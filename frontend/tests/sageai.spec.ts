import { test, expect } from '@playwright/test';

test.describe('SageAI E2E Flows', () => {

  // A setup step that runs before each test to ensure we are logged out
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Clear localStorage if needed
    await page.evaluate(() => localStorage.clear());
  });

  test('User can log in and view the primary dashboard metrics', async ({ page }) => {
    // 1. Visit Login Page
    await page.goto('/login');

    // 2. Fill Credentials
    await page.fill('input[type="email"]', 'admin@sageai.com');
    await page.fill('input[type="password"]', 'admin123');

    // 3. Click Login
    await page.click('button[type="submit"]');

    // 4. Verify we are redirected to the Dashboard
    await expect(page).toHaveURL('/');

    // 5. Verify Dashboard elements load
    await expect(page.locator('text=Security Posture Score')).toBeVisible();
    await expect(page.locator('text=Active Scans')).toBeVisible();
    await expect(page.locator('text=Total Findings')).toBeVisible();
  });

  test('User can navigate to the Scans page and trigger a new scan', async ({ page }) => {
    // Fake login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@sageai.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Navigate to Scans
    await page.click('a[href="/scans"]');
    await expect(page).toHaveURL('/scans');

    // Open New Scan modal or section
    const newScanButton = page.locator('button:has-text("New Scan")');
    await expect(newScanButton).toBeVisible();

    // Verify scan input is present
    await page.fill('input[placeholder="Enter URL or IP address..."]', 'https://example.com');
    const startScanBtn = page.locator('button:has-text("Start Discovery")');
    await expect(startScanBtn).toBeVisible();
    
    // NOTE: Avoid clicking "Start Discovery" in e2e to prevent spamming live backend
    // Unless running against integration test DB, then we can verify the state changes to 'Running'.
  });

  test('User can navigate between side nav tabs successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@sageai.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Agents tab
    await page.click('a[href="/agents"]');
    await expect(page).toHaveURL('/agents');
    await expect(page.locator('text=Team SageAI')).toBeVisible();

    // Integrations tab
    await page.click('a[href="/integrations"]');
    await expect(page).toHaveURL('/integrations');
    await expect(page.locator('text=Data Integrations')).toBeVisible();
  });
});
