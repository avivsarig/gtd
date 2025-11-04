import { defineConfig, devices } from '@playwright/test';

/**
 * E2E Test Configuration for GTD Task Management System
 *
 * Tests run against the dockerized app at http://localhost:5173
 * Backend API at http://localhost:8000
 */
export default defineConfig({
  testDir: './e2e/tests',

  /* Maximum time one test can run */
  timeout: 30 * 1000,

  /* Run tests in files in parallel */
  fullyParallel: false, // GTD workflows are sequential

  /* Fail the build on CI if you accidentally left test.only */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : 1, // Sequential for database state

  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'e2e/reports' }],
    ['list'],
  ],

  /* Shared settings for all projects */
  use: {
    /* Base URL for the app */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test */
    trace: 'retain-on-failure',

    /* Screenshots on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run local dev server before starting tests */
  // We don't use this since docker-compose manages our servers
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },
});
