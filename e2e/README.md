# E2E Tests for GTD Task Management System

End-to-end tests using Playwright to validate complete user workflows.

## Prerequisites

- Node.js 18+ installed on your **host machine** (not in Docker)
- Docker Compose running the GTD app (`make up`)
- App accessible at:
  - Frontend: http://localhost:5173
  - Backend: http://localhost:8000

## Setup

### First Time Setup

```bash
# Install Playwright and dependencies (one-time setup)
make e2e-install
```

This will:
1. Install npm dependencies (Playwright, TypeScript types)
2. Download Chromium browser binaries
3. Install system dependencies for browser automation

## Running Tests

### Basic Commands

```bash
# Run all E2E tests (headless)
make test-e2e

# Run tests with UI mode (interactive)
make test-e2e-ui

# Run tests in debug mode (step through tests)
make test-e2e-debug

# View last test report
npm run test:e2e:report
```

### Direct Playwright Commands

```bash
# Run specific test file
npx playwright test e2e/tests/smoke.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run with specific browser
npx playwright test --project=chromium

# Update snapshots
npx playwright test --update-snapshots
```

## Test Structure

```
e2e/
├── tests/              # Test files (*.spec.ts)
│   ├── smoke.spec.ts   # Basic smoke tests
│   ├── inbox.spec.ts   # Inbox workflow tests
│   ├── tasks.spec.ts   # Task management tests
│   └── projects.spec.ts # Project tests
├── fixtures/           # Reusable test utilities
│   └── test-helpers.ts # Helper functions for tests
└── reports/            # Test reports (generated)
```

## Writing Tests

### Test File Template

```typescript
import { test, expect } from '@playwright/test';
import { navigateTo, waitForApp } from '../fixtures/test-helpers';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await navigateTo(page, '/route');

    // Interact with UI
    await page.click('button[aria-label="Add"]');

    // Assert result
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Helper Functions

Use helpers from `test-helpers.ts` for common operations:

```typescript
import {
  navigateTo,
  waitForApp,
  createTaskViaAPI,
  createInboxItemViaAPI,
  createProjectViaAPI,
  deleteAllTasksViaAPI,
} from '../fixtures/test-helpers';

// Navigate and wait for app
await navigateTo(page, '/tasks');

// Create test data via API
const task = await createTaskViaAPI(page, {
  title: 'Test Task',
  status: 'next',
});

// Clean up after test
await deleteAllTasksViaAPI(page);
```

## Test Isolation

- Each test should be independent
- Use API helpers to set up test data
- Clean up data after tests (or use database snapshots)
- Tests run sequentially to avoid database conflicts

## Debugging

### Visual Debugging

```bash
# Open Playwright Inspector
make test-e2e-debug

# Run with headed browser
npx playwright test --headed --debug
```

### Screenshots and Videos

- Screenshots: Captured on failure (saved to `test-results/`)
- Videos: Recorded for failed tests
- Traces: Full interaction traces for debugging

### View Test Reports

```bash
npm run test:e2e:report
```

Opens HTML report with:
- Test results and timings
- Screenshots of failures
- Video recordings
- Network logs
- Console logs

## CI/CD Integration

E2E tests can run in CI with:

```bash
# In CI pipeline
npm install
npx playwright install --with-deps chromium
npm run test:e2e
```

Set `CI=true` environment variable for:
- Automatic retries (2x)
- Sequential execution
- Stricter failure handling

## Troubleshooting

### App Not Running

```
Error: page.goto: net::ERR_CONNECTION_REFUSED
```

**Solution**: Start the app first
```bash
make up
```

### Browser Not Installed

```
Error: Executable doesn't exist
```

**Solution**: Install browsers
```bash
make e2e-install
```

### Tests Failing Intermittently

- Check for race conditions
- Add explicit waits: `await page.waitForSelector(...)`
- Use `waitForLoadState('networkidle')`
- Increase timeout in `playwright.config.ts`

### Port Conflicts

Ensure ports are available:
- 5173 (frontend)
- 8000 (backend)

Check with: `docker compose ps`
