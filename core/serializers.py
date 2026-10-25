"""DRF serializers — field names match the frontend data.js shape."""
from datetime import date as _date
from datetime import datetime as _datetime

from rest_framework import serializers


from .auth_serializers import (
    SessionVersionTokenRefreshSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    TokenInputSerializer,
    TokenResponseSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    PasswordChangeSerializer,
    EmailVerificationSerializer,
    LogoutSerializer,
)
from .models import (
    AuditLog,
    Contribution,
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
    Shareholder,
    Task,
    Transaction,
    Trip,
    User,
    Vehicle,
)


class TolerantDateField(serializers.DateField):
    """Accept model DateFields whose in-memory default is timezone.now().

    A freshly created instance holds a datetime until refresh_from_db();
    DRF's stock DateField refuses to serialize datetimes, which 500'd
    POST /shareholders/ immediately after a successful save.
    """

    def to_representation(self, value):
        if isinstance(value, _datetime):
            value = value.date()
        return super().to_representation(value)


class UserSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="role_label", read_only=True)
    name = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False,
                                     min_length=8)

    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name", "last_name",
                  "name", "role", "title", "phone", "status", "last_login",
                  "password"]
        read_only_fields = ["id", "last_login"]
        extra_kwargs = {
            # §9: never allow self-elevation or unsafe public assignment.
            # Role/status are writable only via the admin-only UserViewSet;
            # both are enforced again in perform_create/perform_update.
            "role": {"required": False},
            "status": {"required": False},
        }

    def get_name(self, obj):
        return obj.get_full_name() or obj.email

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        user.set_password(password or User.objects.make_random_password())
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ShareholderSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    name = serializers.CharField(source="legal_name")
    # TolerantDateField: admitted_on defaults to timezone.now (datetime).
    joined = TolerantDateField(source="admitted_on", required=False)
    commitment = serializers.DecimalField(max_digits=14, decimal_places=2,
                                          read_only=True)
    outstanding = serializers.DecimalField(max_digits=14, decimal_places=2,
                                           read_only=True)

    class Meta:
        model = Shareholder
        fields = ["id", "name", "email", "phone", "country", "shares",
                  "share_price", "paid", "commitment", "outstanding",
                  "status", "joined"]


class ContributionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    sh = serializers.CharField(source="shareholder.code", read_only=True)
    shareholder_code = serializers.CharField(
        source="shareholder", write_only=True,
    )
    date = serializers.DateField(source="paid_on")
    ref = serializers.CharField(source="reference", required=False, allow_blank=True)
    by = serializers.SerializerMethodField()

    class Meta:
        model = Contribution
        fields = ["id", "sh", "shareholder_code", "amount", "currency", "kind",
                  "date", "method", "ref", "status", "by",
                  "evidence_note", "decision_note"]

    def validate_shareholder_code(self, value):
        try:
            return Shareholder.objects.get(code=value)
        except Shareholder.DoesNotExist:
            raise serializers.ValidationError("Unknown shareholder code: " + value)

    def create(self, validated_data):
        # With source="shareholder", validated_data["shareholder"] is already
        # the resolved Shareholder instance from validate_shareholder_code.
        return super().create(validated_data)

    def get_by(self, obj):
        if obj.decided_by:
            return obj.decided_by.get_full_name() or obj.decided_by.email
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.email
        return ""


class MeetingSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    type = serializers.CharField(source="kind")
    date = serializers.DateField(source="held_on")

    class Meta:
        model = Meeting
        fields = ["id", "type", "date", "attendees", "status", "summary"]


class CustomerSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    contact = serializers.CharField(source="contact_person")
    stage = serializers.CharField(default="Customer", read_only=True)

    class Meta:
        model = Customer
        fields = ["id", "name", "contact", "phone", "email", "category",
                  "status", "stage"]


class LeadSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    follow = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = ["id", "source", "service", "value", "assignee",
                  "stage", "follow"]

    def get_follow(self, obj):
        return obj.follow_up.isoformat() if obj.follow_up else "—"


class InquirySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    reference = serializers.CharField(read_only=True)

    class Meta:
        model = Inquiry
        fields = ["id", "reference", "name", "organization", "email", "phone",
                  "topic", "message", "status"]
        read_only_fields = ["status"]


class VehicleSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    insurance = serializers.DateField(source="insurance_until")
    purchase = serializers.DecimalField(source="purchase_cost", max_digits=14,
                                        decimal_places=2)

    class Meta:
        model = Vehicle
        fields = ["id", "plate", "make", "model", "year", "category",
                  "status", "driver", "odometer", "insurance", "purchase"]
class DriverSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    licence = serializers.CharField(source="licence_class")
    trips = serializers.IntegerField(source="trips_completed")

    class Meta:
        model = Driver
        fields = ["id", "name", "licence", "phone", "trips", "status"]


class TripSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    customer = serializers.CharField(source="customer_name")
    vehicle = serializers.CharField(source="vehicle_plate")
    start = serializers.DateField(source="start_date")
    end = serializers.DateField(source="end_date")
    price = serializers.DecimalField(max_digits=14, decimal_places=2)
    fuel = serializers.DecimalField(source="fuel_cost", max_digits=14,
                                    decimal_places=2)

    class Meta:
        model = Trip
        fields = ["id", "customer", "vehicle", "driver", "route", "start",
                  "end", "price", "fuel", "status"]


class MaintenanceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    vehicle = serializers.CharField(source="vehicle_plate")
    date = serializers.DateField(source="service_date")
    next = serializers.SerializerMethodField()

    class Meta:
        model = MaintenanceRecord
        fields = ["id", "vehicle", "date", "provider", "work", "cost",
                  "next", "status"]

    def get_next(self, obj):
        return obj.next_due.isoformat() if obj.next_due else "—"


class ProjectSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    customer = serializers.CharField(source="customer_name")
    value = serializers.DecimalField(source="contract_value", max_digits=14,
                                     decimal_places=2)
    spent = serializers.DecimalField(source="actual_cost", max_digits=14,
                                     decimal_places=2)
    due = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["id", "name", "customer", "division", "manager", "value",
                  "spent", "progress", "status", "priority", "due"]

    def get_due(self, obj):
        return obj.due_date.isoformat() if obj.due_date else "—"


class TaskSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    project = serializers.SlugRelatedField(
        slug_field="code", queryset=Project.objects.all(),
        required=False, allow_null=True,
    )
    due = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ["id", "project", "title", "assignee", "priority", "due",
                  "status"]

    def get_due(self, obj):
        return obj.due_date.isoformat() if obj.due_date else "—"


class TransactionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    date = serializers.DateField(source="txn_date", required=False)
    type = serializers.CharField(source="kind")
    ref = serializers.CharField(source="reference", required=False, allow_blank=True)

    class Meta:
        model = Transaction
        fields = ["id", "date", "type", "category", "division",
                  "description", "amount", "ref", "status"]


class InvoiceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    customer = serializers.CharField(source="customer_name")
    issue = serializers.DateField(source="issued_on")
    due = serializers.DateField(source="due_on")
    balance = serializers.DecimalField(max_digits=14, decimal_places=2,
                                       read_only=True)

    class Meta:
        model = Invoice
        fields = ["id", "customer", "issue", "due", "total", "paid",
                  "balance", "status"]


class PaymentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    date = serializers.DateField(source="paid_on")

    class Meta:
        model = Payment
        fields = ["id", "invoice_code", "amount", "date", "method",
                  "reference"]


class DocumentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code", read_only=True)
    linked = serializers.CharField(source="linked_to")
    uploaded = serializers.SerializerMethodField()
    by = serializers.CharField(source="uploaded_by", read_only=True)
    access = serializers.CharField(source="access_level")

    class Meta:
        model = Document
        fields = ["id", "name", "category", "linked", "uploaded", "by",
                  "access"]

    def get_uploaded(self, obj):
        return obj.uploaded_at.date().isoformat()


class NotificationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    time = serializers.SerializerMethodField()
    unread = serializers.SerializerMethodField()
    is_read = serializers.BooleanField(required=False)

    class Meta:
        model = Notification
        fields = ["id", "text", "time", "unread", "is_read", "target"]

    def get_time(self, obj):
        return obj.created_at.strftime("%Y-%m-%d %H:%M")

    def get_unread(self, obj):
        return not obj.is_read

    def update(self, instance, validated_data):
        # Only the read/unread flag is mutable after creation. Text, target,
        # recipient and other protected fields are ignored on update.
        allowed = {}
        if "is_read" in validated_data:
            allowed["is_read"] = validated_data["is_read"]
        return super().update(instance, allowed)


class AuditLogSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    time = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ["id", "actor", "action", "target", "time", "outcome"]

    def get_time(self, obj):
        return obj.created_at.strftime("%Y-%m-%d %H:%M")
