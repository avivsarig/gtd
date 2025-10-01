/**
 * API client for GTD backend
 */

const API_BASE_URL = "http://localhost:8000"

export interface Task {
  id: string
  title: string
  description?: string
  status: "next" | "waiting" | "someday" | "completed" | "archived"
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string
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
 * Health check
 */
export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`)
  if (!response.ok) {
    throw new Error("Health check failed")
  }
  return response.json()
}
