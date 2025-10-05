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
 * Health check
 */
export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`)
  if (!response.ok) {
    throw new Error("Health check failed")
  }
  return response.json()
}
