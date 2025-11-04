import { Page, expect } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

/**
 * Wait for the app to be fully loaded
 */
export async function waitForApp(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to a specific route
 */
export async function navigateTo(page: Page, route: string) {
  await page.goto(route);
  await waitForApp(page);
}

/**
 * Clear all data via API (useful for test isolation)
 */
export async function clearDatabase(page: Page) {
  // This would call a backend endpoint to reset the test database
  // For now, we'll implement this as needed
  // await page.request.post('http://localhost:8000/api/v1/test/reset');
}

/**
 * Create a task via API (for test setup)
 */
export async function createTaskViaAPI(
  page: Page,
  task: { title: string; status?: string; description?: string }
) {
  const response = await page.request.post('http://localhost:8000/api/v1/tasks/', {
    data: {
      title: task.title,
      status: task.status || 'next',
      description: task.description || '',
    },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Create an inbox item via API
 */
export async function createInboxItemViaAPI(page: Page, content: string) {
  const response = await page.request.post('http://localhost:8000/api/v1/inbox/', {
    data: { content },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Create a project via API
 */
export async function createProjectViaAPI(
  page: Page,
  project: { name: string; outcome_statement?: string }
) {
  const response = await page.request.post('http://localhost:8000/api/v1/projects/', {
    data: {
      name: project.name,
      outcome_statement: project.outcome_statement || '',
    },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Get all tasks via API
 */
export async function getTasksViaAPI(page: Page) {
  const response = await page.request.get('http://localhost:8000/api/v1/tasks/');
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Delete all tasks via API (for cleanup)
 */
export async function deleteAllTasksViaAPI(page: Page) {
  const tasks = await getTasksViaAPI(page);
  for (const task of tasks) {
    await page.request.delete(`http://localhost:8000/api/v1/tasks/${task.id}`);
  }
}
