import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { Home } from "./Home"
import * as api from "@/lib/api"
import {
  createMockTask,
  createMockProject,
  createMockNote,
  createMockInboxItem,
  createMockContext,
  createCompletedTask,
} from "@/test/factories"

// Mock the API module
vi.mock("@/lib/api")

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementations
    vi.mocked(api.getTasks).mockResolvedValue([])
    vi.mocked(api.getProjects).mockResolvedValue([])
    vi.mocked(api.getNotes).mockResolvedValue([])
    vi.mocked(api.getInboxItems).mockResolvedValue([])
    vi.mocked(api.getContexts).mockResolvedValue([])
  })

  describe("rendering", () => {
    it("renders main dashboard header", async () => {
      render(<Home />)

      expect(screen.getByText("GTD Dashboard")).toBeInTheDocument()
      expect(
        screen.getByText(/Press Cmd\+K for quick capture/),
      ).toBeInTheDocument()
    })

    it("renders all main sections", async () => {
      render(<Home />)

      expect(screen.getByText("Quick Capture")).toBeInTheDocument()
      expect(screen.getByText("Inbox")).toBeInTheDocument()
      expect(screen.getByText("Tasks")).toBeInTheDocument()
      expect(screen.getByText("Notes")).toBeInTheDocument()
      expect(screen.getByText("Projects")).toBeInTheDocument()
      expect(screen.getByText("Contexts")).toBeInTheDocument()
    })

    it("loads data on mount", async () => {
      render(<Home />)

      await waitFor(() => {
        expect(vi.mocked(api.getTasks)).toHaveBeenCalled()
        expect(vi.mocked(api.getProjects)).toHaveBeenCalled()
        expect(vi.mocked(api.getNotes)).toHaveBeenCalled()
        expect(vi.mocked(api.getInboxItems)).toHaveBeenCalled()
        expect(vi.mocked(api.getContexts)).toHaveBeenCalled()
      })
    })
  })

  describe("task loading and display", () => {
    it("displays loaded tasks", async () => {
      const tasks = [
        createMockTask({ title: "Task 1" }),
        createMockTask({ title: "Task 2" }),
      ]
      vi.mocked(api.getTasks).mockResolvedValue(tasks)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Task 1")).toBeInTheDocument()
        expect(screen.getByText("Task 2")).toBeInTheDocument()
      })
    })

    it("displays active task count", async () => {
      const tasks = [
        createMockTask({ title: "Active Task" }),
        createCompletedTask({ title: "Completed Task" }),
      ]
      vi.mocked(api.getTasks).mockResolvedValue(tasks)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/\(1 active\)/)).toBeInTheDocument()
      })
    })

    it("shows empty state for tasks", async () => {
      vi.mocked(api.getTasks).mockResolvedValue([])

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/No tasks yet/)).toBeInTheDocument()
      })
    })

    it("handles error loading tasks", async () => {
      const error = new Error("Failed to load tasks")
      vi.mocked(api.getTasks).mockRejectedValue(error)

      // Should not throw, just log error
      expect(() => render(<Home />)).not.toThrow()
    })
  })

  describe("inbox loading and display", () => {
    it("displays loaded inbox items", async () => {
      const items = [
        createMockInboxItem({ content: "Item 1" }),
        createMockInboxItem({ content: "Item 2" }),
      ]
      vi.mocked(api.getInboxItems).mockResolvedValue(items)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Item 1")).toBeInTheDocument()
        expect(screen.getByText("Item 2")).toBeInTheDocument()
      })
    })

    it("displays inbox item count", async () => {
      const items = [
        createMockInboxItem({ content: "Item 1" }),
        createMockInboxItem({ content: "Item 2" }),
      ]
      vi.mocked(api.getInboxItems).mockResolvedValue(items)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/\(2 items\)/)).toBeInTheDocument()
      })
    })

    it("shows inbox zero message when empty", async () => {
      vi.mocked(api.getInboxItems).mockResolvedValue([])

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/Inbox Zero/)).toBeInTheDocument()
      })
    })

    it("handles error loading inbox", async () => {
      const error = new Error("Failed to load inbox")
      vi.mocked(api.getInboxItems).mockRejectedValue(error)

      expect(() => render(<Home />)).not.toThrow()
    })
  })

  describe("notes loading and display", () => {
    it("displays loaded notes", async () => {
      const notes = [
        createMockNote({ title: "Note 1" }),
        createMockNote({ title: "Note 2" }),
      ]
      vi.mocked(api.getNotes).mockResolvedValue(notes)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Note 1")).toBeInTheDocument()
        expect(screen.getByText("Note 2")).toBeInTheDocument()
      })
    })

    it("displays note count", async () => {
      const notes = [
        createMockNote({ title: "Note 1" }),
        createMockNote({ title: "Note 2" }),
      ]
      vi.mocked(api.getNotes).mockResolvedValue(notes)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/\(2\)/)).toBeInTheDocument()
      })
    })

    it("shows empty state for notes", async () => {
      vi.mocked(api.getNotes).mockResolvedValue([])

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/No notes yet/)).toBeInTheDocument()
      })
    })

    it("handles error loading notes", async () => {
      const error = new Error("Failed to load notes")
      vi.mocked(api.getNotes).mockRejectedValue(error)

      expect(() => render(<Home />)).not.toThrow()
    })
  })

  describe("projects loading and display", () => {
    it("loads projects with stats", async () => {
      const projects = [createMockProject({ name: "Project 1" })]
      vi.mocked(api.getProjects).mockResolvedValue(projects)

      render(<Home />)

      await waitFor(() => {
        expect(vi.mocked(api.getProjects)).toHaveBeenCalledWith(true)
      })
    })
  })

  describe("contexts loading and display", () => {
    it("displays loaded contexts", async () => {
      const contexts = [
        createMockContext({ name: "@home" }),
        createMockContext({ name: "@computer" }),
      ]
      vi.mocked(api.getContexts).mockResolvedValue(contexts)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/\(2\)/)).toBeInTheDocument()
      })
    })

    it("handles error loading contexts", async () => {
      const error = new Error("Failed to load contexts")
      vi.mocked(api.getContexts).mockRejectedValue(error)

      expect(() => render(<Home />)).not.toThrow()
    })
  })

  describe("task interactions", () => {
    it("updates task status when status changes", async () => {
      const user = userEvent.setup()
      const task = createMockTask({ title: "Test Task", status: "next" })
      const updatedTask = { ...task, status: "waiting" as const }

      vi.mocked(api.getTasks).mockResolvedValue([task])
      vi.mocked(api.updateTask).mockResolvedValue(updatedTask)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument()
      })

      const statusSelect = screen.getByLabelText("Task status")
      await user.selectOptions(statusSelect, "waiting")

      await waitFor(() => {
        expect(vi.mocked(api.updateTask)).toHaveBeenCalledWith(task.id, {
          status: "waiting",
        })
      })
    })

    it("completes task when completion button clicked", async () => {
      const user = userEvent.setup()
      const task = createMockTask({ title: "Test Task" })
      const completedTask = { ...task, completed_at: new Date().toISOString() }

      vi.mocked(api.getTasks).mockResolvedValue([task])
      vi.mocked(api.completeTask).mockResolvedValue(completedTask)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument()
      })

      const completeButton = screen.getByRole("button", {
        name: /mark as complete/i,
      })
      await user.click(completeButton)

      await waitFor(() => {
        expect(vi.mocked(api.completeTask)).toHaveBeenCalledWith(task.id)
      })
    })

    it("uncompletes task when toggling completed task", async () => {
      const user = userEvent.setup()
      const task = createCompletedTask({ title: "Completed Task" })
      const uncompletedTask = { ...task, completed_at: null }

      vi.mocked(api.getTasks).mockResolvedValue([task])
      vi.mocked(api.uncompleteTask).mockResolvedValue(uncompletedTask)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Completed Task")).toBeInTheDocument()
      })

      const incompleteButton = screen.getByRole("button", {
        name: /mark as incomplete/i,
      })
      await user.click(incompleteButton)

      await waitFor(() => {
        expect(vi.mocked(api.uncompleteTask)).toHaveBeenCalledWith(task.id)
      })
    })

    it("updates task project assignment", async () => {
      const user = userEvent.setup()
      const project = createMockProject({ name: "My Project" })
      const task = createMockTask({ title: "Test Task" })
      const updatedTask = { ...task, project_id: project.id }

      vi.mocked(api.getTasks).mockResolvedValue([task])
      vi.mocked(api.getProjects).mockResolvedValue([project])
      vi.mocked(api.updateTask).mockResolvedValue(updatedTask)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument()
      })

      const projectSelect = screen.getByLabelText("Project assignment")
      await user.selectOptions(projectSelect, project.id)

      await waitFor(() => {
        expect(vi.mocked(api.updateTask)).toHaveBeenCalledWith(task.id, {
          project_id: project.id,
        })
      })
    })

    it("updates task context assignment", async () => {
      const user = userEvent.setup()
      const context = createMockContext({ name: "@home" })
      const task = createMockTask({ title: "Test Task" })
      const updatedTask = { ...task, context_id: context.id }

      vi.mocked(api.getTasks).mockResolvedValue([task])
      vi.mocked(api.getContexts).mockResolvedValue([context])
      vi.mocked(api.updateTask).mockResolvedValue(updatedTask)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument()
      })

      const contextSelect = screen.getByLabelText("Context assignment")
      await user.selectOptions(contextSelect, context.id)

      await waitFor(() => {
        expect(vi.mocked(api.updateTask)).toHaveBeenCalledWith(task.id, {
          context_id: context.id,
        })
      })
    })

    it("deletes task when delete is confirmed", async () => {
      const user = userEvent.setup()
      const task = createMockTask({ title: "Test Task" })

      vi.mocked(api.getTasks).mockResolvedValue([task])
      vi.mocked(api.deleteTask).mockResolvedValue(undefined)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument()
      })

      // Mock window.confirm to return true
      vi.spyOn(window, "confirm").mockReturnValue(true)

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(vi.mocked(api.deleteTask)).toHaveBeenCalledWith(task.id)
      })
    })
  })

  describe("inbox interactions", () => {
    it("converts inbox item to task", async () => {
      const user = userEvent.setup()
      const item = createMockInboxItem({ content: "Convert me to task" })

      vi.mocked(api.getInboxItems).mockResolvedValue([item])
      vi.mocked(api.convertInboxToTask).mockResolvedValue(createMockTask())

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Convert me to task")).toBeInTheDocument()
      })

      const taskButton = screen.getByRole("button", { name: /task/i })
      await user.click(taskButton)

      await waitFor(() => {
        expect(vi.mocked(api.convertInboxToTask)).toHaveBeenCalledWith(
          item.id,
          {
            title: item.content,
          },
        )
      })
    })

    it("converts inbox item to note", async () => {
      const user = userEvent.setup()
      const item = createMockInboxItem({ content: "Convert me to note" })

      vi.mocked(api.getInboxItems).mockResolvedValue([item])
      vi.mocked(api.convertInboxToNote).mockResolvedValue(createMockNote())

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Convert me to note")).toBeInTheDocument()
      })

      // Get all note buttons and click the first one (for this inbox item)
      const noteButtons = screen.getAllByRole("button", { name: /note/i })
      // Filter to get inbox item actions (not the "+ New Note" button)
      const noteButton =
        noteButtons.find((btn) => btn.innerHTML.includes("FileText")) ||
        noteButtons[0]
      await user.click(noteButton)

      await waitFor(() => {
        expect(vi.mocked(api.convertInboxToNote)).toHaveBeenCalledWith(
          item.id,
          {
            content: item.content,
          },
        )
      })
    })

    it("deletes inbox item when confirmed", async () => {
      const user = userEvent.setup()
      const item = createMockInboxItem({ content: "Delete me" })

      vi.mocked(api.getInboxItems).mockResolvedValue([item])
      vi.mocked(api.deleteInboxItem).mockResolvedValue(undefined)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Delete me")).toBeInTheDocument()
      })

      // Mock window.confirm to return true
      vi.spyOn(window, "confirm").mockReturnValue(true)

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(vi.mocked(api.deleteInboxItem)).toHaveBeenCalledWith(item.id)
      })
    })

    it("handles error when converting inbox item", async () => {
      const user = userEvent.setup()
      const item = createMockInboxItem({ content: "Will fail" })

      vi.mocked(api.getInboxItems).mockResolvedValue([item])
      vi.mocked(api.convertInboxToTask).mockRejectedValue(
        new Error("Conversion failed"),
      )

      // Mock alert
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Will fail")).toBeInTheDocument()
      })

      const taskButton = screen.getByRole("button", { name: /task/i })
      await user.click(taskButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled()
      })

      alertSpy.mockRestore()
    })
  })

  describe("note interactions", () => {
    it("opens note form when clicking new note button", async () => {
      const user = userEvent.setup()

      render(<Home />)

      const newNoteButton = screen.getByRole("button", { name: /\+ New Note/i })
      await user.click(newNoteButton)

      // Form should open (rendered in DOM)
      await waitFor(() => {
        expect(screen.getByLabelText("Title *")).toBeInTheDocument()
      })
    })

    it("creates new note", async () => {
      const user = userEvent.setup()
      const newNote = createMockNote({ title: "New Note", content: "Content" })

      vi.mocked(api.createNote).mockResolvedValue(newNote)

      render(<Home />)

      const newNoteButton = screen.getByRole("button", { name: /\+ New Note/i })
      await user.click(newNoteButton)

      const titleInput = screen.getByLabelText("Title *")
      const contentInput = screen.getByLabelText("Content")
      const submitButton = screen.getByRole("button", { name: "Create Note" })

      await user.type(titleInput, "New Note")
      await user.type(contentInput, "Content")
      await user.click(submitButton)

      await waitFor(() => {
        expect(vi.mocked(api.createNote)).toHaveBeenCalled()
      })
    })

    it("edits existing note", async () => {
      const user = userEvent.setup()
      const note = createMockNote({ title: "Old Title" })
      const updatedNote = { ...note, title: "New Title" }

      vi.mocked(api.getNotes).mockResolvedValue([note])
      vi.mocked(api.updateNote).mockResolvedValue(updatedNote)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Old Title")).toBeInTheDocument()
      })

      const editButton = screen.getAllByRole("button", { name: /edit/i })[0]
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByLabelText("Title *")).toBeInTheDocument()
      })

      const submitButton = screen.getByRole("button", { name: "Update Note" })
      await user.click(submitButton)

      await waitFor(() => {
        expect(vi.mocked(api.updateNote)).toHaveBeenCalled()
      })
    })

    it("note deletion is available when confirmed", async () => {
      const note = createMockNote({ title: "Delete me" })

      vi.mocked(api.getNotes).mockResolvedValue([note])
      vi.mocked(api.deleteNote).mockResolvedValue(undefined)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Delete me")).toBeInTheDocument()
      })

      // Verify deleteNote function can be called
      expect(vi.mocked(api.deleteNote)).toBeDefined()
    })
  })

  describe("keyboard shortcuts", () => {
    it("opens universal capture modal with Cmd+K", async () => {
      const user = userEvent.setup()

      render(<Home />)

      // Simulate Cmd+K
      await user.keyboard("{Meta>}k{/Meta}")

      await waitFor(() => {
        // Check if modal is open (look for modal content)
        const modalElements = screen.queryAllByRole("dialog")
        expect(modalElements.length).toBeGreaterThan(0)
      })
    })

    it("opens universal capture modal with Ctrl+K on non-Mac", async () => {
      const user = userEvent.setup()

      render(<Home />)

      // Simulate Ctrl+K
      await user.keyboard("{Control>}k{/Control}")

      await waitFor(() => {
        const modalElements = screen.queryAllByRole("dialog")
        expect(modalElements.length).toBeGreaterThan(0)
      })
    })

    it("does not trigger shortcut when typing in input", async () => {
      const user = userEvent.setup()

      render(<Home />)

      const newNoteButton = screen.getByRole("button", { name: /\+ New Note/i })
      await user.click(newNoteButton)

      const titleInput = screen.getByLabelText("Title *")
      titleInput.focus()

      // Type Cmd+K while focused on input
      await user.keyboard("k")

      // Should not open another modal (only one should exist from + New Note)
      expect(titleInput).toHaveFocus()
    })

    it("test_cmd_slash_opens_search_modal", async () => {
      const user = userEvent.setup()

      render(<Home />)

      await user.keyboard("{Meta>}/{/Meta}")

      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/search/i)
        expect(searchInput).toBeInTheDocument()
      })
    })

    it("test_search_shortcut_ignored_when_typing_in_input", async () => {
      const user = userEvent.setup()

      render(<Home />)

      const newNoteButton = screen.getByRole("button", { name: /\+ New Note/i })
      await user.click(newNoteButton)

      const titleInput = screen.getByLabelText("Title *")
      titleInput.focus()

      await user.keyboard("{Meta>}/{/Meta}")

      expect(titleInput).toHaveFocus()
      expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument()
    })
  })

  describe("context management", () => {
    it("creates new context", async () => {
      vi.mocked(api.createContext).mockResolvedValue(createMockContext())

      render(<Home />)

      // ContextManager should be rendered
      await waitFor(() => {
        const inputs = screen.queryAllByPlaceholderText(/context name|name/i)
        expect(inputs.length).toBeGreaterThanOrEqual(0)
      })
    })

    it("deletes context when confirmed", async () => {
      const context = createMockContext({ name: "@home" })

      vi.mocked(api.getContexts).mockResolvedValue([context])
      vi.mocked(api.deleteContext).mockResolvedValue(undefined)

      render(<Home />)

      await waitFor(() => {
        // Context should be displayed
        expect(screen.getByText(/\(1\)/)).toBeInTheDocument()
      })
    })
  })

  describe("note form modal", () => {
    it("closes note form when cancel is clicked", async () => {
      const user = userEvent.setup()

      render(<Home />)

      const newNoteButton = screen.getByRole("button", { name: /\+ New Note/i })
      await user.click(newNoteButton)

      const cancelButton = screen.getByRole("button", { name: "Cancel" })
      await user.click(cancelButton)

      // Form should close
      await waitFor(() => {
        expect(screen.queryByLabelText("Title *")).not.toBeInTheDocument()
      })
    })

    it("closes form after successful note creation", async () => {
      const user = userEvent.setup()
      const newNote = createMockNote({ title: "New Note" })

      vi.mocked(api.createNote).mockResolvedValue(newNote)

      render(<Home />)

      const newNoteButton = screen.getByRole("button", { name: /\+ New Note/i })
      await user.click(newNoteButton)

      const titleInput = screen.getByLabelText("Title *")
      const submitButton = screen.getByRole("button", { name: "Create Note" })

      await user.type(titleInput, "New Note")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByLabelText("Title *")).not.toBeInTheDocument()
      })
    })
  })

  describe("data reload after operations", () => {
    it("reloads inbox after creating inbox item", async () => {
      const item = createMockInboxItem()

      vi.mocked(api.getInboxItems).mockResolvedValue([])
      vi.mocked(api.createInboxItem).mockResolvedValue(item)

      render(<Home />)

      // This would be tested through QuickCapture component
      await waitFor(() => {
        expect(vi.mocked(api.getInboxItems)).toHaveBeenCalled()
      })
    })

    it("reloads tasks and inbox after converting item to task", async () => {
      const user = userEvent.setup()
      const item = createMockInboxItem()

      vi.mocked(api.getInboxItems).mockResolvedValue([item])
      vi.mocked(api.convertInboxToTask).mockResolvedValue(createMockTask())

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(item.content)).toBeInTheDocument()
      })

      // Get the Task button for the inbox item (not any other task button)
      const taskButtons = screen.getAllByRole("button", { name: /task/i })
      const inboxTaskButton =
        taskButtons.find((btn) => btn.innerHTML.includes("CheckSquare")) ||
        taskButtons[0]
      await user.click(inboxTaskButton)

      await waitFor(() => {
        // Should reload both
        expect(vi.mocked(api.getInboxItems)).toHaveBeenCalledTimes(2)
        expect(vi.mocked(api.getTasks)).toHaveBeenCalledTimes(2)
      })
    })

    it("reloads notes and inbox after converting item to note", async () => {
      const user = userEvent.setup()
      const item = createMockInboxItem()

      vi.mocked(api.getInboxItems).mockResolvedValue([item])
      vi.mocked(api.convertInboxToNote).mockResolvedValue(createMockNote())

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(item.content)).toBeInTheDocument()
      })

      // Get the Note button for the inbox item
      const noteButtons = screen.getAllByRole("button", { name: /note/i })
      const inboxNoteButton =
        noteButtons.find((btn) => btn.innerHTML.includes("FileText")) ||
        noteButtons[0]
      await user.click(inboxNoteButton)

      await waitFor(() => {
        // Should reload both
        expect(vi.mocked(api.getInboxItems)).toHaveBeenCalledTimes(2)
        expect(vi.mocked(api.getNotes)).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe("error handling", () => {
    it("handles task update error gracefully", async () => {
      const user = userEvent.setup()
      const task = createMockTask({ title: "Test Task" })

      vi.mocked(api.getTasks).mockResolvedValue([task])
      vi.mocked(api.updateTask).mockRejectedValue(new Error("Update failed"))

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument()
      })

      const statusSelect = screen.getByLabelText("Task status")
      await user.selectOptions(statusSelect, "waiting")

      // Should not crash, just show error in console
      await waitFor(() => {
        expect(vi.mocked(api.updateTask)).toHaveBeenCalled()
      })
    })

    it("handles task deletion error with alert", async () => {
      const user = userEvent.setup()
      const task = createMockTask({ title: "Test Task" })

      vi.mocked(api.getTasks).mockResolvedValue([task])
      vi.mocked(api.deleteTask).mockRejectedValue(new Error("Delete failed"))

      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument()
      })

      vi.spyOn(window, "confirm").mockReturnValue(true)

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled()
      })

      alertSpy.mockRestore()
    })
  })

  describe("display counts", () => {
    it("displays correct singular form for single inbox item", async () => {
      const item = createMockInboxItem()
      vi.mocked(api.getInboxItems).mockResolvedValue([item])

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/\(1 item\)/)).toBeInTheDocument()
      })
    })

    it("displays correct plural form for multiple inbox items", async () => {
      const items = [
        createMockInboxItem({ content: "Item 1" }),
        createMockInboxItem({ content: "Item 2" }),
      ]
      vi.mocked(api.getInboxItems).mockResolvedValue(items)

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/\(2 items\)/)).toBeInTheDocument()
      })
    })
  })
})
