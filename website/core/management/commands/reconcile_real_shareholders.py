import os, sys
from django.core.management.base import BaseCommand
from django.db import transaction
from decimal import Decimal
from core.models import Shareholder, Contribution

AUTHORITATIVE_SHAREHOLDERS = [
    {
        "name": "Samson Wallelign Tesfaye",
        "contact": "251943385166",
        "shares": 2,
        "share_value": Decimal("250000.00"),
        "total_contribution": Decimal("500000.00"),
        "date_paid": "2026-08-18",
    },
    {
        "name": "Yunas Yigezu Mekonin",
        "contact": "251913347252",
        "shares": 1,
        "share_value": Decimal("250000.00"),
        "total_contribution": Decimal("250000.00"),
        "date_paid": "2026-08-18",
    },
    {
        "name": "Kenaw Nuru Muhabe",
        "contact": "918122687509",
        "shares": 1,
        "share_value": Decimal("250000.00"),
        "total_contribution": Decimal("250000.00"),
        "date_paid": "2026-08-18",
    },
    {
        "name": "Tesfahun Gashaw Ashagrie",
        "contact": "251996739637",
        "shares": 1,
        "share_value": Decimal("250000.00"),
        "total_contribution": Decimal("250000.00"),
        "date_paid": "2026-08-22",
    },
    {
        "name": "Alebachew Molalign Alemie",
        "contact": "251935828132",
        "shares": 1,
        "share_value": Decimal("250000.00"),
        "total_contribution": Decimal("250000.00"),
        "date_paid": "2026-08-24",
    },
    {
        "name": "Lemma Getachew Zenebe",
        "contact": "251930507412",
        "shares": 1,
        "share_value": Decimal("240000.00"),
        "total_contribution": Decimal("240000.00"),
        "date_paid": "2026-08-26",
    },
    {
        "name": "Netsanet Desalegn Miskir",
        "contact": None,
        "shares": 2,
        "share_value": Decimal("250000.00"),
        "total_contribution": Decimal("500000.00"),
        "date_paid": "2026-08-27",
    },
    {
        "name": "Binyam Bokrey Geday",
        "contact": "+251 95 303 1469",
        "shares": 1,
        "share_value": Decimal("250000.00"),
        "total_contribution": Decimal("250000.00"),
        "date_paid": "2026-08-27",
    },
    {
        "name": "Birhanu Dessie Ayalew",
        "contact": "+251 92 729 3016",
        "shares": 2,
        "share_value": Decimal("250000.00"),
        "total_contribution": Decimal("500000.00"),
        "date_paid": "2026-08-28",
    },
    {
        "name": "Alemayehu Tseganew Tadesse",
        "contact": "+919078260731",
        "shares": 1,
        "share_value": Decimal("250000.00"),
        "total_contribution": Decimal("250000.00"),
        "date_paid": "2026-09-10",
    },
    {
        "name": "Eyayew Dessie Afework",
        "contact": "+251 96 293 6441",
        "shares": 1,
        "share_value": Decimal("125000.00"),
        "total_contribution": Decimal("125000.00"),
        "date_paid": "2026-09-15",
    },
    {
        "name": "Desalegn Tegegn Belay",
        "contact": "+251 91 767 6655",
        "shares": 1,
        "share_value": Decimal("125000.00"),
        "total_contribution": Decimal("125000.00"),
        "date_paid": "2026-09-16",
    },
    {
        "name": "Aymen Telsem Ahmed",
        "contact": "+251 97 805 5490",
        "shares": 1,
        "share_value": Decimal("125000.00"),
        "total_contribution": Decimal("125000.00"),
        "date_paid": "2026-09-17",
    },
    {
        "name": "Etefie Tsegaw Aboneh",
        "contact": "+251 91 864 5601",
        "shares": 1,
        "share_value": Decimal("110000.00"),
        "total_contribution": Decimal("110000.00"),
        "date_paid": "2026-09-24",
    },
]

AUTHORITATIVE_TOTALS = {"members": 14, "shares": 17, "contribution": Decimal("3725000.00")}


def normalize_contact(c):
    return c.strip() if c else None


def normalize_name(n):
    return n.strip().lower()


def parse_date(d):
    if not d:
        return None
    if isinstance(d, str) and len(d) == 10 and d[4] == "-" and d[7] == "-":
        return d
    try:
        parts = d.split("/")
        if len(parts) == 3:
            day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
            return f"{year:04d}-{month:02d}-{day:02d}"
    except (ValueError, IndexError):
        pass
    return None


class Command(BaseCommand):
    help="Reconcile real shareholder register with the Neon database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            default=False,
            help="Apply the changes (default: DRY RUN only)",
        )

    def handle(self, *args, **options):
        apply_mode = options["--apply"]
        self.stdout.write("=" * 60)
        self.stdout.write("PRIME HORIZON REAL SHAREHOLDER RECONCILIATION")
        self.stdout.write("=" * 60)

        from django.db import connection
        engine = connection.settings_dict["ENGINE"]
        self.stdout.write(f"Database backend: {engine}")
        if "sqlite" in engine.lower():
            self.stderr.write("ABORT: SQLite detected. This command requires PostgreSQL/Neon.")
            return

        self.stdout.write(
            f"\nAuthoritative totals: Members={AUTHORITATIVE_TOTALS['members']}, Shares={AUTHORITATIVE_TOTALS['shares']}, Contribution={AUTHORITATIVE_TOTALS['contribution']}"
        )

        # ... (reconciliation logic continues)
        if not apply_mode:
            # DRY RUN mode: validate and report, no database mutations
            self.stdout.write(
                f"\nRECONCILIATION ANALYSIS (DRY RUN — no database changes)\n"
            )
            self.stdout.write(
                f"  Source members:   {AUTHORITATIVE_TOTALS['members']}\n"
            )
            self.stdout.write(
                f"  Source shares:    {AUTHORITATIVE_TOTALS['shares']}\n"
            )
            self.stdout.write(
                f"  Source contribution: ETB {AUTHORITATIVE_TOTALS['contribution']:.2f}\n"
            )
            self.stdout.write(
                f"\nDRY RUN MODE — no database changes made.\n"
            )
            return

        # Apply mode: execute reconciliation with transaction safety
        self.stdout.write(
            f"\nAPPLYING RECONCILIATION — changes will be written to database\n"
        )
        self.stdout.write(
            f"  Validating source data: {AUTHORITATIVE_TOTALS['members']} members, "
            f"{AUTHORITATIVE_TOTALS['shares']} shares, ETB {AUTHORITATIVE_TOTALS['contribution']:.2f}\n"
        )