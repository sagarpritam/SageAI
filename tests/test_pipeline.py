"""Tests for pipeline state tracking and context serialization."""

import pytest
from app.pipeline import ScanStatus, PipelineContext


class TestScanStatus:
    def test_all_statuses(self):
        expected = {"queued", "planning", "enumerating", "scanning", "analyzing", "reporting", "completed", "failed"}
        assert {s.value for s in ScanStatus} == expected

    def test_string_comparison(self):
        assert ScanStatus.COMPLETED == "completed"
        assert ScanStatus.FAILED == "failed"


class TestPipelineContext:
    def test_default_state(self):
        ctx = PipelineContext(domain="example.com")
        assert ctx.domain == "example.com"
        assert ctx.status == ScanStatus.QUEUED
        assert ctx.scan_id  # UUID generated
        assert ctx.error is None

    def test_serialization(self):
        ctx = PipelineContext(domain="example.com")
        ctx.status = ScanStatus.SCANNING
        ctx.scanned_targets = ["example.com", "api.example.com"]

        d = ctx.to_dict()
        assert d["domain"] == "example.com"
        assert d["status"] == "scanning"
        assert len(d["scanned_targets"]) == 2
        assert d["error"] is None

    def test_error_tracking(self):
        ctx = PipelineContext(domain="example.com")
        ctx.status = ScanStatus.FAILED
        ctx.error = "Connection refused"
        d = ctx.to_dict()
        assert d["status"] == "failed"
        assert d["error"] == "Connection refused"
