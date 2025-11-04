import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { TaskList } from "./TaskList"
import {
  createMockTask,
  createCompletedTask,
  createMockProject,
  createMockContext,
} from "@/test/factories"

describe("TaskList", () => {
  const mockProject = createMockProject()
  const mockContext = createMockContext()

  describe("rendering", () => {
    it("renders empty state when no tasks", () => {
      render(
        <TaskList
          tasks={[]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      expect(
        screen.getByText("No tasks yet. Create one to get started!"),
      ).toBeInTheDocument()
    })

    it("renders tasks with title and description", () => {
      const task = createMockTask({
        title: "My Task",
        description: "Task description",
      })

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      expect(screen.getByText("My Task")).toBeInTheDocument()
      expect(screen.getByText("Task description")).toBeInTheDocument()
    })

    it("renders multiple tasks", () => {
      const tasks = [
        createMockTask({ title: "Task 1" }),
        createMockTask({ title: "Task 2" }),
        createMockTask({ title: "Task 3" }),
      ]

      render(
        <TaskList
          tasks={tasks}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      expect(screen.getByText("Task 1")).toBeInTheDocument()
      expect(screen.getByText("Task 2")).toBeInTheDocument()
      expect(screen.getByText("Task 3")).toBeInTheDocument()
    })
  })

  describe("completion toggle", () => {
    it("shows circle icon for incomplete task", () => {
      const task = createMockTask()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      const button = screen.getByRole("button", {
        name: "Mark as complete",
      })
      expect(button).toBeInTheDocument()
    })

    it("shows check icon for completed task", () => {
      const task = createCompletedTask()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      const button = screen.getByRole("button", {
        name: "Mark as incomplete",
      })
      expect(button).toBeInTheDocument()
    })

    it("applies visual feedback to completed tasks", () => {
      const task = createCompletedTask({ title: "Completed Task" })

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      const title = screen.getByText("Completed Task")
      expect(title).toHaveClass("line-through")
    })

    it("calls onToggleComplete when completion button clicked", async () => {
      const user = userEvent.setup()
      const task = createMockTask()
      const mockToggleComplete = vi.fn()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={mockToggleComplete}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      const button = screen.getByRole("button", {
        name: "Mark as complete",
      })
      await user.click(button)

      expect(mockToggleComplete).toHaveBeenCalledWith(task)
    })

    it("disables status selector when task is completed", () => {
      const task = createCompletedTask()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      const statusSelect = screen.getByLabelText("Task status")
      expect(statusSelect).toBeDisabled()
    })

    it("disables project selector when task is completed", () => {
      const task = createCompletedTask()

      render(
        <TaskList
          tasks={[task]}
          projects={[mockProject]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      const projectSelect = screen.getByLabelText("Project assignment")
      expect(projectSelect).toBeDisabled()
    })

    it("disables context selector when task is completed", () => {
      const task = createCompletedTask()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[mockContext]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      const contextSelect = screen.getByLabelText("Context assignment")
      expect(contextSelect).toBeDisabled()
    })
  })

  describe("status selection", () => {
    it("calls onUpdateStatus when status changes", async () => {
      const user = userEvent.setup()
      const task = createMockTask({ status: "next" })
      const mockUpdateStatus = vi.fn()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={mockUpdateStatus}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      const statusSelect = screen.getByLabelText("Task status")
      await user.selectOptions(statusSelect, "waiting")

      expect(mockUpdateStatus).toHaveBeenCalledWith(task.id, "waiting")
    })
  })

  describe("project selection", () => {
    it("renders project options", () => {
      const task = createMockTask()

      render(
        <TaskList
          tasks={[task]}
          projects={[mockProject]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      expect(
        screen.getByRole("option", { name: mockProject.name }),
      ).toBeInTheDocument()
    })

    it("calls onUpdateProject when project changes", async () => {
      const user = userEvent.setup()
      const task = createMockTask()
      const mockUpdateProject = vi.fn()

      render(
        <TaskList
          tasks={[task]}
          projects={[mockProject]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={mockUpdateProject}
          onUpdateContext={vi.fn()}
        />,
      )

      const projectSelect = screen.getByLabelText("Project assignment")
      await user.selectOptions(projectSelect, mockProject.id)

      expect(mockUpdateProject).toHaveBeenCalledWith(task.id, mockProject.id)
    })

    it("calls onUpdateProject with null when clearing project", async () => {
      const user = userEvent.setup()
      const task = createMockTask({ project_id: mockProject.id })
      const mockUpdateProject = vi.fn()

      render(
        <TaskList
          tasks={[task]}
          projects={[mockProject]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={mockUpdateProject}
          onUpdateContext={vi.fn()}
        />,
      )

      const projectSelect = screen.getByLabelText("Project assignment")
      await user.selectOptions(projectSelect, "")

      expect(mockUpdateProject).toHaveBeenCalledWith(task.id, null)
    })
  })

  describe("context selection", () => {
    it("renders context options", () => {
      const task = createMockTask()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[mockContext]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      // Context options include icon + name in the option text
      expect(
        screen.getByRole("option", { name: new RegExp(`${mockContext.name}`) }),
      ).toBeInTheDocument()
    })

    it("calls onUpdateContext when context changes", async () => {
      const user = userEvent.setup()
      const task = createMockTask()
      const mockUpdateContext = vi.fn()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[mockContext]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={mockUpdateContext}
        />,
      )

      const contextSelect = screen.getByLabelText("Context assignment")
      await user.selectOptions(contextSelect, mockContext.id)

      expect(mockUpdateContext).toHaveBeenCalledWith(task.id, mockContext.id)
    })
  })

  describe("metadata display", () => {
    it("displays creation date", () => {
      const task = createMockTask()
      const dateString = new Date(task.created_at).toLocaleDateString()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      expect(screen.getByText(dateString)).toBeInTheDocument()
    })

    it("displays completion date for completed tasks", () => {
      const task = createCompletedTask()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      // Check that the completion badge is shown
      expect(screen.getByText(/✓ Completed/)).toBeInTheDocument()
    })
  })

  describe("edit and delete callbacks", () => {
    it("renders edit button when onEdit provided", () => {
      const task = createMockTask()
      const mockEdit = vi.fn()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
          onEdit={mockEdit}
        />,
      )

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument()
    })

    it("does not render edit button when onEdit not provided", () => {
      const task = createMockTask()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
        />,
      )

      // Check that no edit button exists (should only have completion button)
      const buttons = screen.getAllByRole("button")
      const editButtons = buttons.filter((btn) =>
        btn.textContent?.includes("Edit"),
      )
      expect(editButtons).toHaveLength(0)
    })

    it("renders delete button when onDelete provided", () => {
      const task = createMockTask()
      const mockDelete = vi.fn()

      render(
        <TaskList
          tasks={[task]}
          projects={[]}
          contexts={[]}
          onUpdateStatus={vi.fn()}
          onToggleComplete={vi.fn()}
          onUpdateProject={vi.fn()}
          onUpdateContext={vi.fn()}
          onDelete={mockDelete}
        />,
      )

      expect(
        screen.getByRole("button", { name: /delete/i }),
      ).toBeInTheDocument()
    })
  })
})
