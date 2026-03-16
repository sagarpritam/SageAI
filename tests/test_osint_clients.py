import pytest
import httpx
from unittest.mock import patch, MagicMock
from app.services.intelligence.shodan_intel import shodan_scan
from app.services.intelligence.censys_intel import censys_scan

@pytest.fixture
def mock_dns_resolve():
    with patch("socket.gethostbyname") as mock_gethostbyname:
        mock_gethostbyname.return_value = "8.8.8.8"
        yield mock_gethostbyname

@pytest.mark.asyncio
async def test_shodan_free_scan(httpx_mock, mock_dns_resolve, monkeypatch):
    # Ensure no API key is set to trigger free scan
    monkeypatch.delenv("SHODAN_API_KEY", raising=False)
    
    # Mocking the InternetDB API
    httpx_mock.add_response(
        url="https://internetdb.shodan.io/8.8.8.8",
        json={
            "ip": "8.8.8.8",
            "ports": [53, 443],
            "cpes": ["cpe:/a:google:dns"],
            "hostnames": ["dns.google"],
            "vulns": ["CVE-2020-1234"]
        }
    )

    findings = await shodan_scan("dns.google")
    assert len(findings) == 4
    
    cve_finding = next((f for f in findings if f["type"] == "known_vulnerabilities"), None)
    assert cve_finding is not None
    assert "CVE-2020-1234" in cve_finding["data"]["cve_ids"]
    
    port_finding = next((f for f in findings if f["type"] == "open_ports"), None)
    assert port_finding is not None
    assert 53 in port_finding["data"]["ports"]

@pytest.mark.asyncio
async def test_shodan_pro_scan(httpx_mock, mock_dns_resolve, monkeypatch):
    # Set the API key to trigger Pro scan
    monkeypatch.setenv("SHODAN_API_KEY", "test_key")
    
    # Mocking the REST API
    httpx_mock.add_response(
        url="https://api.shodan.io/shodan/host/8.8.8.8?key=test_key",
        json={
            "ip_str": "8.8.8.8",
            "os": "Linux",
            "vulns": ["CVE-2021-44228"],
            "data": [
                {
                    "port": 22,
                    "product": "OpenSSH",
                    "version": "8.2",
                    "data": "SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5\r\n",
                    "transport": "tcp"
                }
            ]
        }
    )

    findings = await shodan_scan("dns.google")
    assert len(findings) > 0
    
    os_finding = next((f for f in findings if f["type"] == "os_detection"), None)
    assert os_finding is not None
    assert os_finding["data"]["os"] == "Linux"
    
    svc_finding = next((f for f in findings if f["type"] == "service_banner"), None)
    assert svc_finding is not None
    assert svc_finding["data"]["port"] == 22

@pytest.mark.asyncio
async def test_censys_free_scan(httpx_mock, mock_dns_resolve, monkeypatch):
    monkeypatch.delenv("CENSYS_API_ID", raising=False)
    monkeypatch.delenv("CENSYS_API_SECRET", raising=False)
    
    httpx_mock.add_response(
        url="https://crt.sh/?q=%25.example.com&output=json",
        json=[
            {
                "issuer_name": "C=US, O=Let's Encrypt, CN=R3",
                "common_name": "example.com",
                "name_value": "example.com\nwww.example.com",
                "not_after": "2050-01-01T00:00:00"
            }
        ]
    )
    
    # Mock TLS scan
    with patch("ssl.create_default_context") as mock_ssl:
        mock_context = MagicMock()
        mock_ssl.return_value = mock_context
        mock_sock = MagicMock()
        mock_context.wrap_socket.return_value.__enter__.return_value = mock_sock
        mock_sock.getpeercert.return_value = {"issuer": "Fake Issuer"}
        mock_sock.version.return_value = "TLSv1.3"
        
        with patch("socket.create_connection") as mock_conn:
            # We must mock __enter__ for context manager
            mock_conn.return_value.__enter__.return_value = MagicMock()
            
            findings = await censys_scan("example.com")
            
            ct_finding = next((f for f in findings if f["type"] == "certificate_transparency"), None)
            assert ct_finding is not None
            assert "www.example.com" in ct_finding["data"]["domains"]
            
            tls_finding = next((f for f in findings if f["type"] == "tls_inspection"), None)
            assert tls_finding is not None
            assert tls_finding["data"]["protocol"] == "TLSv1.3"

@pytest.mark.asyncio
async def test_censys_api_scan(httpx_mock, mock_dns_resolve, monkeypatch):
    monkeypatch.setenv("CENSYS_API_ID", "test_id")
    monkeypatch.setenv("CENSYS_API_SECRET", "test_secret")
    
    httpx_mock.add_response(
        url="https://search.censys.io/api/v2/hosts/search?q=example.com&per_page=25",
        json={
            "result": {
                "hits": [
                    {
                        "ip": "93.184.216.34",
                        "services": [
                            {
                                "service_name": "HTTP",
                                "port": 80,
                                "transport_protocol": "TCP"
                            }
                        ]
                    }
                ]
            }
        }
    )
    
    findings = await censys_scan("example.com")
    
    svc_finding = next((f for f in findings if f["type"] == "exposed_service"), None)
    assert svc_finding is not None
    assert svc_finding["data"]["port"] == 80
    assert svc_finding["data"]["service"] == "HTTP"
