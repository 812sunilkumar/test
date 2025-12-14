# E2E Tests with Playwright

This directory contains end-to-end (E2E) tests for the frontend application using Playwright.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install
   ```

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

## Test Files

- **`home.spec.ts`** - Tests for the home page
  - Page loading
  - Navigation to booking page
  - Page structure

- **`booking-flow.spec.ts`** - Complete booking flow tests
  - Form display and validation
  - Location and vehicle selection
  - Form completion
  - Successful booking
  - Error handling
  - Message auto-dismiss
  - Loading states
  - Form field validation

## Test Configuration

The Playwright configuration is in `playwright.config.ts` at the root of the frontend directory.

- **Base URL**: `http://localhost:3000` (configurable via `FRONTEND_URL` env variable)
- **Browsers**: Chromium, Firefox, WebKit
- **Auto-start dev server**: Yes (automatically starts `npm run dev` before tests)

## Writing Tests

Example test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

## Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabelText`, `getByText` over `getByTestId`
2. **Wait for elements**: Use `waitFor` or `waitForTimeout` when needed
3. **Mock API calls**: Use `page.route()` to mock API responses
4. **Clean up**: Tests are automatically isolated
5. **Use descriptive test names**: Clearly describe what is being tested

## Troubleshooting

### Tests timing out
- Ensure the backend API is running
- Check network conditions
- Increase timeout in `playwright.config.ts`

### Tests failing
- Check that the dev server is running
- Verify API endpoints are accessible
- Check browser console for errors
- Run tests in headed mode to see what's happening

### Browsers not installed
```bash
npx playwright install
```

## CI/CD

For CI/CD pipelines, set the `CI` environment variable:
```bash
CI=true npm run test:e2e
```

This will:
- Retry failed tests 2 times
- Run tests serially (1 worker)
- Use existing server if available
