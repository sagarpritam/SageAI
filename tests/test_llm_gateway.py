import pytest
from unittest.mock import patch
from app.services.llm.gateway import llm_gateway

@pytest.mark.asyncio
async def test_llm_gateway_failover():
    """Test that the gateway tries the next provider if the first fails."""
    # Reset internal state
    llm_gateway.error_counts = {"openai": 0, "anthropic": 0, "nvidia": 0}
    llm_gateway.circuit_open = {"openai": False, "anthropic": False, "nvidia": False}

    with patch("app.services.llm.gateway.OpenAIClient.generate") as mock_openai, \
         patch("app.services.llm.gateway.AnthropicClient.generate") as mock_anthropic:
        
        # Make OpenAI fail
        mock_openai.side_effect = Exception("OpenAI Error")
        
        # Make Anthropic succeed
        mock_anthropic.return_value = {"content": "Success", "usage": {"total_tokens": 10}}
        
        response = await llm_gateway.generate("Test prompt")
        
        assert response == "Success"
        assert llm_gateway.error_counts["openai"] == 2  # max_retries
        assert llm_gateway.circuit_open["openai"] is True
        assert llm_gateway.error_counts["anthropic"] == 0

@pytest.mark.asyncio
async def test_llm_gateway_circuit_breaker():
    """Test that the circuit breaker trips after max retries."""
    llm_gateway.error_counts = {"openai": 2, "anthropic": 0, "nvidia": 0} 
    llm_gateway.circuit_open = {"openai": True, "anthropic": False, "nvidia": False}
    
    with patch("app.services.llm.gateway.AnthropicClient.generate") as mock_anthropic:
        mock_anthropic.return_value = {"content": "Success", "usage": {"total_tokens": 10}}
        
        response = await llm_gateway.generate("Test prompt")
        
        assert response == "Success"
        assert llm_gateway.circuit_open["openai"] is True
