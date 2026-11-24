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

test.describe('Enterprise Board of Directors Security Dossier Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('sageai_onboarding_done', 'true');
    });
  });

  test('GET /api/board/dossier returns structured dossier with $840K ARR', async ({
    request,
  }) => {
    const res = await request.get('/api/board/dossier');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.dossier_id).toBe('DOSSIER-BOARD-2026-Q4-v8.7');
    expect(data.executive_kpis.total_recognized_arr_usd).toBe(840000);
    expect(data.executive_kpis.conversion_rate_pct).toBe(100.0);
    expect(data.executive_kpis.mean_waf_clamp_latency_ms).toBeLessThanOrEqual(0.20);
    expect(data.executive_kpis.overall_containment_ratio).toBe(1.0);
    expect(data.enterprise_accounts.length).toBe(4);

    const domains = data.enterprise_accounts.map((a: { domain: string }) => a.domain);
    expect(domains).toContain('apex-securities.io');
    expect(domains).toContain('nexusbiohealth.com');
    expect(domains).toContain('hyperscale.dev');
    expect(domains).toContain('vanguard-aero.def');
  });

  test('POST /api/board/dossier recompiles dossier and returns fresh KPIs', async ({
    request,
  }) => {
    const res = await request.post('/api/board/dossier');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.executive_kpis.enterprise_pilot_count).toBe(4);
    expect(data.compliance_certifications).toContain('SOC 2 Type II');
  });

  test('GET /api/board/dossier/pdf serves valid PDF binary stream', async ({
    request,
  }) => {
    const res = await request.get('/api/board/dossier/pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');

    const buffer = await res.body();
    expect(buffer.length).toBeGreaterThan(1000);
  });

  test('Dashboard loads Board Security Dossier tab and displays governance studio', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await mockAuthenticatedSession(context, page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click Board Security Dossier tab
    const tab = page.locator('button:has-text("Board Security Dossier")');
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    // Verify studio heading and classification badge
    await expect(
      page.locator('h1:has-text("Enterprise Board of Directors Security Dossier")')
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=BOARD RESTRICTED & AUDIT CERTIFIED')).toBeVisible();

    // Verify action buttons
    await expect(page.locator('button:has-text("Download Official Board PDF")')).toBeVisible();
    await expect(page.locator('button:has-text("Recompile Dossier")')).toBeVisible();

    // Verify KPI cards
    await expect(page.locator('text=Recognized ARR').first()).toBeVisible();
    await expect(page.locator('text=$840,000').first()).toBeVisible();

    // Verify enterprise accounts table
    await expect(page.locator('text=Apex Global Securities')).toBeVisible();
    await expect(page.locator('text=Nexus BioHealth Global')).toBeVisible();
    await expect(page.locator('text=HyperScale Cloud Systems')).toBeVisible();
    await expect(page.locator('text=Vanguard Aerospace & Defense Systems')).toBeVisible();

    await context.close();
  });
});
