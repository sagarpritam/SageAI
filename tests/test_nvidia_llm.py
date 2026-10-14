from unittest.mock import patch

import pytest

from app.core.config import settings
from app.services.llm.nvidia_client import NvidiaClient


@pytest.mark.asyncio
async def test_nvidia_client_generate():
    # Mock settings
    with patch.object(settings, "NVIDIA_API_KEY", "test-key"):
        client = NvidiaClient()

        from unittest.mock import MagicMock

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "Hello from NVIDIA"}}],
            "usage": {"prompt_tokens": 10, "completion_tokens": 5},
        }
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient.post", return_value=mock_response):
            result = await client.generate("Hello", system_message="Be helpful")

            assert result["content"] == "Hello from NVIDIA"
            assert result["usage"]["prompt_tokens"] == 10
            assert result["usage"]["completion_tokens"] == 5


@pytest.mark.asyncio
async def test_nvidia_client_no_key():
    with patch.object(settings, "NVIDIA_API_KEY", ""):
        client = NvidiaClient()
        with pytest.raises(
            ValueError, match="NVIDIA_API_KEY environment variable is not set"
        ):
            await client.generate("Hello")
