import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display dashboard components', async ({ page }) => {
    // Check main dashboard elements
    await expect(page.locator('text=Smart Scheduling')).toBeVisible();
    await expect(page.locator('text=Health & Wellness')).toBeVisible();
    await expect(page.locator('text=Smart Transportation')).toBeVisible();
    await expect(page.locator('text=Privacy & Security')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Click on Health tab
    await page.click('text=Health');
    
    // Should show health-focused content
    await expect(page.locator('[data-testid="health-metrics"]')).toBeVisible();
    
    // Click on Schedule tab
    await page.click('text=Schedule');
    
    // Should show schedule-focused content
    await expect(page.locator('[data-testid="schedule-optimizer"]')).toBeVisible();
  });

  test('should show real-time updates', async ({ page }) => {
    // Check for real-time health data
    const heartRateElement = page.locator('[data-testid="heart-rate"]');
    const initialValue = await heartRateElement.textContent();
    
    // Wait for updates (WebSocket simulation)
    await page.waitForTimeout(5000);
    
    const updatedValue = await heartRateElement.textContent();
    
    // Values should be different due to real-time updates
    expect(initialValue).not.toBe(updatedValue);
  });
});