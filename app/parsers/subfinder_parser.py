"""Subfinder output parser — normalizes subdomain enumeration results."""

from typing import List

from pydantic import BaseModel, Field


class SubdomainEntry(BaseModel):
    """A single discovered subdomain."""

    subdomain: str
    source: str = Field(
        default="subfinder", description="Tool that discovered this subdomain"
    )


class SubdomainResult(BaseModel):
    """Structured result from subdomain enumeration."""

    domain: str
    entries: List[SubdomainEntry] = Field(default_factory=list)
    total: int = 0
    elapsed_seconds: float = 0.0
    is_mock: bool = False


def parse_subfinder_results(
    domain: str,
    subdomains: List[str],
    elapsed_seconds: float = 0.0,
    is_mock: bool = False,
    source: str = "subfinder",
) -> SubdomainResult:
    """Convert a raw list of subdomains into a structured result.

    Parameters
    ----------
    domain : str
        The root domain that was enumerated.
    subdomains : list[str]
        Raw list of subdomain strings.
    elapsed_seconds : float
        Time taken for the scan.
    is_mock : bool
        Whether the data came from mock mode.
    source : str
        The tool that produced the subdomains.
    """
    entries = [
        SubdomainEntry(subdomain=s.strip().lower(), source=source)
        for s in subdomains
        if s and s.strip()
    ]
    # De-duplicate
    seen = set()
    unique: List[SubdomainEntry] = []
    for entry in entries:
        if entry.subdomain not in seen:
            seen.add(entry.subdomain)
            unique.append(entry)

    return SubdomainResult(
        domain=domain,
        entries=unique,
        total=len(unique),
        elapsed_seconds=elapsed_seconds,
        is_mock=is_mock,
    )
