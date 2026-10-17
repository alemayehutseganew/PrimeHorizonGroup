"""Versioned JSON API for the management portal."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views
from .views import TokenObtainPairView

router = DefaultRouter()
router.register("shareholders", views.ShareholderViewSet, basename="shareholder")
router.register("contributions", views.ContributionViewSet, basename="contribution")
router.register("meetings", views.MeetingViewSet, basename="meeting")
router.register("customers", views.CustomerViewSet, basename="customer")
router.register("leads", views.LeadViewSet, basename="lead")
router.register("inquiries", views.InquiryViewSet, basename="inquiry")
router.register("vehicles", views.VehicleViewSet, basename="vehicle")
router.register("drivers", views.DriverViewSet, basename="driver")
router.register("trips", views.TripViewSet, basename="trip")
router.register("maintenance", views.MaintenanceViewSet, basename="maintenance")
router.register("projects", views.ProjectViewSet, basename="project")
router.register("tasks", views.TaskViewSet, basename="task")
router.register("transactions", views.TransactionViewSet, basename="transaction")
router.register("invoices", views.InvoiceViewSet, basename="invoice")
router.register("payments", views.PaymentViewSet, basename="payment")
router.register("documents", views.DocumentViewSet, basename="document")
router.register("notifications", views.NotificationViewSet, basename="notification")
router.register("audit", views.AuditLogViewSet, basename="audit")
router.register("users", views.UserViewSet, basename="user")

urlpatterns = [
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", views.me, name="me"),
    path("summary/", views.summary, name="summary"),
    path("", include(router.urls)),
]
