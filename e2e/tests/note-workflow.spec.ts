import { test, expect } from '../fixtures/auto-cleanup';
import { navigateTo, createProjectViaAPI } from '../fixtures/test-helpers';

/**
 * Note Management Workflow Tests
 *
 * Tests the complete note management workflow:
 * 1. Create notes
 * 2. Edit note content
 * 3. Assign notes to projects
 * 4. Delete notes
 * 5. View notes with markdown content
 */

test.describe('Note Management Workflow', () => {
  test('can create a new note', async ({ page }) => {
    await navigateTo(page, '/');

    // Find the notes section
    const notesCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Notes' }) });

    // Click the "+ New Note" button
    const newNoteButton = notesCard.getByRole('button', { name: '+ New Note' });
    await expect(newNoteButton).toBeVisible();
    await newNoteButton.click();

    // Fill in note details (modal opens automatically)
    await page.getByLabel(/Title/i).fill('Meeting Notes');
    await page.getByLabel(/Content/i).fill('Discussion points:\n- Budget approval\n- Timeline review');

    // Submit the form
    await page.getByRole('button', { name: /Create Note/i }).click();

    // Verify note appears in the notes list
    await expect(notesCard.getByText('Meeting Notes')).toBeVisible();
  });

  test('can create note with markdown content', async ({ page }) => {
    await navigateTo(page, '/');

    // Open new note form
    const notesCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Notes' }) });
    await notesCard.getByRole('button', { name: '+ New Note' }).click();

    // Fill in markdown content
    await page.getByLabel(/Title/i).fill('Technical Documentation');
    await page.getByLabel(/Content/i).fill('# API Endpoints\n\n## Authentication\n\n```bash\nPOST /api/auth/login\n```');

    // Submit
    await page.getByRole('button', { name: /Create Note/i }).click();

    // Verify note appears
    await expect(notesCard.getByText('Technical Documentation')).toBeVisible();
  });

  test('can edit an existing note', async ({ page }) => {
    await navigateTo(page, '/');

    // Create a note first
    const notesCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Notes' }) });
    await notesCard.getByRole('button', { name: '+ New Note' }).click();

    await page.getByLabel(/Title/i).fill('Original Note Title');
    await page.getByLabel(/Content/i).fill('Original content');
    await page.getByRole('button', { name: /Create Note/i }).click();

    // Wait for note to appear
    await expect(notesCard.getByText('Original Note Title')).toBeVisible();

    // Click edit button
    const noteContainer = notesCard
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Original Note Title' });
    await noteContainer.getByRole('button', { name: 'Edit' }).click();

    // Wait for edit modal
    await expect(page.getByRole('heading', { name: /Edit Note/i })).toBeVisible();

    // Update the note
    await page.getByLabel(/Title/i).fill('Updated Note Title');
    await page.getByLabel(/Content/i).fill('Updated content with more details');

    // Submit
    await page.getByRole('button', { name: /Update Note/i }).click();

    // Verify updated content appears
    await expect(notesCard.getByText('Updated Note Title')).toBeVisible();
    await expect(notesCard.getByText('Original Note Title')).not.toBeVisible();
  });

  test('can assign note to a project', async ({ page }) => {
    // Create a project via API
    const project = await createProjectViaAPI(page, {
      name: 'Research Project',
    });

    await navigateTo(page, '/');

    // Create a note with project assignment
    const notesCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Notes' }) });
    await notesCard.getByRole('button', { name: '+ New Note' }).click();

    await page.getByLabel(/Title/i).fill('Research Findings');
    await page.getByLabel(/Content/i).fill('Initial research results');

    // Find and select project dropdown using aria-label
    const projectSelect = page.getByLabel('Project');
    await projectSelect.selectOption(project.id);

    // Submit
    await page.getByRole('button', { name: /Create Note/i }).click();

    // Verify note appears
    await expect(notesCard.getByText('Research Findings')).toBeVisible();
  });

  test('can delete a note', async ({ page }) => {
    await navigateTo(page, '/');

    // Create a note to delete
    const notesCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Notes' }) });
    await notesCard.getByRole('button', { name: '+ New Note' }).click();

    await page.getByLabel(/Title/i).fill('Note to Delete');
    await page.getByLabel(/Content/i).fill('This will be deleted');
    await page.getByRole('button', { name: /Create Note/i }).click();

    // Wait for note to appear
    await expect(notesCard.getByText('Note to Delete')).toBeVisible();

    // Click delete button
    const noteContainer = notesCard
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Note to Delete' });

    // Set up dialog handler for browser confirm
    page.on('dialog', dialog => dialog.accept());

    // Use .last() to get the actual Delete button (not the note title button)
    await noteContainer.getByRole('button', { name: 'Delete', exact: true }).click();

    // Verify note is removed
    await expect(notesCard.getByText('Note to Delete')).not.toBeVisible();
  });

  test('can create note via inbox conversion', async ({ page }) => {
    await navigateTo(page, '/');

    // Capture to inbox
    const input = page.getByPlaceholder(/What's on your mind/i);
    await input.fill('Quick thought for notes');
    await page.getByRole('button', { name: /Capture to Inbox/i }).click();

    // Convert to note (direct API conversion, no modal)
    const noteButton = page
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Quick thought for notes' })
      .getByRole('button', { name: /Note/i });
    await noteButton.click();

    // Wait for conversion to complete
    await page.waitForTimeout(500);

    // Verify note appears in notes section
    const notesCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Notes' }) });
    await expect(notesCard.getByText('Quick thought for notes')).toBeVisible();
  });

  test('shows note count in section header', async ({ page }) => {
    await navigateTo(page, '/');

    // Create a few notes
    const notesCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Notes' }) });

    // Create first note
    await notesCard.getByRole('button', { name: '+ New Note' }).click();
    await page.getByLabel(/Title/i).fill('Note 1');
    await page.getByLabel(/Content/i).fill('Content 1');
    await page.getByRole('button', { name: /Create Note/i }).click();

    // Create second note
    await notesCard.getByRole('button', { name: '+ New Note' }).click();
    await page.getByLabel(/Title/i).fill('Note 2');
    await page.getByLabel(/Content/i).fill('Content 2');
    await page.getByRole('button', { name: /Create Note/i }).click();

    // Verify section header shows count
    const notesHeader = page
      .locator('[data-slot="card-title"]')
      .filter({ hasText: 'Notes' });
    await expect(notesHeader.getByText(/\(\d+\)/)).toBeVisible();
  });

  test('can view and edit note with long content', async ({ page }) => {
    await navigateTo(page, '/');

    // Create note with long content
    const notesCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Notes' }) });
    await notesCard.getByRole('button', { name: '+ New Note' }).click();

    const longContent = `# Project Overview

## Background
This is a long note with multiple paragraphs and sections.

## Key Points
- Point 1: Important detail
- Point 2: Another important detail
- Point 3: Yet another detail

## Action Items
1. Review the documentation
2. Update the timeline
3. Schedule follow-up meeting

## References
- [Link 1](#)
- [Link 2](#)

## Notes
Additional thoughts and observations go here.
This section can contain multiple paragraphs with detailed information.`;

    await page.getByLabel(/Title/i).fill('Comprehensive Project Notes');
    await page.getByLabel(/Content/i).fill(longContent);
    await page.getByRole('button', { name: /Create Note/i }).click();

    // Verify note is created
    await expect(notesCard.getByText('Comprehensive Project Notes')).toBeVisible();

    // Edit and verify content persists
    const noteContainer = notesCard
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Comprehensive Project Notes' });
    await noteContainer.getByRole('button', { name: 'Edit' }).click();

    // Verify content is preserved in edit form
    const contentInput = page.getByLabel(/Content/i);
    await expect(contentInput).toHaveValue(longContent);
  });
});
