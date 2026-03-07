from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import get_current_user
from app.core.database import get_db
from app.models.scan import Scan
from app.models.finding import Finding
from app.services.llm.gateway import llm_gateway
from app.services.rag.vector_store import vector_store
import logging

logger = logging.getLogger("SageAI.chat")

router = APIRouter(prefix="/ai", tags=["AI Chat"])

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    sources: list[dict] = []

@router.post("/chat", response_model=ChatResponse)
async def ai_security_chat(
    payload: ChatRequest, 
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Chat endpoint for the AI Security Assistant.
    Retrieves relevant cybersecurity knowledge via RAG, and optionally injects live scan context.
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
        
        # ── V2 Scan Context Injection ──
        if payload.context and "scan_id" in payload.context:
            scan_id = payload.context["scan_id"]
            
            # Verify org ownership
            org_id = current_user.get("org", "system")
            result = await db.execute(select(Scan).where(Scan.id == scan_id, Scan.organization_id == str(org_id)))
            scan = result.scalar_one_or_none()
            
            if scan:
                # Fetch findings
                f_result = await db.execute(select(Finding).where(Finding.scan_id == scan.id))
                findings = f_result.scalars().all()
                
                scan_context = f"\n\nCURRENT SCAN CONTEXT (Target: {scan.target}):\n"
                if findings:
                    for f in findings:
                        scan_context += f"- [{f.severity}] {f.title}: {f.description}\n"
                else:
                    scan_context += "- No vulnerabilities found in this scan.\n"
                
                system_prompt += scan_context
                
        if context_str:
            system_prompt += f"\n\n{context_str}"
            
        # Call LLM Gateway
        org_id = current_user.get("org", "system")
        reply = await llm_gateway.generate(
            prompt=user_msg,
            system_message=system_prompt,
            org_id=str(org_id)
        )
        
        return ChatResponse(reply=reply, sources=sources)
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="The AI Assistant is currently unavailable.")

