/**
 * API client for GTD backend
 */

import { API_BASE_URL } from "./config"
import { MESSAGES } from "./messages"

export type TaskStatus = "next" | "waiting" | "someday"

export const TaskStatusEnum = {
  NEXT: "next" as const,
  WAITING: "waiting" as const,
  SOMEDAY: "someday" as const,
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  project_id?: string | null
  context_id?: string | null
  completed_at?: string | null
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  project_id?: string | null
  context_id?: string | null
}

/**
 * Fetch all tasks
 */
export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tasks`)
  if (!response.ok) {
    throw new Error(MESSAGES.api.FETCH_TASKS_FAILED)
  }
  return response.json()
}

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.CREATE_TASK_FAILED)
  }
  return response.json()
}

/**
 * Update a task
 */
export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.UPDATE_TASK_FAILED)
  }
  return response.json()
}

/**
 * Complete a task
 */
export async function completeTask(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${id}/complete`, {
    method: "POST",
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.COMPLETE_TASK_FAILED)
  }
  return response.json()
}

/**
 * Uncomplete a task
 */
export async function uncompleteTask(id: string): Promise<Task> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/tasks/${id}/uncomplete`,
    {
      method: "POST",
    },
  )
  if (!response.ok) {
    throw new Error(MESSAGES.api.UNCOMPLETE_TASK_FAILED)
  }
  return response.json()
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.DELETE_TASK_FAILED)
  }
}

/**
 * Projects
 */
export type ProjectStatus = "active" | "on_hold" | "completed"

export interface Project {
  id: string
  name: string
  outcome_statement?: string
  status: ProjectStatus
  parent_project_id?: string | null
  created_at: string
  updated_at: string
  completed_at?: string | null
  archived_at?: string | null
  last_activity_at?: string | null
  task_count?: number
  completed_task_count?: number
  next_task_count?: number
}

export interface CreateProjectInput {
  name: string
  outcome_statement?: string
  status?: ProjectStatus
}

/**
 * Fetch all projects
 */
export async function getProjects(withStats = false): Promise<Project[]> {
  const url = withStats
    ? `${API_BASE_URL}/api/v1/projects/?with_stats=true`
    : `${API_BASE_URL}/api/v1/projects/`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(MESSAGES.api.FETCH_PROJECTS_FAILED)
  }
  return response.json()
}

/**
 * Create a new project
 */
export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/v1/projects/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.CREATE_PROJECT_FAILED)
  }
  return response.json()
}

/**
 * Notes
 */
export interface Note {
  id: string
  title: string
  content?: string | null
  project_id?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateNoteInput {
  title: string
  content?: string
  project_id?: string | null
}

export interface UpdateNoteInput {
  title?: string
  content?: string
  project_id?: string | null
}

/**
 * Fetch all notes
 */
export async function getNotes(projectId?: string): Promise<Note[]> {
  const url = projectId
    ? `${API_BASE_URL}/api/v1/notes/?project_id=${projectId}`
    : `${API_BASE_URL}/api/v1/notes/`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(MESSAGES.api.FETCH_NOTES_FAILED)
  }
  return response.json()
}

/**
 * Get a single note by ID
 */
export async function getNote(id: string): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/api/v1/notes/${id}`)
  if (!response.ok) {
    throw new Error(MESSAGES.api.FETCH_NOTE_FAILED)
  }
  return response.json()
}

/**
 * Create a new note
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/api/v1/notes/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.CREATE_NOTE_FAILED)
  }
  return response.json()
}

/**
 * Update a note
 */
export async function updateNote(
  id: string,
  input: UpdateNoteInput,
): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/api/v1/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.UPDATE_NOTE_FAILED)
  }
  return response.json()
}

/**
 * Delete a note
 */
export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/notes/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.DELETE_NOTE_FAILED)
  }
}

/**
 * Inbox Items (Universal Capture)
 */
export interface InboxItem {
  id: string
  content: string
  created_at: string
  processed_at?: string | null
  deleted_at?: string | null
}

export interface CreateInboxItemInput {
  content: string
}

export interface ConvertToTaskInput {
  title?: string
  description?: string
  project_id?: string
  scheduled_date?: string
}

export interface ConvertToNoteInput {
  title?: string
  content?: string
  project_id?: string
}

export interface ConvertToProjectInput {
  name?: string
  outcome_statement?: string
}

/**
 * Get all inbox items (unprocessed by default)
 */
export async function getInboxItems(
  includeProcessed = false,
): Promise<InboxItem[]> {
  const url = includeProcessed
    ? `${API_BASE_URL}/api/v1/inbox/?include_processed=true`
    : `${API_BASE_URL}/api/v1/inbox/`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(MESSAGES.api.FETCH_INBOX_FAILED)
  }
  return response.json()
}

/**
 * Get count of unprocessed inbox items
 */
export async function getInboxCount(): Promise<{ count: number }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/inbox/count`)
  if (!response.ok) {
    throw new Error(MESSAGES.api.FETCH_INBOX_COUNT_FAILED)
  }
  return response.json()
}

/**
 * Create a new inbox item (universal capture)
 */
export async function createInboxItem(
  input: CreateInboxItemInput,
): Promise<InboxItem> {
  const response = await fetch(`${API_BASE_URL}/api/v1/inbox/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.CREATE_INBOX_FAILED)
  }
  return response.json()
}

/**
 * Delete an inbox item
 */
export async function deleteInboxItem(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/inbox/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.DELETE_INBOX_FAILED)
  }
}

/**
 * Convert inbox item to task
 */
export async function convertInboxToTask(
  id: string,
  input: ConvertToTaskInput = {},
): Promise<Task> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/inbox/${id}/convert-to-task`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  )
  if (!response.ok) {
    throw new Error(MESSAGES.api.CONVERT_TO_TASK_FAILED)
  }
  return response.json()
}

/**
 * Convert inbox item to note
 */
export async function convertInboxToNote(
  id: string,
  input: ConvertToNoteInput = {},
): Promise<Note> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/inbox/${id}/convert-to-note`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  )
  if (!response.ok) {
    throw new Error(MESSAGES.api.CONVERT_TO_NOTE_FAILED)
  }
  return response.json()
}

/**
 * Convert inbox item to project
 */
export async function convertInboxToProject(
  id: string,
  input: ConvertToProjectInput = {},
): Promise<Project> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/inbox/${id}/convert-to-project`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  )
  if (!response.ok) {
    throw new Error(MESSAGES.api.CONVERT_TO_PROJECT_FAILED)
  }
  return response.json()
}

/**
 * Contexts
 */
export interface Context {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  sort_order: number
  created_at: string
}

export interface CreateContextInput {
  name: string
  description?: string
  icon?: string
  sort_order?: number
}

export interface UpdateContextInput {
  name?: string
  description?: string
  icon?: string
  sort_order?: number
}

/**
 * Fetch all contexts
 */
export async function getContexts(): Promise<Context[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/contexts/`)
  if (!response.ok) {
    throw new Error(MESSAGES.api.FETCH_CONTEXTS_FAILED)
  }
  return response.json()
}

/**
 * Get a single context by ID
 */
export async function getContext(id: string): Promise<Context> {
  const response = await fetch(`${API_BASE_URL}/api/v1/contexts/${id}`)
  if (!response.ok) {
    throw new Error(MESSAGES.api.FETCH_CONTEXT_FAILED)
  }
  return response.json()
}

/**
 * Create a new context
 */
export async function createContext(
  input: CreateContextInput,
): Promise<Context> {
  const response = await fetch(`${API_BASE_URL}/api/v1/contexts/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.CREATE_CONTEXT_FAILED)
  }
  return response.json()
}

/**
 * Update a context
 */
export async function updateContext(
  id: string,
  input: UpdateContextInput,
): Promise<Context> {
  const response = await fetch(`${API_BASE_URL}/api/v1/contexts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.UPDATE_CONTEXT_FAILED)
  }
  return response.json()
}

/**
 * Delete a context
 */
export async function deleteContext(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/contexts/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error(MESSAGES.api.DELETE_CONTEXT_FAILED)
  }
}

/**
 * Search
 */
export type SearchResultType = "task" | "note" | "project"

export interface SearchResultItem {
  id: string
  type: SearchResultType
  title: string
  snippet?: string | null
  rank: number
  created_at: string
  project_id?: string | null
}

export interface SearchResponse {
  query: string
  total_results: number
  results: SearchResultItem[]
}

/**
 * Search across tasks, notes, and projects
 */
export async function search(
  query: string,
  limit = 50,
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  })
  const response = await fetch(`${API_BASE_URL}/api/v1/search/?${params}`)
  if (!response.ok) {
    throw new Error("Search failed")
  }
  return response.json()
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`)
  if (!response.ok) {
    throw new Error("Health check failed")
  }
  return response.json()
}
