from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_manual_endpoints():
    with open("test_out.log", "w", encoding="utf-8") as f:
        f.write("Testing Endpoints Manually...\n")
        
        # 1. Test /autofix endpoint
        f.write("\n--- Testing /autofix ---\n")
        autofix_payload = {
            "finding": {
                "title": "Hardcoded AWS Access Key",
                "description": "Found a hardcoded AWS key in src/main.py",
                "file_path": "src/main.py",
                "line_number": 42
            },
            "repo_url": "https://github.com/mock/repo",
            "simulate": True
        }
        
        # Checking autofix route
        # Instead of guessing, let's look at the routes for autofix
        routes = [route.path for route in app.routes]
        f.write(f"Routes: {routes}\n")
        
        # the autofix is '/api/autofix' or something. 
        autofix_route = next((r for r in routes if "autofix" in r), None)
        
        if autofix_route:
            response = client.post(autofix_route, json=autofix_payload)
            f.write(f"Status Code: {response.status_code}\n")
            f.write(f"Response: {response.json() if response.status_code == 200 else response.text}\n")
        else:
            f.write("Could not find autofix route.\n")

        # 2. Test /reports/{scan_id}/pdf
        f.write("\n--- Testing /reports/{scan_id}/pdf ---\n")
        report_route_pdf = next((r for r in routes if "pdf" in r and "reports" in r), None)
        if report_route_pdf:
            test_route = report_route_pdf.replace("{scan_id}", "test_scan_123")
            response = client.get(test_route)
            f.write(f"Status Code: {response.status_code}\n")
            f.write(f"Headers Content-Type: {response.headers.get('content-type')}\n")
            f.write(f"Content length: {len(response.content)} bytes\n")
            f.write(f"Sample response: {str(response.content[:100])}...\n")
        else:
            f.write("Could not find pdf report route.\n")

if __name__ == "__main__":
    test_manual_endpoints()
