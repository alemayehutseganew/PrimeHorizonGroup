"""DRF viewsets.

Business rules enforced here (never trust the client):
  * approvals require gm/finance/admin roles and lock the record;
  * approving a contribution adds it to the shareholder's paid-in capital
    inside a database transaction, with audit entries either way;
  * shareholders/auditors are read-only on business data;
  * approved records cannot be edited or deleted — only reversed with a note.
  * public record codes (SH-001, VH-01, INV-2041…) are assigned by the
    server, never chosen by the client.
"""
import re

from django.db import transaction
from django.db.models import Q as models_Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import (
    AuditLog,
    Contribution,
    ContributionStatus,
    Customer,
    Document,
    Driver,
    Inquiry,
    Invoice,
    Lead,
    MaintenanceRecord,
    Meeting,
    Notification,
    Payment,
    Project,
    Role,
    Shareholder,
    Task,
    Transaction,
    Trip,
    User,
    Vehicle,
)
from .permissions import APPROVER_ROLES, ApproverOnly, ReadOnlyRoles, RolePermission
from .serializers import (
    AuditLogSerializer,
    ContributionSerializer,
    CustomerSerializer,
    DocumentSerializer,
    DriverSerializer,
    InquirySerializer,
    InvoiceSerializer,
    LeadSerializer,
    MaintenanceSerializer,
    MeetingSerializer,
    NotificationSerializer,
    PaymentSerializer,
    ProjectSerializer,
    ShareholderSerializer,
    TaskSerializer,
    TransactionSerializer,
    TripSerializer,
    UserSerializer,
    VehicleSerializer,
)


def audit(actor, action, target="", outcome="Success"):
    AuditLog.objects.create(actor=actor, action=action,
                            target=target, outcome=outcome)


def actor_name(user):
    return user.get_full_name() or user.email


# Public record codes per module (§5.1): server-assigned only — the
# client can never pick a code (serializers expose it read-only as `id`).
CODE_PREFIXES = {
    "shareholders": ("SH", 3),
    "contributions": ("CT", 4),
    "meetings": ("MTG", 3),
    "customers": ("CU", 2),
    "leads": ("LD", 2),
    "vehicles": ("VH", 2),
    "drivers": ("DR", 1),
    "trips": ("TR", 4),
    "maintenance": ("MT", 3),
    "projects": ("PR", 3),
    "tasks": ("TK", 3),
    "transactions": ("FN", 4),
    "invoices": ("INV", 4),
    "payments": ("PY", 4),
    "documents": ("DOC", 2),
}


def next_code(model, view_name):
    """Highest existing PREFIX-nnn + 1 (e.g. SH-014 -> SH-015)."""
    prefix, width = CODE_PREFIXES[view_name]
    pattern = re.compile(rf"^{re.escape(prefix)}-(\d+)$")
    max_n = 0
    for code in model.objects.values_list("code", flat=True):
        m = pattern.match(code or "")
        if m:
            n = int(m.group(1))
            if n > max_n:
                max_n = n
    return f"{prefix}-{max_n + 1:0{width}d}"


class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [RolePermission, ReadOnlyRoles]
    view_name = ""
    lookup_field = "code"  # public ids are codes like SH-001, CT-1012

    def perform_create(self, serializer):
        # §5.1: record codes are server-assigned public ids; serializers
        # expose `code` read-only (as `id`), so POSTs would otherwise save
        # code="" and break uniqueness + lookup on the second create.
        if self.view_name in CODE_PREFIXES:
            serializer.save(code=next_code(self.queryset.model, self.view_name))
        else:
            serializer.save()


class ShareholderViewSet(BaseViewSet):
    queryset = Shareholder.objects.prefetch_related("contributions").all()
    serializer_class = ShareholderSerializer
    view_name = "shareholders"
    filterset_fields = ["status"]
    search_fields = ["code", "legal_name", "email"]
    ordering_fields = ["code", "shares", "paid"]


class ContributionViewSet(BaseViewSet):
    queryset = Contribution.objects.select_related(
        "shareholder", "recorded_by", "decided_by").all()
    serializer_class = ContributionSerializer
    view_name = "contributions"
    filterset_fields = ["status", "shareholder"]
    search_fields = ["code", "reference"]
    ordering_fields = ["paid_on", "amount"]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user,
                        status=ContributionStatus.PENDING,
                        code=next_code(Contribution, self.view_name))
        audit(actor_name(self.request.user),
              f"Recorded contribution {serializer.instance.code}",
              serializer.instance.code)

    @action(detail=True, methods=["post"], permission_classes=[ApproverOnly])
    def approve(self, request, code=None):
        contrib = self.get_object()
        if contrib.status == ContributionStatus.APPROVED:
            return Response({"detail": "Already approved."},
                            status=status.HTTP_400_BAD_REQUEST)
        if contrib.status != ContributionStatus.PENDING:
            return Response(
                {"detail": f"Cannot approve a {contrib.status} contribution."},
                status=status.HTTP_400_BAD_REQUEST)
        if request.user.email and contrib.recorded_by_id == request.user.id:
            return Response(
                {"detail": "Segregation of duties: the recorder cannot "
                           "approve their own contribution."},
                status=status.HTTP_403_FORBIDDEN)
        with transaction.atomic():
            contrib.status = ContributionStatus.APPROVED
            contrib.decided_by = request.user
            contrib.decided_at = timezone.now()
            contrib.save(update_fields=["status", "decided_by", "decided_at",
                                        "updated_at"])
            sh = Shareholder.objects.select_for_update().get(
                pk=contrib.shareholder_id)
            sh.paid = sh.paid + contrib.amount
            sh.save(update_fields=["paid", "updated_at"])
        audit(actor_name(request.user),
              f"Approved contribution {contrib.code}", contrib.code)
        return Response(self.get_serializer(contrib).data)

    @action(detail=True, methods=["post"], permission_classes=[ApproverOnly])
    def reject(self, request, code=None):
        contrib = self.get_object()
        if contrib.status != ContributionStatus.PENDING:
            return Response(
                {"detail": "Only pending contributions can be rejected."},
                status=status.HTTP_400_BAD_REQUEST)
        reason = (request.data.get("note") or "").strip()
        if not reason:
            return Response({"detail": "A rejection reason is required."},
                            status=status.HTTP_400_BAD_REQUEST)
        contrib.status = ContributionStatus.REJECTED
        contrib.decided_by = request.user
        contrib.decided_at = timezone.now()
        contrib.decision_note = reason
        contrib.save()
        audit(actor_name(request.user),
              f"Rejected contribution {contrib.code} (reason recorded)",
              contrib.code)
        return Response(self.get_serializer(contrib).data)
class TransactionViewSet(BaseViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    view_name = "finance"
    filterset_fields = ["kind", "status", "division"]
    search_fields = ["code", "reference", "category"]
    ordering_fields = ["txn_date", "amount"]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user, status="Pending",
                        code=next_code(Transaction, self.view_name))
        audit(actor_name(self.request.user),
              f"Recorded {serializer.instance.kind.lower()} "
              f"{serializer.instance.code}", serializer.instance.code)

    @action(detail=True, methods=["post"], permission_classes=[ApproverOnly])
    def approve(self, request, code=None):
        txn = self.get_object()
        if txn.status != "Pending":
            return Response({"detail": "Only pending transactions can be approved."},
                            status=status.HTTP_400_BAD_REQUEST)
        txn.status = "Approved"
        txn.decided_by = request.user
        txn.decided_at = timezone.now()
        txn.save()
        audit(actor_name(request.user),
              f"Approved {txn.kind.lower()} {txn.code}", txn.code)
        return Response(self.get_serializer(txn).data)


class InvoiceViewSet(BaseViewSet):
    queryset = Invoice.objects.prefetch_related("payments").all()
    serializer_class = InvoiceSerializer
    view_name = "invoices"
    filterset_fields = ["status"]
    search_fields = ["code", "customer_name"]
    ordering_fields = ["issued_on", "total"]

    @action(detail=True, methods=["post"])
    def record_payment(self, request, code=None):
        if request.user.role not in APPROVER_ROLES:
            return Response({"detail": "Only Finance/Management may record payments."},
                            status=status.HTTP_403_FORBIDDEN)
        invoice = self.get_object()
        try:
            amount = float(request.data.get("amount", 0))
        except (TypeError, ValueError):
            return Response({"detail": "A valid amount is required."},
                            status=status.HTTP_400_BAD_REQUEST)
        if amount <= 0 or amount > float(invoice.total - invoice.paid):
            return Response({"detail": "Amount must be positive and within the balance."},
                            status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            invoice.paid = invoice.paid + amount
            invoice.status = ("Paid" if invoice.paid >= invoice.total
                              else "Partially paid")
            invoice.save(update_fields=["paid", "status", "updated_at"])
            Payment.objects.create(
                code=f"PAY-{invoice.code}-{invoice.payments.count() + 1}",
                invoice=invoice, invoice_code=invoice.code, amount=amount,
                method=request.data.get("method", ""),
                reference=request.data.get("reference", ""))
        audit(actor_name(request.user),
              f"Recorded payment {amount} on {invoice.code}", invoice.code)
        return Response(self.get_serializer(invoice).data)


class PaymentViewSet(BaseViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    view_name = "invoices"
    filterset_fields = ["invoice_code"]
    search_fields = ["code", "reference"]


class CustomerViewSet(BaseViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    view_name = "leads"
    filterset_fields = ["status"]
    search_fields = ["code", "name", "contact_person"]


class LeadViewSet(BaseViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    view_name = "leads"
    filterset_fields = ["stage", "source"]
    search_fields = ["code", "service"]


class VehicleViewSet(BaseViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    view_name = "vehicles"
    filterset_fields = ["status", "category"]
    search_fields = ["code", "plate"]


class DriverViewSet(BaseViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    view_name = "drivers"
    filterset_fields = ["status"]
    search_fields = ["code", "name"]


class TripViewSet(BaseViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    view_name = "trips"
    filterset_fields = ["status"]
    search_fields = ["code", "customer_name", "route"]
    ordering_fields = ["start_date", "price"]


class MaintenanceViewSet(BaseViewSet):
    queryset = MaintenanceRecord.objects.all()
    serializer_class = MaintenanceSerializer
    view_name = "maintenance"
    filterset_fields = ["status"]
    search_fields = ["code", "vehicle_plate", "provider"]


class ProjectViewSet(BaseViewSet):
    queryset = Project.objects.prefetch_related("tasks").all()
    serializer_class = ProjectSerializer
    view_name = "projects"
    filterset_fields = ["status", "division"]
    search_fields = ["code", "name", "customer_name"]


class TaskViewSet(BaseViewSet):
    queryset = Task.objects.select_related("project").all()
    serializer_class = TaskSerializer
    view_name = "tasks"
    filterset_fields = ["status", "priority"]
    search_fields = ["code", "title", "assignee"]


class MeetingViewSet(BaseViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    view_name = "meetings"
    filterset_fields = ["status", "kind"]


class DocumentViewSet(BaseViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    view_name = "documents"
    filterset_fields = ["category"]
    search_fields = ["code", "name"]
class NotificationViewSet(viewsets.ModelViewSet):
    """Users see and manage their own notifications."""
    serializer_class = NotificationSerializer
    view_name = "notifications"
    http_method_names = ["get", "patch", "post", "head", "options"]

    def get_queryset(self):
        # FIX §8: scope strictly to the logged-in user (+ global broadcasts).
        # The old `recipient__in=[None, user]` queryset combined with the
        # default ModelViewSet allowed a user to PATCH/DELETE another user's
        # row by id. Writes are now blocked at object level below.
        user = self.request.user
        if getattr(user, "role", None) in ("admin", "gm"):
            return Notification.objects.all().order_by("-created_at")
        return Notification.objects.filter(
            models_Q(recipient__isnull=True) | models_Q(recipient=user)
        ).order_by("-created_at")

    def get_object(self):
        note = super().get_object()
        user = self.request.user
        # Non-admins may only touch their own or broadcast rows.
        if getattr(user, "role", None) not in ("admin", "gm"):
            if note.recipient_id not in (None, user.id):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Not your notification.")
        return note

    def perform_update(self, serializer):
        # Only is_read may change via the API (idempotent mark-read).
        serializer.save(is_read=serializer.validated_data.get(
            "is_read", serializer.instance.is_read))

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        note = self.get_object()
        note.is_read = True
        note.save(update_fields=["is_read"])
        return Response(self.get_serializer(note).data)

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"detail": "All notifications marked as read."})


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    view_name = "audit"
    permission_classes = [RolePermission]
    filterset_fields = ["outcome"]
    search_fields = ["actor", "action", "target"]
    ordering_fields = ["created_at"]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("email")
    serializer_class = UserSerializer
    view_name = "users"
    permission_classes = [RolePermission]
    filterset_fields = ["role", "status"]
    search_fields = ["email", "first_name", "last_name"]

    def _guard_role_change(self, target, data):
        # §9: only admins may grant the admin role; nobody may change
        # their own role or deactivate themselves.
        # target=None means "creating a new user" — the self-change rule
        # does not apply (previously this compared the requester to
        # themselves and blocked every legitimate invite).
        from rest_framework.exceptions import PermissionDenied
        me = self.request.user
        if target is not None and target.id == me.id and (
                "role" in data or data.get("status") in ("Inactive", "Suspended")):
            raise PermissionDenied("You cannot change your own role or deactivate yourself.")
        if data.get("role") == Role.ADMIN and me.role != Role.ADMIN:
            raise PermissionDenied("Only an admin can grant the admin role.")

    def perform_create(self, serializer):
        self._guard_role_change(None, self.request.data)
        serializer.save()
        audit(actor_name(self.request.user),
              f"Invited user {serializer.instance.email}",
              serializer.instance.email)

    def perform_update(self, serializer):
        self._guard_role_change(serializer.instance, self.request.data)
        serializer.save()

    def perform_destroy(self, instance):
        # §5.1/§9: users are deactivated, never hard-deleted.
        from rest_framework.exceptions import PermissionDenied
        if instance.id == self.request.user.id:
            raise PermissionDenied("You cannot delete your own account.")
        instance.status = "Inactive"
        instance.is_active = False
        instance.save(update_fields=["status", "is_active"])


class InquiryViewSet(viewsets.ModelViewSet):
    """Public submissions are open; reading them requires staff roles."""

    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [RolePermission()]

    @property
    def view_name(self):
        return "leads"

    def perform_create(self, serializer):
        import uuid
        ref = "PHG-" + uuid.uuid4().hex[:8].upper()
        serializer.save(reference=ref)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """Current user profile + allowed frontend views."""
    from .permissions import VIEW_ROLES
    allowed = [v for v, roles in VIEW_ROLES.items()
               if roles is None or request.user.role in roles]
    return Response({
        "user": UserSerializer(request.user).data,
        "views": allowed,
        "share_price": __import__("django.conf", fromlist=["settings"]).settings.SHARE_PRICE_ETB,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def summary(request):
    """Role-aware dashboard aggregates, computed server-side."""
    from django.db.models import Sum
    from .permissions import VIEW_ROLES

    data = {}
    if request.user.role in (VIEW_ROLES["shareholders"] or set()):
        agg = Shareholder.objects.aggregate(
            committed=Sum("shares"), paid=Sum("paid"))
        total_shares = agg["committed"] or 0
        paid = float(agg["paid"] or 0)
        from django.conf import settings as dj_settings
        committed = total_shares * dj_settings.SHARE_PRICE_ETB
        data["capital"] = {
            "total_shares": total_shares,
            "committed": committed,
            "received": paid,
            "outstanding": committed - paid,
            "collection_pct": round(paid / committed * 100, 1) if committed else 0,
        }
    if request.user.role in (VIEW_ROLES["finance"] or set()):
        inc = Transaction.objects.filter(kind="Income", status="Approved").aggregate(
            s=Sum("amount"))["s"] or 0
        exp = Transaction.objects.filter(kind="Expense", status="Approved").aggregate(
            s=Sum("amount"))["s"] or 0
        data["finance"] = {"income": float(inc), "expenses": float(exp),
                           "result": float(inc - exp)}
    if request.user.role in (VIEW_ROLES["vehicles"] or set()):
        data["fleet"] = {
            "total": Vehicle.objects.count(),
            "available": Vehicle.objects.filter(status="Available").count(),
            "on_trip": Vehicle.objects.filter(status="On trip").count(),
            "maintenance": Vehicle.objects.filter(status="Maintenance").count(),
        }
    if request.user.role in (VIEW_ROLES["projects"] or set()):
        data["projects"] = {
            "total": Project.objects.count(),
            "active": Project.objects.filter(status="In progress").count(),
        }
    if request.user.role in {Role.ADMIN, Role.GM, Role.FINANCE}:
        data["pending"] = {
            "contributions": Contribution.objects.filter(status="Pending").count(),
            "transactions": Transaction.objects.filter(status="Pending").count(),
        }
    return Response(data)
