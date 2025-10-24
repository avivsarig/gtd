/**
 * API mocks for testing
 *
 * Centralized mock functions for all API calls.
 * Use these in tests with vi.mock("@/lib/api")
 */

import { vi } from "vitest"
import {
  type Task,
  type Project,
  type Note,
  type InboxItem,
  type Context,
  type CreateTaskInput,
  type UpdateTaskInput,
  type CreateProjectInput,
  type CreateNoteInput,
  type UpdateNoteInput,
  type CreateInboxItemInput,
  type ConvertToTaskInput,
  type ConvertToNoteInput,
  type ConvertToProjectInput,
  type CreateContextInput,
  type UpdateContextInput,
} from "@/lib/api"

export const mockGetTasks = vi.fn<() => Promise<Task[]>>()
export const mockCreateTask = vi.fn<(input: CreateTaskInput) => Promise<Task>>()
export const mockUpdateTask =
  vi.fn<(id: string, input: UpdateTaskInput) => Promise<Task>>()
export const mockCompleteTask = vi.fn<(id: string) => Promise<Task>>()
export const mockUncompleteTask = vi.fn<(id: string) => Promise<Task>>()
export const mockDeleteTask = vi.fn<(id: string) => Promise<void>>()

export const mockGetProjects =
  vi.fn<(withStats?: boolean) => Promise<Project[]>>()
export const mockCreateProject =
  vi.fn<(input: CreateProjectInput) => Promise<Project>>()

export const mockGetNotes = vi.fn<(projectId?: string) => Promise<Note[]>>()
export const mockGetNote = vi.fn<(id: string) => Promise<Note>>()
export const mockCreateNote = vi.fn<(input: CreateNoteInput) => Promise<Note>>()
export const mockUpdateNote =
  vi.fn<(id: string, input: UpdateNoteInput) => Promise<Note>>()
export const mockDeleteNote = vi.fn<(id: string) => Promise<void>>()

export const mockGetInboxItems =
  vi.fn<(includeProcessed?: boolean) => Promise<InboxItem[]>>()
export const mockGetInboxCount = vi.fn<() => Promise<{ count: number }>>()
export const mockCreateInboxItem =
  vi.fn<(input: CreateInboxItemInput) => Promise<InboxItem>>()
export const mockDeleteInboxItem = vi.fn<(id: string) => Promise<void>>()
export const mockConvertInboxToTask =
  vi.fn<(id: string, input?: ConvertToTaskInput) => Promise<Task>>()
export const mockConvertInboxToNote =
  vi.fn<(id: string, input?: ConvertToNoteInput) => Promise<Note>>()
export const mockConvertInboxToProject =
  vi.fn<(id: string, input?: ConvertToProjectInput) => Promise<Project>>()

export const mockGetContexts = vi.fn<() => Promise<Context[]>>()
export const mockGetContext = vi.fn<(id: string) => Promise<Context>>()
export const mockCreateContext =
  vi.fn<(input: CreateContextInput) => Promise<Context>>()
export const mockUpdateContext =
  vi.fn<(id: string, input: UpdateContextInput) => Promise<Context>>()
export const mockDeleteContext = vi.fn<(id: string) => Promise<void>>()

export const mockHealthCheck = vi.fn<() => Promise<{ status: string }>>()

export const mockApi = {
  getTasks: mockGetTasks,
  createTask: mockCreateTask,
  updateTask: mockUpdateTask,
  completeTask: mockCompleteTask,
  uncompleteTask: mockUncompleteTask,
  deleteTask: mockDeleteTask,

  getProjects: mockGetProjects,
  createProject: mockCreateProject,

  getNotes: mockGetNotes,
  getNote: mockGetNote,
  createNote: mockCreateNote,
  updateNote: mockUpdateNote,
  deleteNote: mockDeleteNote,

  getInboxItems: mockGetInboxItems,
  getInboxCount: mockGetInboxCount,
  createInboxItem: mockCreateInboxItem,
  deleteInboxItem: mockDeleteInboxItem,
  convertInboxToTask: mockConvertInboxToTask,
  convertInboxToNote: mockConvertInboxToNote,
  convertInboxToProject: mockConvertInboxToProject,

  getContexts: mockGetContexts,
  getContext: mockGetContext,
  createContext: mockCreateContext,
  updateContext: mockUpdateContext,
  deleteContext: mockDeleteContext,

  healthCheck: mockHealthCheck,
}

export function resetAllMocks() {
  Object.values(mockApi).forEach((mock) => mock.mockReset())
}

export function setupApiMocks() {
  vi.mock("@/lib/api", () => mockApi)
}
