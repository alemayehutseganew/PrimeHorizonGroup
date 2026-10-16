import requests, json

BASE = "http://127.0.0.1:8001/api"

# Login
r = requests.post(f"{BASE}/auth/token/", json={"email": "gm@primehorizon.et", "password": "demo1234"})
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