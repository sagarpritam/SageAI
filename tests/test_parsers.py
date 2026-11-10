"""Tests for parsers — nuclei, nmap, and subfinder output parsing."""

from app.parsers.nmap_parser import NmapResult, parse_nmap_results
from app.parsers.nuclei_parser import NucleiFinding, parse_nuclei_findings
from app.parsers.subfinder_parser import parse_subfinder_results

# ── Nuclei Parser Tests ──────────────────────────────────────────


class TestNucleiParser:
    SAMPLE_FINDINGS = [
        {
            "template-id": "cve-2021-43798",
            "info": {
                "name": "Grafana Directory Traversal",
                "severity": "critical",
                "description": "Path traversal in Grafana",
                "tags": ["cve", "grafana"],
            },
            "type": "http",
            "host": "example.com",
            "matched-at": "http://example.com:8443/etc/passwd",
        },
        {
            "template-id": "missing-hsts",
            "info": {
                "name": "Missing HSTS",
                "severity": "info",
                "description": "HSTS header is missing",
            },
            "type": "http",
            "host": "example.com",
        },
    ]

    def test_parses_all(self):
        result = parse_nuclei_findings(self.SAMPLE_FINDINGS)
        assert len(result) == 2
        assert all(isinstance(f, NucleiFinding) for f in result)

    def test_severity_normalization(self):
        result = parse_nuclei_findings(self.SAMPLE_FINDINGS)
        assert result[0].severity == "critical"
        assert result[1].severity == "info"

    def test_min_severity_filter(self):
        result = parse_nuclei_findings(self.SAMPLE_FINDINGS, min_severity="medium")
        assert len(result) == 1
        assert result[0].name == "Grafana Directory Traversal"

    def test_extracts_fields(self):
        result = parse_nuclei_findings(self.SAMPLE_FINDINGS)
        f = result[0]
        assert f.template_id == "cve-2021-43798"
        assert f.description == "Path traversal in Grafana"
        assert f.host == "example.com"
        assert f.tags == ["cve", "grafana"]

    def test_empty_input(self):
        assert parse_nuclei_findings([]) == []


# ── Nmap Parser Tests ────────────────────────────────────────────


class TestNmapParser:
    SAMPLE_RAW = {
        "hosts": [
            {
                "addresses": [{"addr": "93.184.216.34", "addrtype": "ipv4"}],
                "hostnames": [{"name": "example.com", "type": "user"}],
                "ports": [
                    {
                        "portid": "80",
                        "protocol": "tcp",
                        "state": "open",
                        "service": {
                            "name": "http",
                            "product": "nginx",
                            "version": "1.21",
                        },
                    },
                    {
                        "portid": "443",
                        "protocol": "tcp",
                        "state": "open",
                        "service": {"name": "https"},
                    },
                ],
            }
        ],
        "elapsed_seconds": 3.5,
    }

    def test_parses_hosts(self):
        result = parse_nmap_results(self.SAMPLE_RAW)
        assert isinstance(result, NmapResult)
        assert len(result.hosts) == 1

    def test_host_properties(self):
        result = parse_nmap_results(self.SAMPLE_RAW)
        host = result.hosts[0]
        assert host.ip == "93.184.216.34"
        assert host.hostname == "example.com"
        assert host.open_port_count == 2

    def test_total_ports(self):
        result = parse_nmap_results(self.SAMPLE_RAW)
        assert result.total_open_ports == 2

    def test_service_details(self):
        result = parse_nmap_results(self.SAMPLE_RAW)
        port = result.hosts[0].ports[0]
        assert port.portid == "80"
        assert port.service is not None
        assert port.service.name == "http"
        assert port.service.product == "nginx"

    def test_empty_input(self):
        result = parse_nmap_results({})
        assert result.hosts == []
        assert result.total_open_ports == 0


# ── Subfinder Parser Tests ───────────────────────────────────────


class TestSubfinderParser:
    def test_basic_parsing(self):
        result = parse_subfinder_results(
            domain="example.com",
            subdomains=["api.example.com", "staging.example.com"],
        )
        assert result.domain == "example.com"
        assert result.total == 2

    def test_deduplication(self):
        result = parse_subfinder_results(
            domain="example.com",
            subdomains=["api.example.com", "api.example.com", "staging.example.com"],
        )
        assert result.total == 2

    def test_normalization(self):
        result = parse_subfinder_results(
            domain="example.com",
            subdomains=["  API.Example.COM  "],
        )
        assert result.entries[0].subdomain == "api.example.com"

    def test_empty_input(self):
        result = parse_subfinder_results(domain="example.com", subdomains=[])
        assert result.total == 0
        assert result.entries == []
