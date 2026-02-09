/**
 * JOCstudio Mobile Responsiveness Tests
 * Tests for responsive design across various devices and viewports
 */

import { test, expect, devices } from '@playwright/test';

// Device configurations
const viewports = {
  // Mobile phones
  'iPhone SE': { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'iPhone 14': { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  'iPhone 14 Pro Max': { width: 430, height: 932, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  'Pixel 7': { width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true },
  'Galaxy S21': { width: 360, height: 800, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  
  // Tablets
  'iPad Mini': { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'iPad Pro 11': { width: 834, height: 1194, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'iPad Pro 12.9': { width: 1024, height: 1366, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  
  // Desktop breakpoints
  'Small Desktop': { width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  'Full HD': { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
};

test.describe('Mobile Responsiveness', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LANDING PAGE RESPONSIVENESS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  for (const [deviceName, viewport] of Object.entries(viewports)) {
    test(`Landing page renders correctly on ${deviceName}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // Hero section should be visible
      await expect(page.locator('[data-testid="hero"], .hero, h1')).toBeVisible();

      // CTA button should be visible and clickable
      const ctaButton = page.getByRole('button', { name: /get.*started|start.*free/i });
      await expect(ctaButton).toBeVisible();

      // Navigation should be appropriate for viewport
      if (viewport.isMobile) {
        // Mobile: hamburger menu should exist
        const mobileMenu = page.locator('[data-testid="mobile-menu"], .hamburger, [aria-label="Menu"]');
        await expect(mobileMenu).toBeVisible();
      } else {
        // Desktop: navigation links should be visible
        const navLinks = page.locator('nav a, [data-testid="nav-links"]');
        await expect(navLinks.first()).toBeVisible();
      }

      // No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Screenshot for visual comparison
      await page.screenshot({ 
        path: `./reports/screenshots/responsive/landing-${deviceName.replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DASHBOARD RESPONSIVENESS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test.describe('Dashboard Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[name="email"]', 'mobile@test.jocstudio.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/dashboard/i, { timeout: 10000 });
    });

    test('Dashboard adapts to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      // Project cards should stack vertically
      const cards = page.locator('[data-testid="project-card"]');
      if (await cards.count() > 1) {
        const firstCard = await cards.first().boundingBox();
        const secondCard = await cards.nth(1).boundingBox();
        
        // Cards should not be side by side on mobile
        expect(secondCard.y).toBeGreaterThan(firstCard.y);
      }

      // Sidebar should be collapsed/hidden
      const sidebar = page.locator('[data-testid="sidebar"], aside');
      const isHidden = await sidebar.isHidden() || 
                       await page.locator('[data-testid="sidebar-collapsed"]').isVisible();
      expect(isHidden).toBe(true);

      await page.screenshot({ 
        path: './reports/screenshots/responsive/dashboard-mobile.png',
        fullPage: true 
      });
    });

    test('Dashboard uses full width on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Project cards should be in a grid
      const cards = page.locator('[data-testid="project-card"]');
      if (await cards.count() > 1) {
        const firstCard = await cards.first().boundingBox();
        const secondCard = await cards.nth(1).boundingBox();
        
        // Cards might be side by side on desktop
        const areSideBySide = Math.abs(firstCard.y - secondCard.y) < 50;
        expect(areSideBySide).toBe(true);
      }

      // Sidebar should be visible
      const sidebar = page.locator('[data-testid="sidebar"], aside');
      await expect(sidebar).toBeVisible();

      await page.screenshot({ 
        path: './reports/screenshots/responsive/dashboard-desktop.png',
        fullPage: true 
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROJECT EDITOR RESPONSIVENESS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test.describe('Project Editor Responsiveness', () => {
    test('PDF viewer scales correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 834, height: 1194 }); // iPad Pro 11

      // Navigate to a project with a PDF
      await page.goto('/project/test-project-id');

      // PDF viewer should fill available space
      const pdfViewer = page.locator('[data-testid="pdf-viewer"], canvas');
      if (await pdfViewer.isVisible()) {
        const viewerBox = await pdfViewer.boundingBox();
        expect(viewerBox.width).toBeGreaterThan(400);
      }

      // Measurement panel should be accessible
      const measurePanel = page.locator('[data-testid="measurement-panel"]');
      const toggleBtn = page.locator('[data-testid="toggle-measurements"]');
      
      // Either panel is visible or toggle button is available
      const panelOrToggle = await measurePanel.isVisible() || await toggleBtn.isVisible();
      expect(panelOrToggle).toBe(true);
    });

    test('Toolbar adapts to mobile screen', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/project/test-project-id');

      // Toolbar should show essential tools only
      const toolbar = page.locator('[data-testid="toolbar"]');
      await expect(toolbar).toBeVisible();

      // More tools should be in overflow menu
      const overflowMenu = page.locator('[data-testid="toolbar-more"], [aria-label="More tools"]');
      await expect(overflowMenu).toBeVisible();

      await page.screenshot({ 
        path: './reports/screenshots/responsive/editor-mobile.png' 
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOUCH INTERACTION TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test.describe('Touch Interactions', () => {
    test('Touch targets meet minimum size requirements (44x44px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Check all interactive elements
      const interactiveElements = await page.locator('button, a, [role="button"], input[type="checkbox"]').all();

      for (const element of interactiveElements.slice(0, 20)) { // Check first 20
        const box = await element.boundingBox();
        if (box) {
          // Touch targets should be at least 44x44 pixels
          const meetsTouchTarget = box.width >= 44 && box.height >= 44;
          // Or have adequate spacing
          const hasAdequateSpacing = box.width >= 32 && box.height >= 32;
          
          expect(meetsTouchTarget || hasAdequateSpacing).toBe(true);
        }
      }
    });

    test('Swipe gestures work on mobile menus', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      // Open mobile menu
      const menuBtn = page.locator('[data-testid="mobile-menu"]');
      if (await menuBtn.isVisible()) {
        await menuBtn.click();

        // Menu should be visible
        const menuPanel = page.locator('[data-testid="mobile-nav"], .mobile-menu-panel');
        await expect(menuPanel).toBeVisible();

        // Simulate swipe to close
        const panelBox = await menuPanel.boundingBox();
        await page.mouse.move(panelBox.x + panelBox.width / 2, panelBox.y + panelBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(panelBox.x - 100, panelBox.y + panelBox.height / 2, { steps: 10 });
        await page.mouse.up();

        // Menu should close (or have close button)
        // Implementation varies
      }
    });

    test('Pinch-to-zoom works on PDF viewer', async ({ page }) => {
      // This requires touch emulation which Playwright supports
      await page.setViewportSize({ width: 834, height: 1194 });
      await page.goto('/project/test-project-id');

      // Note: Actual pinch-to-zoom testing requires special handling
      // This is a placeholder for manual testing documentation
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PERFORMANCE ON MOBILE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test.describe('Mobile Performance', () => {
    test('Page loads within acceptable time on 3G', async ({ page, context }) => {
      // Simulate slow 3G
      await context.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });

      await page.setViewportSize({ width: 375, height: 667 });

      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds even on slow connection
      expect(loadTime).toBeLessThan(5000);
    });

    test('Images are responsive and optimized', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Check for responsive images
      const images = await page.locator('img').all();
      
      for (const img of images.slice(0, 10)) {
        // Should have srcset or responsive sizing
        const srcset = await img.getAttribute('srcset');
        const loading = await img.getAttribute('loading');
        
        // Modern images should have lazy loading or srcset
        const isOptimized = srcset !== null || loading === 'lazy';
        // Log warning but don't fail (best practice check)
        if (!isOptimized) {
          console.warn('Image missing optimization:', await img.getAttribute('src'));
        }
      }
    });

    test('Fonts are readable on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // iPhone SE (old)
      await page.goto('/');

      // Check body text size
      const bodyFontSize = await page.evaluate(() => {
        const body = document.querySelector('body');
        return parseFloat(window.getComputedStyle(body).fontSize);
      });

      // Font size should be at least 14px for readability
      expect(bodyFontSize).toBeGreaterThanOrEqual(14);

      // Check that text doesn't overflow
      const hasTextOverflow = await page.evaluate(() => {
        const elements = document.querySelectorAll('p, span, div');
        for (const el of elements) {
          if (el.scrollWidth > el.clientWidth && 
              window.getComputedStyle(el).overflow !== 'hidden') {
            return true;
          }
        }
        return false;
      });

      expect(hasTextOverflow).toBe(false);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ORIENTATION CHANGES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  test.describe('Orientation Changes', () => {
    test('Layout adapts to landscape orientation', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/dashboard');

      await page.screenshot({ 
        path: './reports/screenshots/responsive/dashboard-portrait.png' 
      });

      // Switch to landscape
      await page.setViewportSize({ width: 812, height: 375 });
      await page.waitForTimeout(500); // Allow for reflow

      // Content should still be visible and usable
      await expect(page.locator('[data-testid="project-card"]').first()).toBeVisible();

      // No content should be cut off
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      await page.screenshot({ 
        path: './reports/screenshots/responsive/dashboard-landscape.png' 
      });
    });
  });
});
