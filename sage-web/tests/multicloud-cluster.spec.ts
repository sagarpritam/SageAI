import { test, expect, type BrowserContext, type Page } from '@playwright/test';

const MOCK_E2E_JWT =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvcGVyYXRvckBzYWdlYWkuY29tIiwiZW1haWwiOiJvcGVyYXRvckBzYWdlYWkuY29tIiwib3JnIjoib3JnLWUyZSJ9.mock_sig';

async function mockAuthenticatedSession(context: BrowserContext, page: Page) {
  await context.addCookies([
    {
      name: 'sageai_jwt',
      value: MOCK_E2E_JWT,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  await page.addInitScript(() => {
    window.localStorage.setItem('sageai_onboarding_done', 'true');
  });
}

test.describe('Multi-Cloud Kubernetes & Terraform Staging Ops Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('sageai_onboarding_done', 'true');
    });
  });

  test('GET /api/infrastructure/clusters returns GKE and EKS multi-cloud clusters', async ({
    request,
  }) => {
    const res = await request.get('/api/infrastructure/clusters');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.clusters).toBeDefined();
    expect(data.clusters.length).toBe(2);

    const gke = data.clusters.find((c: { cluster_id: string }) => c.cluster_id === 'sageai-staging-gke');
    expect(gke).toBeDefined();
    expect(gke.cloud_provider).toContain('Google Cloud Platform');
    expect(gke.region).toBe('us-central1');
    expect(gke.pqc_tls_suite).toContain('Kyber768');

    const eks = data.clusters.find((c: { cluster_id: string }) => c.cluster_id === 'sageai-staging-eks');
    expect(eks).toBeDefined();
    expect(eks.cloud_provider).toContain('Amazon Web Services');
    expect(eks.region).toBe('us-east-1');
    expect(eks.pqc_tls_suite).toContain('BikeL3');
  });

  test('GET /api/infrastructure/metrics returns multi-cloud aggregate telemetry', async ({
    request,
  }) => {
    const res = await request.get('/api/infrastructure/metrics');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.total_clusters).toBe(2);
    expect(data.total_nodes).toBeGreaterThanOrEqual(4);
    expect(data.pqc_handshake_latency_ms).toBeLessThanOrEqual(0.25);
    expect(data.zero_egress_rules_active).toBe(42);
    expect(data.status).toBe('INFRASTRUCTURE_OPTIMAL');
  });

  test('POST /api/infrastructure/spin-up executes staging spin-up and returns audit steps', async ({
    request,
  }) => {
    const res = await request.post('/api/infrastructure/spin-up', {
      data: {
        target_cloud: 'DUAL_CLOUD_HA',
        environment: 'staging',
        enable_pqc: true,
        node_count: 2,
      },
    });
    expect(res.status()).toBe(200);

    const receipt = await res.json();
    expect(receipt.status).toBe('STAGING_SPINUP_SUCCESSFUL');
    expect(receipt.deployment_id).toContain('DEPLOY-STAGE-');
    expect(receipt.steps.length).toBe(9);
    expect(receipt.active_endpoints.length).toBe(3);
  });

  test('Authenticated Command Center loads and operates MultiCloudClusterStudio', async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);

    // Mock background dashboard endpoints to avoid noise
    await page.route('**/api/notifications*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/scans*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/analytics*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          trend: [],
          severityCounts: { Critical: 0, High: 0, Medium: 0, Low: 0 },
          totalCompleted: 0,
        }),
      });
    });

    await page.goto('/dashboard');
    await expect(page.locator('h1:has-text("Command Center")')).toBeVisible({ timeout: 6000 });

    const clusterTab = page.locator('button:has-text("Multi-Cloud Cluster Ops")');
    await expect(clusterTab).toBeVisible();
    await clusterTab.click();

    // Verify presence of GKE and EKS cluster cards
    await expect(page.locator('text=sageai-staging-gke').first()).toBeVisible();
    await expect(page.locator('text=sageai-staging-eks').first()).toBeVisible();
    await expect(page.locator('text=Kyber768 + BikeL3').first()).toBeVisible();

    // Trigger staging spin-up button
    const spinUpBtn = page.locator('button:has-text("Execute Automated Staging Spin-Up")');
    await expect(spinUpBtn).toBeVisible();
    await spinUpBtn.click();

    // Verify successful execution receipt is visible
    await expect(page.locator('text=STAGING_SPINUP_SUCCESSFUL').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=PROVISIONED STAGING ENDPOINTS:').first()).toBeVisible();
  });
});
