/**
 * API client tests
 *
 * Test request formatting, error handling, and response parsing.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  getTasks,
  createTask,
  updateTask,
  completeTask,
  uncompleteTask,
  deleteTask,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getInboxItems,
  createInboxItem,
  deleteInboxItem,
  getContexts,
  createContext,
  deleteContext,
  healthCheck,
} from "./api"
import {
  createMockTask,
  createMockProject,
  createMockNote,
  createMockInboxItem,
  createMockContext,
} from "@/test/factories"

const API_BASE_URL = "http://localhost:8000"

describe("API Client - Tasks", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getTasks", () => {
    it("fetches tasks from correct endpoint", async () => {
      const mockTasks = [createMockTask(), createMockTask()]
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockTasks,
      })

      const result = await getTasks()

      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/tasks`)
      expect(result).toEqual(mockTasks)
    })

    it("throws error when request fails", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(getTasks()).rejects.toThrow("Failed to fetch tasks")
    })
  })

  describe("createTask", () => {
    it("sends POST request with correct payload", async () => {
      const input = { title: "New task", status: "next" as const }
      const mockResponse = createMockTask(input)

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await createTask(input)

      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      expect(result).toEqual(mockResponse)
    })

    it("throws error on creation failure", async () => {
      fetchMock.mockResolvedValue({ ok: false })

      await expect(createTask({ title: "Test" })).rejects.toThrow(
        "Failed to create task",
      )
    })
  })

  describe("updateTask", () => {
    it("sends PUT request with correct payload", async () => {
      const taskId = "123"
      const input = { title: "Updated title" }
      const mockResponse = createMockTask({ id: taskId, ...input })

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await updateTask(taskId, input)

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("completeTask", () => {
    it("sends POST request to complete endpoint", async () => {
      const taskId = "123"
      const mockResponse = createMockTask({
        id: taskId,
        completed_at: new Date().toISOString(),
      })

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await completeTask(taskId)

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/tasks/${taskId}/complete`,
        { method: "POST" },
      )
      expect(result.completed_at).toBeTruthy()
    })
  })

  describe("uncompleteTask", () => {
    it("sends POST request to uncomplete endpoint", async () => {
      const taskId = "123"
      const mockResponse = createMockTask({ id: taskId, completed_at: null })

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await uncompleteTask(taskId)

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/tasks/${taskId}/uncomplete`,
        { method: "POST" },
      )
      expect(result.completed_at).toBeNull()
    })
  })

  describe("deleteTask", () => {
    it("sends DELETE request", async () => {
      const taskId = "123"
      fetchMock.mockResolvedValue({ ok: true })

      await deleteTask(taskId)

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/tasks/${taskId}`,
        { method: "DELETE" },
      )
    })

    it("throws error on deletion failure", async () => {
      fetchMock.mockResolvedValue({ ok: false })

      await expect(deleteTask("123")).rejects.toThrow("Failed to delete task")
    })
  })
})

describe("API Client - Projects", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getProjects", () => {
    it("fetches projects without stats by default", async () => {
      const mockProjects = [createMockProject(), createMockProject()]
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockProjects,
      })

      await getProjects()

      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/projects/`)
    })

    it("fetches projects with stats when requested", async () => {
      const mockProjects = [createMockProject(), createMockProject()]
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockProjects,
      })

      await getProjects({ with_stats: true })

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/projects/?with_stats=true`,
      )
    })
  })

  describe("createProject", () => {
    it("sends POST request with correct payload", async () => {
      const input = { name: "New Project", outcome_statement: "Success" }
      const mockResponse = createMockProject(input)

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await createProject(input)

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/projects/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      )
      expect(result.name).toBe(input.name)
    })
  })
})

describe("API Client - Notes", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getNotes", () => {
    it("fetches all notes without filter", async () => {
      const mockNotes = [createMockNote(), createMockNote()]
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockNotes,
      })

      await getNotes()

      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/notes/`)
    })

    it("fetches notes filtered by project", async () => {
      const projectId = "proj-123"
      const mockNotes = [createMockNote({ project_id: projectId })]
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockNotes,
      })

      await getNotes({ project_id: projectId })

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/notes/?project_id=${projectId}`,
      )
    })
  })

  describe("createNote", () => {
    it("sends POST request with correct payload", async () => {
      const input = {
        title: "New Note",
        content: "Content here",
        project_id: "proj-123",
      }
      const mockResponse = createMockNote(input)

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await createNote(input)

      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/notes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      expect(result.title).toBe(input.title)
    })
  })

  describe("updateNote", () => {
    it("sends PUT request with correct payload", async () => {
      const noteId = "note-123"
      const input = { title: "Updated Note" }
      const mockResponse = createMockNote({ id: noteId, ...input })

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      await updateNote(noteId, input)

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/notes/${noteId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      )
    })
  })

  describe("deleteNote", () => {
    it("sends DELETE request", async () => {
      const noteId = "note-123"
      fetchMock.mockResolvedValue({ ok: true })

      await deleteNote(noteId)

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/notes/${noteId}`,
        { method: "DELETE" },
      )
    })
  })
})

describe("API Client - Inbox", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getInboxItems", () => {
    it("fetches unprocessed items by default", async () => {
      const mockItems = [createMockInboxItem(), createMockInboxItem()]
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockItems,
      })

      await getInboxItems()

      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/inbox/`)
    })

    it("includes processed items when requested", async () => {
      const mockItems = [createMockInboxItem()]
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockItems,
      })

      await getInboxItems(true)

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/inbox/?include_processed=true`,
      )
    })
  })

  describe("createInboxItem", () => {
    it("sends POST request with content", async () => {
      const input = { content: "Quick thought" }
      const mockResponse = createMockInboxItem(input)

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await createInboxItem(input)

      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/inbox/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      expect(result.content).toBe(input.content)
    })
  })

  describe("deleteInboxItem", () => {
    it("sends DELETE request", async () => {
      const itemId = "inbox-123"
      fetchMock.mockResolvedValue({ ok: true })

      await deleteInboxItem(itemId)

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/inbox/${itemId}`,
        { method: "DELETE" },
      )
    })
  })
})

describe("API Client - Contexts", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getContexts", () => {
    it("fetches all contexts", async () => {
      const mockContexts = [createMockContext(), createMockContext()]
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockContexts,
      })

      const result = await getContexts()

      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/contexts/`)
      expect(result).toEqual(mockContexts)
    })
  })

  describe("createContext", () => {
    it("sends POST request with correct payload", async () => {
      const input = { name: "@office", icon: "🏢", sort_order: 1 }
      const mockResponse = createMockContext(input)

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await createContext(input)

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/contexts/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      )
      expect(result.name).toBe(input.name)
    })
  })
})

describe("API Client - Health Check", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("calls health endpoint", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok" }),
    })

    const result = await healthCheck()

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/health`)
    expect(result.status).toBe("ok")
  })

  it("throws error when health check fails", async () => {
    fetchMock.mockResolvedValue({ ok: false })

    await expect(healthCheck()).rejects.toThrow("Health check failed")
  })
})

describe("API Client - Error Handling", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Network Errors", () => {
    it("handles network failure on getTasks", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"))

      await expect(getTasks()).rejects.toThrow()
    })

    it("handles network failure on createTask", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"))

      await expect(createTask({ title: "Test" })).rejects.toThrow()
    })

    it("handles network failure on getProjects", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"))

      await expect(getProjects()).rejects.toThrow()
    })

    it("handles network failure on getNotes", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"))

      await expect(getNotes()).rejects.toThrow()
    })

    it("handles network failure on getInboxItems", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"))

      await expect(getInboxItems()).rejects.toThrow()
    })

    it("handles network failure on getContexts", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"))

      await expect(getContexts()).rejects.toThrow()
    })
  })

  describe("404 Errors", () => {
    it("handles 404 on updateTask", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(updateTask("fake-id", { title: "Updated" })).rejects.toThrow(
        "Failed to update task",
      )
    })

    it("handles 404 on completeTask", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(completeTask("fake-id")).rejects.toThrow()
    })

    it("handles 404 on deleteTask", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(deleteTask("fake-id")).rejects.toThrow()
    })

    it("handles 404 on updateProject", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(
        updateProject("fake-id", { name: "Updated" }),
      ).rejects.toThrow()
    })

    it("handles 404 on deleteProject", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(deleteProject("fake-id")).rejects.toThrow()
    })

    it("handles 404 on deleteNote", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(deleteNote("fake-id")).rejects.toThrow()
    })

    it("handles 404 on deleteInboxItem", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(deleteInboxItem("fake-id")).rejects.toThrow()
    })

    it("handles 404 on deleteContext", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(deleteContext("fake-id")).rejects.toThrow()
    })
  })

  describe("500 Server Errors", () => {
    it("handles 500 on getTasks", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(getTasks()).rejects.toThrow("Failed to fetch tasks")
    })

    it("handles 500 on createTask", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(createTask({ title: "Test" })).rejects.toThrow()
    })

    it("handles 500 on getProjects", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(getProjects()).rejects.toThrow()
    })

    it("handles 500 on createProject", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(createProject({ name: "Test" })).rejects.toThrow()
    })

    it("handles 500 on getNotes", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(getNotes()).rejects.toThrow()
    })

    it("handles 500 on createNote", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(
        createNote({ title: "Test", content: "Test" }),
      ).rejects.toThrow()
    })

    it("handles 500 on getInboxItems", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(getInboxItems()).rejects.toThrow()
    })

    it("handles 500 on createInboxItem", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(createInboxItem({ content: "Test" })).rejects.toThrow()
    })
  })

  describe("422 Validation Errors", () => {
    it("handles 422 on createTask with invalid data", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 422,
      })

      await expect(createTask({ title: "" })).rejects.toThrow()
    })

    it("handles 422 on createProject with invalid data", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 422,
      })

      await expect(createProject({ name: "" })).rejects.toThrow()
    })

    it("handles 422 on createNote with invalid data", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 422,
      })

      await expect(createNote({ title: "", content: "" })).rejects.toThrow()
    })

    it("handles 422 on createInboxItem with invalid data", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 422,
      })

      await expect(createInboxItem({ content: "" })).rejects.toThrow()
    })
  })

  describe("Response Parsing", () => {
    it("handles malformed JSON response", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON")
        },
      })

      await expect(getTasks()).rejects.toThrow()
    })

    it("handles empty response where data expected", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => null,
      })

      const result = await getTasks()
      expect(result).toBeNull()
    })
  })
})
