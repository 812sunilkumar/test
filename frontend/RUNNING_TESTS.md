# Running Playwright E2E Tests

## Prerequisites

1. **Node.js** installed (v18 or higher recommended)
2. **Backend API** should be running (default: `http://localhost:5000`)

## Setup (First Time Only)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

This will download Chromium, Firefox, and WebKit browsers (~300MB).

### 3. Verify Backend is Running

Make sure your backend API is running on `http://localhost:5000` (or update the API base URL in your environment).

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

This will:
- Automatically start the Next.js dev server on port 3000
- Run all tests in Chromium, Firefox, and WebKit
- Generate an HTML report

### Run Tests with UI Mode (Recommended for Development)

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:
- See all tests
- Run individual tests
- Watch tests run in real-time
- Debug test failures

### Run Tests in Debug Mode

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector where you can:
- Step through tests line by line
- See what the browser is doing
- Inspect elements
- Pause execution

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

This runs tests with visible browser windows so you can see what's happening.

### Run Specific Test File

```bash
# Run only home page tests
npx playwright test e2e/home.spec.ts

# Run only booking flow tests
npx playwright test e2e/booking-flow.spec.ts
```

### Run Tests in Specific Browser

```bash
# Run only in Chromium
npx playwright test --project=chromium

# Run only in Firefox
npx playwright test --project=firefox

# Run only in WebKit
npx playwright test --project=webkit
```

## Test Reports

After running tests, you'll see:

1. **Console Output**: Summary of passed/failed tests
2. **HTML Report**: Open with:
   ```bash
   npx playwright show-report
   ```

The HTML report shows:
- Test results with screenshots
- Test execution timeline
- Error details
- Network requests

## Common Commands

### Run Tests and Open Report

```bash
npm run test:e2e && npx playwright show-report
```

### Run Tests with Specific Timeout

```bash
npx playwright test --timeout=60000
```

### Run Tests in Specific Environment

```bash
# Set custom frontend URL
FRONTEND_URL=http://localhost:3001 npm run test:e2e

# Run in CI mode (retries enabled, serial execution)
CI=true npm run test:e2e
```

### Update Test Snapshots

```bash
npx playwright test --update-snapshots
```

## Troubleshooting

### Tests Fail: "Cannot connect to http://localhost:3000"

**Solution**: The dev server might not be starting. Check:
1. Port 3000 is not already in use
2. Next.js dependencies are installed
3. Try running dev server manually: `npm run dev`

### Tests Fail: "API Error" or Network Errors

**Solution**: 
1. Ensure backend is running on `http://localhost:5000`
2. Check API endpoints are accessible
3. Verify CORS settings in backend

### Tests Timeout

**Solution**:
1. Increase timeout in `playwright.config.ts`:
   ```typescript
   use: {
     actionTimeout: 30000, // 30 seconds
   }
   ```
2. Check network speed
3. Run tests in headed mode to see what's happening

### Browsers Not Found

**Solution**:
```bash
npx playwright install
```

### Tests Pass Locally but Fail in CI

**Solution**:
1. Use `CI=true` environment variable
2. Check CI environment has all dependencies
3. Verify backend is accessible from CI environment

## Test Structure

```
frontend/
├── e2e/
│   ├── home.spec.ts          # Home page tests
│   ├── booking-flow.spec.ts  # Booking flow tests
│   └── README.md             # Test documentation
├── playwright.config.ts      # Playwright configuration
└── package.json             # Test scripts
```

## Best Practices

1. **Run tests before committing**: `npm run test:e2e`
2. **Use UI mode for debugging**: `npm run test:e2e:ui`
3. **Check HTML report** after test runs
4. **Keep tests independent**: Each test should work standalone
5. **Mock external APIs** when possible for faster, more reliable tests

## Example Workflow

```bash
# 1. Start backend (in separate terminal)
cd backend
npm run start:dev

# 2. Run E2E tests (in frontend directory)
cd frontend
npm run test:e2e

# 3. If tests fail, debug with UI mode
npm run test:e2e:ui

# 4. View detailed report
npx playwright show-report
```

## CI/CD Integration

For CI/CD pipelines, use:

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run tests
CI=true npm run test:e2e
```

The `CI=true` flag:
- Enables retries (2 retries on failure)
- Runs tests serially (1 worker)
- Uses existing server if available
- Generates reports for artifacts
