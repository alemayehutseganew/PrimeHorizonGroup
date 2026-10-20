"""Seed the database with the portal demo dataset.

Mirrors website/js/data.js exactly. Idempotent — safe to re-run.
The password applied to every seeded user is taken from the PHG_SEED_PASSWORD
environment variable; if it is not set, a strong random password is generated
and printed once at the end of the run. Never seed demo users in production.
"""
import os
import secrets
import string
from datetime import date, datetime, time
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from core.models import Contribution, Shareholder, User


def resolve_seed_password():
    """Password for seeded accounts: env override, else a generated one."""
    supplied = os.environ.get("PHG_SEED_PASSWORD", "").strip()
    if supplied:
        return supplied, False
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(16)), True

USERS = [
    ("gm@primehorizon.et", "gm", "Ato Samuel Girma", "gm", "Active", True, False),
    ("finance@primehorizon.et", "finance", "W/ro Hanna Tesfaye", "finance", "Active", True, False),
    ("transport@primehorizon.et", "transport", "Ato Dawit Bekele", "transport", "Active", True, False),
    ("projects@primehorizon.et", "projects", "Ato Nahom Fikru", "projects", "Active", True, False),
    ("admin@primehorizon.et", "admin", "IT Administrator", "admin", "Active", True, True),
    ("yonas@primehorizon.et", "yonas", "Ato Yonas Alemu", "shareholder", "Active", False, False),
    ("kaleb@primehorizon.et", "kaleb", "Ato Kaleb Mengistu", "shareholder", "Active", False, False),
    ("robel@primehorizon.et", "robel", "Ato Robel Assefa", "auditor", "Suspended", False, False),
]


def aware(d, hour=10, minute=0):
    return timezone.make_aware(datetime.combine(d, time(hour, minute)))


class Command(BaseCommand):
    help = "Seed the demo dataset (mirrors website/js/data.js)."

    def handle(self, *args, **options):
        password, generated = resolve_seed_password()
        with transaction.atomic():
            users = self.seed_users(password)
            sh_map = self.seed_shareholders()
            self.seed_contributions(sh_map, users)
            self.seed_fleet()
            self.seed_operations()
            self.seed_finance(users)
            self.seed_governance(users)
        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
        if generated:
            self.stdout.write(self.style.WARNING(
                "Seeded users were given this generated password (shown once, "
                "not stored anywhere else): " + password))

    def seed_users(self, password):
        users = {}
        for email, username, name, role, st, is_staff, is_super in USERS:
            u, _ = User.objects.update_or_create(
                email=email,
                defaults={"username": username, "first_name": name,
                          "last_name": "", "role": role, "status": st,
                          "is_staff": is_staff, "is_superuser": is_super,
                          "is_active": st == "Active"},
            )
            u.set_password(password)
            u.save()
            users[email] = u
        return users

    SHAREHOLDERS = [
    ("SH-001", "Ato Dawit Bekele", "d.bekele@example.et", 2, 500000, "2025-11-04"),
    ("SH-002", "W/ro Hanna Tesfaye", "h.tesfaye@example.et", 2, 500000, "2025-11-04"),
    ("SH-003", "Ato Samuel Girma", "s.girma@example.et", 2, 250000, "2025-11-11"),
    ("SH-004", "Ato Yonas Alemu", "y.alemu@example.et", 1, 250000, "2025-11-04"),
    ("SH-005", "W/ro Mekdes Tadesse", "m.tadesse@example.et", 1, 125000, "2025-11-04"),
    ("SH-006", "Ato Abel Haile", "a.haile@example.et", 1, 250000, "2025-11-18"),
    ("SH-007", "Ato Nahom Fikru", "n.fikru@example.et", 1, 0, "2025-11-18"),
    ("SH-008", "W/ro Selamawit Kebede", "s.kebede@example.et", 1, 250000, "2025-12-02"),
    ("SH-009", "Ato Robel Assefa", "r.assefa@example.et", 1, 125000, "2025-12-02"),
    ("SH-010", "Ato Kaleb Mengistu", "k.mengistu@example.et", 1, 250000, "2025-12-02"),
    ("SH-011", "W/ro Betelhem Degu", "b.degu@example.et", 1, 250000, "2026-01-09"),
    ("SH-012", "Ato Tesfaye Wolde", "t.wolde@example.et", 1, 0, "2026-01-09"),
    ("SH-013", "Ato Girma Teshome", "g.teshome@example.et", 1, 250000, "2026-01-22"),
    ("SH-014", "W/ro Lidiya Worku", "l.worku@example.et", 1, 0, "2026-01-22"),
    ]

    CONTRIBUTIONS = [
    ("CT-1001", "SH-001", 500000, "2025-11-06", "Bank transfer", "CBE-884201", "Approved"),
    ("CT-1002", "SH-002", 500000, "2025-11-07", "Bank transfer", "CBE-884517", "Approved"),
    ("CT-1003", "SH-004", 250000, "2025-11-10", "Bank transfer", "AWB-119034", "Approved"),
    ("CT-1004", "SH-005", 125000, "2025-11-14", "Bank transfer", "CBE-885002", "Approved"),
    ("CT-1005", "SH-003", 250000, "2025-11-20", "Bank transfer", "CBE-886311", "Approved"),
    ("CT-1006", "SH-006", 250000, "2025-11-25", "Bank transfer", "AWB-120445", "Approved"),
    ("CT-1007", "SH-008", 250000, "2025-12-05", "Bank transfer", "CBE-889230", "Approved"),
    ("CT-1008", "SH-009", 125000, "2025-12-09", "Bank transfer", "CBE-889911", "Approved"),
    ("CT-1009", "SH-010", 250000, "2025-12-15", "Bank transfer", "NBE-330128", "Approved"),
    ("CT-1010", "SH-013", 250000, "2026-01-27", "Bank transfer", "CBE-901553", "Approved"),
    ("CT-1011", "SH-011", 250000, "2026-02-03", "Bank transfer", "AWB-131771", "Approved"),
    ("CT-1012", "SH-014", 125000, "2026-02-10", "Bank transfer", "CBE-904119", "Pending"),
    ("CT-1013", "SH-005", 125000, "2026-02-14", "Bank transfer", "CBE-905338", "Pending"),
]

    def seed_shareholders(self):
        sh_map = {}
        for code, name, email, shares, paid, admitted in self.SHAREHOLDERS:
            sh, _ = Shareholder.objects.update_or_create(
                code=code,
                defaults={"legal_name": name, "email": email, "shares": shares,
                          "share_price": Decimal("250000"),
                          "paid": Decimal(str(paid)),
                          "admitted_on": date.fromisoformat(admitted)},
            )
            sh_map[code] = sh
        return sh_map

    def seed_contributions(self, sh_map, users):
        fin = users["finance@primehorizon.et"]
        for code, sh_code, amount, paid_on, method, ref, st in self.CONTRIBUTIONS:
            d = date.fromisoformat(paid_on)
            Contribution.objects.update_or_create(
                code=code,
                defaults={"shareholder": sh_map[sh_code],
                          "amount": Decimal(str(amount)), "paid_on": d,
                          "method": method, "reference": ref, "status": st,
                          "recorded_by": fin,
                          "decided_by": fin if st == "Approved" else None,
                          "decided_at": aware(d) if st == "Approved" else None},
            )
    def seed_fleet(self):
        from core.models import Driver, MaintenanceRecord, Trip, Vehicle

        vehicles = [
            ("VH-01", "AA 3 T41529", "Toyota", "Hilux", 2024, "Pickup", "Available", "Ato Mulugeta D.", 24500, "2026-09-30", 4350000),
            ("VH-02", "AA 2 A78103", "Isuzu", "NPR 75", 2023, "Box truck", "On trip", "Ato Samuel T.", 87200, "2026-07-15", 6800000),
            ("VH-03", "AA 3 B52214", "Hyundai", "HD 170", 2024, "Cargo truck", "Booked", "Ato Birhanu K.", 41300, "2026-11-02", 7450000),
            ("VH-04", "AA 1 L90458", "Toyota", "Coaster", 2022, "Minibus", "On trip", "Ato Tadesse A.", 132800, "2026-05-20", 5200000),
            ("VH-05", "AA 2 K33067", "Mitsubishi", "Canter", 2023, "Flatbed", "Maintenance", "—", 95100, "2026-08-11", 6100000),
            ("VH-06", "AA 3 T44780", "Toyota", "Corolla", 2024, "Saloon", "Available", "Ato Henok M.", 18900, "2026-12-01", 2950000),
        ]
        v_map = {}
        for (code, plate, make, model, year, cat, st, drv, odo, ins, cost) in vehicles:
            v, _ = Vehicle.objects.update_or_create(
                code=code,
                defaults={"plate": plate, "make": make, "model": model,
                          "year": year, "category": cat, "status": st,
                          "driver": drv, "odometer": odo,
                          "insurance_until": date.fromisoformat(ins),
                          "purchase_cost": Decimal(str(cost))},
            )
            v_map[plate] = v

        for code, name, lic, phone, trips in [
            ("DR-1", "Ato Mulugeta Desta", "C", "+251 911 220 118", 42),
            ("DR-2", "Ato Samuel Tesfaye", "C", "+251 911 335 402", 57),
            ("DR-3", "Ato Birhanu Kebede", "C+", "+251 912 118 763", 31),
            ("DR-4", "Ato Tadesse Abebe", "B", "+251 911 874 220", 88),
            ("DR-5", "Ato Henok Mehari", "B", "+251 913 662 019", 12),
        ]:
            Driver.objects.update_or_create(
                code=code,
                defaults={"name": name, "licence_class": lic, "phone": phone,
                          "trips_completed": trips},
            )

        for (code, cust, plate, drv, route, s, e, price, fuel, st) in [
            ("TR-2041", "Raxa Distribution PLC", "AA 2 A78103", "Ato Samuel Tesfaye", "Addis Ababa → Bahir Dar", "2026-02-10", "2026-02-13", 78000, 14200, "Completed"),
            ("TR-2042", "Habesha Beverages", "AA 3 B52214", "Ato Birhanu Kebede", "Addis Ababa → Adama", "2026-02-12", "2026-02-12", 22000, 4800, "Completed"),
            ("TR-2043", "Sunrise Construction", "AA 1 L90458", "Ato Tadesse Abebe", "Staff shuttle — Bole/Merlin", "2026-02-14", "2026-02-28", 96000, 18500, "In progress"),
            ("TR-2044", "Ethio Tech Solutions", "AA 2 K33067", "—", "Addis Ababa → Hawassa", "2026-02-20", "2026-02-22", 54000, 0, "Booked"),
            ("TR-2045", "Raxa Distribution PLC", "AA 2 A78103", "Ato Samuel Tesfaye", "Addis Ababa → Mekelle", "2026-02-24", "2026-02-28", 132000, 0, "Booked"),
            ("TR-2046", "Blue Nile Import", "AA 3 T41529", "Ato Mulugeta Desta", "Modjo dry port → Warehouse", "2026-02-16", "2026-02-16", 12500, 2100, "In progress"),
        ]:
            Trip.objects.update_or_create(
                code=code,
                defaults={"customer_name": cust, "vehicle": v_map.get(plate),
                          "vehicle_plate": plate, "driver": drv, "route": route,
                          "start_date": date.fromisoformat(s),
                          "end_date": date.fromisoformat(e),
                          "price": Decimal(str(price)),
                          "fuel_cost": Decimal(str(fuel)), "status": st},
            )

        for (code, plate, svc, prov, work, cost, nxt, st) in [
            ("MT-301", "AA 2 K33067", "2026-02-15", "Merkato Motors", "Clutch replacement + full service", 61500, "2026-05-15", "In progress"),
            ("MT-302", "AA 1 L90458", "2026-01-28", "Toyota Service", "Scheduled 80,000 km service", 28400, "2026-04-28", "Completed"),
            ("MT-303", "AA 2 A78103", "2026-01-12", "Isuzu Addis", "Brake pads + tyre rotation", 19800, "2026-04-12", "Completed"),
            ("MT-304", "AA 3 B52214", "2025-12-20", "Hyundai Service", "Engine oil, filters, diagnostics", 15200, "2026-03-20", "Completed"),
        ]:
            MaintenanceRecord.objects.update_or_create(
                code=code,
                defaults={"vehicle": v_map.get(plate), "vehicle_plate": plate,
                          "service_date": date.fromisoformat(svc),
                          "provider": prov, "work": work,
                          "cost": Decimal(str(cost)),
                          "next_due": date.fromisoformat(nxt), "status": st},
            )
    def seed_operations(self):
        from core.models import Customer, Lead, Project, Task

        for code, name, contact, phone, cat in [
            ("CU-01", "Raxa Distribution PLC", "Ato Fikru Gebre", "+251 911 452 330", "Logistics client"),
            ("CU-02", "Habesha Beverages", "W/ro Almaz F.", "+251 913 201 887", "Technical client"),
            ("CU-03", "Sunrise Construction", "Ato Yared T.", "+251 911 664 021", "Transport client"),
            ("CU-04", "Nile Insurance", "Ato Ephrem S.", "+251 911 078 554", "Technical client"),
            ("CU-05", "Blue Nile Import", "W/ro Rahel D.", "+251 912 990 117", "Transport client"),
            ("CU-06", "Ethio Tech Solutions", "Ato Biniam H.", "+251 911 337 209", "Maintenance client"),
        ]:
            Customer.objects.update_or_create(
                code=code,
                defaults={"name": name, "contact_person": contact,
                          "phone": phone, "category": cat},
            )

        for code, src, svc, val, assign, stage, follow in [
            ("LD-01", "Website form", "Transport / freight", 60000, "Ato Dawit Bekele", "Quotation sent", "2026-02-20"),
            ("LD-02", "Referral", "Network installation", 240000, "Ato Nahom Fikru", "Qualified", "2026-02-19"),
            ("LD-03", "Website form", "IT support contract", 120000, "Ato Yonas Alemu", "Contacted", "2026-02-21"),
            ("LD-04", "Trade fair", "Electrical maintenance", 180000, "Ato Abel Haile", "New", "2026-02-24"),
            ("LD-05", "Referral", "Staff transport", 310000, "Ato Dawit Bekele", "Negotiation", "2026-02-19"),
            ("LD-06", "Website form", "Software development", 640000, "Ato Yonas Alemu", "Won", None),
        ]:
            Lead.objects.update_or_create(
                code=code,
                defaults={"source": src, "service": svc,
                          "value": Decimal(str(val)), "assignee": assign,
                          "stage": stage,
                          "follow_up": date.fromisoformat(follow) if follow else None},
            )

        p_map = {}
        for (code, name, cust, div, val, spent, prog, st, mgr, due) in [
            ("PR-101", "Office Network Build — Bole Branch", "Nile Insurance", "Technical", 385000, 214000, 65, "In progress", "Ato Nahom Fikru", "2026-03-10"),
            ("PR-102", "Staff Transport Contract Q1–Q2", "Sunrise Construction", "Transport", 620000, 190000, 35, "In progress", "Ato Dawit Bekele", "2026-06-30"),
            ("PR-103", "Inventory Web Platform", "Habesha Beverages", "Technical", 840000, 512000, 78, "Under review", "Ato Yonas Alemu", "2026-03-02"),
            ("PR-104", "Warehouse Lighting Retrofit", "Blue Nile Import", "Technical", 265000, 265000, 100, "Completed", "Ato Abel Haile", "2026-01-30"),
            ("PR-105", "Generator Maintenance Program", "Ethio Tech Solutions", "Technical", 180000, 42000, 20, "In progress", "Ato Abel Haile", "2026-05-15"),
            ("PR-106", "Freight Corridor — Addis/Dire Dawa", "Raxa Distribution PLC", "Transport", 450000, 0, 5, "Approved", "Ato Dawit Bekele", "2026-04-20"),
        ]:
            p, _ = Project.objects.update_or_create(
                code=code,
                defaults={"name": name, "customer_name": cust, "division": div,
                          "contract_value": Decimal(str(val)),
                          "actual_cost": Decimal(str(spent)), "progress": prog,
                          "status": st, "manager": mgr,
                          "due_date": date.fromisoformat(due)},
            )
            p_map[code] = p

        for code, proj, title, assign, prio, due, st in [
            ("TK-511", "PR-101", "Terminate and test 48 data points", "Ato Nahom Fikru", "High", "2026-02-24", "In progress"),
            ("TK-512", "PR-101", "Configure core switch VLANs", "Ato Girma Teshome", "High", "2026-02-26", "To do"),
            ("TK-513", "PR-103", "UAT session with client team", "Ato Yonas Alemu", "Medium", "2026-02-25", "In progress"),
            ("TK-514", "PR-103", "Fix invoice export rounding", "Ato Girma Teshome", "High", "2026-02-20", "Done"),
            ("TK-515", "PR-105", "Service 100 kVA genset — site visit", "Ato Abel Haile", "Medium", "2026-03-05", "To do"),
            ("TK-516", "PR-102", "Publish February shuttle schedule", "Ato Dawit Bekele", "High", "2026-02-18", "Done"),
        ]:
            Task.objects.update_or_create(
                code=code,
                defaults={"project": p_map.get(proj), "title": title,
                          "assignee": assign, "priority": prio,
                          "due_date": date.fromisoformat(due), "status": st},
            )
    def seed_finance(self, users):
        from core.models import Invoice, Transaction

        fin = users["finance@primehorizon.et"]
        for code, d, kind, cat, div, amt, ref, st in [
            ("FN-3001", "2026-02-18", "Income", "Transport revenue", "Transport", 78000, "INV-2041", "Approved"),
            ("FN-3002", "2026-02-16", "Expense", "Fuel", "Transport", 14200, "RCP-8891", "Approved"),
            ("FN-3003", "2026-02-15", "Expense", "Maintenance and repairs", "Transport", 61500, "RCP-8894", "Pending"),
            ("FN-3004", "2026-02-14", "Income", "IT support revenue", "Technical", 45000, "INV-2039", "Approved"),
            ("FN-3005", "2026-02-12", "Income", "Software development revenue", "Technical", 210000, "INV-2038", "Approved"),
            ("FN-3006", "2026-02-10", "Expense", "Software and subscriptions", "Technical", 8900, "RCP-8887", "Approved"),
            ("FN-3007", "2026-02-08", "Expense", "Staff costs", "Shared", 96000, "PAY-0212", "Approved"),
            ("FN-3008", "2026-02-05", "Income", "Electrical and engineering services", "Technical", 128000, "INV-2036", "Approved"),
            ("FN-3009", "2026-02-03", "Expense", "Rent and utilities", "Shared", 34000, "RCP-8880", "Approved"),
            ("FN-3010", "2026-02-01", "Income", "Transport revenue", "Transport", 96000, "INV-2033", "Approved"),
        ]:
            Transaction.objects.update_or_create(
                code=code,
                defaults={"txn_date": date.fromisoformat(d), "kind": kind,
                          "category": cat, "division": div,
                          "amount": Decimal(str(amt)), "reference": ref,
                          "status": st, "recorded_by": fin,
                          "decided_by": fin if st == "Approved" else None,
                          "decided_at": aware(date.fromisoformat(d)) if st == "Approved" else None},
            )

        for code, cust, issue, due, total, paid, st in [
            ("INV-2041", "Raxa Distribution PLC", "2026-02-11", "2026-02-25", 78000, 78000, "Paid"),
            ("INV-2039", "Nile Insurance", "2026-02-14", "2026-02-28", 45000, 0, "Sent"),
            ("INV-2038", "Habesha Beverages", "2026-02-12", "2026-02-26", 210000, 105000, "Partially paid"),
            ("INV-2036", "Blue Nile Import", "2026-02-05", "2026-02-19", 128000, 128000, "Paid"),
            ("INV-2033", "Sunrise Construction", "2026-02-01", "2026-02-15", 96000, 0, "Overdue"),
            ("INV-2029", "Ethio Tech Solutions", "2026-01-20", "2026-02-03", 54000, 54000, "Paid"),
        ]:
            Invoice.objects.update_or_create(
                code=code,
                defaults={"customer_name": cust,
                          "issued_on": date.fromisoformat(issue),
                          "due_on": date.fromisoformat(due),
                          "total": Decimal(str(total)),
                          "paid": Decimal(str(paid)), "status": st},
            )
    def seed_governance(self, users):
        from core.models import AuditLog, Document, Meeting, Notification

        for code, name, cat, linked, by, access in [
            ("DOC-01", "Founders' Agreement (signed)", "Governance", "Company", "Admin", "Shareholders & Management"),
            ("DOC-02", "Articles of Association", "Governance", "Company", "Admin", "Shareholders & Management"),
            ("DOC-03", "Trade licence 2026", "Registration", "Company", "Admin", "All staff"),
            ("DOC-04", "Vehicle purchase — VH-02 receipt", "Fleet", "AA 2 A78103", "Transport Manager", "Management"),
            ("DOC-05", "Insurance policy — VH-04", "Fleet", "AA 1 L90458", "Transport Manager", "Management"),
            ("DOC-06", "Nile Insurance contract", "Customer", "PR-101", "Project Manager", "Management"),
            ("DOC-07", "Invoice INV-2041 PDF", "Finance", "INV-2041", "Finance Officer", "Finance & Management"),
            ("DOC-08", "Board meeting minutes — #003", "Governance", "Meeting #003", "Admin", "Shareholders & Management"),
        ]:
            Document.objects.update_or_create(
                code=code,
                defaults={"name": name, "category": cat, "linked_to": linked,
                          "uploaded_by": by, "access_level": access},
            )

        for code, kind, held, attend, st, summary in [
            ("MTG-001", "Founding Assembly", "2025-10-24", "14/14", "Approved", "Business model, share structure and initial capital plan approved."),
            ("MTG-002", "Board Meeting", "2025-12-12", "5/5", "Approved", "Fleet acquisition plan and first capital call confirmed."),
            ("MTG-003", "Board Meeting", "2026-02-06", "5/5", "Approved", "Q1 operations review; technical division SLA policy adopted."),
            ("MTG-004", "Shareholder Assembly", "2026-03-06", "—", "Scheduled", "Agenda: capital contribution status, dividend policy discussion."),
        ]:
            Meeting.objects.update_or_create(
                code=code,
                defaults={"kind": kind, "held_on": date.fromisoformat(held),
                          "attendees": attend, "status": st, "summary": summary},
            )

        gm = users["gm@primehorizon.et"]
        for text, target in [
            ("New customer inquiry from Blue Nile Import (website form).", "leads"),
            ("Contribution CT-1013 (ETB 125,000) is pending approval.", "contributions"),
            ("Vehicle AA 1 L90458 insurance expires in 90 days.", "vehicles"),
            ("Invoice INV-2033 is now overdue.", "invoices"),
            ("Meeting notice published: Shareholder Assembly 2026-03-06.", "meetings"),
        ]:
            Notification.objects.get_or_create(
                recipient=gm, text=text, target=target,
                defaults={"is_read": False},
            )

        for actor, action, target, outcome in [
            ("Finance Officer", "Approved contribution CT-1011", "CT-1011", "Success"),
            ("Project Manager", "Updated project PR-103 progress 65→78%", "PR-103", "Success"),
            ("Transport Manager", "Created trip TR-2045", "TR-2045", "Success"),
            ("System", "User login succeeded", "gm", "Success"),
            ("Finance Officer", "Recorded expense FN-3003 (pending)", "FN-3003", "Success"),
            ("Unknown", "Failed login attempt", "—", "Blocked"),
            ("Admin", "Invited new user (Finance role)", "u-021", "Success"),
        ]:
            AuditLog.objects.get_or_create(
                actor=actor, action=action, target=target, outcome=outcome,
            )
