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

test.describe('Automated eBPF Policy & SOC 2 Type II Studio Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('sageai_onboarding_done', 'true');
    });
  });

  test('GET /api/network/ebpf-policies/list returns kernel XDP policies', async ({
    request,
  }) => {
    const res = await request.get('/api/network/ebpf-policies/list');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.total_policies).toBeGreaterThanOrEqual(2);
    expect(data.kernel_hook_mode).toBe('XDP_INGRESS_ZERO_COPY');
    expect(data.policies.length).toBeGreaterThanOrEqual(2);

    const ssrfPolicy = data.policies.find(
      (p: { vector_type: string }) => p.vector_type === 'IMDS_METADATA_SSRF'
    );
    expect(ssrfPolicy).toBeDefined();
    expect(ssrfPolicy.hook_point).toBe('XDP_INGRESS');
    expect(ssrfPolicy.action).toBe('XDP_DROP');
  });

  test('POST /api/network/ebpf-policies/synthesize auto-compiles C/eBPF filter from AST diff', async ({
    request,
  }) => {
    const payload = {
      diff_text: "+if '169.254' in target_url: raise SSRFException('Blocked')",
      target_endpoint: '/api/v1/trade/settle',
      vector_type: 'IMDS_METADATA_SSRF',
      target_interface: 'eth0',
    };
    const res = await request.post('/api/network/ebpf-policies/synthesize', {
      data: payload,
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('SYNTHESIZED');
    expect(data.policy.policy_id).toBeDefined();
    expect(data.policy.c_source_code).toContain('SEC("xdp")');
    expect(data.policy.verifier_status).toBe('VERIFIED_SAFE');
    expect(data.policy.instruction_count).toBeGreaterThan(0);
  });

  test('GET /api/compliance/soc2/evidence returns 100% readiness and CC6, CC7, CC8 controls', async ({
    request,
  }) => {
    const res = await request.get('/api/compliance/soc2/evidence');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('EVIDENCE_COLLECTED');
    expect(data.manifest.readiness_score_pct).toBe(100.0);
    expect(data.manifest.enterprise_evidence.active_enterprise_contracts).toBeGreaterThanOrEqual(4);
    expect(data.manifest.enterprise_evidence.total_reconciled_arr_usd).toBe(840000);
    expect(data.trust_services_criteria.overall_readiness_pct).toBe(100.0);
    expect(data.trust_services_criteria.criteria.CC6_Logical_Access_Controls.status).toBe('COMPLIANT');
    expect(data.trust_services_criteria.criteria.CC7_System_Operations.status).toBe('COMPLIANT');
    expect(data.trust_services_criteria.criteria.CC8_Change_Management.status).toBe('COMPLIANT');
  });

  test('GET /api/compliance/soc2/download serves auditor ZIP archive binary stream', async ({
    request,
  }) => {
    const res = await request.get('/api/compliance/soc2/download');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/zip');

    const buffer = await res.body();
    expect(buffer.length).toBeGreaterThan(20);
  });

  test('Dashboard loads eBPF Policy & SOC 2 Bundle tab and switches sub-tabs', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await mockAuthenticatedSession(context, page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click eBPF Policy & SOC 2 Bundle tab
    const tab = page.locator('button:has-text("eBPF Policy & SOC 2 Bundle")');
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    // Verify main header
    await expect(
      page.locator('h1:has-text("Automated eBPF Kernel Policy & Continuous SOC 2 Type II Exporter")')
    ).toBeVisible({ timeout: 10000 });

    // Verify quick metrics bar
    await expect(page.locator('text=XDP HOOK OVERHEAD')).toBeVisible();
    await expect(page.locator('text=SOC 2 READINESS')).toBeVisible();
    await expect(page.locator('text=SLA ARR BUNDLE')).toBeVisible();

    // Verify Sub-Tab 1: eBPF Synthesizer
    await expect(page.locator('[data-testid="ebpf-policy-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="synthesize-policy-btn"]')).toBeVisible();
    await expect(page.locator('text=Compiled C/eBPF Kernel Program')).toBeVisible();

    // Click Synthesize button
    await page.locator('[data-testid="synthesize-policy-btn"]').click();
    await expect(page.locator('text=Kernel Policy Synthesized')).toBeVisible({ timeout: 10000 });

    // Switch to Sub-Tab 2: SOC 2 Type II
    const soc2Tab = page.locator('[data-testid="soc2-evidence-tab"]');
    await expect(soc2Tab).toBeVisible();
    await soc2Tab.click();

    // Verify SOC 2 view
    await expect(page.locator('text=Auditor Evidence Archive Manifest')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="download-soc2-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="generate-soc2-btn"]')).toBeVisible();
    await expect(page.locator('text=CC6').first()).toBeVisible();

    await context.close();
  });
});
