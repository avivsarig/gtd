/**
 * API mocks for testing
 *
 * Centralized mock functions for all API calls.
 * Use these in tests with vi.mock("@/lib/api")
 */

import { vi } from "vitest"
import  {
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

export const mockGetTasks = vi.fn<[], Promise<Task[]>>()
export const mockCreateTask = vi.fn<[CreateTaskInput], Promise<Task>>()
export const mockUpdateTask = vi.fn<[string, UpdateTaskInput], Promise<Task>>()
export const mockCompleteTask = vi.fn<[string], Promise<Task>>()
export const mockUncompleteTask = vi.fn<[string], Promise<Task>>()
export const mockDeleteTask = vi.fn<[string], Promise<void>>()

export const mockGetProjects = vi.fn<[boolean?], Promise<Project[]>>()
export const mockCreateProject = vi.fn<[CreateProjectInput], Promise<Project>>()

export const mockGetNotes = vi.fn<[string?], Promise<Note[]>>()
export const mockGetNote = vi.fn<[string], Promise<Note>>()
export const mockCreateNote = vi.fn<[CreateNoteInput], Promise<Note>>()
export const mockUpdateNote = vi.fn<[string, UpdateNoteInput], Promise<Note>>()
export const mockDeleteNote = vi.fn<[string], Promise<void>>()

export const mockGetInboxItems = vi.fn<[boolean?], Promise<InboxItem[]>>()
export const mockGetInboxCount = vi.fn<[], Promise<{ count: number }>>()
export const mockCreateInboxItem = vi.fn<
  [CreateInboxItemInput],
  Promise<InboxItem>
>()
export const mockDeleteInboxItem = vi.fn<[string], Promise<void>>()
export const mockConvertInboxToTask = vi.fn<
  [string, ConvertToTaskInput?],
  Promise<Task>
>()
export const mockConvertInboxToNote = vi.fn<
  [string, ConvertToNoteInput?],
  Promise<Note>
>()
export const mockConvertInboxToProject = vi.fn<
  [string, ConvertToProjectInput?],
  Promise<Project>
>()

export const mockGetContexts = vi.fn<[], Promise<Context[]>>()
export const mockGetContext = vi.fn<[string], Promise<Context>>()
export const mockCreateContext = vi.fn<[CreateContextInput], Promise<Context>>()
export const mockUpdateContext = vi.fn<
  [string, UpdateContextInput],
  Promise<Context>
>()
export const mockDeleteContext = vi.fn<[string], Promise<void>>()

export const mockHealthCheck = vi.fn<[], Promise<{ status: string }>>()

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
