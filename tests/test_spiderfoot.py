import pytest
import httpx
from unittest.mock import patch, MagicMock
from app.services.intelligence.spiderfoot_intel import spiderfoot_scan

@pytest.fixture
def mock_dns_resolve():
    with patch("socket.gethostbyname") as mock_gethostbyname:
        mock_gethostbyname.return_value = "1.1.1.1"
        yield mock_gethostbyname

@pytest.mark.asyncio
async def test_spiderfoot_scan(httpx_mock, mock_dns_resolve):
    # Mock IPinfo
    httpx_mock.add_response(
        url="https://ipinfo.io/1.1.1.1/json",
        json={
            "ip": "1.1.1.1",
            "city": "Brisbane",
            "region": "Queensland",
            "country": "AU",
            "org": "AS13335 Cloudflare, Inc."
        }
    )
    
    # Mock ThreatCrowd
    httpx_mock.add_response(
        url="https://www.threatcrowd.org/searchApi/v2/domain/report/?domain=example.com",
        json={
            "response_code": "1",
            "subdomains": ["www.example.com", "api.example.com"],
            "emails": ["admin@example.com"],
            "resolutions": [{"ip_address": "1.1.1.1"}]
        }
    )
    
    # Mock URLScan
    httpx_mock.add_response(
        url="https://urlscan.io/api/v1/search/?q=domain:example.com&size=10",
        json={
            "total": 5,
            "results": [
                {
                    "page": {"url": "https://example.com", "ip": "1.1.1.1", "server": "nginx"},
                    "task": {"time": "2023-10-01T00:00:00Z"}
                }
            ]
        }
    )
    
    with patch("subprocess.run") as mock_subprocess:
        # We need subprocess.run to return a mock CompletedProcess
        # Since it's called multiple times (NS, A, MX, TXT), we can just return a generic successful output
        mock_completed = MagicMock()
        mock_completed.returncode = 0
        mock_completed.stdout = "nameserver = ns1.example.com\n1.1.1.1"
        mock_subprocess.return_value = mock_completed
        
        findings = await spiderfoot_scan("example.com")
        
        # 1 summary + 1 ipinfo + 3 threatcrowd (subdomains, emails, resolutions) + 1 urlscan + 1 whois NS + 3 DNS (A, MX, TXT)
        assert len(findings) > 0
        
        summary = next((f for f in findings if f["type"] == "recon_summary"), None)
        assert summary is not None
        
        geo = next((f for f in findings if f["type"] == "ip_geolocation"), None)
        assert geo is not None
        assert geo["data"]["country"] == "AU"
        
        emails = next((f for f in findings if f["type"] == "emails_discovered"), None)
        assert emails is not None
        assert "admin@example.com" in emails["data"]["emails"]
