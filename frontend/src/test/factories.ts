/**
 * Test data factories
 *
 * Generate realistic mock data for tests.
 * Pattern inspired by backend's Factory Boy approach.
 */

import {
  TaskStatusEnum,
  type Task,
  type TaskStatus,
  type Project,
  type Note,
  type InboxItem,
  type Context,
  type SearchResultItem,
  type SearchResponse,
} from "@/lib/api"

let taskCounter = 0
let projectCounter = 0
let noteCounter = 0
let inboxCounter = 0
let contextCounter = 0
let searchResultCounter = 0

export function resetCounters() {
  taskCounter = 0
  projectCounter = 0
  noteCounter = 0
  inboxCounter = 0
  contextCounter = 0
  searchResultCounter = 0
}

export function createMockTask(overrides?: Partial<Task>): Task {
  const id = overrides?.id || crypto.randomUUID()
  const now = new Date().toISOString()
  taskCounter++

  return {
    id,
    title: `Test Task ${taskCounter}`,
    description: `Description for task ${taskCounter}`,
    status: TaskStatusEnum.NEXT,
    project_id: null,
    context_id: null,
    completed_at: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  }
}

export function createCompletedTask(overrides?: Partial<Task>): Task {
  return createMockTask({
    completed_at: new Date().toISOString(),
    ...overrides,
  })
}

export function createTaskWithStatus(
  status: TaskStatus,
  overrides?: Partial<Task>,
): Task {
  return createMockTask({
    status,
    ...overrides,
  })
}

export function createMockProject(overrides?: Partial<Project>): Project {
  const id = overrides?.id || crypto.randomUUID()
  const now = new Date().toISOString()
  projectCounter++

  return {
    id,
    name: `Test Project ${projectCounter}`,
    outcome_statement: `Outcome for project ${projectCounter}`,
    status: "active",
    parent_project_id: null,
    created_at: now,
    updated_at: now,
    last_activity_at: now,
    completed_at: null,
    archived_at: null,
    task_count: 0,
    completed_task_count: 0,
    next_task_count: 0,
    ...overrides,
  }
}

export function createProjectWithStats(
  stats: {
    task_count?: number
    completed_task_count?: number
    next_task_count?: number
  },
  overrides?: Partial<Project>,
): Project {
  return createMockProject({
    task_count: stats.task_count ?? 5,
    completed_task_count: stats.completed_task_count ?? 2,
    next_task_count: stats.next_task_count ?? 3,
    ...overrides,
  })
}

export function createCompletedProject(overrides?: Partial<Project>): Project {
  return createMockProject({
    status: "completed",
    completed_at: new Date().toISOString(),
    ...overrides,
  })
}

export function createMockNote(overrides?: Partial<Note>): Note {
  const id = overrides?.id || crypto.randomUUID()
  const now = new Date().toISOString()
  noteCounter++

  return {
    id,
    title: `Test Note ${noteCounter}`,
    content: `Content for note ${noteCounter}`,
    project_id: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    ...overrides,
  }
}

export function createMockInboxItem(overrides?: Partial<InboxItem>): InboxItem {
  const id = overrides?.id || crypto.randomUUID()
  const now = new Date().toISOString()
  inboxCounter++

  return {
    id,
    content: `Inbox item ${inboxCounter}`,
    created_at: now,
    processed_at: null,
    deleted_at: null,
    ...overrides,
  }
}

export function createProcessedInboxItem(
  overrides?: Partial<InboxItem>,
): InboxItem {
  return createMockInboxItem({
    processed_at: new Date().toISOString(),
    ...overrides,
  })
}

export function createMockContext(overrides?: Partial<Context>): Context {
  const id = overrides?.id || crypto.randomUUID()
  const now = new Date().toISOString()
  contextCounter++

  const contextNames = ["@home", "@computer", "@phone", "@errands", "@office"]
  const contextIcons = ["🏠", "💻", "📱", "🚗", "🏢"]

  const index = (contextCounter - 1) % contextNames.length

  return {
    id,
    name: contextNames[index]!,
    description: `Description for context ${contextCounter}`,
    icon: contextIcons[index]!,
    sort_order: contextCounter,
    created_at: now,
    ...overrides,
  }
}

export function createMultipleTasks(
  count: number,
  overrides?: Partial<Task>,
): Task[] {
  return Array.from({ length: count }, () => createMockTask(overrides))
}

export function createMultipleProjects(
  count: number,
  overrides?: Partial<Project>,
): Project[] {
  return Array.from({ length: count }, () => createMockProject(overrides))
}

export function createMultipleNotes(
  count: number,
  overrides?: Partial<Note>,
): Note[] {
  return Array.from({ length: count }, () => createMockNote(overrides))
}

export function createMultipleInboxItems(
  count: number,
  overrides?: Partial<InboxItem>,
): InboxItem[] {
  return Array.from({ length: count }, () => createMockInboxItem(overrides))
}

export function createMultipleContexts(
  count: number,
  overrides?: Partial<Context>,
): Context[] {
  return Array.from({ length: count }, () => createMockContext(overrides))
}

export function createMockSearchResult(
  overrides?: Partial<SearchResultItem>,
): SearchResultItem {
  const id = overrides?.id || crypto.randomUUID()
  const now = new Date().toISOString()
  searchResultCounter++

  return {
    id,
    type: "task",
    title: `Search Result ${searchResultCounter}`,
    snippet: `Snippet for result ${searchResultCounter}`,
    rank: 0.5,
    created_at: now,
    project_id: null,
    ...overrides,
  }
}

export function createMockSearchResponse(
  overrides?: Partial<SearchResponse>,
): SearchResponse {
  return {
    query: "test",
    total_results: 0,
    results: [],
    ...overrides,
  }
}

export function createMultipleSearchResults(
  count: number,
  overrides?: Partial<SearchResultItem>,
): SearchResultItem[] {
  return Array.from({ length: count }, () => createMockSearchResult(overrides))
}
