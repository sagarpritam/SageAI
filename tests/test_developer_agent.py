import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.services.agent.developer_agent import DeveloperAgent

@pytest.fixture
def mock_github_service():
    github = MagicMock()
    github.fetch_file_content = AsyncMock(return_value="def insecure_func():\n    eval('print(\"hello\")')\n")
    return github

@pytest.fixture
def sample_finding():
    return {
        "file": "app/insecure.py",
        "test_name": "B307",
        "severity": "MEDIUM",
        "test_id": "B307",
        "issue_text": "Use of eval detected.",
        "line": 2
    }

@pytest.mark.asyncio
async def test_developer_agent_success(mock_github_service, sample_finding):
    agent = DeveloperAgent(github_service=mock_github_service)
    
    with patch("app.services.agent.developer_agent.llm_gateway.generate", new_callable=AsyncMock) as mock_llm:
        # LLM returns fixed code
        mock_llm.return_value = "```python\ndef insecure_func():\n    print(\"hello\")\n```"
        
        with patch("app.services.agent.developer_agent.validate_patch") as mock_validate:
            mock_validate.return_value = {"approved": True, "reasons": []}
            
            with patch.object(agent, "_verify_patch", new_callable=AsyncMock) as mock_verify:
                mock_verify.return_value = False # No vulnerabilities found
                
                result = await agent.generate_patch(owner="test", repo="repo", finding=sample_finding)
                
                assert result is not None
                assert result["patched_code"] == "def insecure_func():\n    print(\"hello\")"
                assert result["vulnerability"]["type"] == "B307"
                
                # Verify methods called
                mock_github_service.fetch_file_content.assert_called_once()
                mock_llm.assert_called_once()
                mock_validate.assert_called_once()
                mock_verify.assert_called_once()

@pytest.mark.asyncio
async def test_developer_agent_guardrail_rejection(mock_github_service, sample_finding):
    agent = DeveloperAgent(github_service=mock_github_service)
    # Fast retry fail
    agent.MAX_RETRIES = 1
    
    with patch("app.services.agent.developer_agent.llm_gateway.generate", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = "def insecure_func():\n    os.system('rm -rf /')"
        
        with patch("app.services.agent.developer_agent.validate_patch") as mock_validate:
            # Guardrails reject it
            mock_validate.return_value = {"approved": False, "reasons": ["Import of OS system detected"]}
            
            result = await agent.generate_patch(owner="test", repo="repo", finding=sample_finding)
            
            # Should fail and return None
            assert result is None
            
@pytest.mark.asyncio
async def test_developer_agent_verify_fails(mock_github_service, sample_finding):
    agent = DeveloperAgent(github_service=mock_github_service)
    agent.MAX_RETRIES = 1
    
    with patch("app.services.agent.developer_agent.llm_gateway.generate", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = "def insecure_func():\n    eval('print(\"hello\")')"
        
        with patch("app.services.agent.developer_agent.validate_patch") as mock_validate:
            mock_validate.return_value = {"approved": True, "reasons": []}
            
            with patch.object(agent, "_verify_patch", new_callable=AsyncMock) as mock_verify:
                # Bandit scan still finds issue
                mock_verify.return_value = True 
                
                result = await agent.generate_patch(owner="test", repo="repo", finding=sample_finding)
                
                # Should fail after retries exhausted
                assert result is None
