"""OpenAI Embeddings Client for RAG."""

import httpx
from app.core.config import settings

async def get_embedding(text: str) -> list[float]:
    """Get the vector embedding for a block of text using OpenAI."""
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "input": text,
        "model": "text-embedding-3-small"
    }
    
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            "https://api.openai.com/v1/embeddings",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        data = response.json()
        return data["data"][0]["embedding"]
