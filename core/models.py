"""Prime Horizon Group Plc — data model (SRS §7)."""
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

MONEY = {"max_digits": 14, "decimal_places": 2}


# ---------------------------------------------------------------------------
# Users & roles
# ---------------------------------------------------------------------------
class Role(models.TextChoices):
    ADMIN = "admin", "System Administrator"
    GM = "gm", "General Manager"
    FINANCE = "finance", "Finance Officer"
    TRANSPORT = "transport", "Transport Manager"
    PROJECTS = "projects", "Technical Project Manager"
    SALES = "sales", "Sales / Customer Service"
    SHAREHOLDER = "shareholder", "Shareholder"
    AUDITOR = "auditor", "Auditor (read-only)"


class User(AbstractUser):
    """Company user with a single primary role."""

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SHAREHOLDER)
    phone = models.CharField(max_length=30, blank=True)
    status = models.CharField(
        max_length=12,
        choices=[("Active", "Active"), ("Inactive", "Inactive"),
                 ("Suspended", "Suspended"), ("Invited", "Invited")],
        default="Active",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    @property
    def role_label(self):
        # FIX: UserSerializer exposes `title` from `role_label`, but the
        # property did not exist — every /auth/me/ + hydrate() call crashed
        # with AttributeError, breaking login/profile on all roles.
        try:
            return self.get_role_display()
        except Exception:
            return self.role or ""

    def __str__(self):
        return f"{self.get_full_name() or self.email} ({self.get_role_display()})"


# ---------------------------------------------------------------------------
# Governance: shareholders, capital, meetings
# ---------------------------------------------------------------------------
class ShareholderStatus(models.TextChoices):
    ACTIVE = "Active", "Active"
    INACTIVE = "Inactive", "Inactive"
    SUSPENDED = "Suspended", "Suspended"


class Shareholder(models.Model):
    code = models.CharField(max_length=12, unique=True)  # e.g. SH-001
    legal_name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    country = models.CharField(max_length=80, blank=True, default="Ethiopia")
    shares = models.PositiveIntegerField(default=1)
    share_price = models.DecimalField(default=Decimal("250000"), **MONEY)
    paid = models.DecimalField(default=Decimal("0"), **MONEY)
    status = models.CharField(
        max_length=12, choices=ShareholderStatus.choices,
        default=ShareholderStatus.ACTIVE,
    )
    admitted_on = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.legal_name}"

    @property
    def commitment(self):
        return self.shares * self.share_price

    @property
    def outstanding(self):
        return self.commitment - self.paid
class ContributionStatus(models.TextChoices):
    PENDING = "Pending", "Pending"
    APPROVED = "Approved", "Approved"
    REJECTED = "Rejected", "Rejected"
    REVERSED = "Reversed", "Reversed"


class Contribution(models.Model):
    """One capital-contribution payment. Approval moves money into paid-in capital."""

    code = models.CharField(max_length=12, unique=True)  # e.g. CT-1001
    shareholder = models.ForeignKey(
        Shareholder, on_delete=models.PROTECT, related_name="contributions"
    )
    amount = models.DecimalField(validators=[MinValueValidator(Decimal("0.01"))], **MONEY)
    currency = models.CharField(max_length=8, default="ETB")
    kind = models.CharField(
        max_length=20, default="Share capital",
        help_text="Share capital vs loan vs advance — never merged silently.",
    )
    paid_on = models.DateField(default=timezone.now)
    method = models.CharField(max_length=40, default="Bank transfer")
    reference = models.CharField(max_length=60, blank=True)
    evidence_note = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=12, choices=ContributionStatus.choices,
        default=ContributionStatus.PENDING,
    )
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="recorded_contributions",
    )
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="decided_contributions",
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    decision_note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-paid_on", "-id"]

    def __str__(self):
        return f"{self.code} — {self.amount} {self.currency} ({self.status})"


class Meeting(models.Model):
    code = models.CharField(max_length=12, unique=True)  # e.g. MTG-001
    kind = models.CharField(max_length=40, default="Board Meeting")
    held_on = models.DateField(default=timezone.now)
    attendees = models.CharField(max_length=40, blank=True)
    status = models.CharField(
        max_length=12,
        choices=[("Scheduled", "Scheduled"), ("Approved", "Approved"),
                 ("Cancelled", "Cancelled")],
        default="Scheduled",
    )
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-held_on"]

    def __str__(self):
        return f"{self.code} — {self.kind}"
# ---------------------------------------------------------------------------
# CRM: customers, leads, inquiries
# ---------------------------------------------------------------------------
class Customer(models.Model):
    code = models.CharField(max_length=12, unique=True)  # CU-01
    name = models.CharField(max_length=150)
    contact_person = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    category = models.CharField(max_length=60, blank=True)
    status = models.CharField(
        max_length=12, default="Active",
        choices=[("Active", "Active"), ("Inactive", "Inactive")],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} — {self.name}"


class Lead(models.Model):
    STAGES = ["New", "Contacted", "Qualified", "Quotation sent",
              "Negotiation", "Won", "Lost"]

    code = models.CharField(max_length=12, unique=True)  # LD-01
    source = models.CharField(max_length=60, blank=True)
    service = models.CharField(max_length=120, blank=True)
    value = models.DecimalField(default=Decimal("0"), **MONEY)
    assignee = models.CharField(max_length=120, blank=True)
    stage = models.CharField(
        max_length=20, default="New",
        choices=[(s, s) for s in STAGES],
    )
    follow_up = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.service} ({self.stage})"


class Inquiry(models.Model):
    """Public website form submission (SRS §3.6)."""

    reference = models.CharField(max_length=24, unique=True)
    name = models.CharField(max_length=120)
    organization = models.CharField(max_length=150, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    topic = models.CharField(max_length=80)
    message = models.TextField()
    status = models.CharField(
        max_length=12, default="New",
        choices=[("New", "New"), ("Contacted", "Contacted"),
                 ("Converted", "Converted"), ("Closed", "Closed")],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} — {self.topic}"
# ---------------------------------------------------------------------------
# Fleet: vehicles, drivers, trips, maintenance
# ---------------------------------------------------------------------------
class VehicleStatus(models.TextChoices):
    AVAILABLE = "Available", "Available"
    BOOKED = "Booked", "Booked"
    ON_TRIP = "On trip", "On trip"
    MAINTENANCE = "Maintenance", "Maintenance"
    INACTIVE = "Inactive", "Inactive"


class Vehicle(models.Model):
    code = models.CharField(max_length=12, unique=True)  # VH-01
    plate = models.CharField(max_length=24, unique=True)
    make = models.CharField(max_length=60, blank=True)
    model = models.CharField(max_length=60, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    category = models.CharField(max_length=40, blank=True)
    status = models.CharField(
        max_length=12, choices=VehicleStatus.choices,
        default=VehicleStatus.AVAILABLE,
    )
    driver = models.CharField(max_length=120, blank=True, default="—")
    odometer = models.PositiveIntegerField(default=0)
    insurance_until = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(default=Decimal("0"), **MONEY)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.plate}"


class Driver(models.Model):
    code = models.CharField(max_length=12, unique=True)  # DR-1
    name = models.CharField(max_length=120)
    licence_class = models.CharField(max_length=8, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    trips_completed = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=12, default="Active",
        choices=[("Active", "Active"), ("Inactive", "Inactive"),
                 ("Suspended", "Suspended")],
    )

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.name}"


class Trip(models.Model):
    STATUS = ["Booked", "In progress", "Completed", "Cancelled"]

    code = models.CharField(max_length=12, unique=True)  # TR-2041
    customer_name = models.CharField(max_length=150)
    vehicle = models.ForeignKey(
        Vehicle, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="trips",
    )
    vehicle_plate = models.CharField(max_length=24, blank=True)
    driver = models.CharField(max_length=120, blank=True, default="—")
    route = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    price = models.DecimalField(default=Decimal("0"), **MONEY)
    fuel_cost = models.DecimalField(default=Decimal("0"), **MONEY)
    status = models.CharField(
        max_length=12, default="Booked",
        choices=[(s, s) for s in STATUS],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.code} — {self.route}"


class MaintenanceRecord(models.Model):
    code = models.CharField(max_length=12, unique=True)  # MT-301
    vehicle = models.ForeignKey(
        Vehicle, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="maintenance",
    )
    vehicle_plate = models.CharField(max_length=24, blank=True)
    service_date = models.DateField(default=timezone.now)
    provider = models.CharField(max_length=120, blank=True)
    work = models.TextField(blank=True)
    cost = models.DecimalField(default=Decimal("0"), **MONEY)
    next_due = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=12, default="Completed",
        choices=[("Completed", "Completed"), ("In progress", "In progress"),
                 ("Scheduled", "Scheduled"), ("Cancelled", "Cancelled")],
    )

    class Meta:
        ordering = ["-service_date"]

    def __str__(self):
        return f"{self.code} — {self.vehicle_plate}"
# ---------------------------------------------------------------------------
# Projects & tasks
# ---------------------------------------------------------------------------
class Project(models.Model):
    STATUS = ["Lead", "Quotation", "Approved", "In progress", "Under review",
              "Completed", "Closed", "On hold", "Cancelled"]

    code = models.CharField(max_length=12, unique=True)  # PR-101
    name = models.CharField(max_length=200)
    customer_name = models.CharField(max_length=150, blank=True)
    division = models.CharField(
        max_length=20, default="Technical",
        choices=[("Technical", "Technical"), ("Transport", "Transport"),
                 ("Shared", "Shared")],
    )
    scope = models.TextField(blank=True)
    manager = models.CharField(max_length=120, blank=True)
    contract_value = models.DecimalField(default=Decimal("0"), **MONEY)
    budget = models.DecimalField(default=Decimal("0"), **MONEY)
    actual_cost = models.DecimalField(default=Decimal("0"), **MONEY)
    progress = models.PositiveIntegerField(default=0)
    priority = models.CharField(
        max_length=10, default="Medium",
        choices=[("Low", "Low"), ("Medium", "Medium"), ("High", "High")],
    )
    status = models.CharField(
        max_length=12, default="Approved",
        choices=[(s, s) for s in STATUS],
    )
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.name}"


class Task(models.Model):
    code = models.CharField(max_length=12, unique=True)  # TK-511
    project = models.ForeignKey(
        Project, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="tasks",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assignee = models.CharField(max_length=120, blank=True)
    priority = models.CharField(
        max_length=10, default="Medium",
        choices=[("Low", "Low"), ("Medium", "Medium"), ("High", "High")],
    )
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=12, default="To do",
        choices=[("To do", "To do"), ("In progress", "In progress"),
                 ("Done", "Done"), ("Blocked", "Blocked")],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["due_date", "code"]

    def __str__(self):
        return f"{self.code} — {self.title}"
# ---------------------------------------------------------------------------
# Finance: transactions, invoices, payments
# ---------------------------------------------------------------------------
class Transaction(models.Model):
    code = models.CharField(max_length=12, unique=True)  # FN-3001
    txn_date = models.DateField(default=timezone.now)
    kind = models.CharField(
        max_length=10,
        choices=[("Income", "Income"), ("Expense", "Expense")],
    )
    category = models.CharField(max_length=80, blank=True)
    division = models.CharField(
        max_length=20, default="Shared",
        choices=[("Transport", "Transport"), ("Technical", "Technical"),
                 ("Shared", "Shared")],
    )
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(validators=[MinValueValidator(Decimal("0.01"))], **MONEY)
    currency = models.CharField(max_length=8, default="ETB")
    method = models.CharField(max_length=40, blank=True)
    reference = models.CharField(max_length=60, blank=True)
    status = models.CharField(
        max_length=12, default="Pending",
        choices=[("Pending", "Pending"), ("Approved", "Approved"),
                 ("Rejected", "Rejected"), ("Reversed", "Reversed")],
    )
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="recorded_transactions",
    )
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="decided_transactions",
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-txn_date", "-id"]

    def __str__(self):
        return f"{self.code} — {self.kind} {self.amount}"


class Invoice(models.Model):
    code = models.CharField(max_length=12, unique=True)  # INV-2041
    customer_name = models.CharField(max_length=150)
    issued_on = models.DateField(default=timezone.now)
    due_on = models.DateField()
    total = models.DecimalField(default=Decimal("0"), **MONEY)
    paid = models.DecimalField(default=Decimal("0"), **MONEY)
    currency = models.CharField(max_length=8, default="ETB")
    status = models.CharField(
        max_length=16, default="Sent",
        choices=[("Draft", "Draft"), ("Sent", "Sent"),
                 ("Partially paid", "Partially paid"), ("Paid", "Paid"),
                 ("Overdue", "Overdue"), ("Cancelled", "Cancelled")],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-issued_on"]

    def __str__(self):
        return f"{self.code} — {self.customer_name}"

    @property
    def balance(self):
        return self.total - self.paid

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class Payment(models.Model):
    code = models.CharField(max_length=12, unique=True)
    invoice = models.ForeignKey(
        Invoice, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="payments",
    )
    invoice_code = models.CharField(max_length=12, blank=True)
    amount = models.DecimalField(validators=[MinValueValidator(Decimal("0.01"))], **MONEY)
    currency = models.CharField(max_length=8, default="ETB")
    paid_on = models.DateField(default=timezone.now)
    method = models.CharField(max_length=40, blank=True)
    reference = models.CharField(max_length=60, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-paid_on"]

    def __str__(self):
        return f"{self.code} — {self.amount}"
# ---------------------------------------------------------------------------
# Documents, notifications, audit
# ---------------------------------------------------------------------------
class Document(models.Model):
    code = models.CharField(max_length=12, unique=True)  # DOC-01
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=40, blank=True)
    linked_to = models.CharField(max_length=80, blank=True)
    uploaded_by = models.CharField(max_length=120, blank=True)
    access_level = models.CharField(max_length=60, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.name}"


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.CASCADE, related_name="notifications",
    )
    text = models.CharField(max_length=255)
    target = models.CharField(max_length=40, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.text[:60]


class AuditLog(models.Model):
    actor = models.CharField(max_length=120)
    action = models.CharField(max_length=255)
    target = models.CharField(max_length=60, blank=True)
    outcome = models.CharField(
        max_length=12, default="Success",
        choices=[("Success", "Success"), ("Blocked", "Blocked"),
                 ("Failed", "Failed")],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.actor} — {self.action}"
