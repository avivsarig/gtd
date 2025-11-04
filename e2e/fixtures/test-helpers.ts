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
 * Get all inbox items via API
 */
export async function getInboxItemsViaAPI(page: Page) {
  const response = await page.request.get('http://localhost:8000/api/v1/inbox/');
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Delete an inbox item via API
 */
export async function deleteInboxItemViaAPI(page: Page, id: string) {
  await page.request.delete(`http://localhost:8000/api/v1/inbox/${id}`);
}

/**
 * Delete all inbox items via API (for cleanup)
 */
export async function deleteAllInboxItemsViaAPI(page: Page) {
  const items = await getInboxItemsViaAPI(page);
  for (const item of items) {
    await deleteInboxItemViaAPI(page, item.id);
  }
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
 * Create a context via API (for test setup)
 */
export async function createContextViaAPI(
  page: Page,
  context: { name: string; description?: string; icon?: string }
) {
  const response = await page.request.post('http://localhost:8000/api/v1/contexts/', {
    data: {
      name: context.name,
      description: context.description || '',
      icon: context.icon || '',
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

/**
 * Get all notes via API
 */
export async function getNotesViaAPI(page: Page) {
  const response = await page.request.get('http://localhost:8000/api/v1/notes/');
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Delete all notes via API (for cleanup)
 */
export async function deleteAllNotesViaAPI(page: Page) {
  const notes = await getNotesViaAPI(page);
  for (const note of notes) {
    await page.request.delete(`http://localhost:8000/api/v1/notes/${note.id}`);
  }
}

/**
 * Get all projects via API
 */
export async function getProjectsViaAPI(page: Page) {
  const response = await page.request.get('http://localhost:8000/api/v1/projects/');
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Delete all projects via API (for cleanup)
 */
export async function deleteAllProjectsViaAPI(page: Page) {
  const projects = await getProjectsViaAPI(page);
  for (const project of projects) {
    await page.request.delete(`http://localhost:8000/api/v1/projects/${project.id}`);
  }
}

/**
 * Get all contexts via API
 */
export async function getContextsViaAPI(page: Page) {
  const response = await page.request.get('http://localhost:8000/api/v1/contexts/');
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Delete all contexts via API (for cleanup)
 */
export async function deleteAllContextsViaAPI(page: Page) {
  const contexts = await getContextsViaAPI(page);
  for (const context of contexts) {
    await page.request.delete(`http://localhost:8000/api/v1/contexts/${context.id}`);
  }
}

/**
 * Clean up all test data (comprehensive cleanup)
 * Order matters: delete tasks first (may reference projects/contexts),
 * then notes, then projects, then contexts, finally inbox
 */
export async function cleanupAllTestData(page: Page) {
  await deleteAllTasksViaAPI(page);
  await deleteAllNotesViaAPI(page);
  await deleteAllProjectsViaAPI(page);
  await deleteAllContextsViaAPI(page);
  await deleteAllInboxItemsViaAPI(page);
}
