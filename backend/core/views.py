"""DRF viewsets.

Business rules enforced here (never trust the client):
  * approvals require gm/finance/admin roles and lock the record;
  * approving a contribution adds it to the shareholder's paid-in capital
    inside a database transaction, with audit entries either way;
  * shareholders/auditors are read-only on business data;
  * approved records cannot be edited or deleted — only reversed with a note.
"""
from django.db import transaction
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


class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [RolePermission, ReadOnlyRoles]
    view_name = ""
    lookup_field = "code"  # public ids are codes like SH-001, CT-1012


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
                        status=ContributionStatus.PENDING)
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
        serializer.save(recorded_by=self.request.user, status="Pending")
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

    def get_queryset(self):
        return Notification.objects.filter(
            recipient__in=[None, self.request.user]).order_by("-created_at")

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
