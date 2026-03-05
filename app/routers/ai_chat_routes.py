"""AI Chat interface powered by RAG Knowledge Base."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_user
from app.models.user import User
from app.services.llm.gateway import llm_gateway
from app.services.rag.vector_store import vector_store
import logging

logger = logging.getLogger("SageAI.chat")

router = APIRouter(prefix="/ai", tags=["AI Chat"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    sources: list[dict] = []

@router.post("/chat", response_model=ChatResponse)
async def ai_security_chat(payload: ChatRequest, current_user: User = Depends(get_current_user)):
    """
    Chat endpoint for the AI Security Assistant.
    Retrieves relevant cybersecurity knowledge via RAG and answers the user's question.
    """
    user_msg = payload.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    try:
        # Retrieve context from RAG vector store
        docs = await vector_store.search(user_msg, top_k=2)
        
        context_str = ""
        sources = []
        if docs:
            context_str = "Relevant Security Knowledge:\n"
            for d in docs:
                context_str += f"- {d['text']}\n"
                sources.append({"title": d["metadata"].get("title", "Unknown Source")})
                
        system_prompt = (
            "You are SageAI, an elite AI cybersecurity assistant and penetration tester. "
            "You help users understand vulnerabilities, secure their applications, and analyze scan results. "
            "If relevant security knowledge is provided below, use it to ensure your answers are highly technical, accurate, and aligned with industry standards (like OWASP). "
            "Keep your responses professional, concise, and natively formatted in markdown."
        )
        
        if context_str:
            system_prompt += f"\n\n{context_str}"
            
        # Call LLM Gateway
        org_id = current_user.memberships[0].organization_id if current_user.memberships else "system"
        reply = await llm_gateway.generate(
            prompt=user_msg,
            system_message=system_prompt,
            org_id=str(org_id)
        )
        
        return ChatResponse(reply=reply, sources=sources)
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="The AI Assistant is currently unavailable.")
