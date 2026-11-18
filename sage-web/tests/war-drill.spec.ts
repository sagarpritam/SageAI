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

test.describe('Autonomous Red Team vs. Blue Team Cyber War Drill Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('sageai_onboarding_done', 'true');
    });
  });

  test('GET /api/simulation/enterprise-drill/targets returns 4 active enterprise domains', async ({
    request,
  }) => {
    const res = await request.get('/api/simulation/enterprise-drill/targets');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.targets).toBeDefined();
    expect(data.targets.length).toBe(4);

    const domains = data.targets.map((t: { domain: string }) => t.domain);
    expect(domains).toContain('apex-securities.io');
    expect(domains).toContain('nexusbiohealth.com');
    expect(domains).toContain('hyperscale.dev');
    expect(domains).toContain('vanguard-aero.def');

    const totalArr = data.targets.reduce(
      (acc: number, t: { arr_usd: number }) => acc + t.arr_usd,
      0
    );
    expect(totalArr).toBe(840000);
  });

  test('GET /api/simulation/enterprise-drill/metrics asserts sub-0.20ms WAF SLA', async ({
    request,
  }) => {
    const res = await request.get('/api/simulation/enterprise-drill/metrics');
    expect(res.status()).toBe(200);

    const metrics = await res.json();
    expect(metrics.active_enterprise_domains_protected).toBe(4);
    expect(metrics.mean_waf_clamp_latency_ms).toBeLessThanOrEqual(0.20);
    expect(metrics.waf_clamp_sla_threshold_ms).toBe(0.20);
    expect(metrics.ast_autofix_patch_success_rate_pct).toBe(100.0);
    expect(metrics.overall_containment_ratio).toBe(1.0);
    expect(metrics.human_intervention_downtime_seconds).toBe(0.0);
  });

  test('POST /api/simulation/enterprise-drill/launch executes drill with verified assertions', async ({
    request,
  }) => {
    const res = await request.post('/api/simulation/enterprise-drill/launch', {
      data: {
        target_domain: 'apex-securities.io',
        custom_scenario: 'Playwright Automated E2E Drill',
        attacker_ip: '198.51.100.117',
      },
    });
    expect(res.status()).toBe(200);

    const drill = await res.json();
    expect(drill.waf_clamp_assertion_passed).toBe(true);
    expect(drill.mean_waf_clamp_latency_ms).toBeLessThanOrEqual(0.20);
    expect(drill.ast_autofix_assertion_passed).toBe(true);
    expect(drill.containment_ratio).toBe(1.0);
    expect(drill.human_downtime_seconds).toBe(0.0);
    expect(drill.domain_results.length).toBeGreaterThanOrEqual(1);

    const apex = drill.domain_results[0];
    expect(apex.waf_clamp_latency_ms).toBeLessThanOrEqual(0.20);
    expect(apex.ast_unified_diff).toContain('SSRF Protection');
  });

  test('Dashboard loads Red vs Blue Arena tab and renders tactical arena studio', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await mockAuthenticatedSession(context, page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click Red vs Blue War Drill tab
    const drillTab = page.locator('button:has-text("Red vs Blue War Drill")');
    await expect(drillTab).toBeVisible({ timeout: 10000 });
    await drillTab.click();

    // Verify studio heading and WAF badge
    await expect(
      page.locator('h1:has-text("Autonomous Red Team vs. Blue Team Battle Arena")')
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=WAF Clamp Latency').first()).toBeVisible();
    await expect(page.locator('text=AST AutoFix Rate').first()).toBeVisible();

    // Verify Action button
    const launchBtn = page.locator('button:has-text("Launch Autonomous War Drill")');
    await expect(launchBtn).toBeVisible();

    // Verify tactical panels
    await expect(page.locator('h2:has-text("Red Team Attack Simulation")')).toBeVisible();
    await expect(page.locator('h2:has-text("Blue Team Autonomous Defense Grid")')).toBeVisible();

    await context.close();
  });
});
