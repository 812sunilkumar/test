import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading
    await expect(page.getByRole('heading', { name: /book a test drive/i })).toBeVisible();
    
    // Check for booking button/link
    const bookingButton = page.getByRole('link', { name: /book test drive/i });
    await expect(bookingButton).toBeVisible();
  });

  test('should navigate to booking page when button is clicked', async ({ page }) => {
    await page.goto('/');
    
    const bookingButton = page.getByRole('link', { name: /book test drive/i });
    await bookingButton.click();
    
    // Should navigate to booking page
    await expect(page).toHaveURL(/.*booktestdrive/);
  });

  test('should display correct page structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for centered layout
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
    
    // Check for card-like structure
    const card = page.locator('.bg-white.rounded-lg').first();
    await expect(card).toBeVisible();
  });
});
