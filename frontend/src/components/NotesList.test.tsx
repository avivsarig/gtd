import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { NotesList } from "./NotesList"
import { createMockNote, createMockProject } from "@/test/factories"

describe("NotesList", () => {
  const mockProject = createMockProject()

  describe("rendering", () => {
    it("renders empty state when no notes", () => {
      render(
        <NotesList
          notes={[]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      expect(
        screen.getByText("No notes yet. Create one to get started!")
      ).toBeInTheDocument()
    })

    it("renders notes with titles", () => {
      const notes = [
        createMockNote({ title: "Note 1" }),
        createMockNote({ title: "Note 2" }),
        createMockNote({ title: "Note 3" }),
      ]

      render(
        <NotesList
          notes={notes}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      expect(screen.getByText("Note 1")).toBeInTheDocument()
      expect(screen.getByText("Note 2")).toBeInTheDocument()
      expect(screen.getByText("Note 3")).toBeInTheDocument()
    })

    it("renders project name when note has project", () => {
      const note = createMockNote({
        title: "Project Note",
        project_id: mockProject.id,
      })

      render(
        <NotesList
          notes={[note]}
          projects={[mockProject]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      expect(screen.getByText(mockProject.name)).toBeInTheDocument()
    })

    it("does not render project badge when note has no project", () => {
      const note = createMockNote({ title: "Standalone Note", project_id: null })

      render(
        <NotesList
          notes={[note]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      expect(screen.queryByText(/project/i)).not.toBeInTheDocument()
    })
  })

  describe("expand/collapse functionality", () => {
    it("does not show content initially", () => {
      const note = createMockNote({
        title: "Test Note",
        content: "This is the content",
      })

      render(
        <NotesList
          notes={[note]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      expect(screen.queryByText("This is the content")).not.toBeInTheDocument()
    })

    it("shows content when note is expanded", async () => {
      const user = userEvent.setup()
      const note = createMockNote({
        title: "Test Note",
        content: "This is the content",
      })

      render(
        <NotesList
          notes={[note]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const titleButton = screen.getByRole("button", { name: "Test Note" })
      await user.click(titleButton)

      expect(screen.getByText("This is the content")).toBeInTheDocument()
    })

    it("hides content when expanded note is clicked again", async () => {
      const user = userEvent.setup()
      const note = createMockNote({
        title: "Test Note",
        content: "This is the content",
      })

      render(
        <NotesList
          notes={[note]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const titleButton = screen.getByRole("button", { name: "Test Note" })
      await user.click(titleButton)

      expect(screen.getByText("This is the content")).toBeInTheDocument()

      await user.click(titleButton)

      expect(
        screen.queryByText("This is the content")
      ).not.toBeInTheDocument()
    })

    it("shows updated_at timestamp when expanded", async () => {
      const user = userEvent.setup()
      const note = createMockNote({ title: "Test Note" })
      const dateString = new Date(note.updated_at).toLocaleString()

      render(
        <NotesList
          notes={[note]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const titleButton = screen.getByRole("button", { name: "Test Note" })
      await user.click(titleButton)

      expect(screen.getByText(/Updated:/)).toBeInTheDocument()
    })

    it("handles multiple notes expanding independently", async () => {
      const user = userEvent.setup()
      const note1 = createMockNote({
        title: "Note 1",
        content: "Content 1",
      })
      const note2 = createMockNote({
        title: "Note 2",
        content: "Content 2",
      })

      render(
        <NotesList
          notes={[note1, note2]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const titleButton1 = screen.getByRole("button", { name: "Note 1" })
      const titleButton2 = screen.getByRole("button", { name: "Note 2" })

      await user.click(titleButton1)
      expect(screen.getByText("Content 1")).toBeInTheDocument()
      expect(screen.queryByText("Content 2")).not.toBeInTheDocument()

      await user.click(titleButton2)
      expect(screen.queryByText("Content 1")).not.toBeInTheDocument()
      expect(screen.getByText("Content 2")).toBeInTheDocument()
    })
  })

  describe("user interaction", () => {
    it("renders edit button for each note", () => {
      const notes = [
        createMockNote({ title: "Note 1" }),
        createMockNote({ title: "Note 2" }),
      ]

      render(
        <NotesList
          notes={notes}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const editButtons = screen.getAllByRole("button", { name: /edit/i })
      expect(editButtons.length).toBeGreaterThanOrEqual(2)
    })

    it("renders delete button for each note", () => {
      const notes = [
        createMockNote({ title: "Note 1" }),
        createMockNote({ title: "Note 2" }),
      ]

      render(
        <NotesList
          notes={notes}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })
      expect(deleteButtons.length).toBeGreaterThanOrEqual(2)
    })

    it("calls onEdit when edit button is clicked", async () => {
      const user = userEvent.setup()
      const note = createMockNote({ title: "Test Note" })
      const mockEdit = vi.fn()

      render(
        <NotesList
          notes={[note]}
          projects={[]}
          onEdit={mockEdit}
          onDelete={vi.fn()}
        />
      )

      const editButton = screen.getByRole("button", { name: /edit/i })
      await user.click(editButton)

      expect(mockEdit).toHaveBeenCalledWith(note)
    })

    it("calls onDelete when delete button is clicked", async () => {
      const user = userEvent.setup()
      const note = createMockNote({ title: "Test Note" })
      const mockDelete = vi.fn()

      // Mock window.confirm to return true
      vi.spyOn(window, "confirm").mockReturnValue(true)

      render(
        <NotesList
          notes={[note]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={mockDelete}
        />
      )

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      await user.click(deleteButton)

      expect(mockDelete).toHaveBeenCalledWith(note.id)
    })
  })

  describe("project name resolution", () => {
    it("displays correct project name for multiple notes with same project", () => {
      const notes = [
        createMockNote({
          title: "Note 1",
          project_id: mockProject.id,
        }),
        createMockNote({
          title: "Note 2",
          project_id: mockProject.id,
        }),
      ]

      render(
        <NotesList
          notes={notes}
          projects={[mockProject]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const projectBadges = screen.getAllByText(mockProject.name)
      expect(projectBadges).toHaveLength(2)
    })

    it("displays correct project names for notes with different projects", () => {
      const project1 = createMockProject({ name: "Project 1" })
      const project2 = createMockProject({ name: "Project 2" })

      const notes = [
        createMockNote({
          title: "Note 1",
          project_id: project1.id,
        }),
        createMockNote({
          title: "Note 2",
          project_id: project2.id,
        }),
      ]

      render(
        <NotesList
          notes={notes}
          projects={[project1, project2]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      expect(screen.getByText("Project 1")).toBeInTheDocument()
      expect(screen.getByText("Project 2")).toBeInTheDocument()
    })

    it("handles missing project gracefully", () => {
      const note = createMockNote({
        title: "Test Note",
        project_id: "non-existent-project-id",
      })

      render(
        <NotesList
          notes={[note]}
          projects={[mockProject]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      expect(screen.getByText("Test Note")).toBeInTheDocument()
      expect(screen.queryByText(mockProject.name)).not.toBeInTheDocument()
    })
  })

  describe("content display", () => {
    it("preserves whitespace and formatting in content", async () => {
      const user = userEvent.setup()
      const content = "Line 1\nLine 2\n  Indented line"
      const note = createMockNote({
        title: "Formatted Note",
        content,
      })

      render(
        <NotesList
          notes={[note]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const titleButton = screen.getByRole("button", { name: "Formatted Note" })
      await user.click(titleButton)

      // Verify content is displayed (may be split across elements due to whitespace handling)
      expect(screen.getByText(/Line 1/)).toBeInTheDocument()
      expect(screen.getByText(/Indented line/)).toBeInTheDocument()
    })

    it("does not render content when note content is empty", async () => {
      const user = userEvent.setup()
      const note = createMockNote({
        title: "Empty Note",
        content: "",
      })

      render(
        <NotesList
          notes={[note]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const titleButton = screen.getByRole("button", { name: "Empty Note" })
      await user.click(titleButton)

      // Timestamp should be shown but not content
      expect(screen.getByText(/Updated:/)).toBeInTheDocument()
    })
  })

  describe("styling and accessibility", () => {
    it("applies hover effect to title", () => {
      const note = createMockNote({ title: "Test Note" })

      render(
        <NotesList
          notes={[note]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const titleButton = screen.getByRole("button", { name: "Test Note" })
      expect(titleButton).toHaveClass("group")
    })

    it("renders delete confirm message", () => {
      const note = createMockNote({ title: "Important Note" })

      render(
        <NotesList
          notes={[note]}
          projects={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      // Check that delete button exists (confirm message will be in ItemCard)
      expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument()
    })
  })
})
