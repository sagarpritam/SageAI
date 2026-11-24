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

test.describe('Automated SOC Incident Playbooks & Dynamic eBPF Tuning Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('sageai_onboarding_done', 'true');
    });
  });

  test('GET /api/soc/playbooks/list returns automated playbooks', async ({
    request,
  }) => {
    const res = await request.get('/api/soc/playbooks/list');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.playbooks).toBeDefined();
    expect(data.playbooks.length).toBeGreaterThanOrEqual(4);

    const pbIds = data.playbooks.map((p: { playbook_id: string }) => p.playbook_id);
    expect(pbIds).toContain('PB-RANSOMWARE-CONTAINMENT');
    expect(pbIds).toContain('PB-APT-C2-TERMINATION');
    expect(pbIds).toContain('PB-CLOUD-IMDS-LOCKDOWN');
    expect(pbIds).toContain('PB-SUPPLY-CHAIN-QUARANTINE');
  });

  test('POST /api/soc/playbooks/execute runs automated containment', async ({
    request,
  }) => {
    const res = await request.post('/api/soc/playbooks/execute', {
      data: {
        playbook_id: 'PB-RANSOMWARE-CONTAINMENT',
        target_environment: 'staging-dual-cloud',
        operator_role: 'ciso',
      },
    });
    expect(res.status()).toBe(200);

    const result = await res.json();
    expect(result.status).toBe('COMPLETED_CONTAINED');
    expect(result.containment_ratio).toBe(1.0);
    expect(result.human_downtime_seconds).toBe(0.0);
    expect(result.steps_executed.length).toBeGreaterThanOrEqual(4);
    expect(result.merkle_record_hash).toBeDefined();
  });

  test('GET & POST /api/soc/playbooks/ebpf/tune manages live kernel tuning', async ({
    request,
  }) => {
    const getRes = await request.get('/api/soc/playbooks/ebpf/tuning');
    expect(getRes.status()).toBe(200);
    const initial = await getRes.json();
    expect(initial.xdp_mode).toBeDefined();

    const postRes = await request.post('/api/soc/playbooks/ebpf/tune', {
      data: {
        xdp_mode: 'NATIVE_DRIVER',
        drop_action: 'XDP_DROP',
        ring_buffer_size_mb: 64,
        blocked_cidrs: ['198.51.100.0/24', '203.0.113.0/24'],
        blocked_ports: [4444, 1337],
        tuned_by: 'ciso',
      },
    });
    expect(postRes.status()).toBe(200);
    const tuned = await postRes.json();
    expect(tuned.xdp_mode).toBe('NATIVE_DRIVER');
    expect(tuned.active_rules_count).toBeGreaterThanOrEqual(4);
  });

  test('GET & POST /api/soc/playbooks/killswitch/trigger manages emergency levers', async ({
    request,
  }) => {
    const getRes = await request.get('/api/soc/playbooks/killswitch/status');
    expect(getRes.status()).toBe(200);
    const ksData = await getRes.json();
    expect(ksData.killswitches.length).toBe(4);

    const triggerRes = await request.post(
      '/api/soc/playbooks/killswitch/trigger',
      {
        data: {
          killswitch_id: 'KS-INGRESS-SEVER',
          action: 'ENGAGE',
          operator_name: 'Marcus Vance',
          operator_role: 'ciso',
          reason: 'Automated E2E emergency containment verification',
        },
      }
    );
    expect(triggerRes.status()).toBe(200);
    const cert = await triggerRes.json();
    expect(cert.status).toBe('ENGAGED_ACTIVE');
    expect(cert.certificate_id).toBeDefined();
  });

  test('Dashboard loads SOC Playbooks & eBPF Studio tab and operates tactical controls', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await mockAuthenticatedSession(context, page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click SOC Playbooks & eBPF tab
    const tab = page.locator('button:has-text("SOC Playbooks & eBPF")');
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    // Verify studio heading
    await expect(
      page.locator('h1:has-text("Automated SOC Incident Playbooks & eBPF Tuning")')
    ).toBeVisible({ timeout: 10000 });

    // Verify sub-tabs exist
    await expect(page.locator('button:has-text("Automated Playbooks")')).toBeVisible();
    await expect(page.locator('button:has-text("eBPF Packet Tuning")')).toBeVisible();
    await expect(page.locator('button:has-text("CISO Kill-Switches")')).toBeVisible();

    // Verify Execute Playbook button
    await expect(page.locator('button:has-text("Execute Playbook")').first()).toBeVisible();

    // Switch to eBPF Tuning tab
    await page.locator('button:has-text("eBPF Packet Tuning")').click();
    await expect(
      page.locator('h2:has-text("Dynamic Kernel-Space eBPF XDP Tuning Controls")')
    ).toBeVisible();
    await expect(page.locator('button:has-text("Apply Live eBPF Kernel Tuning")')).toBeVisible();

    // Switch to CISO Kill-Switches tab
    await page.locator('button:has-text("CISO Kill-Switches")').click();
    await expect(
      page.locator('h3:has-text("CISO Emergency Operational Signatory")')
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("ENGAGE EMERGENCY KILL-SWITCH")').first()
    ).toBeVisible();

    await context.close();
  });
});
