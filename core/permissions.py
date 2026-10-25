"""Role-based access control.

Mirrors the portal's ROLE_VIEWS matrix on the server side:
navigation hiding is cosmetic — these permissions are the real gate.
"""
from rest_framework import permissions

from .models import Role


# Frontend view name -> roles allowed to access the underlying endpoints.
VIEW_ROLES = {
    "shareholders": {Role.ADMIN, Role.GM, Role.FINANCE, Role.SHAREHOLDER},
    "contributions": {Role.ADMIN, Role.GM, Role.FINANCE, Role.SHAREHOLDER},
    "meetings": {Role.ADMIN, Role.GM, Role.FINANCE, Role.SHAREHOLDER},
    "leads": {Role.ADMIN, Role.GM, Role.FINANCE, Role.TRANSPORT, Role.PROJECTS},
    "customers": {Role.ADMIN, Role.GM, Role.FINANCE, Role.TRANSPORT,
                  Role.PROJECTS},
    "transactions": {Role.ADMIN, Role.GM, Role.FINANCE, Role.TRANSPORT,
                     Role.PROJECTS},
    "payments": {Role.ADMIN, Role.GM, Role.FINANCE},
    "vehicles": {Role.ADMIN, Role.GM, Role.TRANSPORT},
    "drivers": {Role.ADMIN, Role.GM, Role.TRANSPORT},
    "trips": {Role.ADMIN, Role.GM, Role.TRANSPORT},
    "maintenance": {Role.ADMIN, Role.GM, Role.TRANSPORT},
    "projects": {Role.ADMIN, Role.GM, Role.TRANSPORT, Role.PROJECTS},
    "tasks": {Role.ADMIN, Role.GM, Role.TRANSPORT, Role.PROJECTS},
    "finance": {Role.ADMIN, Role.GM, Role.FINANCE, Role.TRANSPORT, Role.PROJECTS},
    "invoices": {Role.ADMIN, Role.GM, Role.FINANCE},
    "documents": {Role.ADMIN, Role.GM, Role.FINANCE, Role.TRANSPORT,
                  Role.PROJECTS, Role.SHAREHOLDER},
    "reports": {Role.ADMIN, Role.GM, Role.FINANCE, Role.TRANSPORT,
                Role.PROJECTS, Role.SHAREHOLDER},
    "notifications": None,  # every authenticated user sees their own
    "audit": {Role.ADMIN, Role.GM, Role.FINANCE},
    "users": {Role.ADMIN, Role.GM},
    "partnerships": {Role.ADMIN, Role.GM, Role.SALES, Role.PROJECTS},

    "settings": None,  # every authenticated user
}

# Roles that may perform sensitive mutations (approvals, financial edits).
APPROVER_ROLES = {Role.ADMIN, Role.GM, Role.FINANCE}


class RolePermission(permissions.BasePermission):
    """Gate a viewset on the `view_name` attribute of the view."""

    message = "Your role is not permitted to access this resource."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not request.user.is_active:
            return False
        allowed = VIEW_ROLES.get(getattr(view, "view_name", None), None)
        if allowed is None:
            return True  # open to any authenticated user
        return request.user.role in allowed


class ReadOnlyRoles(permissions.BasePermission):
    """Shareholders and auditors can read but never mutate business data."""

    message = "Your role has read-only access to this resource."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role not in {Role.SHAREHOLDER, Role.AUDITOR}


class ApproverOnly(permissions.BasePermission):
    """Only GM / Finance / Admin may approve or reject."""

    message = "Approval requires General Manager or Finance Officer role."

    def has_permission(self, request, view):
        return request.user.role in APPROVER_ROLES
