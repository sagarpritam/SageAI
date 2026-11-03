"""Unit & Integration Tests for WarRoom Real-Time Telemetry and Event Broadcasting."""

import pytest
from app.services.warroom_service import warroom_manager


@pytest.mark.asyncio
async def test_warroom_manager_emit_event():
    """Verify warroom manager emits and stores events with geo simulation."""
    initial_count = len(warroom_manager.get_history())

    evt = await warroom_manager.emit_event(
        event_type="exploit.attempt",
        source="TestAgent",
        target="target.internal.io",
        payload={"message": "Test SSRF attack intercepted"},
        priority=4,
    )

    assert evt["id"].startswith("evt-")
    assert evt["type"] == "exploit.attempt"
    assert evt["target"] == "target.internal.io"
    assert evt["priority"] == 4
    assert "geo" in evt["payload"]
    assert "lat" in evt["payload"]["geo"]
    assert "lng" in evt["payload"]["geo"]

    history = warroom_manager.get_history()
    assert len(history) >= initial_count + 1
    assert history[0]["id"] == evt["id"]


@pytest.mark.asyncio
async def test_warroom_rest_endpoints(client):
    """Verify GET and POST /warroom/events."""
    # 1. GET events
    res_get = await client.get("/warroom/events")
    assert res_get.status_code == 200
    data = res_get.json()
    assert data["status"] == "success"
    assert len(data["events"]) > 0

    # 2. POST event
    res_post = await client.post(
        "/warroom/events",
        json={
            "type": "finding.discovered",
            "source": "NIDSSweeper",
            "target": "prod-api-cluster",
            "priority": 3,
            "payload": {"message": "SYN sweep detected and dropped"},
        },
    )
    assert res_post.status_code == 200
    post_data = res_post.json()
    assert post_data["status"] == "success"
    assert post_data["event"]["source"] == "NIDSSweeper"

