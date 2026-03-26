import pytest
from unittest.mock import patch, AsyncMock
from uuid import UUID

@pytest.fixture
def mock_run_scans():
    with patch("app.routers.scan_routes.run_all_scans", new_callable=AsyncMock) as mock_run:
        mock_run.return_value = [
            {
                "type": "SQL Injection",
                "description": "SQL injection found in login form.",
                "severity": "High",
                "cvss": 8.5,
                "source": "sast_scanner"
            },
            {
                "type": "Open Port 80",
                "description": "HTTP port is open.",
                "severity": "Low",
                "cvss": 2.0,
                "source": "nmap_scanner"
            }
        ]
        yield mock_run

@pytest.mark.asyncio
async def test_full_scan_lifecycle(client, auth_headers, mock_run_scans):
    # 1. Trigger the scan
    payload = {"target": "https://integration-test.com/"}
    create_resp = await client.post("/scan", json=payload, headers=auth_headers)
    
    assert create_resp.status_code == 201
    create_data = create_resp.json()
    assert create_data["status"] == "completed"
    assert create_data["target"] == "https://integration-test.com/"
    
    # Verify the mock was called
    mock_run_scans.assert_called_once()
    
    scan_id = create_data["id"]
    assert scan_id is not None
    
    # Assert risk was calculated
    assert create_data["risk_summary"]["risk_level"] in ("High", "Critical")

    # 2. Verify the scan was persisted along with the specific findings
    findings_resp = await client.get(f"/scan/{scan_id}/findings", headers=auth_headers)
    assert findings_resp.status_code == 200
    findings_data = findings_resp.json()
    
    # We returned 2 findings in our mock, they should be persisted
    assert len(findings_data) == 2
    
    sql_finding = next(f for f in findings_data if f["title"] == "SQL Injection")
    assert sql_finding["severity"] == "High"
    assert float(sql_finding["cvss_score"]) == 8.5
    
    port_finding = next(f for f in findings_data if f["title"] == "Open Port 80")
    assert port_finding["severity"] == "Low"
    
    # 3. List the scans and verify the overall risk is tracked
    list_resp = await client.get("/scans", headers=auth_headers)
    assert list_resp.status_code == 200
    scans_list = list_resp.json()
    
    # Find our scan in the list
    my_scan = next((s for s in scans_list if s["id"] == scan_id), None)
    assert my_scan is not None
    assert my_scan["risk_level"] in ("High", "Critical")
    assert my_scan["status"] == "completed"

@pytest.mark.asyncio
async def test_scan_failure_lifecycle(client, auth_headers):
    # If the scanner raises an exception, the scan should be marked as "failed"
    with patch("app.routers.scan_routes.run_all_scans", new_callable=AsyncMock) as mock_run:
        mock_run.side_effect = Exception("Integration test failure simulation")
        
        payload = {"target": "https://fail-test.com"}
        resp = await client.post("/scan", json=payload, headers=auth_headers)
        
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "failed"
        assert len(data["findings"]) == 0
        
        scan_id = data["id"]
        
        # Verify it persisted as failed
        get_resp = await client.get(f"/scan/{scan_id}", headers=auth_headers)
        assert get_resp.status_code == 200
        assert get_resp.json()["status"] == "failed"
