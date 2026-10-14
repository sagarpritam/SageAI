from fastapi.testclient import TestClient
import uuid
from app.main import app

client = TestClient(app)

def test_manual_endpoints():
    with TestClient(app) as client:
        with open("test_out.log", "w", encoding="utf-8") as f:
            f.write("Testing Endpoints Manually...\n")
            
            # 1. Register & Login to get a valid authentication token
            f.write("\n--- Authenticating ---\n")
            test_id = str(uuid.uuid4())[:8]
            email = f"manual_test_{test_id}@sageai.com"
            password = "TestPass123!"
            
            # Register
            reg_response = client.post("/auth/register", json={
                "email": email,
                "password": password,
                "organization_name": f"ManualTestOrg_{test_id}",
            })
            f.write(f"Registration Status: {reg_response.status_code}\n")
            
            # Login
            login_response = client.post("/auth/login", json={
                "email": email,
                "password": password,
            })
            f.write(f"Login Status: {login_response.status_code}\n")
            
            if login_response.status_code != 200:
                f.write("Authentication failed. Skipping subsequent authenticated tests.\n")
                return
                
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # 2. Test /autofix/run endpoint
            f.write("\n--- Testing /autofix/run ---\n")
            autofix_payload = {
                "repository": "mock/repo",
                "branch": "main",
                "max_fixes": 2
            }
            
            routes = [route.path for route in app.routes]
            # Target the run endpoint specifically
            autofix_route = next((r for r in routes if "autofix" in r and "run" in r), None)
            
            if autofix_route:
                response = client.post(autofix_route, json=autofix_payload, headers=headers)
                f.write(f"Status Code: {response.status_code}\n")
                f.write(f"Response: {response.json() if response.status_code == 200 else response.text}\n")
            else:
                f.write("Could not find /autofix/run route.\n")
            
            # 3. Test /reports/{scan_id}/pdf
            f.write("\n--- Testing /reports/{scan_id}/pdf ---\n")
            report_route_pdf = next((r for r in routes if "pdf" in r and "reports" in r), None)
            if report_route_pdf:
                test_route = report_route_pdf.replace("{scan_id}", "test_scan_123")
                response = client.get(test_route, headers=headers)
                f.write(f"Status Code: {response.status_code}\n")
                f.write(f"Headers Content-Type: {response.headers.get('content-type')}\n")
                f.write(f"Content length: {len(response.content)} bytes\n")
                f.write(f"Sample response: {str(response.content[:100])}...\n")
            else:
                f.write("Could not find pdf report route.\n")

if __name__ == "__main__":
    test_manual_endpoints()
