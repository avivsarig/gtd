import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { BaseSelect, type Option } from "./select"

describe("BaseSelect", () => {
  const mockOptions: Option[] = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ]

  describe("Rendering", () => {
    it("should render select with options", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      expect(select).toBeInTheDocument()

      mockOptions.forEach((option) => {
        expect(
          screen.getByRole("option", { name: option.label }),
        ).toBeInTheDocument()
      })
    })

    it("should render with placeholder", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          placeholder="Choose one"
          aria-label="Test select"
        />,
      )

      expect(
        screen.getByRole("option", { name: "Choose one" }),
      ).toBeInTheDocument()
    })

    it("should render with custom placeholder", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          placeholder="Custom placeholder"
          aria-label="Test select"
        />,
      )

      expect(
        screen.getByRole("option", { name: "Custom placeholder" }),
      ).toBeInTheDocument()
    })

    it("should render without placeholder when not provided", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          aria-label="Test select"
        />,
      )

      const options = screen.getAllByRole("option")
      expect(options).toHaveLength(mockOptions.length + 1) // +1 for default placeholder
    })

    it("should render selected value", () => {
      render(
        <BaseSelect
          value="option2"
          options={mockOptions}
          onChange={vi.fn()}
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select") as HTMLSelectElement
      expect(select.value).toBe("option2")
    })

    it("should render with icons in options", () => {
      const optionsWithIcons: Option[] = [
        { value: "home", label: "Home", icon: "🏠" },
        { value: "work", label: "Work", icon: "💼" },
      ]

      render(
        <BaseSelect
          value={null}
          options={optionsWithIcons}
          onChange={vi.fn()}
          aria-label="Context select"
        />,
      )

      expect(
        screen.getByRole("option", { name: /🏠 Home/ }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole("option", { name: /💼 Work/ }),
      ).toBeInTheDocument()
    })
  })

  describe("Variants", () => {
    it("should apply default variant classes", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          variant="default"
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      expect(select).toHaveClass(
        "bg-background",
        "border-border",
        "focus:ring-primary",
      )
    })

    it("should apply project variant classes", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          variant="project"
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      expect(select).toHaveClass(
        "border-purple-500/30",
        "bg-purple-500/20",
        "text-purple-400",
      )
    })

    it("should apply context variant classes", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          variant="context"
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      expect(select).toHaveClass(
        "border-green-500/30",
        "bg-green-500/20",
        "text-green-400",
      )
    })

    it("should apply dynamic color for status variant", () => {
      const statusOptions: Option[] = [
        {
          value: "active",
          label: "Active",
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        },
        {
          value: "inactive",
          label: "Inactive",
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        },
      ]

      const { rerender } = render(
        <BaseSelect
          value="active"
          options={statusOptions}
          onChange={vi.fn()}
          variant="status"
          aria-label="Status select"
        />,
      )

      const select = screen.getByLabelText("Status select")
      expect(select).toHaveClass(
        "bg-blue-500/20",
        "text-blue-400",
        "border-blue-500/30",
      )

      rerender(
        <BaseSelect
          value="inactive"
          options={statusOptions}
          onChange={vi.fn()}
          variant="status"
          aria-label="Status select"
        />,
      )

      expect(select).toHaveClass(
        "bg-gray-500/20",
        "text-gray-400",
        "border-gray-500/30",
      )
    })
  })

  describe("User Interaction", () => {
    it("should call onChange with selected value", async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={handleChange}
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      await user.selectOptions(select, "option2")

      expect(handleChange).toHaveBeenCalledWith("option2")
    })

    it("should call onChange with null when empty value selected", async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(
        <BaseSelect
          value="option1"
          options={mockOptions}
          onChange={handleChange}
          placeholder="None"
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      await user.selectOptions(select, "")

      expect(handleChange).toHaveBeenCalledWith(null)
    })

    it("should change selected option", async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(
        <BaseSelect
          value="option1"
          options={mockOptions}
          onChange={handleChange}
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      await user.selectOptions(select, "option3")

      expect(handleChange).toHaveBeenCalledWith("option3")
    })
  })

  describe("Disabled State", () => {
    it("should render as disabled", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          disabled
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      expect(select).toBeDisabled()
    })

    it("should not call onChange when disabled", async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={handleChange}
          disabled
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      await user.selectOptions(select, "option1")

      expect(handleChange).not.toHaveBeenCalled()
    })

    it("should have disabled styling", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          disabled
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      expect(select).toHaveClass(
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
      )
    })
  })

  describe("Accessibility", () => {
    it("should have proper aria-label", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          aria-label="Accessible select"
        />,
      )

      expect(screen.getByLabelText("Accessible select")).toBeInTheDocument()
    })

    it("should be keyboard navigable", () => {
      const handleChange = vi.fn()

      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={handleChange}
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      select.focus()

      expect(select).toHaveFocus()
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty options array", () => {
      render(
        <BaseSelect
          value={null}
          options={[]}
          onChange={vi.fn()}
          aria-label="Empty select"
        />,
      )

      const select = screen.getByLabelText("Empty select")
      expect(select).toBeInTheDocument()
    })

    it("should handle null value", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select") as HTMLSelectElement
      expect(select.value).toBe("")
    })

    it("should handle undefined value", () => {
      render(
        <BaseSelect
          value={undefined}
          options={mockOptions}
          onChange={vi.fn()}
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select") as HTMLSelectElement
      expect(select.value).toBe("")
    })

    it("should accept custom className", () => {
      render(
        <BaseSelect
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          className="custom-class"
          aria-label="Test select"
        />,
      )

      const select = screen.getByLabelText("Test select")
      expect(select).toHaveClass("custom-class")
    })

    it("should forward ref", () => {
      const ref = vi.fn()

      render(
        <BaseSelect
          ref={ref}
          value={null}
          options={mockOptions}
          onChange={vi.fn()}
          aria-label="Test select"
        />,
      )

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLSelectElement))
    })
  })

  describe("Type Safety", () => {
    it("should work with string types", () => {
      const stringOptions: Option<string>[] = [
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ]

      render(
        <BaseSelect<string>
          value="a"
          options={stringOptions}
          onChange={vi.fn()}
          aria-label="String select"
        />,
      )

      expect(screen.getByLabelText("String select")).toBeInTheDocument()
    })
  })
})
