import requests

print("Test A: No token")
r = requests.get('http://127.0.0.1:8000/api/auth/me')
print(f"Status: {r.status_code}")

print("Test B: Invalid token")
r = requests.get('http://127.0.0.1:8000/api/auth/me', headers={"Authorization": "Bearer invalidtoken"})
print(f"Status: {r.status_code}")

print("Logging in to get valid token")
res = requests.post('http://127.0.0.1:8000/api/auth/login', json={"email":"admin@nersafe.gov.in","password":"Password@123"})
if res.status_code == 200:
    token = res.json().get('access_token')
    print("Test C: Valid token")
    r = requests.get('http://127.0.0.1:8000/api/auth/me', headers={"Authorization": f"Bearer {token}"})
    print(f"Status: {r.status_code}")

    print("Test D: Admin protected endpoint without token")
    r = requests.post('http://127.0.0.1:8000/api/emergency-alerts/send', json={"district_id": "D1", "title": "Test", "message": "Test Message", "severity": "HIGH", "target_zones": []})
    print(f"Status: {r.status_code}")

    print("Test E: Admin protected endpoint with token")
    r = requests.post('http://127.0.0.1:8000/api/emergency-alerts/send', headers={"Authorization": f"Bearer {token}"}, json={"title": "Test", "message": "Test Message", "severity": "HIGH", "type": "TEST", "state": "Test", "district": "Test", "area": "Test", "risk_score": 0.0})
    print(f"Status: {r.status_code}")
else:
    print(f"Login failed: {res.status_code} {res.text}")
