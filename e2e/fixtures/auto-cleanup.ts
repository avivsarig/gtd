import { test as base } from '@playwright/test';
import { cleanupAllTestData } from './test-helpers';

/**
 * Extended Playwright test with automatic cleanup
 *
 * Usage: Import this instead of @playwright/test
 *
 * Example:
 * ```typescript
 * import { test, expect } from '../fixtures/auto-cleanup';
 *
 * test.describe('My Tests', () => {
 *   test('my test', async ({ page }) => {
 *     // Your test code
 *     // Cleanup happens automatically after this test
 *   });
 * });
 * ```
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Run the test
    await use(page);

    // Cleanup after the test completes
    // This runs even if the test fails
    await cleanupAllTestData(page);
  },
});

export { expect } from '@playwright/test';
