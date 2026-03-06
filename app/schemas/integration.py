from pydantic import BaseModel, Field

class GitHubTokenRequest(BaseModel):
    token: str = Field(..., description="The GitHub Personal Access Token (PAT)")

class IntegrationStatusResponse(BaseModel):
    has_github_token: bool
