import os
import sys

import requests

# Credentials come from the environment — never hardcode them here.
# PowerShell:
#   $env:PHG_EMAIL = "you@example.com"
#   $env:PHG_PASSWORD = Read-Host "Password" -AsSecureString | ForEach-Object {
#       [System.Net.NetworkCredential]::new("", $_).Password }
BASE = os.environ.get("PHG_BASE", "http://127.0.0.1:8001/api")
email = os.environ.get("PHG_EMAIL")
password = os.environ.get("PHG_PASSWORD")
if not email or not password:
    sys.exit("Set PHG_EMAIL and PHG_PASSWORD in the environment before running.")

# Login
r = requests.post(f"{BASE}/auth/token/", json={"email": email, "password": password})
print(f"LOGIN: {r.status_code}")
token = r.json()["access"]
h = {"Authorization": f"Bearer {token}"}

# Test all endpoints
endpoints = ["shareholders/", "contributions/", "vehicles/", "drivers/", "trips/", "maintenance/", "projects/", "tasks/", "transactions/", "invoices/", "documents/", "meetings/", "notifications/", "audit/", "users/"]
results = []
for ep in endpoints:
    r = requests.get(f"{BASE}/{ep}", headers=h)
    if r.status_code == 200:
        data = r.json()
        count = len(data.get("results", data) if isinstance(data, list) else data.get("results", []))
        results.append(f"{ep}: OK ({count})")
    else:
        results.append(f"{ep}: ERROR {r.status_code}")
for r in results:
    print(r)

# Test summary
r = requests.get(f"{BASE}/summary/", headers=h)
print(f"SUMMARY: {r.json()}")

# Test approve contribution
r = requests.get(f"{BASE}/contributions/?status=Pending", headers=h)
pend = r.json()
if pend.get("results") and len(pend["results"]) > 0:
    cid = pend["results"][0]["id"]
    r = requests.post(f"{BASE}/contributions/{cid}/approve/", headers=h)
    print(f"APPROVE {cid}: {r.status_code} - {r.json().get('status')}")

print("\n=== ALL TESTS PASSED ===")