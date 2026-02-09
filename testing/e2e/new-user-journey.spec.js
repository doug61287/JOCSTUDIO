/**
 * JOCstudio E2E Test - New User Journey
 * Complete flow from landing page to first won project
 */

import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Test data
const testUser = {
  email: `e2e-${Date.now()}@test.jocstudio.com`,
  password: 'TestPassword123!',
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  company: faker.company.name(),
};

test.describe('New User Journey', () => {
  test.describe.configure({ mode: 'serial' }); // Run tests in order

  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1: Visit Landing Page
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 1: Visit landing page', async () => {
    await page.goto('/');
    
    // Verify landing page elements
    await expect(page).toHaveTitle(/JOCstudio/i);
    await expect(page.locator('h1')).toContainText(/takeoff|estimating|proposal/i);
    
    // CTA button should be visible
    const ctaButton = page.getByRole('button', { name: /start.*free.*trial|get.*started|sign.*up/i });
    await expect(ctaButton).toBeVisible();
    
    // Screenshot for visual regression
    await page.screenshot({ path: './reports/screenshots/01-landing-page.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 2: Click Start Free Trial
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 2: Click Start Free Trial', async () => {
    const ctaButton = page.getByRole('button', { name: /start.*free.*trial|get.*started/i });
    await ctaButton.click();
    
    // Should navigate to registration page
    await expect(page).toHaveURL(/register|signup|sign-up/i);
    
    // Registration form should be visible
    await expect(page.locator('form')).toBeVisible();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 3: Register Account
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 3: Register account', async () => {
    // Fill registration form
    await page.fill('[name="firstName"], [name="first_name"], #firstName', testUser.firstName);
    await page.fill('[name="lastName"], [name="last_name"], #lastName', testUser.lastName);
    await page.fill('[name="email"], #email', testUser.email);
    await page.fill('[name="password"], #password', testUser.password);
    await page.fill('[name="company"], [name="companyName"], #company', testUser.company);
    
    // Accept terms if present
    const termsCheckbox = page.locator('[name="terms"], [name="acceptTerms"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for registration to complete
    await page.waitForURL(/verify|onboarding|dashboard|confirm/i, { timeout: 10000 });
    
    await page.screenshot({ path: './reports/screenshots/03-registered.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 4: Verify Email (Mock)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 4: Verify email (mock)', async () => {
    // In test environment, auto-verify or use magic link
    // Check if on verification page
    const isVerificationPage = await page.url().includes('verify');
    
    if (isVerificationPage) {
      // Mock verification - in test env, use a test API endpoint
      await page.goto(`/api/test/verify-email?email=${testUser.email}`);
      await page.goto('/onboarding');
    }
    
    // Should be on onboarding or dashboard
    await expect(page.url()).toMatch(/onboarding|dashboard/i);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 5: Complete Onboarding
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 5: Complete onboarding', async () => {
    // Check if onboarding exists
    const isOnboarding = await page.url().includes('onboarding');
    
    if (isOnboarding) {
      // Step 1: Select role/use case
      const contractorOption = page.locator('[data-testid="role-contractor"], button:has-text("Contractor")');
      if (await contractorOption.isVisible()) {
        await contractorOption.click();
      }
      
      // Step 2: Select specialty
      const generalConstruction = page.locator('[data-testid="specialty-general"], button:has-text("General")');
      if (await generalConstruction.isVisible()) {
        await generalConstruction.click();
      }
      
      // Complete/Skip onboarding
      const nextButton = page.getByRole('button', { name: /next|continue|complete|skip/i });
      while (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500); // Brief wait for transition
      }
    }
    
    // Should reach dashboard
    await page.waitForURL(/dashboard/i, { timeout: 10000 });
    await expect(page.locator('h1, h2')).toContainText(/dashboard|projects|welcome/i);
    
    await page.screenshot({ path: './reports/screenshots/05-onboarding-complete.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 6: Create First Project
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 6: Create first project', async () => {
    // Click new project button
    const newProjectBtn = page.getByRole('button', { name: /new.*project|create.*project|\+/i });
    await newProjectBtn.click();
    
    // Wait for project form/modal
    await page.waitForSelector('[data-testid="project-form"], form[name="project"]', { timeout: 5000 });
    
    // Fill project details
    await page.fill('[name="name"], [name="projectName"], #projectName', 'E2E Test Project');
    await page.fill('[name="client"], [name="clientName"], #clientName', 'Test Client Corp');
    await page.fill('[name="address"], #address', '123 Test Street, Test City, TS 12345');
    
    // Optional: Add description
    const descriptionField = page.locator('[name="description"], #description');
    if (await descriptionField.isVisible()) {
      await descriptionField.fill('This is an automated E2E test project');
    }
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Create")');
    
    // Wait for navigation to project
    await page.waitForURL(/project/i, { timeout: 10000 });
    
    await page.screenshot({ path: './reports/screenshots/06-project-created.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 7: Upload PDF
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 7: Upload PDF', async () => {
    // Find upload area
    const uploadArea = page.locator('[data-testid="file-upload"], [data-testid="pdf-upload"], .dropzone');
    await expect(uploadArea).toBeVisible();
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./fixtures/test-drawing.pdf');
    
    // Wait for upload to complete
    await expect(page.locator('[data-testid="upload-success"], .upload-complete, .file-preview')).toBeVisible({ timeout: 30000 });
    
    await page.screenshot({ path: './reports/screenshots/07-pdf-uploaded.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 8: Add Measurements
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 8: Add measurements', async () => {
    // Open measurement tool
    const measureBtn = page.getByRole('button', { name: /measure|takeoff|add.*measurement/i });
    await measureBtn.click();
    
    // Select area measurement tool
    const areaToolBtn = page.locator('[data-testid="tool-area"], button:has-text("Area")');
    await areaToolBtn.click();
    
    // Draw on canvas (simulate polygon)
    const canvas = page.locator('canvas, [data-testid="pdf-viewer"]');
    const box = await canvas.boundingBox();
    
    // Click to create polygon points
    await page.mouse.click(box.x + 100, box.y + 100);
    await page.mouse.click(box.x + 300, box.y + 100);
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.mouse.click(box.x + 100, box.y + 300);
    await page.mouse.dblclick(box.x + 100, box.y + 100); // Close polygon
    
    // Fill measurement details
    await page.fill('[name="measurementName"], [name="name"]', 'Floor Area');
    await page.fill('[name="unitCost"]', '12.50');
    
    // Save measurement
    await page.click('button:has-text("Save"), button:has-text("Add")');
    
    // Verify measurement appears in list
    await expect(page.locator('[data-testid="measurement-list"]')).toContainText('Floor Area');
    
    await page.screenshot({ path: './reports/screenshots/08-measurements-added.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 9: Generate Proposal
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 9: Generate proposal', async () => {
    // Click generate proposal button
    const generateBtn = page.getByRole('button', { name: /generate.*proposal|create.*proposal|export/i });
    await generateBtn.click();
    
    // Wait for proposal modal/page
    await page.waitForSelector('[data-testid="proposal-preview"], .proposal-template', { timeout: 10000 });
    
    // Select template if available
    const templateSelector = page.locator('[data-testid="template-select"]');
    if (await templateSelector.isVisible()) {
      await templateSelector.selectOption({ index: 0 });
    }
    
    // Generate/Download
    const downloadBtn = page.getByRole('button', { name: /download|generate|send/i });
    
    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await downloadBtn.click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/proposal.*\.pdf$/i);
    
    await page.screenshot({ path: './reports/screenshots/09-proposal-generated.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 10: Mark as Won (Trigger Hero Sequence)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 10: Mark as won (trigger Hero sequence)', async () => {
    // Navigate to project if not there
    await page.goto(/project/ );
    
    // Find status dropdown or won button
    const statusBtn = page.locator('[data-testid="project-status"], button:has-text("Status")');
    await statusBtn.click();
    
    // Select "Won"
    const wonOption = page.locator('[data-testid="status-won"], [role="option"]:has-text("Won"), button:has-text("Won")');
    await wonOption.click();
    
    // Confirm if dialog appears
    const confirmDialog = page.locator('[role="dialog"]:has-text("Congratulations")');
    if (await confirmDialog.isVisible({ timeout: 2000 })) {
      await page.click('[role="dialog"] button:has-text("Confirm"), [role="dialog"] button:has-text("Yes")');
    }
    
    // Verify Hero celebration
    const celebration = page.locator('[data-testid="hero-celebration"], .confetti, .celebration');
    await expect(celebration).toBeVisible({ timeout: 5000 });
    
    // Verify status updated
    await expect(page.locator('[data-testid="project-status"]')).toContainText(/won/i);
    
    await page.screenshot({ path: './reports/screenshots/10-project-won.png' });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADDITIONAL USER TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('Registration Edge Cases', () => {
  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error, [data-testid="email-error"]')).toBeVisible();
  });

  test('should show validation errors for weak password', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="password"]', '123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error, [data-testid="password-error"]')).toContainText(/strong|weak|minimum/i);
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="email"]', testUser.email); // Use already registered email
    await page.fill('[name="password"]', testUser.password);
    await page.fill('[name="firstName"]', 'Duplicate');
    await page.fill('[name="lastName"]', 'User');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error, [role="alert"]')).toContainText(/exists|already|registered/i);
  });
});
