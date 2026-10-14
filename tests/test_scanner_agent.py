from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.agent.scanner_agent import ScannerAgent


@pytest.mark.asyncio
async def test_scanner_agent_run():
    agent = ScannerAgent(org_id="test_org")

    # Mock the tools
    mock_tool1 = MagicMock()
    mock_tool1.name = "nmap_scanner"
    mock_tool1.run = AsyncMock(
        return_value=[{"type": "open_port", "port": 80, "protocol": "tcp"}]
    )

    mock_tool2 = MagicMock()
    mock_tool2.name = "http_vuln_scanner"
    mock_tool2.run = AsyncMock(
        return_value=[{"type": "vuln", "detail": "Missing headers"}]
    )

    with patch(
        "app.services.agent.scanner_agent.get_all_tools",
        return_value=[mock_tool1, mock_tool2],
    ):
        with patch(
            "app.services.agent.scanner_agent.llm_gateway.generate"
        ) as mock_llm_generate:
            # Mock the LLM returning a JSON clean array
            mock_llm_generate.return_value = """
            [
              {
                "type": "Open Port 80",
                "description": "Port 80 is open.",
                "severity": "Info",
                "source": "nmap_scanner",
                "owasp": null,
                "cve": null,
                "evidence": "{'port': 80}"
              }
            ]
            """

            result = await agent.run(target="127.0.0.1", context="port http scan")

            assert result["agent"] == "ScannerAgent"
            assert result["target"] == "127.0.0.1"
            assert "raw_results" in result
            assert "nmap_scanner" in result["raw_results"]
            assert "http_vuln_scanner" in result["raw_results"]

            # Verify the LLM was called
            mock_llm_generate.assert_called_once()

            # Verify findings parsed correctly
            findings = result["findings"]
            assert len(findings) == 1
            assert findings[0]["type"] == "Open Port 80"
            assert findings[0]["severity"] == "Info"


@pytest.mark.asyncio
async def test_scanner_agent_llm_fallback():
    agent = ScannerAgent(org_id="test_org")

    mock_tool1 = MagicMock()
    mock_tool1.name = "nmap_scanner"
    mock_tool1.run = AsyncMock(
        return_value=[
            {"type": "open_port", "detail": "Port 80 is open", "severity": "info"}
        ]
    )

    with patch(
        "app.services.agent.scanner_agent.get_all_tools", return_value=[mock_tool1]
    ):
        with patch(
            "app.services.agent.scanner_agent.llm_gateway.generate"
        ) as mock_llm_generate:
            # Make the LLM raise an exception to test the fallback logic
            mock_llm_generate.side_effect = Exception("LLM is down")

            result = await agent.run(target="127.0.0.1", context="nmap scan")

            # The fallback logic should just directly translate raw tool results into findings
            findings = result["findings"]
            assert len(findings) == 1
            assert findings[0]["type"] == "open_port"
            assert findings[0]["description"] == "Port 80 is open"
            assert findings[0]["severity"] == "Info"
            assert findings[0]["source"] == "nmap_scanner"
