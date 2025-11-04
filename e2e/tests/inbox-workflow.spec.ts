import { test, expect } from '@playwright/test';
import { navigateTo, createInboxItemViaAPI, deleteAllInboxItemsViaAPI, deleteAllTasksViaAPI } from '../fixtures/test-helpers';

/**
 * Inbox Processing Workflow Tests
 *
 * Tests the complete GTD inbox processing workflow:
 * 1. Capture items to inbox
 * 2. Process items (convert to tasks/notes)
 * 3. Verify inbox zero state
 */

test.describe('Inbox Processing Workflow', () => {
  // Clean up only what these tests touch
  test.afterEach(async ({ page }) => {
    await deleteAllInboxItemsViaAPI(page);
    await deleteAllTasksViaAPI(page);
  });
  test('can capture new inbox item via quick capture', async ({ page }) => {
    await navigateTo(page, '/');

    // Find the quick capture input
    const input = page.getByPlaceholder(/What's on your mind/i);
    await expect(input).toBeVisible();

    // Type a new item
    await input.fill('Buy groceries for the week');

    // Submit via button click
    const captureButton = page.getByRole('button', { name: /Capture to Inbox/i });
    await captureButton.click();

    // Verify the item appears in the inbox section (use .first() since text may appear multiple times)
    await expect(page.getByText('Buy groceries for the week').first()).toBeVisible();

    // Verify input is cleared
    await expect(input).toHaveValue('');
  });

  test('can convert inbox item to task', async ({ page }) => {
    // Create an inbox item via API
    const item = await createInboxItemViaAPI(page, 'Complete project documentation');

    await navigateTo(page, '/');

    // Find the inbox item
    await expect(page.getByText('Complete project documentation')).toBeVisible();

    // Click the "Task" button to convert
    const taskButton = page
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Complete project documentation' })
      .getByRole('button', { name: /Task/i });
    await taskButton.click();

    // Wait for the task form modal to appear
    await expect(page.getByRole('heading', { name: /Create Task/i })).toBeVisible();

    // Verify the content is pre-filled
    const titleInput = page.getByLabel(/Task Title/i);
    await expect(titleInput).toHaveValue('Complete project documentation');

    // Submit the form
    await page.getByRole('button', { name: /Create Task/i }).click();

    // Verify task appears in Tasks section
    await expect(
      page
        .locator('[data-slot="card"]')
        .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Tasks' }) })
        .getByText('Complete project documentation')
    ).toBeVisible();

    // Verify item is removed from inbox
    const inboxCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Inbox' }) });
    await expect(inboxCard.getByText('Complete project documentation')).not.toBeVisible();
  });

  test('can convert inbox item to note', async ({ page }) => {
    // Create an inbox item via API
    await createInboxItemViaAPI(page, 'Ideas for new features');

    await navigateTo(page, '/');

    // Find the inbox item
    await expect(page.getByText('Ideas for new features')).toBeVisible();

    // Click the "Note" button to convert
    const noteButton = page
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Ideas for new features' })
      .getByRole('button', { name: /Note/i });
    await noteButton.click();

    // Wait for the note form modal to appear
    await expect(page.getByRole('heading', { name: /Create Note/i })).toBeVisible();

    // Verify the content is pre-filled
    const titleInput = page.getByLabel(/^Title$/i);
    await expect(titleInput).toHaveValue('Ideas for new features');

    // Submit the form
    await page.getByRole('button', { name: /Create Note/i }).click();

    // Verify note appears in Notes section
    await expect(
      page
        .locator('[data-slot="card"]')
        .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Notes' }) })
        .getByText('Ideas for new features')
    ).toBeVisible();

    // Verify item is removed from inbox
    const inboxCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Inbox' }) });
    await expect(inboxCard.getByText('Ideas for new features')).not.toBeVisible();
  });

  test('can edit inbox item', async ({ page }) => {
    // Create an inbox item via API
    await createInboxItemViaAPI(page, 'Original content');

    await navigateTo(page, '/');

    // Find the edit button for the inbox item
    const itemContainer = page
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Original content' });

    // Click edit button (pencil icon)
    await itemContainer.locator('button[aria-label*="edit" i], button:has(svg)').first().click();

    // Wait for edit modal
    await expect(page.getByRole('heading', { name: /Edit Inbox Item/i })).toBeVisible();

    // Update the content
    const contentInput = page.getByLabel(/What's on your mind?/i);
    await contentInput.fill('Updated content with more details');

    // Submit the form
    await page.getByRole('button', { name: /Update Inbox Item/i }).click();

    // Verify the updated content appears
    await expect(page.getByText('Updated content with more details')).toBeVisible();
    await expect(page.getByText('Original content')).not.toBeVisible();
  });

  test('can delete inbox item', async ({ page }) => {
    // Create an inbox item via API
    await createInboxItemViaAPI(page, 'Item to be deleted');

    await navigateTo(page, '/');

    // Find the item
    await expect(page.getByText('Item to be deleted')).toBeVisible();

    // Find and click the delete button
    const itemContainer = page
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Item to be deleted' });

    await itemContainer.locator('button[aria-label*="delete" i], button:has(svg)').last().click();

    // Confirm deletion in the confirmation dialog
    await page.getByRole('button', { name: /Delete/i }).click();

    // Verify item is removed
    await expect(page.getByText('Item to be deleted')).not.toBeVisible();
  });

  test('shows inbox zero state when empty', async ({ page }) => {
    await navigateTo(page, '/');

    // Find the inbox card
    const inboxCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Inbox' }) });

    // Verify inbox zero message is visible
    await expect(inboxCard.getByText(/inbox zero/i)).toBeVisible();
  });
});
