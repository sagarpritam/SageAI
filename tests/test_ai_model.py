import pytest
from unittest.mock import patch, AsyncMock
from app.services.agent.developer_agent import DeveloperAgent

@pytest.mark.asyncio
async def test_developer_agent_patch_generation():
    """
    Test that the Developer Agent correctly formats the payload and parses the LLM response.
    Since we are mocking the LLM API call, this guarantees the wrapper logic is solid.
    """
    mock_github = AsyncMock()
    agent = DeveloperAgent(github_service=mock_github)

    mocked_llm_response = "def secure_render():\n    return 'safe_string'"

    # Mock the internal LLM completion gateway call
    with patch("app.services.agent.developer_agent.llm_gateway.generate", new_callable=AsyncMock) as mock_call_llm:
        mock_call_llm.return_value = mocked_llm_response
        
        # Test input 
        vulnerability_data = {
            "file": "app/main.py",
            "line": 45,
            "issue_text": "Cross-Site Scripting (XSS)",
            "test_name": "XSS",
            "code_snippet": "def render(): return '<script>alert()</script>'"
        }

        # Configure the github mock to return our snippet
        mock_github.fetch_file_content.return_value = "def render(): return '<script>alert()</script>'"
        
        # Since generate_patch runs bandit against generated patch, mock verification to avoid executing Bandit
        with patch.object(agent, '_verify_patch', new_callable=AsyncMock) as mock_verify:
            mock_verify.return_value = False # False means no vulnerabilities found after patch
            
            result = await agent.generate_patch("fake_owner", "fake_repo", vulnerability_data)
            
        # Assertions
        assert result is not None
        assert "patched_code" in result
        assert "secure" in result["patched_code"].lower()
        
        # Ensure the LLM gateway was actually called with our prompt
        mock_call_llm.assert_called_once()
        called_prompt = mock_call_llm.call_args[0][0]
        assert "Cross-Site Scripting" in called_prompt

@pytest.mark.asyncio
async def test_ai_fallback_logic():
    """
    Test that the agent gracefully handles an LLM failure or timeout, fallback to basic logic
    """
    mock_github = AsyncMock()
    agent = DeveloperAgent(github_service=mock_github)

    with patch("app.services.agent.developer_agent.llm_gateway.generate", new_callable=AsyncMock) as mock_call_llm:
        mock_call_llm.side_effect = Exception("Ollama service unavailable or timeout")
        
        vulnerability_data = {
            "file": "app/main.py",
            "line": 45,
            "issue_text": "Cross-Site Scripting (XSS)",
            "test_name": "XSS",
            "code_snippet": "def render(): return '<script>alert()</script>'"
        }

        mock_github.fetch_file_content.return_value = "def render(): return '<script>alert()</script>'"
        
        result = await agent.generate_patch("fake_owner", "fake_repo", vulnerability_data)
        
        assert result is None
