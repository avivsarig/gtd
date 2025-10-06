/**
 * API client for GTD backend
 */

const API_BASE_URL = "http://localhost:8000"

export type TaskStatus = "next" | "waiting" | "someday"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  project_id?: string | null
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
}

/**
 * Fetch all tasks
 */
export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tasks`)
  if (!response.ok) {
    throw new Error("Failed to fetch tasks")
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
    throw new Error("Failed to create task")
  }
  return response.json()
}

/**
 * Update a task
 */
export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error("Failed to update task")
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
    throw new Error("Failed to complete task")
  }
  return response.json()
}

/**
 * Uncomplete a task
 */
export async function uncompleteTask(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${id}/uncomplete`, {
    method: "POST",
  })
  if (!response.ok) {
    throw new Error("Failed to uncomplete task")
  }
  return response.json()
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
    throw new Error("Failed to fetch projects")
  }
  return response.json()
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/v1/projects/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error("Failed to create project")
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
    throw new Error("Failed to fetch notes")
  }
  return response.json()
}

/**
 * Get a single note by ID
 */
export async function getNote(id: string): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/api/v1/notes/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch note")
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
    throw new Error("Failed to create note")
  }
  return response.json()
}

/**
 * Update a note
 */
export async function updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/api/v1/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error("Failed to update note")
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
    throw new Error("Failed to delete note")
  }
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
