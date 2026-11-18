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

test.describe('Enterprise RevOps Pipeline & SLA Contract Execution Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('sageai_onboarding_done', 'true');
    });
  });

  test('GET /api/revops/contract/[id] returns institutional SLA agreement', async ({
    request,
  }) => {
    const res = await request.get('/api/revops/contract/LEAD-APEX-01');
    expect(res.status()).toBe(200);

    const contract = await res.json();
    expect(contract.lead_id).toBe('LEAD-APEX-01');
    expect(contract.company_name).toBe('Apex Global Securities');
    expect(contract.arr_contract_value_usd).toBe(240000);
    expect(contract.sla_terms.uptime_availability).toContain('99.999%');
    expect(contract.sla_terms.indemnity_coverage_usd).toContain('$10,000,000');
  });

  test('POST /api/revops/contract/[id]/sign executes digital contract signature', async ({
    request,
  }) => {
    const res = await request.post('/api/revops/contract/LEAD-APEX-01/sign', {
      data: { signed_by: 'Marcus Vance' },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('CONTRACT_EXECUTED');
    expect(data.execution_certificate).toBeDefined();
    expect(data.recognized_arr_usd).toBe(240000);
  });

  test('POST /api/revops/dispatch-batch transmits batch outreach touch', async ({
    request,
  }) => {
    const res = await request.post('/api/revops/dispatch-batch', {
      data: { sequence_touch: 1, channel: 'MULTI_CHANNEL_OMNI' },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.batch_dispatch_status).toBe('SUCCESSFULLY_TRANSMITTED');
    expect(data.total_dispatches).toBe(4);
  });

  test('Authenticated Command Center operates RevOpsPipelineStudio and signs SLA contract', async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);

    // Mock background dashboard endpoints to isolate RevOps testing
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

    const revopsTab = page.locator('button:has-text("Enterprise RevOps Pipeline")');
    await expect(revopsTab).toBeVisible();
    await revopsTab.click();

    // Verify presence of enterprise deals in the pipeline grid
    await expect(page.locator('text=Apex Global Securities').first()).toBeVisible();
    await expect(page.locator('text=Nexus BioHealth Global').first()).toBeVisible();
    await expect(page.locator('text=HyperScale Cloud Systems').first()).toBeVisible();
    await expect(page.locator('text=Vanguard Aerospace & Defense Systems').first()).toBeVisible();

    // Open SLA agreement modal for Apex Global Securities
    const viewContractBtn = page.locator('button:has-text("View / Sign SLA Contract")').first();
    await expect(viewContractBtn).toBeVisible();
    await viewContractBtn.click();

    // Verify SLA clauses inside modal
    await expect(page.locator('text=GUARANTEED SERVICE LEVEL AGREEMENT (SLA) CLAUSES:')).toBeVisible();
    await expect(page.locator('text=Sub-0.20ms packet inspection and mitigation clamp guarantee')).toBeVisible();

    // Execute digital counter-signature
    const signBtn = page.locator('button:has-text("Digitally Counter-Sign & Execute Agreement")');
    await expect(signBtn).toBeVisible();
    await signBtn.click();

    // Verify success banner
    await expect(page.locator('text=Enterprise Pilot SLA executed with certificate').first()).toBeVisible({ timeout: 8000 });
  });
});
