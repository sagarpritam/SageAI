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

test.describe('Series A Scale, Sensor Mesh & Whitelabel Tenant Portal Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('sageai_onboarding_done', 'true');
    });
  });

  test('GET /api/telemetry/sensor-mesh/nodes returns 112 nodes and sub-0.20ms SLA', async ({
    request,
  }) => {
    const res = await request.get('/api/telemetry/sensor-mesh/nodes');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.total_nodes_returned).toBe(112);
    expect(data.summary.total_sensor_nodes).toBe(112);
    expect(data.summary.sla_boundary_passed).toBe(true);
    expect(data.summary.overall_mean_latency_ms).toBeLessThanOrEqual(0.20);
    expect(data.recent_events.length).toBeGreaterThan(0);
  });

  test('POST /api/telemetry/sensor-mesh/ingest processes packet sever event', async ({
    request,
  }) => {
    const payload = {
      cluster_id: 'apex-cluster',
      node_id: 'apex-cluster-node-01',
      event_type: 'IMDS_SSRF_CLAMPED',
      source_ip: '10.240.8.12',
      destination_ip: '169.254.169.254',
      hook_action: 'XDP_DROP',
    };
    const res = await request.post('/api/telemetry/sensor-mesh/ingest', { data: payload });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('EVENT_INGESTED');
    expect(data.event.event_type).toBe('IMDS_SSRF_CLAMPED');
  });

  test('GET /api/portal/tenant/org-apex/dashboard returns 100% uptime and AST patches', async ({
    request,
  }) => {
    const res = await request.get('/api/portal/tenant/org-apex/dashboard');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('PORTAL_LOADED');
    expect(data.dashboard.primary_ciso).toBe('Marcus Vance');
    expect(data.dashboard.uptime_pct).toBe(100.0);
    expect(data.dashboard.indemnity_coverage_usd).toBe(10000000);
  });

  test('POST /api/portal/tenant/org-apex/approve-patch deploys AST patch', async ({
    request,
  }) => {
    const res = await request.post('/api/portal/tenant/org-apex/approve-patch', {
      data: { patch_id: 'AST-PATCH-APEX-04' },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('PATCH_APPROVED');
    expect(data.details.approved_by).toBe('Marcus Vance');
  });

  test('POST /api/portal/tenant/org-apex/escalate-soc triggers emergency War Room', async ({
    request,
  }) => {
    const res = await request.post('/api/portal/tenant/org-apex/escalate-soc', {
      data: {
        incident_type: 'UNUSUAL_OUTBOUND_EGRESS',
        description: 'High-frequency trader egress anomaly.',
      },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('SOC_ESCALATED');
    expect(data.escalation.tier).toBe('TIER_3_TACTICAL_WARROOM');
  });

  test('GET /api/finance/series-a/model returns Series A unit economics and Cap Table', async ({
    request,
  }) => {
    const res = await request.get('/api/finance/series-a/model');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.unit_economics.current_recognized_arr_usd).toBe(840000);
    expect(data.unit_economics.projected_year1_arr_usd).toBe(3400000);
    expect(data.unit_economics.net_revenue_retention_pct).toBe(142.0);
    expect(data.unit_economics.cac_payback_months).toBeLessThanOrEqual(2.0);
    expect(data.round_metadata.target_raise_usd).toBe(6000000);
    expect(data.round_metadata.pre_money_valuation_usd).toBe(25000000);
  });

  test('GET /api/finance/series-a/pdf serves downloadable investment memorandum', async ({
    request,
  }) => {
    const res = await request.get('/api/finance/series-a/pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');

    const buffer = await res.body();
    expect(buffer.length).toBeGreaterThan(1000);
  });

  test('Dashboard loads Series A Scale tab and navigates all 3 sub-consoles', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await mockAuthenticatedSession(context, page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click Series A Scale & Sensor Mesh tab
    const tab = page.locator('button:has-text("Series A Scale & Sensor Mesh")');
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    // Verify main header
    await expect(
      page.locator('h1:has-text("Sensor Mesh Streaming Gateway, CISO Tenant Portal & Series A Data Room")')
    ).toBeVisible({ timeout: 10000 });

    // Verify Tab 1: Sensor Mesh
    await expect(page.locator('[data-testid="sensor-mesh-tab"]')).toBeVisible();
    await expect(page.locator('text=Distributed Sensor Mesh Node Fleet')).toBeVisible();
    await expect(page.locator('[data-testid="simulate-ingest-btn"]')).toBeVisible();

    // Click Simulate Ingest
    await page.locator('[data-testid="simulate-ingest-btn"]').click();
    await expect(page.locator('text=Kernel Probe Ingested')).toBeVisible({ timeout: 10000 });

    // Switch to Tab 2: Tenant Portal
    const portalTab = page.locator('[data-testid="tenant-portal-tab"]');
    await expect(portalTab).toBeVisible();
    await portalTab.click();

    // Verify Portal view
    await expect(page.locator('text=Uptime Guarantee')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="escalate-soc-btn"]')).toBeVisible();

    // Click Escalate to SOC
    await page.locator('[data-testid="escalate-soc-btn"]').click();
    await expect(page.locator('text=Tier-3 SOC Incident Engaged')).toBeVisible({ timeout: 10000 });

    // Switch to Tab 3: Series A Financial Model
    const seriesATab = page.locator('[data-testid="series-a-tab"]');
    await expect(seriesATab).toBeVisible();
    await seriesATab.click();

    // Verify Series A view
    await expect(page.locator('text=Series A Institutional Investment Memorandum')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="download-series-a-pdf-btn"]')).toBeVisible();
    await expect(page.locator('text=142% NRR').first()).toBeVisible();
    await expect(page.locator('text=$840K USD').first()).toBeVisible();

    await context.close();
  });
});
