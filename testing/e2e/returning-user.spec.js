/**
 * JOCstudio E2E Test - Returning User Journey
 * Login, dashboard, edit project, export, logout
 */

import { test, expect } from '@playwright/test';

// Test user (should exist from previous tests or seeded data)
const testUser = {
  email: process.env.TEST_USER_EMAIL || 'returning@test.jocstudio.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
};

test.describe('Returning User Journey', () => {
  test.describe.configure({ mode: 'serial' });

  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1: Login
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 1: Login', async () => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('[name="email"], #email', testUser.email);
    await page.fill('[name="password"], #password', testUser.password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL(/dashboard/i, { timeout: 10000 });
    
    await page.screenshot({ path: './reports/screenshots/returning-01-login.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 2: View Dashboard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 2: View dashboard', async () => {
    // Verify dashboard elements
    await expect(page.locator('[data-testid="project-list"], .projects-grid')).toBeVisible();
    
    // Should show recent projects
    await expect(page.locator('[data-testid="project-card"]')).toHaveCount({ minimum: 1 });
    
    // Stats should be visible
    await expect(page.locator('[data-testid="stats-total-projects"], .stat-projects')).toBeVisible();
    await expect(page.locator('[data-testid="stats-won-value"], .stat-won')).toBeVisible();
    
    // Quick actions should be available
    await expect(page.getByRole('button', { name: /new.*project/i })).toBeVisible();
    
    await page.screenshot({ path: './reports/screenshots/returning-02-dashboard.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 3: Open Existing Project
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 3: Open existing project', async () => {
    // Click on first project card
    const projectCard = page.locator('[data-testid="project-card"]').first();
    await projectCard.click();
    
    // Wait for project page to load
    await page.waitForURL(/project\//i);
    
    // Verify project elements
    await expect(page.locator('[data-testid="project-name"], h1')).toBeVisible();
    await expect(page.locator('[data-testid="measurement-list"], .measurements')).toBeVisible();
    
    await page.screenshot({ path: './reports/screenshots/returning-03-project-open.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 4: Edit Measurements
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 4: Edit measurements', async () => {
    // Click on first measurement to edit
    const measurement = page.locator('[data-testid="measurement-item"]').first();
    await measurement.click();
    
    // Edit quantity
    const quantityInput = page.locator('[name="quantity"], #quantity');
    await quantityInput.clear();
    await quantityInput.fill('150');
    
    // Edit unit cost
    const unitCostInput = page.locator('[name="unitCost"], #unitCost');
    await unitCostInput.clear();
    await unitCostInput.fill('25.00');
    
    // Save
    await page.click('button:has-text("Save"), button:has-text("Update")');
    
    // Verify update reflected
    await expect(page.locator('[data-testid="measurement-total"]').first()).toContainText('3,750'); // 150 * 25
    
    await page.screenshot({ path: './reports/screenshots/returning-04-measurements-edited.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 5: Export to Excel
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 5: Export to Excel', async () => {
    // Click export button
    const exportBtn = page.getByRole('button', { name: /export|download/i });
    await exportBtn.click();
    
    // Select Excel format
    const excelOption = page.locator('[data-testid="export-excel"], button:has-text("Excel")');
    
    // Start waiting for download
    const downloadPromise = page.waitForEvent('download');
    await excelOption.click();
    
    const download = await downloadPromise;
    
    // Verify it's an Excel file
    expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls)$/i);
    
    await page.screenshot({ path: './reports/screenshots/returning-05-exported.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 6: Logout
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 6: Logout', async () => {
    // Open user menu
    const userMenu = page.locator('[data-testid="user-menu"], [data-testid="avatar"]');
    await userMenu.click();
    
    // Click logout
    const logoutBtn = page.locator('[data-testid="logout"], button:has-text("Logout"), a:has-text("Logout")');
    await logoutBtn.click();
    
    // Should redirect to login or home
    await page.waitForURL(/login|^\/$/, { timeout: 5000 });
    
    await page.screenshot({ path: './reports/screenshots/returning-06-logged-out.png' });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGIN EDGE CASES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('Login Edge Cases', () => {
  test('should show error for wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', 'WrongPassword!');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error, [role="alert"]')).toContainText(/invalid|incorrect|wrong/i);
  });

  test('should show error for non-existent email', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'nonexistent@test.jocstudio.com');
    await page.fill('[name="password"]', 'SomePassword123!');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error, [role="alert"]')).toBeVisible();
  });

  test('should have working forgot password link', async ({ page }) => {
    await page.goto('/login');
    
    const forgotLink = page.getByRole('link', { name: /forgot.*password|reset/i });
    await forgotLink.click();
    
    await expect(page).toHaveURL(/forgot|reset|password/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('should maintain session across page reload', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/i);
    
    // Reload
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL(/dashboard/i);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
