import { test, expect } from '@playwright/test';
import { waitForApp, navigateTo } from '../fixtures/test-helpers';

/**
 * Smoke tests - Verify basic app functionality
 *
 * These tests ensure the app is running and accessible
 */

test.describe('Smoke Tests', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);

    // Verify dashboard header is present
    await expect(page.getByRole('heading', { name: 'GTD Dashboard' })).toBeVisible();
  });

  test('inbox section is visible', async ({ page }) => {
    await navigateTo(page, '/');

    // Check for inbox section using card title
    await expect(page.locator('[data-slot="card-title"]', { hasText: 'Inbox' }).first()).toBeVisible();
  });

  test('tasks section is visible', async ({ page }) => {
    await navigateTo(page, '/');

    // Check for tasks section using card title
    await expect(page.locator('[data-slot="card-title"]', { hasText: 'Tasks' }).first()).toBeVisible();
  });

  test('notes section is visible', async ({ page }) => {
    await navigateTo(page, '/');

    // Check for notes section using card title
    await expect(page.locator('[data-slot="card-title"]', { hasText: 'Notes' }).first()).toBeVisible();
  });

  test('projects section is visible', async ({ page }) => {
    await navigateTo(page, '/');

    // Check for projects section using card title
    await expect(page.locator('[data-slot="card-title"]', { hasText: 'Projects' }).first()).toBeVisible();
  });

  test('can navigate to inbox page', async ({ page }) => {
    await navigateTo(page, '/inbox');

    // Verify we're on the inbox page
    await expect(page).toHaveURL(/\/inbox/);
  });

  test('backend API is accessible', async ({ page }) => {
    const response = await page.request.get('http://localhost:8000/health');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });
});
