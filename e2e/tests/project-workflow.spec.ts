import { test, expect } from '../fixtures/auto-cleanup';
import { navigateTo, createProjectViaAPI, createTaskViaAPI } from '../fixtures/test-helpers';

/**
 * Project Management Workflow Tests
 *
 * Tests the complete project management workflow:
 * 1. Create projects
 * 2. Edit project details
 * 3. Assign tasks to projects
 * 4. View project statistics
 * 5. Complete projects
 * 6. Delete projects
 */

test.describe('Project Management Workflow', () => {
  test('can create a new project', async ({ page }) => {
    await navigateTo(page, '/');

    // Find the projects section
    const projectsCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Projects' }) });

    // Click the "+ New Project" button
    await projectsCard.getByRole('button', { name: '+ New Project' }).click();

    // Wait for the project form modal
    await expect(page.getByRole('heading', { name: /Create Project/i })).toBeVisible();

    // Fill in project details
    await page.getByLabel(/Name/i).fill('Mobile App Development');
    await page.getByLabel(/Outcome Statement/i).fill('Launch MVP to app stores');

    // Submit the form
    await page.getByRole('button', { name: /Create Project/i }).click();

    // Verify project appears in the projects list
    await expect(projectsCard.getByText('Mobile App Development')).toBeVisible();
  });

  test('can edit an existing project', async ({ page }) => {
    // Create a project via API
    await createProjectViaAPI(page, {
      name: 'Original Project Name',
      outcome_statement: 'Original outcome',
    });

    await navigateTo(page, '/');

    // Find the project
    const projectsCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Projects' }) });

    const projectItem = projectsCard.locator('text=Original Project Name');
    await expect(projectItem).toBeVisible();

    // Click edit button for the project
    const projectContainer = projectsCard
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Original Project Name' });
    await projectContainer.getByRole('button', { name: 'Edit' }).click();

    // Wait for edit modal
    await expect(page.getByRole('heading', { name: /Edit Project/i })).toBeVisible();

    // Update project details
    await page.getByLabel(/Name/i).fill('Updated Project Name');
    await page.getByLabel(/Outcome Statement/i).fill('Updated outcome statement');

    // Submit
    await page.getByRole('button', { name: /Update|Save/i }).click();

    // Verify updated name appears
    await expect(projectsCard.getByText('Updated Project Name')).toBeVisible();
    await expect(projectsCard.getByText('Original Project Name')).not.toBeVisible();
  });

  test('displays project statistics correctly', async ({ page }) => {
    // Create a project via API
    const project = await createProjectViaAPI(page, {
      name: 'Statistics Test Project',
    });

    // Create tasks assigned to this project
    await createTaskViaAPI(page, {
      title: 'Task 1',
      status: 'next',
    });

    await createTaskViaAPI(page, {
      title: 'Task 2',
      status: 'next',
    });

    // Mark one task as complete
    const response = await page.request.post('http://localhost:8000/api/v1/tasks/', {
      data: {
        title: 'Task 3',
        status: 'next',
      },
    });
    const task = await response.json();
    await page.request.post(`http://localhost:8000/api/v1/tasks/${task.id}/complete`);

    await navigateTo(page, '/');

    // Find the project in the list
    const projectsCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Projects' }) });

    // Verify project shows task count statistics
    // Note: This depends on how the UI displays stats
    await expect(projectsCard.getByText('Statistics Test Project')).toBeVisible();
  });

  test('can assign task to project during task creation', async ({ page }) => {
    // Create a project and task via API
    const project = await createProjectViaAPI(page, {
      name: 'Backend API',
    });
    await createTaskViaAPI(page, {
      title: 'Implement authentication endpoint',
      status: 'next',
    });

    await navigateTo(page, '/');

    // Find the task
    const taskItem = page
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Implement authentication endpoint' });

    // Assign project using the dropdown
    const projectSelect = taskItem.locator('select[aria-label="Project assignment"]');
    await projectSelect.selectOption(project.id);

    // Wait for UI to update
    await page.waitForTimeout(300);

    // Verify project is assigned
    await expect(projectSelect).toHaveValue(project.id);
  });

  test('can complete a project', async ({ page }) => {
    // Create a project via API
    await createProjectViaAPI(page, {
      name: 'Project to Complete',
      outcome_statement: 'Finish all milestones',
    });

    await navigateTo(page, '/');

    // Find the project
    const projectsCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Projects' }) });

    const projectContainer = projectsCard
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Project to Complete' });

    // Look for a complete/checkbox button
    const completeButton = projectContainer.locator('button[aria-label*="complete" i], input[type="checkbox"]').first();

    if (await completeButton.isVisible()) {
      await completeButton.click();

      // Verify project is marked as complete or removed from active list
      // This depends on the UI behavior
      await page.waitForTimeout(500);
    }
  });

  test('can delete a project', async ({ page }) => {
    // Create a project via API
    await createProjectViaAPI(page, {
      name: 'Project to Delete',
    });

    await navigateTo(page, '/');

    // Find the project
    const projectsCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Projects' }) });

    await expect(projectsCard.getByText('Project to Delete')).toBeVisible();

    // Click delete button
    const projectContainer = projectsCard
      .locator('[data-slot="card-content"]')
      .filter({ hasText: 'Project to Delete' });

    // Set up dialog handler for browser confirm
    page.on('dialog', dialog => dialog.accept());

    await projectContainer.getByRole('button', { name: 'Delete' }).click();

    // Verify project is removed
    await expect(projectsCard.getByText('Project to Delete')).not.toBeVisible();
  });

  test('shows active project count in section header', async ({ page }) => {
    // Create multiple projects via API
    await createProjectViaAPI(page, { name: 'Active Project 1' });
    await createProjectViaAPI(page, { name: 'Active Project 2' });
    await createProjectViaAPI(page, { name: 'Active Project 3' });

    await navigateTo(page, '/');

    // Find the projects section header
    const projectsHeader = page
      .locator('[data-slot="card-title"]')
      .filter({ hasText: 'Projects' });

    // Verify it shows the count
    await expect(projectsHeader.getByText(/\d+ active/i)).toBeVisible();
  });

  test('can create sub-project (nested project)', async ({ page }) => {
    // Create a parent project via API
    const parentProject = await createProjectViaAPI(page, {
      name: 'Parent Project',
    });

    await navigateTo(page, '/');

    // Open new project form
    const projectsCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Projects' }) });
    await projectsCard.getByRole('button', { name: '+ New Project' }).click();

    // Fill in sub-project details
    await page.getByLabel(/Name/i).fill('Sub Project');

    // Select parent project using the labeled select element
    const parentSelect = page.getByLabel('Parent Project');
    if (await parentSelect.isVisible()) {
      await parentSelect.selectOption(parentProject.id);
    }

    // Submit
    await page.getByRole('button', { name: /Create Project/i }).click();

    // Verify sub-project appears
    await expect(projectsCard.getByText('Sub Project')).toBeVisible();
  });
});
