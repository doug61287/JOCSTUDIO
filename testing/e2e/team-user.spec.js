/**
 * JOCstudio E2E Test - Team User Journey
 * Organization management, invitations, collaboration, permissions
 */

import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Organization owner credentials
const owner = {
  email: `owner-${Date.now()}@test.jocstudio.com`,
  password: 'OwnerPassword123!',
  firstName: 'Owner',
  lastName: 'User',
  company: 'Test Organization Inc',
};

// Team member to invite
const teamMember = {
  email: `member-${Date.now()}@test.jocstudio.com`,
  firstName: 'Team',
  lastName: 'Member',
};

test.describe('Team User Journey', () => {
  test.describe.configure({ mode: 'serial' });

  let ownerPage;
  let memberPage;
  let inviteLink;

  test.beforeAll(async ({ browser }) => {
    // Create two browser contexts for owner and member
    ownerPage = await browser.newPage();
    memberPage = await browser.newPage();
  });

  test.afterAll(async () => {
    await ownerPage.close();
    await memberPage.close();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1: Login as Organization Owner
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 1: Register and login as organization owner', async () => {
    // Register owner
    await ownerPage.goto('/register');
    await ownerPage.fill('[name="firstName"]', owner.firstName);
    await ownerPage.fill('[name="lastName"]', owner.lastName);
    await ownerPage.fill('[name="email"]', owner.email);
    await ownerPage.fill('[name="password"]', owner.password);
    await ownerPage.fill('[name="company"]', owner.company);
    await ownerPage.click('button[type="submit"]');
    
    // Wait for dashboard
    await ownerPage.waitForURL(/dashboard|onboarding/i, { timeout: 10000 });
    
    // Skip onboarding if present
    const skipBtn = ownerPage.getByRole('button', { name: /skip|later/i });
    if (await skipBtn.isVisible({ timeout: 2000 })) {
      await skipBtn.click();
    }
    
    await ownerPage.screenshot({ path: './reports/screenshots/team-01-owner-login.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 2: Create Organization (if not auto-created)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 2: Verify organization setup', async () => {
    // Navigate to organization settings
    await ownerPage.goto('/settings/organization');
    
    // Verify organization exists
    await expect(ownerPage.locator('[data-testid="org-name"]')).toContainText(owner.company);
    
    // Verify owner role
    await expect(ownerPage.locator('[data-testid="user-role"]')).toContainText(/owner|admin/i);
    
    await ownerPage.screenshot({ path: './reports/screenshots/team-02-org-settings.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 3: Invite Team Member
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 3: Invite team member', async () => {
    // Navigate to team members section
    await ownerPage.goto('/settings/team');
    
    // Click invite button
    const inviteBtn = ownerPage.getByRole('button', { name: /invite|add.*member/i });
    await inviteBtn.click();
    
    // Fill invite form
    await ownerPage.fill('[name="email"], #inviteEmail', teamMember.email);
    
    // Select role
    const roleSelect = ownerPage.locator('[name="role"], #role');
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption('member');
    }
    
    // Send invitation
    await ownerPage.click('button:has-text("Send"), button:has-text("Invite")');
    
    // Verify invitation sent
    await expect(ownerPage.locator('[role="alert"], .toast')).toContainText(/invitation.*sent|invited/i);
    
    // Get invite link from modal or email (mock)
    const inviteLinkElement = ownerPage.locator('[data-testid="invite-link"]');
    if (await inviteLinkElement.isVisible()) {
      inviteLink = await inviteLinkElement.textContent();
    } else {
      // Mock getting invite link from API in test environment
      const response = await ownerPage.request.get(`/api/test/get-invite-link?email=${teamMember.email}`);
      const data = await response.json();
      inviteLink = data.inviteLink;
    }
    
    await ownerPage.screenshot({ path: './reports/screenshots/team-03-invite-sent.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 4: Accept Invitation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 4: Accept invitation', async () => {
    // Navigate to invite link
    await memberPage.goto(inviteLink || '/invite/test-token');
    
    // Verify invitation details
    await expect(memberPage.locator('h1, h2')).toContainText(/invited|join/i);
    await expect(memberPage.locator('[data-testid="org-name"]')).toContainText(owner.company);
    
    // Fill registration (if new user) or login (if existing)
    const isNewUser = await memberPage.locator('[name="password"]').isVisible();
    
    if (isNewUser) {
      await memberPage.fill('[name="firstName"]', teamMember.firstName);
      await memberPage.fill('[name="lastName"]', teamMember.lastName);
      await memberPage.fill('[name="password"]', 'MemberPassword123!');
    }
    
    // Accept invitation
    await memberPage.click('button:has-text("Accept"), button:has-text("Join")');
    
    // Wait for dashboard
    await memberPage.waitForURL(/dashboard/i, { timeout: 10000 });
    
    // Verify member is part of organization
    await expect(memberPage.locator('[data-testid="org-badge"]')).toContainText(owner.company);
    
    await memberPage.screenshot({ path: './reports/screenshots/team-04-invitation-accepted.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 5: Collaborate on Project
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 5: Collaborate on project', async () => {
    // Owner creates a project
    await ownerPage.goto('/dashboard');
    await ownerPage.click('[data-testid="new-project"]');
    await ownerPage.fill('[name="name"]', 'Team Collaboration Project');
    await ownerPage.fill('[name="client"]', 'Team Client');
    await ownerPage.click('button[type="submit"]');
    await ownerPage.waitForURL(/project/i);
    
    // Owner adds a measurement
    const measureBtn = ownerPage.getByRole('button', { name: /add.*measurement/i });
    await measureBtn.click();
    await ownerPage.fill('[name="name"]', 'Owner Measurement');
    await ownerPage.fill('[name="quantity"]', '100');
    await ownerPage.click('button:has-text("Save")');
    
    // Member should see the project
    await memberPage.goto('/dashboard');
    await expect(memberPage.locator('[data-testid="project-card"]:has-text("Team Collaboration")')).toBeVisible();
    
    // Member opens the project
    await memberPage.click('[data-testid="project-card"]:has-text("Team Collaboration")');
    await memberPage.waitForURL(/project/i);
    
    // Member should see owner's measurement
    await expect(memberPage.locator('[data-testid="measurement-item"]:has-text("Owner Measurement")')).toBeVisible();
    
    // Member adds their own measurement
    const memberMeasureBtn = memberPage.getByRole('button', { name: /add.*measurement/i });
    await memberMeasureBtn.click();
    await memberPage.fill('[name="name"]', 'Member Measurement');
    await memberPage.fill('[name="quantity"]', '50');
    await memberPage.click('button:has-text("Save")');
    
    // Owner should see member's measurement (refresh)
    await ownerPage.reload();
    await expect(ownerPage.locator('[data-testid="measurement-item"]:has-text("Member Measurement")')).toBeVisible();
    
    await ownerPage.screenshot({ path: './reports/screenshots/team-05-collaboration.png' });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 6: Check Permissions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test('Step 6: Check permissions', async () => {
    // Member should NOT be able to access organization settings
    await memberPage.goto('/settings/organization');
    
    // Should either redirect or show access denied
    const accessDenied = await memberPage.locator('[data-testid="access-denied"], .error-403').isVisible({ timeout: 2000 });
    const redirected = memberPage.url().includes('/dashboard') || memberPage.url().includes('/403');
    
    expect(accessDenied || redirected).toBe(true);
    
    // Member should NOT be able to delete projects they don't own
    const projectCard = memberPage.locator('[data-testid="project-card"]').first();
    await projectCard.click();
    
    const deleteBtn = memberPage.locator('[data-testid="delete-project"]');
    if (await deleteBtn.isVisible()) {
      // Button should be disabled or show permission error on click
      const isDisabled = await deleteBtn.isDisabled();
      if (!isDisabled) {
        await deleteBtn.click();
        // Confirm dialog
        const confirmBtn = memberPage.locator('[role="dialog"] button:has-text("Delete")');
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await expect(memberPage.locator('[role="alert"]')).toContainText(/permission|denied|cannot/i);
        }
      }
    }
    
    // Owner CAN delete projects
    await ownerPage.goto('/dashboard');
    await ownerPage.click('[data-testid="project-card"]:has-text("Team Collaboration")');
    const ownerDeleteBtn = ownerPage.locator('[data-testid="delete-project"]');
    await expect(ownerDeleteBtn).toBeEnabled();
    
    await memberPage.screenshot({ path: './reports/screenshots/team-06-permissions.png' });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERMISSION EDGE CASES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('Permission Edge Cases', () => {
  test('should not allow inviting with invalid email', async ({ page }) => {
    // Login as owner first (would need setup)
    await page.goto('/settings/team');
    
    const inviteBtn = page.getByRole('button', { name: /invite/i });
    await inviteBtn.click();
    
    await page.fill('[name="email"]', 'invalid-email');
    await page.click('button:has-text("Send")');
    
    await expect(page.locator('.error')).toBeVisible();
  });

  test('should handle expired invitation link', async ({ page }) => {
    await page.goto('/invite/expired-token');
    
    await expect(page.locator('[data-testid="error"], h1')).toContainText(/expired|invalid/i);
  });

  test('should handle already-used invitation link', async ({ page }) => {
    await page.goto('/invite/used-token');
    
    await expect(page.locator('[data-testid="error"], h1')).toContainText(/already.*used|invalid/i);
  });
});
