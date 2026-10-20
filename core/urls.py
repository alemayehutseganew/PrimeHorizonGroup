"""

Versioned JSON API for the management portal.

"""

from django.urls import include, path

from rest_framework.routers import DefaultRouter

from . import views

from .views import SessionVersionTokenRefreshView, TokenObtainPairView



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

    # Authentication

    path("auth/signup/", views.signup, name="signup"),

    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain"),

    path("auth/token/refresh/", SessionVersionTokenRefreshView.as_view(), name="token_refresh"),

    path("auth/logout/", views.logout, name="logout"),

    path("auth/me/", views.me, name="me"),

    path("auth/password-reset/", views.password_reset_request, name="password_reset"),

    path("auth/password-reset/confirm/", views.password_reset_confirm, name="password_reset_confirm"),

    path("auth/password-change/", views.password_change, name="password_change"),

    path("auth/email-verification/", views.email_verification, name="email_verification"),

    # Dashboard

    path("summary/", views.summary, name="summary"),

    path("", include(router.urls)),

]
