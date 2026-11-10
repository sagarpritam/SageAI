import { test, expect } from '@playwright/test';

test.describe('SagePatch AutoFix Review Flow E2E Tests', () => {

  const MOCK_PROPOSED_PATCH = {
    id: 'patch-sql-injection-01',
    repository: 'sagarpritam/SageAI',
    base_branch: 'main',
    patch_branch: 'sagepatch/fix-sql-injection-01',
    file_path: 'app/routers/auth.py',
    vulnerability_type: 'SQL_INJECTION',
    severity: 'CRITICAL',
    diff: '@@ -12,4 +12,4 @@\n- query = f"SELECT * FROM users WHERE email = \'{email}\'"\n+ stmt = select(User).where(User.email == email)\n+ result = await db.execute(stmt)',
    lines_changed: 3,
    status: 'proposed',
    sandbox_passed: true,
    sandbox_details: {
      safe: true,
      syntax_valid: true,
      security_valid: true,
      reasons: ['No prohibited calls detected', 'AST valid syntax', 'Safe imports'],
    },
    requested_by: 'SagePatch Autonomous Remediation Agent',
    created_at: '2026-11-02T12:00:00Z',
  };

  const MOCK_APPROVED_PATCH = {
    id: 'patch-xss-02',
    repository: 'sagarpritam/SageAI',
    base_branch: 'main',
    patch_branch: 'sagepatch/fix-xss-02',
    file_path: 'sage-web/src/components/Input.tsx',
    vulnerability_type: 'CROSS_SITE_SCRIPTING',
    severity: 'HIGH',
    diff: '@@ -5,2 +5,2 @@\n- element.innerHTML = userInput;\n+ element.textContent = sanitizeInput(userInput);',
    lines_changed: 2,
    status: 'approved',
    sandbox_passed: true,
    requested_by: 'SagePatch Autonomous Remediation Agent',
    approved_by: 'lead_security_officer@sageai.com',
    approved_at: '2026-11-02T12:15:00Z',
    pr_number: 42,
    pr_url: 'https://github.com/sagarpritam/SageAI/pull/42',
    created_at: '2026-11-02T11:45:00Z',
  };

  const MOCK_REJECTED_PATCH = {
    id: 'patch-idor-03',
    repository: 'sagarpritam/SageAI',
    base_branch: 'main',
    patch_branch: 'sagepatch/fix-idor-03',
    file_path: 'app/models/scan.py',
    vulnerability_type: 'INSECURE_DIRECT_OBJECT_REFERENCE',
    severity: 'MEDIUM',
    diff: '@@ -40,3 +40,3 @@\n- return db.query(Scan).all()\n+ return db.query(Scan).filter_by(org_id=user.org_id)',
    lines_changed: 2,
    status: 'rejected',
    sandbox_passed: true,
    requested_by: 'SagePatch Autonomous Remediation Agent',
    rejection_reason: 'Requires comprehensive database migration instead of in-place query filter.',
    created_at: '2026-11-02T10:30:00Z',
  };

  test.beforeEach(async ({ context, page }) => {
    // Set authenticated session cookie to access /dashboard
    await context.addCookies([
      {
        name: 'sageai_jwt',
        value: 'mock_e2e_authenticated_jwt_token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // Mock engine status endpoint
    await page.route('/api/autofix', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ready: true,
            message: 'SagePatch Remediation Engine Ready',
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock patches list endpoint
    await page.route('/api/autofix/patches', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          MOCK_PROPOSED_PATCH,
          MOCK_APPROVED_PATCH,
          MOCK_REJECTED_PATCH,
        ]),
      });
    });
  });

  test('AutoFixPanel renders engine status, badge counter, and patch queue items', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on the Auto-Fix tab in dashboard navigation
    const autofixTab = page.locator('button:has-text("Auto-Fix")');
    await expect(autofixTab).toBeVisible();
    await autofixTab.click();

    // Verify engine readiness banner
    await expect(page.locator('text=SagePatch Remediation Engine Ready').first()).toBeVisible();
    await expect(page.locator('text=Phase 04 Verified')).toBeVisible();

    // Verify Review Queue tab and pending counter badge (1 proposed patch)
    const queueBtn = page.locator('button:has-text("SagePatch Review Queue")');
    await expect(queueBtn).toBeVisible();
    await expect(queueBtn.locator('span:has-text("1")')).toBeVisible();

    // Verify all 3 patches render with corresponding severities & vulnerability types
    await expect(page.locator('text=SQL_INJECTION')).toBeVisible();
    await expect(page.locator('text=CROSS_SITE_SCRIPTING')).toBeVisible();
    await expect(page.locator('text=INSECURE_DIRECT_OBJECT_REFERENCE')).toBeVisible();

    // Verify file paths
    await expect(page.locator('text=app/routers/auth.py')).toBeVisible();
    await expect(page.locator('text=sage-web/src/components/Input.tsx')).toBeVisible();

    // Verify sandbox verification badges
    await expect(page.locator('text=AST Syntax Validated').first()).toBeVisible();
    await expect(page.locator('text=Sandboxed Isolation').first()).toBeVisible();
    await expect(page.locator('text=Human Review Enforced').first()).toBeVisible();

    // Verify approved patch shows GitHub PR link
    await expect(page.locator('text=#42')).toBeVisible();
    await expect(page.locator('a:has-text("View PR on GitHub")')).toHaveAttribute(
      'href',
      'https://github.com/sagarpritam/SageAI/pull/42'
    );

    // Verify rejected patch displays rejection rationale banner
    await expect(
      page.locator('text=Requires comprehensive database migration instead of in-place query filter.')
    ).toBeVisible();
  });

  test('User can expand and inspect the unified diff viewer', async ({ page }) => {
    await page.goto('/dashboard');
    await page.locator('button:has-text("Auto-Fix")').click();

    // Find the inspect unified diff button for the proposed SQL injection patch
    const inspectDiffBtn = page.locator('button:has-text("Inspect Unified Diff")').first();
    await expect(inspectDiffBtn).toBeVisible();
    await inspectDiffBtn.click();

    // Button label toggles to "Hide Unified Diff"
    await expect(page.locator('button:has-text("Hide Unified Diff")').first()).toBeVisible();

    // Verify diff content contains addition and deletion markers
    const diffContainer = page.locator('div.font-mono.text-xs.overflow-x-auto').first();
    await expect(diffContainer).toBeVisible();
    await expect(diffContainer.locator('text=- query = f"SELECT * FROM users')).toBeVisible();
    await expect(diffContainer.locator('text=+ stmt = select(User).where')).toBeVisible();

    // Clicking again collapses the diff viewer
    await page.locator('button:has-text("Hide Unified Diff")').first().click();
    await expect(page.locator('button:has-text("Inspect Unified Diff")').first()).toBeVisible();
    await expect(diffContainer).not.toBeVisible();
  });

  test('Approving a patch dispatches PR and refreshes list', async ({ page }) => {
    let approveCalled = false;

    // Intercept approve endpoint
    await page.route(
      `/api/autofix/patches/${MOCK_PROPOSED_PATCH.id}/approve`,
      async (route) => {
        expect(route.request().method()).toBe('POST');
        approveCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            patch_id: MOCK_PROPOSED_PATCH.id,
            status: 'approved',
            pr_number: 43,
            pr_url: 'https://github.com/sagarpritam/SageAI/pull/43',
          }),
        });
      }
    );

    await page.goto('/dashboard');
    await page.locator('button:has-text("Auto-Fix")').click();

    // Find Simulate PR and Approve & Open PR buttons
    await expect(page.locator('button:has-text("Simulate PR")')).toBeVisible();
    const approveBtn = page.locator('button:has-text("Approve & Open PR")');
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Verify approve API route was called
    await expect.poll(() => approveCalled).toBe(true);
  });

  test('Rejecting a patch opens rationale modal and requires explanation before submission', async ({
    page,
  }) => {
    let rejectPayload: { reason?: string } = {};

    // Intercept reject endpoint
    await page.route(
      `/api/autofix/patches/${MOCK_PROPOSED_PATCH.id}/reject`,
      async (route) => {
        expect(route.request().method()).toBe('POST');
        rejectPayload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            patch_id: MOCK_PROPOSED_PATCH.id,
            status: 'rejected',
            reason: rejectPayload.reason,
          }),
        });
      }
    );

    await page.goto('/dashboard');
    await page.locator('button:has-text("Auto-Fix")').click();

    // Click Reject Patch button
    const rejectBtn = page.locator('button:has-text("Reject Patch")');
    await expect(rejectBtn).toBeVisible();
    await rejectBtn.click();

    // Rejection modal appears
    const modal = page.locator('h4:has-text("Reject Remediation Patch")');
    await expect(modal).toBeVisible();

    const textarea = page.locator('textarea[placeholder*="breaking API change"]');
    await expect(textarea).toBeVisible();

    // Fill rejection explanation
    const rejectionReasonText = 'Code changes conflict with active Celery task transaction semantics.';
    await textarea.fill(rejectionReasonText);

    // Click Confirm Rejection
    const confirmBtn = page.locator('button:has-text("Confirm Rejection")');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Verify modal closes and reject payload matches entered text
    await expect(modal).not.toBeVisible();
    await expect.poll(() => rejectPayload.reason).toBe(rejectionReasonText);
  });

  test('User can switch between Review Queue, Scan Repository, and Propose Sandbox Fix tabs', async ({ page }) => {
    await page.goto('/dashboard');
    await page.locator('button:has-text("Auto-Fix")').click();

    // Switch to Scan Repository tab
    const scanTabBtn = page.locator('button:has-text("Scan Repository")');
    await expect(scanTabBtn).toBeVisible();
    await scanTabBtn.click();

    // Verify scan inputs are visible
    await expect(page.locator('text=Run SAST & Propose Fixes')).toBeVisible();
    await expect(page.locator('input[placeholder*="owner/repo"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Branch"]')).toBeVisible();
    await expect(page.locator('button:has-text("Start Remediation Scan")')).toBeVisible();

    // Switch to Propose Sandbox Fix tab
    const proposeTabBtn = page.locator('button:has-text("Propose Sandbox Fix")');
    await expect(proposeTabBtn).toBeVisible();
    await proposeTabBtn.click();
    await expect(page.locator('button:has-text("Validate AST & Propose Patch")')).toBeVisible();

    // Switch back to Review Queue tab
    const queueTabBtn = page.locator('button:has-text("SagePatch Review Queue")');
    await queueTabBtn.click();
    await expect(page.locator('text=Human-in-the-Loop Patch Approvals')).toBeVisible();
  });

});

