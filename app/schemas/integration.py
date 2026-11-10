from typing import Optional

from pydantic import BaseModel, Field


class GitHubTokenRequest(BaseModel):
    token: Optional[str] = Field(
        None, description="The GitHub Personal Access Token (PAT)"
    )
    pat: Optional[str] = Field(
        None, description="Alias for token accepted from frontend clients"
    )


class IntegrationStatusResponse(BaseModel):
    has_github_token: bool


class VerifyKeyRequest(BaseModel):
    provider: str = Field(
        ..., description="Provider: nvidia, censys, shodan, virustotal, github"
    )
    key: str = Field(..., description="Primary API key or token")
    secondary_key: Optional[str] = Field(
        None, description="Secondary secret (used for Censys API Secret)"
    )


class VerifyKeyResponse(BaseModel):
    valid: bool
    provider: str
    message: Optional[str] = None
    error: Optional[str] = None
    latency_ms: Optional[int] = None
    model: Optional[str] = None


class SaveIntegrationRequest(BaseModel):
    provider: str = Field(..., description="Provider name to save")
    key: str = Field(..., description="Primary API key or token")
    secondary_key: Optional[str] = Field(None, description="Optional secondary secret")
