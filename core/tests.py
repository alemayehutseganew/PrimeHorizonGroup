"""Django tests for CRUD operations, permissions, and dashboard calculations."""
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import AccessToken

from .models import (
    Role, User, Shareholder, Contribution, ContributionStatus,
    Vehicle, Transaction, Notification,
)

UserModel = get_user_model()


def make_user(email, role, username=None, password="testpass123", status="Active"):
    return UserModel.objects.create_user(
        email=email,
        username=username or email.split("@")[0],
        password=password,
        role=role,
        status=status,
    )


def auth_client_for(user):
    client = APIClient()
    token = AccessToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION="Bearer " + str(token))
    return client


class CRUDTestBase(APITestCase):
    def setUp(self):
        self.gm = make_user("gm@test.et", Role.GM, username="gm")
        self.finance = make_user("finance@test.et", Role.FINANCE, username="finance")
        self.shareholder = make_user("sh@test.et", Role.SHAREHOLDER, username="sh")
        self.auditor = make_user("aud@test.et", Role.AUDITOR, username="aud")
        self.client = auth_client_for(self.gm)


class ShareholderCRUDTests(CRUDTestBase):
    def test_list_returns_db_records(self):
        Shareholder.objects.create(code="SH-001", legal_name="Test One", shares=2, paid=Decimal("500000"))
        Shareholder.objects.create(code="SH-002", legal_name="Test Two", shares=1, paid=Decimal("250000"))
        r = self.client.get("/api/shareholders/")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        results = data.get("results", data)
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["name"], "Test One")

    def test_create_persists_to_db(self):
        r = self.client.post("/api/shareholders/", {
            "name": "New Shareholder",
            "email": "new@example.et",
            "shares": 3,
            "share_price": "250000.00",
            "paid": "0.00",
            "status": "Active",
        })
        self.assertEqual(r.status_code, 201, r.content)
        self.assertTrue(Shareholder.objects.filter(code__startswith="SH-").exists())

    def test_update_persists_after_refresh(self):
        sh = Shareholder.objects.create(code="SH-001", legal_name="Original", shares=1, paid=Decimal("0"))
        r = self.client.patch("/api/shareholders/SH-001/", {"paid": "250000.00"})
        self.assertEqual(r.status_code, 200, r.content)
        sh.refresh_from_db()
        self.assertEqual(sh.paid, Decimal("250000.00"))

    def test_delete_removes_from_db(self):
        sh = Shareholder.objects.create(code="SH-001", legal_name="To Delete", shares=1, paid=Decimal("0"))
        r = self.client.delete("/api/shareholders/SH-001/")
        self.assertEqual(r.status_code, 204, r.content)
        self.assertFalse(Shareholder.objects.filter(code="SH-001").exists())

    def test_shareholder_read_only_for_shareholder_role(self):
        client = auth_client_for(self.shareholder)
        sh = Shareholder.objects.create(code="SH-001", legal_name="RO Test", shares=1, paid=Decimal("0"))
        r = client.patch("/api/shareholders/SH-001/", {"paid": "999999.00"})
        self.assertEqual(r.status_code, 403)


class ContributionCRUDTests(CRUDTestBase):
    def test_create_pending_contribution(self):
        sh = Shareholder.objects.create(code="SH-001", legal_name="Test", shares=1, paid=Decimal("0"))
        r = self.client.post("/api/contributions/", {
            "shareholder_code": "SH-001",
            "amount": "250000.00",
            "currency": "ETB",
            "kind": "Share capital",
            "date": "2026-03-01",
            "method": "Bank transfer",
            "reference": "REF-001",
        })
        self.assertEqual(r.status_code, 201, r.content)
        c = Contribution.objects.get(code=r.json()["id"])
        self.assertEqual(c.status, ContributionStatus.PENDING)
        self.assertEqual(c.recorded_by, self.gm)

    def test_approve_updates_paid_capital(self):
        sh = Shareholder.objects.create(code="SH-001", legal_name="Test", shares=1, paid=Decimal("0"))
        c = Contribution.objects.create(
            code="CT-001", shareholder=sh, amount=Decimal("250000.00"),
            status=ContributionStatus.PENDING, recorded_by=self.finance,
        )
        r = self.client.post("/api/contributions/CT-001/approve/")
        self.assertEqual(r.status_code, 200, r.content)
        c.refresh_from_db()
        sh.refresh_from_db()
        self.assertEqual(c.status, ContributionStatus.APPROVED)
        self.assertEqual(sh.paid, Decimal("250000.00"))

    def test_approve_requires_approver_role(self):
        client = auth_client_for(self.shareholder)
        sh = Shareholder.objects.create(code="SH-001", legal_name="Test", shares=1, paid=Decimal("0"))
        c = Contribution.objects.create(
            code="CT-002", shareholder=sh, amount=Decimal("250000.00"),
            status=ContributionStatus.PENDING, recorded_by=self.gm,
        )
        r = client.post("/api/contributions/CT-002/approve/")
        self.assertEqual(r.status_code, 403)


class DashboardTests(CRUDTestBase):
    def test_summary_capital_from_db(self):
        Shareholder.objects.create(code="SH-001", legal_name="A", shares=2, paid=Decimal("500000"))
        Shareholder.objects.create(code="SH-002", legal_name="B", shares=1, paid=Decimal("250000"))
        r = self.client.get("/api/summary/")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["capital"]["total_shares"], 3)
        self.assertEqual(data["capital"]["received"], 750000.0)
        self.assertEqual(data["capital"]["committed"], 3 * 250000)

    def test_summary_finance_from_db(self):
        Transaction.objects.create(code="FN-1", txn_date=timezone.now().date(),
                                   kind="Income", category="Capital", division="Governance",
                                   description="Test", amount=Decimal("100000"), status="Approved")
        Transaction.objects.create(code="FN-2", txn_date=timezone.now().date(),
                                   kind="Expense", category="Fuel", division="Transport",
                                   description="Test", amount=Decimal("30000"), status="Approved")
        r = self.client.get("/api/summary/")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["finance"]["income"], 100000.0)
        self.assertEqual(data["finance"]["expenses"], 30000.0)
        self.assertEqual(data["finance"]["result"], 70000.0)

    def test_summary_fleet_from_db(self):
        Vehicle.objects.create(code="VH-01", plate="AA 1", make="Toyota", model="Hilux",
                               year=2024, category="Pickup", status="Available")
        Vehicle.objects.create(code="VH-02", plate="AA 2", make="Isuzu", model="NPR",
                               year=2023, category="Truck", status="On trip")
        r = self.client.get("/api/summary/")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["fleet"]["total"], 2)
        self.assertEqual(data["fleet"]["available"], 1)
        self.assertEqual(data["fleet"]["on_trip"], 1)

    def test_shareholder_cannot_see_finance(self):
        client = auth_client_for(self.shareholder)
        r = client.get("/api/summary/")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertNotIn("finance", data)


class AuthTests(CRUDTestBase):
    def test_login_returns_token(self):
        r = self.client.post("/api/auth/token/", {
            "email": "gm@test.et",
            "password": "testpass123",
        })
        self.assertEqual(r.status_code, 200)
        self.assertIn("access", r.json())

    def test_me_returns_user(self):
        r = self.client.get("/api/auth/me/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["user"]["email"], "gm@test.et")

    def test_login_wrong_password_rejected(self):
        r = self.client.post("/api/auth/token/", {
            "email": "gm@test.et",
            "password": "wrong-password",
        })
        self.assertEqual(r.status_code, 401)

    def test_login_by_username(self):
        r = self.client.post("/api/auth/token/", {
            "username": "gm",
            "password": "testpass123",
        })
        self.assertEqual(r.status_code, 200, r.content)
        self.assertIn("access", r.json())
        self.assertIn("refresh", r.json())

    def test_refresh_rotation(self):
        r = self.client.post("/api/auth/token/", {
            "email": "gm@test.et",
            "password": "testpass123",
        })
        refresh = r.json()["refresh"]
        r2 = self.client.post("/api/auth/token/refresh/", {"refresh": refresh})
        self.assertEqual(r2.status_code, 200, r2.content)
        self.assertIn("access", r2.json())

    def test_logout_revokes_refresh(self):
        r = self.client.post("/api/auth/token/", {
            "email": "gm@test.et",
            "password": "testpass123",
        })
        refresh = r.json()["refresh"]
        authed = APIClient()
        authed.credentials(HTTP_AUTHORIZATION="Bearer " + r.json()["access"])
        r2 = authed.post("/api/auth/logout/", {"refresh": refresh})
        self.assertEqual(r2.status_code, 200, r2.content)
        r3 = self.client.post("/api/auth/token/refresh/", {"refresh": refresh})
        self.assertEqual(r3.status_code, 401)

    def test_password_change_revokes_old_tokens(self):
        r = self.client.post("/api/auth/token/", {
            "email": "gm@test.et",
            "password": "testpass123",
        })
        old_access = r.json()["access"]
        authed = APIClient()
        authed.credentials(HTTP_AUTHORIZATION="Bearer " + old_access)
        r2 = authed.post("/api/auth/password-change/", {
            "current_password": "testpass123",
            "new_password": "newpass1234",
            "password_confirmation": "newpass1234",
        })
        self.assertEqual(r2.status_code, 200, r2.content)
        r3 = authed.get("/api/auth/me/")
        self.assertEqual(r3.status_code, 401)

    def test_password_reset_flow(self):
        r = self.client.post("/api/auth/password-reset/", {"email": "gm@test.et"})
        self.assertEqual(r.status_code, 200)
        from .models import PasswordResetToken
        row = PasswordResetToken.objects.filter(user=self.gm, used=False).first()
        self.assertIsNotNone(row)
        from .tokens import PasswordResetTokenGenerator
        gen = PasswordResetTokenGenerator()
        raw = gen.make_token(self.gm)
        r2 = self.client.post("/api/auth/password-reset/confirm/", {
            "token": raw,
            "new_password": "resetpass1",
            "password_confirmation": "resetpass1",
        })
        self.assertEqual(r2.status_code, 200, r2.content)
        r3 = self.client.post("/api/auth/token/", {
            "email": "gm@test.et",
            "password": "resetpass1",
        })
        self.assertEqual(r3.status_code, 200, r3.content)

    def test_signup_and_verify(self):
        r = self.client.post("/api/auth/signup/", {
            "email": "newbie@test.et",
            "username": "newbie",
            "password": "signup1234",
        })
        self.assertEqual(r.status_code, 201, r.content)
        from .models import EmailVerification
        row = EmailVerification.objects.filter(user__email="newbie@test.et", used=False).first()
        self.assertIsNotNone(row)
        r2 = self.client.post("/api/auth/email-verification/", {"token": row.token})
        self.assertEqual(r2.status_code, 200, r2.content)
        r3 = self.client.post("/api/auth/token/", {
            "email": "newbie@test.et",
            "password": "signup1234",
        })
        self.assertEqual(r3.status_code, 200, r3.content)

    def test_unauthenticated_rejected(self):
        self.client.credentials()
        r = self.client.get("/api/shareholders/")
        self.assertEqual(r.status_code, 401)


class PermissionTests(CRUDTestBase):
    def test_shareholder_cannot_create_shareholder(self):
        client = auth_client_for(self.shareholder)
        r = client.post("/api/shareholders/", {"name": "X", "shares": 1})
        self.assertEqual(r.status_code, 403)

    def test_auditor_read_only(self):
        client = auth_client_for(self.auditor)
        r = client.get("/api/shareholders/")
        self.assertEqual(r.status_code, 200)
        r = client.post("/api/shareholders/", {"name": "X", "shares": 1})
        self.assertEqual(r.status_code, 403)

    def test_approver_only_approve_contribution(self):
        client = auth_client_for(self.shareholder)
        sh = Shareholder.objects.create(code="SH-001", legal_name="Test", shares=1, paid=Decimal("0"))
        c = Contribution.objects.create(
            code="CT-003", shareholder=sh, amount=Decimal("250000.00"),
            status=ContributionStatus.PENDING, recorded_by=self.gm,
        )
        r = client.post("/api/contributions/CT-003/approve/")
        self.assertEqual(r.status_code, 403)


class AllModulesListTests(CRUDTestBase):
    modules = [
        "shareholders", "contributions", "meetings",
        "customers", "leads", "vehicles", "drivers", "trips",
        "maintenance", "projects", "tasks", "transactions",
        "invoices", "payments", "documents", "notifications",
        "audit", "users",
    ]

    def test_all_modules_list(self):
        for mod in self.modules:
            r = self.client.get("/api/" + mod + "/")
            self.assertEqual(r.status_code, 200,
                             f"GET /api/{mod}/ returned {r.status_code}")


class NotificationScopeTests(CRUDTestBase):
    """§8/§9: notifications are user-scoped; mark-read is idempotent."""

    def test_user_cannot_touch_others_notification(self):
        other = make_user("other@test.et", Role.SALES, username="other")
        me_sales = make_user("me@test.et", Role.SALES, username="mesales")
        note = Notification.objects.create(recipient=other, text="private")
        client = auth_client_for(me_sales)
        r = client.patch(f"/api/notifications/{note.id}/",
                         {"is_read": True})
        self.assertIn(r.status_code, (403, 404))

    def test_mark_read_is_idempotent(self):
        me_sales = make_user("me2@test.et", Role.SALES, username="me2")
        note = Notification.objects.create(recipient=me_sales, text="hello")
        client = auth_client_for(me_sales)
        for _ in range(2):
            r = client.post(f"/api/notifications/{note.id}/mark_read/")
            self.assertEqual(r.status_code, 200, r.content)
            self.assertFalse(r.json()["unread"])
        note.refresh_from_db()
        self.assertTrue(note.is_read)

    def test_me_title_present(self):
        r = self.client.get("/api/auth/me/")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()["user"]["title"])


class UserLifecycleTests(CRUDTestBase):
    """§9: password hashing, no self-elevation, deactivation not deletion."""

    def test_created_password_is_hashed(self):
        from django.contrib.auth import get_user_model
        admin_client = auth_client_for(self.gm)
        r = admin_client.post("/api/users/", {
            "email": "new@test.et", "username": "newuser",
            "first_name": "New", "role": "sales",
            "status": "Invited", "password": "Testpass123",
        })
        self.assertEqual(r.status_code, 201, r.content)
        u = get_user_model().objects.get(email="new@test.et")
        self.assertNotEqual(u.password, "Testpass123")
        self.assertTrue(u.check_password("Testpass123"))

    def test_non_admin_cannot_grant_admin(self):
        finance_client = auth_client_for(self.finance)
        r = finance_client.post("/api/users/", {
            "email": "evil@test.et", "username": "evil",
            "first_name": "Evil", "role": "admin",
            "status": "Invited", "password": "Testpass123",
        })
        self.assertEqual(r.status_code, 403)

    def test_user_delete_deactivates(self):
        from django.contrib.auth import get_user_model
        target = make_user("gone@test.et", Role.SALES, username="gone")
        r = self.client.delete(f"/api/users/{target.id}/")
        self.assertIn(r.status_code, (200, 202, 204))
        target.refresh_from_db()
        self.assertEqual(target.status, "Inactive")
        self.assertFalse(target.is_active)
        self.assertTrue(get_user_model().objects.filter(email="gone@test.et").exists())