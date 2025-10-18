import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { StatusSelect, STATUS_OPTIONS } from "./StatusSelect"

describe("StatusSelect", () => {
  describe("rendering", () => {
    it("renders select with all status options", () => {
      render(
        <StatusSelect
          value="next"
          onChange={vi.fn()}
        />
      )

      const select = screen.getByLabelText("Task status")
      expect(select).toBeInTheDocument()

      STATUS_OPTIONS.forEach((option) => {
        expect(
          screen.getByRole("option", { name: option.label })
        ).toBeInTheDocument()
      })
    })

    it("renders with correct initial value", () => {
      render(
        <StatusSelect
          value="waiting"
          onChange={vi.fn()}
        />
      )

      const select = screen.getByLabelText("Task status") as HTMLSelectElement
      expect(select.value).toBe("waiting")
    })

    it("applies color styling based on selected status", () => {
      const { rerender } = render(
        <StatusSelect
          value="next"
          onChange={vi.fn()}
        />
      )

      const select = screen.getByLabelText("Task status")
      expect(select).toHaveClass("bg-blue-500/20")

      rerender(
        <StatusSelect
          value="waiting"
          onChange={vi.fn()}
        />
      )

      expect(select).toHaveClass("bg-yellow-500/20")

      rerender(
        <StatusSelect
          value="someday"
          onChange={vi.fn()}
        />
      )

      expect(select).toHaveClass("bg-gray-500/20")
    })
  })

  describe("user interaction", () => {
    it("calls onChange when status changes", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <StatusSelect
          value="next"
          onChange={mockOnChange}
        />
      )

      const select = screen.getByLabelText("Task status")
      await user.selectOptions(select, "waiting")

      expect(mockOnChange).toHaveBeenCalledWith("waiting")
    })

    it("calls onChange with correct value for each status", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      const { rerender } = render(
        <StatusSelect
          value="next"
          onChange={mockOnChange}
        />
      )

      const select = screen.getByLabelText("Task status")

      await user.selectOptions(select, "waiting")
      expect(mockOnChange).toHaveBeenCalledWith("waiting")

      mockOnChange.mockClear()
      rerender(
        <StatusSelect
          value="waiting"
          onChange={mockOnChange}
        />
      )

      await user.selectOptions(select, "someday")
      expect(mockOnChange).toHaveBeenCalledWith("someday")

      mockOnChange.mockClear()
      rerender(
        <StatusSelect
          value="someday"
          onChange={mockOnChange}
        />
      )

      await user.selectOptions(select, "next")
      expect(mockOnChange).toHaveBeenCalledWith("next")
    })
  })

  describe("disabled state", () => {
    it("renders disabled when disabled prop is true", () => {
      render(
        <StatusSelect
          value="next"
          onChange={vi.fn()}
          disabled={true}
        />
      )

      const select = screen.getByLabelText("Task status")
      expect(select).toBeDisabled()
    })

    it("applies disabled styling", () => {
      render(
        <StatusSelect
          value="next"
          onChange={vi.fn()}
          disabled={true}
        />
      )

      const select = screen.getByLabelText("Task status")
      expect(select).toHaveClass("disabled:cursor-not-allowed")
      expect(select).toHaveClass("disabled:opacity-50")
    })

    it("does not respond to changes when disabled", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <StatusSelect
          value="next"
          onChange={mockOnChange}
          disabled={true}
        />
      )

      const select = screen.getByLabelText("Task status")

      // Try to change value
      await user.selectOptions(select, "waiting")

      // onChange should not be called
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it("renders enabled by default", () => {
      render(
        <StatusSelect
          value="next"
          onChange={vi.fn()}
        />
      )

      const select = screen.getByLabelText("Task status")
      expect(select).not.toBeDisabled()
    })
  })

  describe("accessibility", () => {
    it("has proper aria-label", () => {
      render(
        <StatusSelect
          value="next"
          onChange={vi.fn()}
        />
      )

      expect(screen.getByLabelText("Task status")).toBeInTheDocument()
    })

    it("options are accessible via keyboard", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <StatusSelect
          value="next"
          onChange={mockOnChange}
        />
      )

      const select = screen.getByLabelText("Task status") as HTMLSelectElement
      select.focus()

      // Native select elements handle keyboard navigation natively
      expect(select).toHaveFocus()

      // Verify we can interact via selectOptions which simulates user selection
      await user.selectOptions(select, "waiting")
      expect(mockOnChange).toHaveBeenCalledWith("waiting")
    })
  })

  describe("edge cases", () => {
    it("handles rapid status changes", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <StatusSelect
          value="next"
          onChange={mockOnChange}
        />
      )

      const select = screen.getByLabelText("Task status")

      await user.selectOptions(select, "waiting")
      await user.selectOptions(select, "someday")
      await user.selectOptions(select, "next")

      expect(mockOnChange).toHaveBeenCalledTimes(3)
      expect(mockOnChange).toHaveBeenNthCalledWith(1, "waiting")
      expect(mockOnChange).toHaveBeenNthCalledWith(2, "someday")
      expect(mockOnChange).toHaveBeenNthCalledWith(3, "next")
    })

    it("maintains current value when onChange is called", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      const { rerender } = render(
        <StatusSelect
          value="next"
          onChange={mockOnChange}
        />
      )

      const select = screen.getByLabelText("Task status") as HTMLSelectElement
      expect(select.value).toBe("next")

      await user.selectOptions(select, "waiting")

      rerender(
        <StatusSelect
          value="waiting"
          onChange={mockOnChange}
        />
      )

      expect(select.value).toBe("waiting")
    })
  })
})
