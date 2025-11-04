import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { ProjectSelect } from "./ProjectSelect"
import { createMockProject } from "@/test/factories"

describe("ProjectSelect", () => {
  const mockProjects = [
    createMockProject({ name: "Project Alpha" }),
    createMockProject({ name: "Project Beta" }),
    createMockProject({ name: "Project Gamma" }),
  ]

  describe("rendering", () => {
    it("renders select with project options", () => {
      render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={vi.fn()}
        />,
      )

      mockProjects.forEach((project) => {
        expect(
          screen.getByRole("option", { name: project.name }),
        ).toBeInTheDocument()
      })
    })

    it("renders 'No Project' option", () => {
      render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={vi.fn()}
        />,
      )

      expect(
        screen.getByRole("option", { name: "No Project" }),
      ).toBeInTheDocument()
    })

    it("renders with correct initial value", () => {
      const projectId = mockProjects[0].id

      render(
        <ProjectSelect
          value={projectId}
          projects={mockProjects}
          onChange={vi.fn()}
        />,
      )

      const select = screen.getByLabelText(
        "Project assignment",
      ) as HTMLSelectElement
      expect(select.value).toBe(projectId)
    })

    it("renders with empty value when value is null", () => {
      render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={vi.fn()}
        />,
      )

      const select = screen.getByLabelText(
        "Project assignment",
      ) as HTMLSelectElement
      expect(select.value).toBe("")
    })

    it("renders with empty value when value is undefined", () => {
      render(
        <ProjectSelect
          value={undefined}
          projects={mockProjects}
          onChange={vi.fn()}
        />,
      )

      const select = screen.getByLabelText(
        "Project assignment",
      ) as HTMLSelectElement
      expect(select.value).toBe("")
    })

    it("applies purple color styling", () => {
      render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={vi.fn()}
        />,
      )

      const select = screen.getByLabelText("Project assignment")
      expect(select).toHaveClass("bg-purple-500/20")
      expect(select).toHaveClass("text-purple-400")
    })
  })

  describe("user interaction", () => {
    it("calls onChange when project is selected", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={mockOnChange}
        />,
      )

      const select = screen.getByLabelText("Project assignment")
      await user.selectOptions(select, mockProjects[0].id)

      expect(mockOnChange).toHaveBeenCalledWith(mockProjects[0].id)
    })

    it("calls onChange with null when 'No Project' is selected", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <ProjectSelect
          value={mockProjects[0].id}
          projects={mockProjects}
          onChange={mockOnChange}
        />,
      )

      const select = screen.getByLabelText("Project assignment")
      await user.selectOptions(select, "")

      expect(mockOnChange).toHaveBeenCalledWith(null)
    })

    it("handles changing between different projects", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      const { rerender } = render(
        <ProjectSelect
          value={mockProjects[0].id}
          projects={mockProjects}
          onChange={mockOnChange}
        />,
      )

      const select = screen.getByLabelText("Project assignment")

      await user.selectOptions(select, mockProjects[1].id)
      expect(mockOnChange).toHaveBeenCalledWith(mockProjects[1].id)

      mockOnChange.mockClear()
      rerender(
        <ProjectSelect
          value={mockProjects[1].id}
          projects={mockProjects}
          onChange={mockOnChange}
        />,
      )

      await user.selectOptions(select, mockProjects[2].id)
      expect(mockOnChange).toHaveBeenCalledWith(mockProjects[2].id)
    })
  })

  describe("disabled state", () => {
    it("renders disabled when disabled prop is true", () => {
      render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={vi.fn()}
          disabled={true}
        />,
      )

      const select = screen.getByLabelText("Project assignment")
      expect(select).toBeDisabled()
    })

    it("applies disabled styling", () => {
      render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={vi.fn()}
          disabled={true}
        />,
      )

      const select = screen.getByLabelText("Project assignment")
      expect(select).toHaveClass("disabled:cursor-not-allowed")
      expect(select).toHaveClass("disabled:opacity-50")
    })

    it("does not respond to changes when disabled", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={mockOnChange}
          disabled={true}
        />,
      )

      const select = screen.getByLabelText("Project assignment")

      try {
        await user.selectOptions(select, mockProjects[0].id)
      } catch {
        // Expected to fail or not respond
      }

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it("renders enabled by default", () => {
      render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={vi.fn()}
        />,
      )

      const select = screen.getByLabelText("Project assignment")
      expect(select).toBeEnabled()
    })
  })

  describe("empty projects list", () => {
    it("renders only 'No Project' when projects list is empty", () => {
      render(<ProjectSelect value={null} projects={[]} onChange={vi.fn()} />)

      expect(
        screen.getByRole("option", { name: "No Project" }),
      ).toBeInTheDocument()

      const options = screen.getAllByRole("option")
      expect(options).toHaveLength(1)
    })
  })

  describe("accessibility", () => {
    it("has proper aria-label", () => {
      render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={vi.fn()}
        />,
      )

      expect(screen.getByLabelText("Project assignment")).toBeInTheDocument()
    })

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={mockOnChange}
        />,
      )

      const select = screen.getByLabelText(
        "Project assignment",
      ) as HTMLSelectElement
      select.focus()

      // Native select elements handle keyboard navigation natively
      expect(select).toHaveFocus()

      // Verify we can interact via selectOptions
      await user.selectOptions(select, mockProjects[0].id)
      expect(mockOnChange).toHaveBeenCalledWith(mockProjects[0].id)
    })
  })

  describe("edge cases", () => {
    it("handles invalid project id gracefully", () => {
      render(
        <ProjectSelect
          value="non-existent-id"
          projects={mockProjects}
          onChange={vi.fn()}
        />,
      )

      const select = screen.getByLabelText(
        "Project assignment",
      ) as HTMLSelectElement
      // HTML select normalizes invalid values to first valid value (empty string in this case)
      expect(select.value).toBe("")
    })

    it("updates when projects list changes", () => {
      const newProject = createMockProject({ name: "New Project" })
      const { rerender } = render(
        <ProjectSelect
          value={null}
          projects={mockProjects}
          onChange={vi.fn()}
        />,
      )

      expect(
        screen.queryByRole("option", { name: "New Project" }),
      ).not.toBeInTheDocument()

      rerender(
        <ProjectSelect
          value={null}
          projects={[...mockProjects, newProject]}
          onChange={vi.fn()}
        />,
      )

      expect(
        screen.getByRole("option", { name: "New Project" }),
      ).toBeInTheDocument()
    })
  })
})
