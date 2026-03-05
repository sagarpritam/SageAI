"""Lightweight In-Memory Vector Store for RAG."""

import json
import math
import logging
from pathlib import Path
from typing import List, Dict, Any

from .embeddings import get_embedding

logger = logging.getLogger("SageAI.rag")

KNOWLEDGE_FILE = Path("app/data/knowledge.json")

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculate the cosine similarity between two vectors."""
    dot_product = sum(x * y for x, y in zip(v1, v2))
    magnitude1 = math.sqrt(sum(x * x for x in v1))
    magnitude2 = math.sqrt(sum(x * x for x in v2))
    if magnitude1 * magnitude2 == 0:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)

class VectorStore:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self._load()
        
    def _load(self):
        """Load knowledge base from disk."""
        if KNOWLEDGE_FILE.exists():
            try:
                with open(KNOWLEDGE_FILE, "r") as f:
                    self.documents = json.load(f)
                logger.info(f"Loaded {len(self.documents)} knowledge documents.")
            except Exception as e:
                logger.error(f"Failed to load knowledge base: {e}")
                
    def _save(self):
        """Save knowledge base to disk."""
        KNOWLEDGE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(KNOWLEDGE_FILE, "w") as f:
            json.dump(self.documents, f, indent=2)
            
    async def add_document(self, text: str, metadata: Dict[str, str] = None):
        """Embed and add a document to the store."""
        # Simple deduplication
        for doc in self.documents:
            if doc["text"] == text:
                return
                
        embedding = await get_embedding(text)
        self.documents.append({
            "text": text,
            "metadata": metadata or {},
            "embedding": embedding
        })
        self._save()
        logger.info(f"Added document: {metadata.get('title', 'Unknown')}")
        
    async def search(self, query: str, top_k: int = 3, threshold: float = 0.3) -> List[Dict[str, Any]]:
        """Search the vector store for the most relevant documents."""
        if not self.documents:
            return []
            
        try:
            query_embedding = await get_embedding(query)
        except Exception as e:
            logger.error(f"Failed to get query embedding: {e}")
            return []
            
        results = []
        for doc in self.documents:
            score = cosine_similarity(query_embedding, doc["embedding"])
            if score >= threshold:
                results.append({
                    "score": score,
                    "text": doc["text"],
                    "metadata": doc["metadata"]
                })
                
        # Sort by score descending and return top K
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

# Global singleton
vector_store = VectorStore()
