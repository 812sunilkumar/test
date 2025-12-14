import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/booktestdrive');
    // Wait for page to load and locations to fetch
    await page.waitForLoadState('networkidle');
    // Give extra time for locations to load
    await page.waitForTimeout(2000);
  });

  test('should display booking form with all sections', async ({ page }) => {
    // Check for form sections
    await expect(page.getByText(/select location & vehicle/i)).toBeVisible();
    await expect(page.getByText(/booking details/i)).toBeVisible();
    
    // Check for form fields
    await expect(page.getByLabel(/location/i)).toBeVisible();
    await expect(page.getByLabel(/vehicle/i)).toBeVisible();
    await expect(page.getByLabel(/date/i)).toBeVisible();
    await expect(page.getByLabel(/time/i)).toBeVisible();
    await expect(page.getByLabel(/duration/i)).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/phone/i)).toBeVisible();
  });

  test('should load locations on page load', async ({ page }) => {
    const locationSelect = page.getByLabel(/location/i);
    await expect(locationSelect).toBeVisible();
    
    // Check if locations are loaded (not just "Loading locations...")
    const selectText = await locationSelect.textContent();
    expect(selectText).not.toContain('Loading locations...');
    
    // Should have at least the default "Select location" option
    await expect(page.getByText(/select location/i)).toBeVisible();
  });

  test('should disable vehicle selector until location is selected', async ({ page }) => {
    const vehicleSelect = page.getByLabel(/vehicle/i);
    
    // Vehicle selector should be disabled initially
    await expect(vehicleSelect).toBeDisabled();
    
    // Should show "Please select a location first"
    await expect(page.getByText(/please select a location first/i)).toBeVisible();
  });

  test('should load vehicles when location is selected', async ({ page }) => {
    const locationSelect = page.getByLabel(/location/i);
    
    // Wait for locations to be available
    await locationSelect.waitFor({ state: 'visible' });
    
    // Get available options (skip the first empty option)
    const options = await locationSelect.locator('option').all();
    if (options.length > 1) {
      // Select first available location
      await locationSelect.selectOption({ index: 1 });
      
      // Wait for vehicles to load
      await page.waitForTimeout(2000);
      
      const vehicleSelect = page.getByLabel(/vehicle/i);
      
      // Vehicle selector should be enabled
      await expect(vehicleSelect).not.toBeDisabled();
      
      // Should not show "Please select a location first" anymore
      await expect(page.getByText(/please select a location first/i)).not.toBeVisible();
    }
  });

  test('should not show submit button until form is complete', async ({ page }) => {
    // Submit button should not be visible initially
    const submitButton = page.getByRole('button', { name: /book test drive/i });
    await expect(submitButton).not.toBeVisible();
  });

  test('should show submit button when form is complete', async ({ page }) => {
    const locationSelect = page.getByLabel(/location/i);
    await locationSelect.waitFor({ state: 'visible' });
    
    // Select location
    const options = await locationSelect.locator('option').all();
    if (options.length > 1) {
      await locationSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      // Select vehicle
      const vehicleSelect = page.getByLabel(/vehicle/i);
      const vehicleOptions = await vehicleSelect.locator('option').all();
      if (vehicleOptions.length > 1) {
        await vehicleSelect.selectOption({ index: 1 });
        
        // Fill date (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await page.getByLabel(/date/i).fill(dateStr);
        
        // Fill time
        await page.getByLabel(/time/i).fill('10:00');
        
        // Fill duration
        await page.getByLabel(/duration/i).fill('45');
        
        // Fill customer info
        await page.getByLabel(/name/i).fill('John Doe');
        await page.getByLabel(/email/i).fill('john@example.com');
        await page.getByLabel(/phone/i).fill('+1234567890');
        
        // Submit button should now be visible
        const submitButton = page.getByRole('button', { name: /book test drive/i });
        await expect(submitButton).toBeVisible();
        await expect(submitButton).not.toBeDisabled();
      }
    }
  });

  test('should display vehicle info when vehicle is selected', async ({ page }) => {
    const locationSelect = page.getByLabel(/location/i);
    await locationSelect.waitFor({ state: 'visible' });
    
    const options = await locationSelect.locator('option').all();
    if (options.length > 1) {
      await locationSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      const vehicleSelect = page.getByLabel(/vehicle/i);
      const vehicleOptions = await vehicleSelect.locator('option').all();
      if (vehicleOptions.length > 1) {
        await vehicleSelect.selectOption({ index: 1 });
        
        // Should show vehicle availability info
        await expect(page.getByText(/vehicle availability/i)).toBeVisible();
        await expect(page.getByText(/available days/i)).toBeVisible();
        await expect(page.getByText(/available time window/i)).toBeVisible();
      }
    }
  });

  test('should display success message after successful booking', async ({ page }) => {
    // Mock successful API response
    await page.route('**/book', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reservation: { _id: 'test-reservation-123' },
        }),
      });
    });

    const locationSelect = page.getByLabel(/location/i);
    await locationSelect.waitFor({ state: 'visible' });
    
    const options = await locationSelect.locator('option').all();
    if (options.length > 1) {
      await locationSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      const vehicleSelect = page.getByLabel(/vehicle/i);
      const vehicleOptions = await vehicleSelect.locator('option').all();
      if (vehicleOptions.length > 1) {
        await vehicleSelect.selectOption({ index: 1 });
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await page.getByLabel(/date/i).fill(dateStr);
        await page.getByLabel(/time/i).fill('10:00');
        await page.getByLabel(/duration/i).fill('45');
        await page.getByLabel(/name/i).fill('John Doe');
        await page.getByLabel(/email/i).fill('john@example.com');
        await page.getByLabel(/phone/i).fill('+1234567890');
        
        // Submit form
        const submitButton = page.getByRole('button', { name: /book test drive/i });
        await submitButton.click();
        
        // Should show success message
        await expect(page.getByText(/booked successfully/i)).toBeVisible();
        await expect(page.getByText(/reservation id/i)).toBeVisible();
      }
    }
  });

  test('should display error message for failed booking', async ({ page }) => {
    // Mock error API response
    await page.route('**/book', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'No available vehicles for the selected time slot',
        }),
      });
    });

    const locationSelect = page.getByLabel(/location/i);
    await locationSelect.waitFor({ state: 'visible' });
    
    const options = await locationSelect.locator('option').all();
    if (options.length > 1) {
      await locationSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      const vehicleSelect = page.getByLabel(/vehicle/i);
      const vehicleOptions = await vehicleSelect.locator('option').all();
      if (vehicleOptions.length > 1) {
        await vehicleSelect.selectOption({ index: 1 });
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await page.getByLabel(/date/i).fill(dateStr);
        await page.getByLabel(/time/i).fill('10:00');
        await page.getByLabel(/duration/i).fill('45');
        await page.getByLabel(/name/i).fill('John Doe');
        await page.getByLabel(/email/i).fill('john@example.com');
        await page.getByLabel(/phone/i).fill('+1234567890');
        
        // Submit form
        const submitButton = page.getByRole('button', { name: /book test drive/i });
        await submitButton.click();
        
        // Should show error message in red
        const errorMessage = page.getByText(/no available vehicles/i);
        await expect(errorMessage).toBeVisible();
        
        // Check error styling (red background)
        const messageContainer = errorMessage.locator('..');
        await expect(messageContainer).toHaveClass(/bg-red-50/);
      }
    }
  });

  test('should auto-dismiss messages after 5 seconds', async ({ page }) => {
    // Mock error API response
    await page.route('**/book', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Test error message',
        }),
      });
    });

    const locationSelect = page.getByLabel(/location/i);
    await locationSelect.waitFor({ state: 'visible' });
    
    const options = await locationSelect.locator('option').all();
    if (options.length > 1) {
      await locationSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      const vehicleSelect = page.getByLabel(/vehicle/i);
      const vehicleOptions = await vehicleSelect.locator('option').all();
      if (vehicleOptions.length > 1) {
        await vehicleSelect.selectOption({ index: 1 });
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await page.getByLabel(/date/i).fill(dateStr);
        await page.getByLabel(/time/i).fill('10:00');
        await page.getByLabel(/duration/i).fill('45');
        await page.getByLabel(/name/i).fill('John Doe');
        await page.getByLabel(/email/i).fill('john@example.com');
        await page.getByLabel(/phone/i).fill('+1234567890');
        
        const submitButton = page.getByRole('button', { name: /book test drive/i });
        await submitButton.click();
        
        // Message should be visible
        await expect(page.getByText(/test error message/i)).toBeVisible();
        
        // Wait 5 seconds
        await page.waitForTimeout(5100);
        
        // Message should be dismissed
        await expect(page.getByText(/test error message/i)).not.toBeVisible();
      }
    }
  });

  test('should show loading state during booking submission', async ({ page }) => {
    // Mock delayed API response
    await page.route('**/book', async route => {
      await page.waitForTimeout(1000); // Simulate delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reservation: { _id: 'test-reservation-123' },
        }),
      });
    });

    const locationSelect = page.getByLabel(/location/i);
    await locationSelect.waitFor({ state: 'visible' });
    
    const options = await locationSelect.locator('option').all();
    if (options.length > 1) {
      await locationSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      const vehicleSelect = page.getByLabel(/vehicle/i);
      const vehicleOptions = await vehicleSelect.locator('option').all();
      if (vehicleOptions.length > 1) {
        await vehicleSelect.selectOption({ index: 1 });
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await page.getByLabel(/date/i).fill(dateStr);
        await page.getByLabel(/time/i).fill('10:00');
        await page.getByLabel(/duration/i).fill('45');
        await page.getByLabel(/name/i).fill('John Doe');
        await page.getByLabel(/email/i).fill('john@example.com');
        await page.getByLabel(/phone/i).fill('+1234567890');
        
        const submitButton = page.getByRole('button', { name: /book test drive/i });
        await submitButton.click();
        
        // Should show loading state
        await expect(page.getByText(/processing/i)).toBeVisible();
        await expect(submitButton).toBeDisabled();
      }
    }
  });

  test('should validate form fields', async ({ page }) => {
    // Try to interact with form without filling required fields
    const locationSelect = page.getByLabel(/location/i);
    await expect(locationSelect).toBeVisible();
    
    // Submit button should not be visible without complete form
    const submitButton = page.getByRole('button', { name: /book test drive/i });
    await expect(submitButton).not.toBeVisible();
  });

  test('should clear vehicle selection when location changes', async ({ page }) => {
    const locationSelect = page.getByLabel(/location/i);
    await locationSelect.waitFor({ state: 'visible' });
    
    const options = await locationSelect.locator('option').all();
    if (options.length > 2) {
      // Select first location
      await locationSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      const vehicleSelect = page.getByLabel(/vehicle/i);
      const vehicleOptions = await vehicleSelect.locator('option').all();
      if (vehicleOptions.length > 1) {
        await vehicleSelect.selectOption({ index: 1 });
        
        // Change location
        await locationSelect.selectOption({ index: 2 });
        await page.waitForTimeout(2000);
        
        // Vehicle should be cleared
        const vehicleValue = await vehicleSelect.inputValue();
        expect(vehicleValue).toBe('');
      }
    }
  });
});
