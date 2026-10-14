"""
Tests for Deep Search — Module 10: THE ABYSS.

Covers:
  - DeepSearchService recursive pivoting with mocked modules + LLM
  - DeepSearchAgent wrapper
  - Entity extraction prompt/response handling
  - Loop prevention (visited set)
  - Depth and entity caps
"""

from unittest.mock import AsyncMock, patch

import pytest

# ── Fixtures ───────────────────────────────────────────────────────────────────


@pytest.fixture
def mock_llm_pivots():
    """Mock LLM response that returns a structured pivot extraction."""
    return '{"pivots": [{"entity": "admin@example.com", "entity_type": "email", "confidence": 0.9, "source": "spiderfoot", "reason": "Found in WHOIS contact"}, {"entity": "sub.example.com", "entity_type": "domain", "confidence": 0.8, "source": "censys", "reason": "Certificate SAN entry"}], "analysis": "Target has exposed admin email and subdomain.", "risk_indicators": ["exposed admin email"]}'


@pytest.fixture
def mock_llm_no_pivots():
    """Mock LLM response that returns no pivots (leaf node)."""
    return '{"pivots": [], "analysis": "No additional entities found.", "risk_indicators": []}'


@pytest.fixture
def mock_llm_briefing():
    """Mock LLM response for the intelligence briefing."""
    return "## Executive Summary\nTarget has a moderate attack surface.\n\n## Key Findings\n- Exposed admin email\n- Subdomain with open ports"


@pytest.fixture
def mock_findings():
    """Sample OSINT findings."""
    return [
        {"type": "shodan", "ip": "1.2.3.4", "ports": [80, 443]},
        {"type": "censys", "subject": "example.com", "sans": ["sub.example.com"]},
        {"type": "spiderfoot", "data": "admin@example.com found in WHOIS"},
    ]


# ── DeepSearchService Tests ───────────────────────────────────────────────────


class TestDeepSearchService:
    """Test the recursive OSINT pivoting engine."""

    @pytest.mark.asyncio
    @patch("app.services.intelligence.deep_search_service.llm_gateway")
    async def test_basic_search_returns_result(
        self, mock_llm, mock_llm_no_pivots, mock_findings
    ):
        """A basic deep search should return a valid result structure."""
        mock_llm.generate = AsyncMock(return_value=mock_llm_no_pivots)

        with patch(
            "app.services.intelligence.deep_search_service.DeepSearchService._run_modules",
            new_callable=AsyncMock,
            return_value=mock_findings,
        ):
            from app.services.intelligence.deep_search_service import DeepSearchService

            service = DeepSearchService(org_id="test")
            result = await service.execute(
                target="example.com",
                target_type="domain",
                max_depth=1,
                max_entities=5,
            )

        assert result["status"] == "complete"
        assert result["target"] == "example.com"
        assert result["stats"]["total_entities"] >= 1
        assert "graph" in result
        assert "nodes" in result["graph"]
        assert "edges" in result["graph"]
        assert "briefing" in result
        assert "session_id" in result

    @pytest.mark.asyncio
    @patch("app.services.intelligence.deep_search_service.llm_gateway")
    async def test_recursive_pivoting(
        self, mock_llm, mock_llm_pivots, mock_llm_no_pivots, mock_findings
    ):
        """Deep search should discover pivots and recursively search them."""
        # First call returns pivots, subsequent calls return no pivots
        call_count = 0

        async def side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return mock_llm_pivots  # First entity: return pivots
            elif (
                "briefing" in str(args).lower()
                or "intelligence" in str(kwargs.get("system_message", "")).lower()
            ):
                return "## Briefing\nTest briefing content."
            return mock_llm_no_pivots  # Subsequent: no more pivots

        mock_llm.generate = AsyncMock(side_effect=side_effect)

        with patch(
            "app.services.intelligence.deep_search_service.DeepSearchService._run_modules",
            new_callable=AsyncMock,
            return_value=mock_findings,
        ):
            from app.services.intelligence.deep_search_service import DeepSearchService

            service = DeepSearchService(org_id="test")
            result = await service.execute(
                target="example.com",
                target_type="domain",
                max_depth=2,
                max_entities=10,
            )

        # Should have searched more than just the initial target
        assert result["stats"]["total_entities"] >= 2
        # Should have edges connecting discovered entities
        assert len(result["graph"]["edges"]) >= 1

    @pytest.mark.asyncio
    @patch("app.services.intelligence.deep_search_service.llm_gateway")
    async def test_depth_limit(self, mock_llm, mock_llm_pivots, mock_findings):
        """Deep search should respect the max_depth limit."""
        mock_llm.generate = AsyncMock(return_value=mock_llm_pivots)

        with patch(
            "app.services.intelligence.deep_search_service.DeepSearchService._run_modules",
            new_callable=AsyncMock,
            return_value=mock_findings,
        ):
            from app.services.intelligence.deep_search_service import DeepSearchService

            service = DeepSearchService(org_id="test")
            result = await service.execute(
                target="example.com",
                target_type="domain",
                max_depth=1,  # Only 1 level deep
                max_entities=50,
            )

        # Depth should not exceed configured max
        assert result["stats"]["max_depth_reached"] <= 1

    @pytest.mark.asyncio
    @patch("app.services.intelligence.deep_search_service.llm_gateway")
    async def test_entity_cap(self, mock_llm, mock_llm_pivots, mock_findings):
        """Deep search should stop when max_entities is reached."""
        mock_llm.generate = AsyncMock(return_value=mock_llm_pivots)

        with patch(
            "app.services.intelligence.deep_search_service.DeepSearchService._run_modules",
            new_callable=AsyncMock,
            return_value=mock_findings,
        ):
            from app.services.intelligence.deep_search_service import DeepSearchService

            service = DeepSearchService(org_id="test")
            result = await service.execute(
                target="example.com",
                target_type="domain",
                max_depth=5,
                max_entities=3,  # Very low cap
            )

        assert result["stats"]["total_entities"] <= 3

    @pytest.mark.asyncio
    @patch("app.services.intelligence.deep_search_service.llm_gateway")
    async def test_loop_prevention(self, mock_llm, mock_findings):
        """Deep search should not re-visit already searched entities."""
        # LLM returns a pivot pointing back to the original target
        loop_response = '{"pivots": [{"entity": "example.com", "entity_type": "domain", "confidence": 0.9, "source": "self", "reason": "circular reference"}], "analysis": "Loop.", "risk_indicators": []}'
        mock_llm.generate = AsyncMock(return_value=loop_response)

        with patch(
            "app.services.intelligence.deep_search_service.DeepSearchService._run_modules",
            new_callable=AsyncMock,
            return_value=mock_findings,
        ):
            from app.services.intelligence.deep_search_service import DeepSearchService

            service = DeepSearchService(org_id="test")
            result = await service.execute(
                target="example.com",
                target_type="domain",
                max_depth=3,
                max_entities=10,
            )

        # Should only have 1 entity (the original), because the pivot
        # back to example.com is filtered out in _extract_pivots
        assert result["stats"]["total_entities"] == 1

    @pytest.mark.asyncio
    @patch("app.services.intelligence.deep_search_service.llm_gateway")
    async def test_progress_callback(self, mock_llm, mock_llm_no_pivots, mock_findings):
        """Progress callback should be called with events."""
        mock_llm.generate = AsyncMock(return_value=mock_llm_no_pivots)

        events = []

        async def on_progress(data):
            events.append(data)

        with patch(
            "app.services.intelligence.deep_search_service.DeepSearchService._run_modules",
            new_callable=AsyncMock,
            return_value=mock_findings,
        ):
            from app.services.intelligence.deep_search_service import DeepSearchService

            service = DeepSearchService(org_id="test")
            await service.execute(
                target="example.com",
                target_type="domain",
                max_depth=1,
                max_entities=5,
                on_progress=on_progress,
            )

        event_types = [e["event"] for e in events]
        assert "session_started" in event_types
        assert "entity_search_started" in event_types
        assert "entity_search_complete" in event_types
        assert "session_complete" in event_types


# ── DeepSearchAgent Tests ─────────────────────────────────────────────────────


class TestDeepSearchAgent:
    """Test the agent wrapper."""

    @pytest.mark.asyncio
    @patch("app.services.intelligence.deep_search_service.llm_gateway")
    async def test_agent_returns_structured_output(
        self, mock_llm, mock_llm_no_pivots, mock_findings
    ):
        """Agent should return output with agent name and all expected fields."""
        mock_llm.generate = AsyncMock(return_value=mock_llm_no_pivots)

        with patch(
            "app.services.intelligence.deep_search_service.DeepSearchService._run_modules",
            new_callable=AsyncMock,
            return_value=mock_findings,
        ):
            from app.services.agent.deep_search_agent import DeepSearchAgent

            agent = DeepSearchAgent(org_id="test")
            result = await agent.run(
                target="example.com",
                target_type="domain",
                max_depth=1,
            )

        assert result["agent"] == "DeepSearchAgent"
        assert result["module"] == "deep_search"
        assert result["codename"] == "THE ABYSS"
        assert result["status"] in ("complete", "error")
        assert "graph" in result
        assert "briefing" in result
        assert "stats" in result
        assert "duration_s" in result

    @pytest.mark.asyncio
    async def test_agent_handles_errors_gracefully(self):
        """Agent should return error status without raising."""
        with patch(
            "app.services.intelligence.deep_search_service.DeepSearchService.execute",
            new_callable=AsyncMock,
            side_effect=Exception("Module crash"),
        ):
            from app.services.agent.deep_search_agent import DeepSearchAgent

            agent = DeepSearchAgent(org_id="test")
            result = await agent.run(target="fail.com", target_type="domain")

        assert result["agent"] == "DeepSearchAgent"
        assert result["status"] == "error"
        assert "Module crash" in result["error"]
