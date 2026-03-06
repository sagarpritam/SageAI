"""Tool Abstraction Layer and Registry."""

from .base import BaseTool
from .nmap_scanner import NmapScannerTool
from .ssl_scanner_tool import SslScannerTool
from .dns_scanner_tool import DnsScannerTool
from .http_vuln_scanner import HttpVulnScannerTool
from .osint_scanner import OsintScannerTool
from .sast_scanner import SASTScanner
from .github_pr_tool import GitHubPRTool

# Instantiate tools
TOOLS = [
    NmapScannerTool(),
    SslScannerTool(),
    DnsScannerTool(),
    HttpVulnScannerTool(),
    OsintScannerTool(),
    SASTScanner(),
    GitHubPRTool(),
]

TOOL_REGISTRY = {tool.name: tool for tool in TOOLS}

def get_tool(name: str) -> BaseTool | None:
    """Retrieve a tool by name."""
    return TOOL_REGISTRY.get(name)

def get_all_tools() -> list[BaseTool]:
    """Retrieve all available tools."""
    return TOOLS

