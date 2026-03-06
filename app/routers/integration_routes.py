from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.organization import Organization
from app.schemas.integration import GitHubTokenRequest, IntegrationStatusResponse
from app.core.encryption import encrypt

router = APIRouter(prefix="/integrations", tags=["Integrations"])


@router.get("/github/status", response_model=IntegrationStatusResponse)
async def get_github_integration_status(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Check if the organization has a GitHub Token configured."""
    org = await db.get(Organization, current_user["org"])
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    return IntegrationStatusResponse(has_github_token=bool(org.github_token_encrypted))


@router.post("/github/token")
async def set_github_token(
    request: GitHubTokenRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Securely encrypt and store a GitHub Personal Access Token for the organization."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can configure integrations."
        )

    org = await db.get(Organization, current_user["org"])
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    # Encrypt the token before storing it
    org.github_token_encrypted = encrypt(request.token)
    await db.commit()
    
    return {"message": "GitHub token securely stored."}


@router.delete("/github/token")
async def delete_github_token(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove the GitHub Personal Access Token for the organization."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can configure integrations."
        )

    org = await db.get(Organization, current_user["org"])
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    org.github_token_encrypted = None
    await db.commit()
    
    return {"message": "GitHub token removed."}
