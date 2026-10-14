import uuid

from locust import HttpUser, between, task


class SageAIUser(HttpUser):
    # Simulate a user thinking between 1 and 3 seconds between requests
    wait_time = between(1, 3)

    def on_start(self):
        """Executed when a simulated user starts. Simulates logging in."""
        # For a real load test, we'd hit /auth/login, but for this simulation
        # we can assume we either have a seeded user or hit public endpoints
        # to test raw throughput, or we can use a basic user payload.
        response = self.client.post(
            "/auth/register",
            json={
                "email": f"perf{uuid.uuid4().hex[:6]}@sageai.com",
                "password": "LoadTestPassword123!",
                "organization_name": "LoadTestOrg",
            },
        )

        self.token = ""
        if response.status_code == 201:
            login_resp = self.client.post(
                "/auth/login",
                json={
                    "email": response.json().get("user", {}).get("email"),
                    "password": "LoadTestPassword123!",
                },
            )
            if login_resp.status_code == 200:
                self.token = login_resp.json().get("access_token")

        self.headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(3)
    def view_scans_dashboard(self):
        """Simulate a user viewing their dashboard."""
        self.client.get("/scans", headers=self.headers)

    @task(1)
    def trigger_scan(self):
        """Simulate triggering a vulnerability scan."""
        # This tests the queuing mechanism
        self.client.post(
            "/scan", json={"target": "https://example.com"}, headers=self.headers
        )

    @task(1)
    def get_org_details(self):
        """A user checks their organization details."""
        self.client.get("/org", headers=self.headers)
