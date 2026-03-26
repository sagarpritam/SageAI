"""Nmap output parser — converts nmap dict output into typed Pydantic models."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class NmapService(BaseModel):
    """Service detected on a port."""
    name: str = Field(default="unknown")
    product: Optional[str] = None
    version: Optional[str] = None
    extrainfo: Optional[str] = None


class NmapPort(BaseModel):
    """An open port found by nmap."""
    portid: str
    protocol: str = "tcp"
    state: str = "open"
    reason: Optional[str] = None
    service: Optional[NmapService] = None


class NmapHost(BaseModel):
    """A host scanned by nmap."""
    addresses: List[Dict[str, str]] = Field(default_factory=list)
    hostnames: List[Dict[str, str]] = Field(default_factory=list)
    ports: List[NmapPort] = Field(default_factory=list)

    @property
    def ip(self) -> str:
        """Return the first IPv4 address, if any."""
        for addr in self.addresses:
            if addr.get("addrtype") == "ipv4":
                return addr.get("addr", "")
        return self.addresses[0].get("addr", "") if self.addresses else ""

    @property
    def hostname(self) -> str:
        """Return the first hostname, if any."""
        return self.hostnames[0].get("name", "") if self.hostnames else ""

    @property
    def open_port_count(self) -> int:
        return len(self.ports)


class NmapResult(BaseModel):
    """Structured result from nmap scan."""
    hosts: List[NmapHost] = Field(default_factory=list)
    elapsed_seconds: float = 0.0
    is_mock: bool = False

    @property
    def total_open_ports(self) -> int:
        return sum(h.open_port_count for h in self.hosts)


def parse_nmap_results(raw: Dict[str, Any]) -> NmapResult:
    """Convert the raw dict from ``nmap_wrapper.parse_nmap_xml`` into typed models.

    Parameters
    ----------
    raw : dict
        The dict returned by ``run_nmap()`` or ``parse_nmap_xml()``.
    """
    hosts: List[NmapHost] = []
    for host_data in raw.get("hosts", []):
        ports: List[NmapPort] = []
        for p in host_data.get("ports", []):
            svc = None
            if p.get("service"):
                svc = NmapService(**{k: v for k, v in p["service"].items() if v is not None})
            ports.append(NmapPort(
                portid=p.get("portid", "0"),
                protocol=p.get("protocol", "tcp"),
                state=p.get("state", "open"),
                reason=p.get("reason"),
                service=svc,
            ))
        hosts.append(NmapHost(
            addresses=host_data.get("addresses", []),
            hostnames=host_data.get("hostnames", []),
            ports=ports,
        ))

    return NmapResult(
        hosts=hosts,
        elapsed_seconds=raw.get("elapsed_seconds", 0.0),
        is_mock=raw.get("is_mock", False),
    )
