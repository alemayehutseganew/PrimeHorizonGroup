"""Django admin registrations for the management portal."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

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
    PartnershipAttachment,
    PartnershipRequest,

    Payment,
    Project,
    Shareholder,
    Task,
    Transaction,
    Trip,
    User,
    Vehicle,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "role", "status", "is_active")
    list_filter = ("role", "status", "is_active")
    search_fields = ("email", "username", "first_name", "last_name")
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Company", {"fields": ("role", "phone", "status")}),
    )


@admin.register(Shareholder)
class ShareholderAdmin(admin.ModelAdmin):
    list_display = ("code", "legal_name", "shares", "share_price", "paid", "status")
    list_filter = ("status",)
    search_fields = ("code", "legal_name", "email")


@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ("code", "shareholder", "amount", "currency", "paid_on", "status")
    list_filter = ("status", "currency", "method")
    search_fields = ("code", "reference", "shareholder__legal_name")
    readonly_fields = ("recorded_by", "decided_by", "decided_at")


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ("code", "kind", "held_on", "attendees", "status")
    list_filter = ("kind", "status")


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "contact_person", "phone", "status")
    list_filter = ("status", "category")
    search_fields = ("code", "name")


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("code", "service", "source", "value", "stage", "follow_up")
    list_filter = ("stage", "source")


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ("reference", "name", "topic", "status", "created_at")
    list_filter = ("status", "topic")
    search_fields = ("reference", "name", "email", "message")
    readonly_fields = ("reference", "created_at")


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("code", "plate", "make", "model", "category", "status", "driver")
    list_filter = ("status", "category")
    search_fields = ("code", "plate")


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "licence_class", "trips_completed", "status")
    list_filter = ("status", "licence_class")


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("code", "customer_name", "vehicle_plate", "route", "status")
    list_filter = ("status",)
    search_fields = ("code", "customer_name", "route")


@admin.register(MaintenanceRecord)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ("code", "vehicle_plate", "service_date", "provider", "cost", "status")
    list_filter = ("status",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "customer_name", "division", "progress", "status")
    list_filter = ("status", "division")
    search_fields = ("code", "name", "customer_name")


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "project", "assignee", "priority", "status", "due_date")
    list_filter = ("status", "priority")


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("code", "txn_date", "kind", "category", "division", "amount", "status")
    list_filter = ("kind", "status", "division")
    readonly_fields = ("recorded_by", "decided_by", "decided_at")


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("code", "customer_name", "issued_on", "due_on", "total", "paid", "status")
    list_filter = ("status",)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("code", "invoice_code", "amount", "paid_on", "method")


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "category", "linked_to", "access_level")
    list_filter = ("category",)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("text", "recipient", "is_read", "created_at")
    list_filter = ("is_read",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("actor", "action", "target", "outcome", "created_at")
    list_filter = ("outcome",)
    search_fields = ("actor", "action", "target")

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


admin.site.site_header = "Prime Horizon Group Plc Administration"
admin.site.site_title = "Prime Horizon Group Plc Administration"
admin.site.index_title = "Prime Horizon Group Plc Management"
@admin.register(PartnershipRequest)
class PartnershipRequestAdmin(admin.ModelAdmin):
    list_display = ("reference", "request_type", "sector",
                    "organization_name", "contact_name", "status",
                    "created_at")
    list_filter = ("status", "request_type", "sector", "created_at")
    search_fields = ("reference", "organization_name", "contact_name",
                     "email", "subject", "procurement_reference")
    readonly_fields = ("reference", "created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("reference", "request_type", "sector",
                           "organization_name", "contact_name", "contact_role",
                           "email", "phone", "country", "location", "subject")}),
        ("Details", {"fields": ("requirements", "deliverables", "timeline",
                                "budget", "procurement_reference",
                                "privacy_acknowledged")}),
        ("Management", {"fields": ("status", "assigned_to",
                                   "internal_notes")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(PartnershipAttachment)
class PartnershipAttachmentAdmin(admin.ModelAdmin):
    list_display = ("original_name", "request", "content_type", "size",
                    "uploaded_at")
    search_fields = ("original_name", "request__reference")
    readonly_fields = ("uploaded_at",)
