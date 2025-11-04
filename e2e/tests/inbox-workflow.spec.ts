import { test, expect } from '../fixtures/auto-cleanup';
import { navigateTo, createInboxItemViaAPI } from '../fixtures/test-helpers';

/**
 * Inbox Processing Workflow Tests
 *
 * Tests the complete GTD inbox processing workflow:
 * 1. Capture items to inbox
 * 2. Process items (convert to tasks/notes)
 * 3. Verify inbox zero state
 */

test.describe('Inbox Processing Workflow', () => {
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

    // Click the "Task" button to convert (direct API conversion, no modal)
    const taskButton = page
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Complete project documentation' })
      .getByRole('button', { name: /Task/i });
    await taskButton.click();

    // Wait for conversion to complete and UI to update
    await page.waitForTimeout(500);

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

    // Find the inbox item in the inbox card
    const inboxCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Inbox' }) });
    await expect(inboxCard.getByText('Ideas for new features')).toBeVisible();

    // Click the "Note" button to convert (direct API conversion, no modal)
    const noteButton = page
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Ideas for new features' })
      .getByRole('button', { name: /Note/i });
    await noteButton.click();

    // Wait for conversion to complete and UI to update
    await page.waitForTimeout(500);

    // Verify note appears in Notes section
    await expect(
      page
        .locator('[data-slot="card"]')
        .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Notes' }) })
        .getByText('Ideas for new features')
    ).toBeVisible();

    // Verify item is removed from inbox
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

    // Click edit button
    await itemContainer.getByRole('button', { name: 'Edit' }).click();

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

    // Set up dialog handler before clicking delete (browser confirm dialog)
    page.on('dialog', dialog => dialog.accept());

    await itemContainer.getByRole('button', { name: 'Delete' }).click();

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
