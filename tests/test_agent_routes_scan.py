from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scan import Scan


@pytest.mark.asyncio
async def test_run_assessment_creates_scan(
    client, auth_headers, db_session: AsyncSession
):
    with (
        patch("app.routers.agent_routes.MultiAgentOrchestrator") as MockOrchestrator,
        patch("app.routers.agent_routes.broadcast_scan_progress"),
    ):
        # Setup mock orchestrator
        mock_instance = MockOrchestrator.return_value
        mock_instance.run_targeted = AsyncMock(
            return_value={
                "risk_score": 50,
                "risk_level": "Medium",
                "findings": [{"id": 1, "title": "Test Finding"}],
            }
        )

        r = await client.post(
            "/agents/assess",
            json={
                "target": "example.com",
                "mode": "quick",
                "use_knowledge_graph": False,
            },
            headers=auth_headers,
        )
        assert r.status_code == 200
        data = r.json()
        assert "scan_id" in data
        assert data["result"]["risk_score"] == 50

        scan_id = data["scan_id"]

        # Verify Scan in DB
        db_scan = await db_session.get(Scan, scan_id)
        assert db_scan is not None
        assert db_scan.target == "example.com"
        assert db_scan.status == "completed"
        assert db_scan.risk_score == 50


@pytest.mark.asyncio
async def test_run_assessment_async_creates_scan(
    client, auth_headers, db_session: AsyncSession
):
    with patch("app.routers.agent_routes.BackgroundTasks.add_task") as mock_add_task:
        r = await client.post(
            "/agents/assess/async",
            json={
                "target": "example.com",
                "mode": "full",
                "use_knowledge_graph": False,
            },
            headers=auth_headers,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "started"
        scan_id = data["scan_id"]

        # Verify initial Scan creation in DB
        db_scan = await db_session.get(Scan, scan_id)
        assert db_scan is not None
        assert db_scan.target == "example.com"
        assert db_scan.status == "running"

        # Verify background task was queued
        mock_add_task.assert_called_once()
