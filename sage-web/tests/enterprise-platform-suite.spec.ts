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

test.describe('Enterprise Platform Suite & D3FEND Alignment Studio Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('sageai_onboarding_done', 'true');
    });
  });

  test('GET /api/security/tenants returns all 4 enterprise tenants with KMS details', async ({
    request,
  }) => {
    const res = await request.get('/api/security/tenants');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.total_tenants).toBe(4);
    const tenantIds = data.tenants.map((t: { tenant_id: string }) => t.tenant_id);
    expect(tenantIds).toContain('org-apex');
    expect(tenantIds).toContain('org-nexus');
    expect(tenantIds).toContain('org-hyperscale');
    expect(tenantIds).toContain('org-vanguard');

    const apex = data.tenants.find((t: { tenant_id: string }) => t.tenant_id === 'org-apex');
    expect(apex.kms_key.algorithm).toContain('FIPS 203');
  });

  test('POST /api/security/tenants/org-apex/rotate-keys executes key ring rotation', async ({
    request,
  }) => {
    const res = await request.post('/api/security/tenants/org-apex/rotate-keys');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('KEY_ROTATED');
    expect(data.details.tenant_id).toBe('org-apex');
    expect(data.details.new_version).toBeGreaterThanOrEqual(2);
    expect(data.details.merkle_record_hash).toBeDefined();
  });

  test('GET /api/threat-modeling/d3fend/posture returns defensive score and 6 categories', async ({
    request,
  }) => {
    const res = await request.get('/api/threat-modeling/d3fend/posture');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.overall_posture_score).toBeGreaterThanOrEqual(95.0);
    expect(data.categories.Model).toBeDefined();
    expect(data.categories.Harden).toBeDefined();
    expect(data.categories.Detect).toBeDefined();
    expect(data.categories.Isolate).toBeDefined();
    expect(data.categories.Deceive).toBeDefined();
    expect(data.categories.Evict).toBeDefined();
    expect(data.mappings.length).toBeGreaterThanOrEqual(4);
  });

  test('POST /api/threat-modeling/d3fend/evaluate maps new mitigation into matrix', async ({
    request,
  }) => {
    const payload = {
      attack_technique: 'T1566',
      mitigation_name: 'Canary Honeytoken Disarm',
      defensive_category: 'Deceive',
      d3fend_id: 'D3-DEC',
    };
    const res = await request.post('/api/threat-modeling/d3fend/evaluate', { data: payload });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('MAPPED');
    expect(data.evaluation.mapping.d3fend_technique_id).toBe('D3-DEC');
  });

  test('GET /api/deployment/pilot-kits returns 4 customer deployment packages', async ({
    request,
  }) => {
    const res = await request.get('/api/deployment/pilot-kits');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.total_kits).toBe(4);
    const leadIds = data.pilot_kits.map((k: { lead_id: string }) => k.lead_id);
    expect(leadIds).toContain('LEAD-APEX-01');
    expect(leadIds).toContain('LEAD-NEXUS-02');
    expect(leadIds).toContain('LEAD-HYPER-03');
    expect(leadIds).toContain('LEAD-VANGUARD-04');
  });

  test('GET /api/deployment/pilot-kits/LEAD-APEX-01/download serves configuration', async ({
    request,
  }) => {
    const res = await request.get('/api/deployment/pilot-kits/LEAD-APEX-01/download');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('licenseToken');
  });

  test('POST /api/deployment/pilot-kits/LEAD-APEX-01/verify-ping confirms heartbeat', async ({
    request,
  }) => {
    const res = await request.post('/api/deployment/pilot-kits/LEAD-APEX-01/verify-ping');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('HEARTBEAT_VERIFIED');
    expect(data.telemetry.sensor_nodes_count).toBeGreaterThan(0);
  });

  test('Dashboard loads Enterprise Pilot & D3FEND Suite and interacts across all 3 tabs', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await mockAuthenticatedSession(context, page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click Enterprise Pilot & D3FEND Suite tab
    const tab = page.locator('button:has-text("Enterprise Pilot & D3FEND Suite")');
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    // Verify main heading
    await expect(
      page.locator('h1:has-text("Enterprise Tenant Isolation, D3FEND Threat Modeling & Pilot Deployment")')
    ).toBeVisible({ timeout: 10000 });

    // Verify Tab 1: Tenants
    await expect(page.locator('[data-testid="tenants-tab"]')).toBeVisible();
    await expect(page.locator('text=Enterprise Tenants')).toBeVisible();
    await expect(page.locator('[data-testid="rotate-kms-btn"]')).toBeVisible();

    // Click Rotate KMS Key Ring
    await page.locator('[data-testid="rotate-kms-btn"]').click();
    await expect(page.locator('text=rotated to v')).toBeVisible({ timeout: 10000 });

    // Switch to Tab 2: D3FEND
    const d3fendTab = page.locator('[data-testid="d3fend-tab"]');
    await expect(d3fendTab).toBeVisible();
    await d3fendTab.click();

    // Verify D3FEND view
    await expect(page.locator('text=MITRE D3FEND Continuous Defensive Posture')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="evaluate-defense-btn"]')).toBeVisible();

    // Click Align Defense button
    await page.locator('[data-testid="evaluate-defense-btn"]').click();
    await expect(page.locator('text=Mitigation evaluated & aligned with D3FEND')).toBeVisible({ timeout: 10000 });

    // Switch to Tab 3: Deployments
    const deployTab = page.locator('[data-testid="deployments-tab"]');
    await expect(deployTab).toBeVisible();
    await deployTab.click();

    // Verify Deployments view
    await expect(page.locator('text=Enterprise Pilot Accounts')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Customer 1-Line Installation Command')).toBeVisible();
    await expect(page.locator('[data-testid="verify-ping-btn"]')).toBeVisible();

    // Click Verify Heartbeat button
    await page.locator('[data-testid="verify-ping-btn"]').click();
    await expect(page.locator('text=Live Sensor Mesh Heartbeat Confirmed')).toBeVisible({ timeout: 10000 });

    await context.close();
  });
});
