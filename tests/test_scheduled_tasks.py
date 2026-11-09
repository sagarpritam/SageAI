"""Unit and Integration Tests for Celery Scheduled Tasks & Beat Configuration."""

from unittest.mock import AsyncMock, patch

from app.tasks import celery_app, sync_threat_feeds


def test_celery_beat_schedule_configuration():
    """Verify Celery Beat schedule contains all automated cron tasks."""
    schedule = celery_app.conf.beat_schedule

    assert "asm-continuous-recon-12h" in schedule
    assert schedule["asm-continuous-recon-12h"]["task"] == "SageAI.asm_scheduled_recon"

    assert "cisa-kev-daily-sync" in schedule
    assert schedule["cisa-kev-daily-sync"]["task"] == "SageAI.sync_threat_feeds"

    assert "cleanup-old-scans-weekly" in schedule
    assert schedule["cleanup-old-scans-weekly"]["task"] == "SageAI.cleanup_old_scans"


def test_sync_threat_feeds_task_success():
    """Verify sync_threat_feeds Celery task runs asynchronously and returns count."""
    with patch(
        "app.services.threat_feed.cve_indexer.cve_indexer.sync_cisa_kev",
        new_callable=AsyncMock,
    ) as mock_sync:
        mock_sync.return_value = 1768

        result = sync_threat_feeds(force=True)

        assert result["status"] == "success"
        assert result["indexed_count"] == 1768
        mock_sync.assert_awaited_once_with(force=True)


def test_sync_threat_feeds_task_error_handling():
    """Verify sync_threat_feeds catches unexpected exceptions gracefully."""
    with patch(
        "app.services.threat_feed.cve_indexer.cve_indexer.sync_cisa_kev",
        new_callable=AsyncMock,
    ) as mock_sync:
        mock_sync.side_effect = RuntimeError(
            "Network connection to CISA feed timed out"
        )

        result = sync_threat_feeds(force=False)

        assert result["status"] == "failed"
        assert "Network connection to CISA feed timed out" in result["error"]
