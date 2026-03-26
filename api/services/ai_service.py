"""AI Service — centralized LLM gateway with retry logic.

Wraps OpenAI API calls with:
- Configurable model via environment
- Tenacity exponential-backoff retries
- Token usage logging
- Structured output via Pydantic response models
"""

import os
import logging
from typing import Any, Optional, Type

from pydantic import BaseModel
import openai
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

logger = logging.getLogger(__name__)

# ── Configuration ────────────────────────────────────────────────
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
LLM_MAX_RETRIES = int(os.getenv("LLM_MAX_RETRIES", "3"))
LLM_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "30"))

client = openai.OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", "dummy-key-for-now"),
    timeout=LLM_TIMEOUT,
)


# Retry on transient OpenAI errors
@retry(
    stop=stop_after_attempt(LLM_MAX_RETRIES),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    retry=retry_if_exception_type((
        openai.APITimeoutError,
        openai.RateLimitError,
        openai.APIConnectionError,
        openai.InternalServerError,
    )),
    before_sleep=before_sleep_log(logger, logging.WARNING),
    reraise=True,
)
def call_llm(
    prompt: str,
    system_prompt: str = "You are a senior cybersecurity expert.",
    response_model: Optional[Type[BaseModel]] = None,
    max_tokens: int = 1500,
    temperature: float = 0.2,
) -> Any:
    """Call the LLM with optional structured output via a Pydantic model.

    Retries up to ``LLM_MAX_RETRIES`` times on transient errors with
    exponential backoff.

    Parameters
    ----------
    prompt : str
        The user prompt.
    system_prompt : str
        System-level instructions.
    response_model : Type[BaseModel] | None
        If provided, uses OpenAI structured output to enforce this schema.
    max_tokens : int
        Maximum completion tokens.
    temperature : float
        Sampling temperature.
    """
    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ]

        logger.info(
            "Calling LLM model=%s  structured=%s  max_tokens=%d",
            LLM_MODEL, response_model is not None, max_tokens,
        )

        if response_model:
            response = client.beta.chat.completions.parse(
                model=LLM_MODEL,
                messages=messages,
                response_format=response_model,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            # Log token usage
            if hasattr(response, "usage") and response.usage:
                logger.info(
                    "LLM tokens: prompt=%d  completion=%d  total=%d",
                    response.usage.prompt_tokens,
                    response.usage.completion_tokens,
                    response.usage.total_tokens,
                )
            return response.choices[0].message.parsed
        else:
            response = client.chat.completions.create(
                model=LLM_MODEL,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            if hasattr(response, "usage") and response.usage:
                logger.info(
                    "LLM tokens: prompt=%d  completion=%d  total=%d",
                    response.usage.prompt_tokens,
                    response.usage.completion_tokens,
                    response.usage.total_tokens,
                )
            return response.choices[0].message.content

    except (openai.APITimeoutError, openai.RateLimitError, openai.APIConnectionError, openai.InternalServerError):
        # Let tenacity handle the retry
        raise

    except openai.AuthenticationError as exc:
        logger.error("OpenAI authentication failed — check OPENAI_API_KEY: %s", exc)
        raise RuntimeError(f"AI Service authentication failed: {exc}")

    except Exception as exc:
        logger.error("AI Service unexpected error: %s", exc)
        raise RuntimeError(f"AI Service failed: {exc}")
