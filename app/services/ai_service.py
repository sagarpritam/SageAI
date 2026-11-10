import json
import logging
from typing import Any, Type, TypeVar

from pydantic import BaseModel

logger = logging.getLogger(__name__)

TModel = TypeVar("TModel", bound=BaseModel)


def call_llm(
    prompt: str,
    system_prompt: str,
    response_model: Type[TModel],
) -> TModel:
    """
    Core AI Inference Engine for SageAI Agents.
    Routes intelligently to NVIDIA's OpenAI-compatible NIM APIs.
    Requires NVIDIA_API_KEY to be set in environment or config.
    """
    import openai

    from app.core.config import Settings

    settings = Settings()

    # Priority 1: NVIDIA NeMo / LLaMA-based NIMs
    if settings.NVIDIA_API_KEY:
        client = openai.OpenAI(
            api_key=settings.NVIDIA_API_KEY,
            base_url="https://integrate.api.nvidia.com/v1",
        )
        model = "meta/llama3-70b-instruct"
    # Priority 2: Standard OpenAI (Fallback)
    elif settings.OPENAI_API_KEY:
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        model = "gpt-4o-mini"
    else:
        raise ValueError(
            "No AI Provider configured. Please set NVIDIA_API_KEY or OPENAI_API_KEY."
        )

    schema = response_model.model_json_schema()

    # Instruct the LLM specifically to output the correct JSON
    full_system_prompt = (
        f"{system_prompt}\n\n"
        f"You must respond ONLY with valid JSON. "
        f"The JSON must strictly match this schema:\n{json.dumps(schema, indent=2)}\n"
        f"Do not include markdown blocks like ```json."
    )

    logger.info(f"Calling AI Engine ({model}) for {response_model.__name__}...")

    messages: list[Any] = [
        {"role": "system", "content": full_system_prompt},
        {"role": "user", "content": prompt},
    ]
    if "llama3" not in model:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )
    else:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
            max_tokens=2048,
        )

    content = (response.choices[0].message.content or "").strip()

    # Clean up markdown if the LLM hallucinated it despite instructions
    if content.startswith("```json"):
        content = content.replace("```json", "", 1)
    if content.startswith("```"):
        content = content.replace("```", "", 1)
    if content.endswith("```"):
        content = content[: content.rfind("```")]

    try:
        return response_model.model_validate_json(content)
    except Exception as e:
        logger.error(f"Failed to parse AI response into {response_model.__name__}: {e}")
        logger.debug(f"Raw Output: {content}")
        raise ValueError(f"AI response violated schema constraints: {e}")
