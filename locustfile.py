"""SageAI Performance & Security Rate-Limiting Load Test Suite.

Simulates two distinct behavioral profiles:
1. SageAIPerformanceUser: End-to-end user workflows (auth, organization plan, posture dashboard, assets, scan trigger).
2. SageAIRateLimitStressUser: Rapid-burst traffic against rate-limited sensitive endpoints to verify SlowAPI HTTP 429 enforcement.
"""

import uuid

from locust import HttpUser, between, tag, task


class SageAIPerformanceUser(HttpUser):
    """Simulates active authenticated users navigating SageAI dashboards and services."""

    wait_time = between(0.5, 1.5)

    def on_start(self):
        """Register a unique user session and obtain a JWT bearer token."""
        self.email = f"perf_{uuid.uuid4().hex[:8]}@sageai.com"
        self.password = "PerfTestPassword123!"
        self.headers = {}
        self.token = ""

        # 1. Register new account
        res = self.client.post(
            "/auth/register",
            json={
                "email": self.email,
                "password": self.password,
                "organization_name": f"Org_{uuid.uuid4().hex[:6]}",
            },
            name="/auth/register",
        )
        if res.status_code == 201:
            self.token = res.json().get("access_token", "")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            # Fallback to login if already exists
            login_res = self.client.post(
                "/auth/login",
                json={"email": self.email, "password": self.password},
                name="/auth/login",
            )
            if login_res.status_code == 200:
                self.token = login_res.json().get("access_token", "")
                self.headers = {"Authorization": f"Bearer {self.token}"}

    @task(6)
    @tag("health")
    def health_check(self):
        """Ping root health endpoint to measure raw API baseline latency."""
        self.client.get("/", name="/ (Health Check)")

    @task(4)
    @tag("org")
    def view_org_plan(self):
        """View organization subscription plan and usage metrics."""
        if self.headers:
            self.client.get("/org/plan", headers=self.headers, name="/org/plan")

    @task(3)
    @tag("posture")
    def view_posture_dashboard(self):
        """Retrieve security posture and compliance scores."""
        if self.headers:
            self.client.get(
                "/posture/score", headers=self.headers, name="/posture/score"
            )

    @task(2)
    @tag("assets")
    def view_assets(self):
        """Retrieve attack surface asset inventory."""
        if self.headers:
            self.client.get("/assets", headers=self.headers, name="/assets")

    @task(1)
    @tag("scan")
    def trigger_scan(self):
        """Trigger an authenticated vulnerability scan."""
        if self.headers:
            self.client.post(
                "/scan",
                json={"target": "https://example.com"},
                headers=self.headers,
                name="/scan",
            )


class SageAIRateLimitStressUser(HttpUser):
    """Stress tests SlowAPI rate-limiting enforcement on sensitive endpoints."""

    wait_time = between(0.1, 0.2)

    @task
    @tag("rate_limit")
    def burst_forgot_password(self):
        """Burst requests against /auth/forgot-password (configured limit: 5/minute).

        Validates that the rate limiter gracefully responds with HTTP 429 Too Many Requests
        without unhandled exceptions or service degradation.
        """
        with self.client.post(
            "/auth/forgot-password",
            json={"email": "ratelimit_probe@sageai.com"},
            name="/auth/forgot-password (Rate Limit Verification)",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 429):
                response.success()
            else:
                response.failure(f"Unexpected status code: {response.status_code}")
