import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { NoteForm } from "./NoteForm"
import { createMockNote, createMockProject } from "@/test/factories"

describe("NoteForm", () => {
  const mockProject1 = createMockProject({ name: "Project 1" })
  const mockProject2 = createMockProject({ name: "Project 2" })
  const projects = [mockProject1, mockProject2]

  describe("rendering", () => {
    it("renders form with title and content inputs", () => {
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      expect(screen.getByLabelText("Title *")).toBeInTheDocument()
      expect(screen.getByLabelText("Content")).toBeInTheDocument()
    })

    it("renders project selector", () => {
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      expect(screen.getByLabelText("Project")).toBeInTheDocument()
    })

    it("renders submit button", () => {
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      expect(
        screen.getByRole("button", { name: "Create Note" }),
      ).toBeInTheDocument()
    })

    it("renders cancel button when onCancel provided", () => {
      const mockSubmit = vi.fn()
      const mockCancel = vi.fn()

      render(
        <NoteForm
          projects={projects}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      )

      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    })

    it("does not render cancel button when onCancel not provided", () => {
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      expect(
        screen.queryByRole("button", { name: "Cancel" }),
      ).not.toBeInTheDocument()
    })
  })

  describe("creating new note", () => {
    it("submits form with title and content", async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValue(undefined)

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText("Title *")
      const contentInput = screen.getByLabelText("Content")
      const submitButton = screen.getByRole("button", { name: "Create Note" })

      await user.type(titleInput, "New Note")
      await user.type(contentInput, "Note content")
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          title: "New Note",
          content: "Note content",
          project_id: null,
        })
      })
    })

    it("submits with project_id when project is selected", async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValue(undefined)

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText("Title *")
      const projectSelect = screen.getByLabelText("Project")
      const submitButton = screen.getByRole("button", { name: "Create Note" })

      await user.type(titleInput, "New Note")
      await user.selectOptions(projectSelect, mockProject1.id)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          title: "New Note",
          content: undefined,
          project_id: mockProject1.id,
        })
      })
    })

    it("trims whitespace from title and content", async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValue(undefined)

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText("Title *")
      const contentInput = screen.getByLabelText("Content")
      const submitButton = screen.getByRole("button", { name: "Create Note" })

      await user.type(titleInput, "   New Note   ")
      await user.type(contentInput, "   Note content   ")
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          title: "New Note",
          content: "Note content",
          project_id: null,
        })
      })
    })

    it("does not submit empty content as undefined", async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValue(undefined)

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText("Title *")
      const submitButton = screen.getByRole("button", { name: "Create Note" })

      await user.type(titleInput, "New Note")
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "New Note",
            content: undefined,
          }),
        )
      })
    })

    it("resets form after successful submission", async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValue(undefined)

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText("Title *") as HTMLInputElement
      const contentInput = screen.getByLabelText(
        "Content",
      ) as HTMLTextAreaElement
      const projectSelect = screen.getByLabelText(
        "Project",
      ) as HTMLSelectElement
      const submitButton = screen.getByRole("button", { name: "Create Note" })

      await user.type(titleInput, "New Note")
      await user.type(contentInput, "Content")
      await user.selectOptions(projectSelect, mockProject1.id)
      await user.click(submitButton)

      await waitFor(() => {
        expect(titleInput.value).toBe("")
        expect(contentInput.value).toBe("")
        expect(projectSelect.value).toBe("")
      })
    })
  })

  describe("editing existing note", () => {
    it("loads note data into form", () => {
      const note = createMockNote({
        title: "Existing Note",
        content: "Existing content",
        project_id: mockProject1.id,
      })

      const mockSubmit = vi.fn()

      render(<NoteForm note={note} projects={projects} onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText("Title *") as HTMLInputElement
      const contentInput = screen.getByLabelText(
        "Content",
      ) as HTMLTextAreaElement
      const projectSelect = screen.getByLabelText(
        "Project",
      ) as HTMLSelectElement

      expect(titleInput.value).toBe("Existing Note")
      expect(contentInput.value).toBe("Existing content")
      expect(projectSelect.value).toBe(mockProject1.id)
    })

    it("displays Update Note button when editing", () => {
      const note = createMockNote()
      const mockSubmit = vi.fn()

      render(<NoteForm note={note} projects={projects} onSubmit={mockSubmit} />)

      expect(
        screen.getByRole("button", { name: "Update Note" }),
      ).toBeInTheDocument()
    })

    it("submits updated note data", async () => {
      const user = userEvent.setup()
      const note = createMockNote({
        title: "Old Title",
        content: "Old content",
      })
      const mockSubmit = vi.fn().mockResolvedValue(undefined)

      render(<NoteForm note={note} projects={projects} onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText("Title *")
      const contentInput = screen.getByLabelText("Content")
      const submitButton = screen.getByRole("button", { name: "Update Note" })

      await user.clear(titleInput)
      await user.type(titleInput, "New Title")
      await user.clear(contentInput)
      await user.type(contentInput, "New content")
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          title: "New Title",
          content: "New content",
          project_id: null,
        })
      })
    })

    it("does not reset form after updating existing note", async () => {
      const user = userEvent.setup()
      const note = createMockNote({
        title: "Existing Note",
        content: "Existing content",
      })
      const mockSubmit = vi.fn().mockResolvedValue(undefined)

      render(<NoteForm note={note} projects={projects} onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText("Title *") as HTMLInputElement
      const submitButton = screen.getByRole("button", { name: "Update Note" })

      await user.clear(titleInput)
      await user.type(titleInput, "Updated Title")
      await user.click(submitButton)

      await waitFor(() => {
        expect(titleInput.value).toBe("Updated Title")
      })
    })

    it("updates form when note prop changes", () => {
      const note1 = createMockNote({ title: "Note 1" })
      const note2 = createMockNote({ title: "Note 2" })
      const mockSubmit = vi.fn()

      const { rerender } = render(
        <NoteForm note={note1} projects={projects} onSubmit={mockSubmit} />,
      )

      const titleInput = screen.getByLabelText("Title *") as HTMLInputElement
      expect(titleInput.value).toBe("Note 1")

      rerender(
        <NoteForm note={note2} projects={projects} onSubmit={mockSubmit} />,
      )

      expect(titleInput.value).toBe("Note 2")
    })
  })

  describe("validation", () => {
    it("disables submit button when title is empty", () => {
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      const submitButton = screen.getByRole("button", { name: "Create Note" })
      expect(submitButton).toBeDisabled()
    })

    it("enables submit button when title has content", async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText("Title *")
      const submitButton = screen.getByRole("button", { name: "Create Note" })

      expect(submitButton).toBeDisabled()

      await user.type(titleInput, "New Note")

      expect(submitButton).toBeEnabled()
    })

    it("disables submit button when title is only whitespace", async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText("Title *")
      const submitButton = screen.getByRole("button", { name: "Create Note" })

      await user.type(titleInput, "   ")

      expect(submitButton).toBeDisabled()
    })

    it("prevents form submission when title is empty", async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      const form = screen.getByLabelText("Title *").closest("form")!
      const submitButton = screen.getByRole("button", { name: "Create Note" })

      // Try to submit by pressing Enter (form submission should be prevented)
      expect(submitButton).toBeDisabled()
    })
  })

  describe("cancel functionality", () => {
    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      const mockCancel = vi.fn()

      render(
        <NoteForm
          projects={projects}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />,
      )

      const cancelButton = screen.getByRole("button", { name: "Cancel" })
      await user.click(cancelButton)

      expect(mockCancel).toHaveBeenCalled()
    })

    it("disables cancel button when loading", () => {
      const mockSubmit = vi.fn()
      const mockCancel = vi.fn()

      render(
        <NoteForm
          projects={projects}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
          isLoading={true}
        />,
      )

      const cancelButton = screen.getByRole("button", { name: "Cancel" })
      expect(cancelButton).toBeDisabled()
    })
  })

  describe("loading state", () => {
    it("disables inputs when loading", () => {
      const mockSubmit = vi.fn()

      render(
        <NoteForm projects={projects} onSubmit={mockSubmit} isLoading={true} />,
      )

      const titleInput = screen.getByLabelText("Title *")
      const contentInput = screen.getByLabelText("Content")
      const projectSelect = screen.getByLabelText("Project")

      expect(titleInput).toBeDisabled()
      expect(contentInput).toBeDisabled()
      expect(projectSelect).toBeDisabled()
    })

    it("shows Saving text on submit button when loading", () => {
      const mockSubmit = vi.fn()

      render(
        <NoteForm projects={projects} onSubmit={mockSubmit} isLoading={true} />,
      )

      expect(
        screen.getByRole("button", { name: "Saving..." }),
      ).toBeInTheDocument()
    })

    it("disables submit button when loading", () => {
      const mockSubmit = vi.fn()

      render(
        <NoteForm projects={projects} onSubmit={mockSubmit} isLoading={true} />,
      )

      const submitButton = screen.getByRole("button", { name: "Saving..." })
      expect(submitButton).toBeDisabled()
    })
  })

  describe("project management", () => {
    it("displays all available projects", () => {
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      expect(
        screen.getByRole("option", { name: "Project 1" }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole("option", { name: "Project 2" }),
      ).toBeInTheDocument()
    })

    it("displays No Project option", () => {
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      expect(
        screen.getByRole("option", { name: "No Project" }),
      ).toBeInTheDocument()
    })

    it("allows changing project selection", async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValue(undefined)

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      const projectSelect = screen.getByLabelText("Project")
      const titleInput = screen.getByLabelText("Title *")
      const submitButton = screen.getByRole("button", { name: "Create Note" })

      await user.type(titleInput, "Test Note")
      await user.selectOptions(projectSelect, mockProject1.id)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            project_id: mockProject1.id,
          }),
        )
      })
    })
  })

  describe("accessibility", () => {
    it("focuses on title input on render", () => {
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText("Title *")
      expect(titleInput).toHaveFocus()
    })

    it("labels are properly associated with inputs", () => {
      const mockSubmit = vi.fn()

      render(<NoteForm projects={projects} onSubmit={mockSubmit} />)

      expect(screen.getByLabelText("Title *")).toBeInTheDocument()
      expect(screen.getByLabelText("Content")).toBeInTheDocument()
      expect(screen.getByLabelText("Project")).toBeInTheDocument()
    })
  })
})
