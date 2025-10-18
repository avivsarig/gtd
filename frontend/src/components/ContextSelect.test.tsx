import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { ContextSelect } from "./ContextSelect"
import { createMockContext } from "@/test/factories"

describe("ContextSelect", () => {
  const mockContexts = [
    createMockContext({ name: "Home", icon: "🏠" }),
    createMockContext({ name: "Computer", icon: "💻" }),
    createMockContext({ name: "Phone", icon: "📱" }),
  ]

  describe("rendering", () => {
    it("renders select with context options", () => {
      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={vi.fn()}
        />
      )

      mockContexts.forEach((context) => {
        expect(
          screen.getByRole("option", {
            name: new RegExp(`${context.icon}.*${context.name}|${context.name}`)
          })
        ).toBeInTheDocument()
      })
    })

    it("renders 'No Context' option", () => {
      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={vi.fn()}
        />
      )

      expect(
        screen.getByRole("option", { name: "No Context" })
      ).toBeInTheDocument()
    })

    it("renders with correct initial value", () => {
      const contextId = mockContexts[0].id

      render(
        <ContextSelect
          value={contextId}
          contexts={mockContexts}
          onChange={vi.fn()}
        />
      )

      const select = screen.getByLabelText("Context assignment") as HTMLSelectElement
      expect(select.value).toBe(contextId)
    })

    it("renders with empty value when value is null", () => {
      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={vi.fn()}
        />
      )

      const select = screen.getByLabelText("Context assignment") as HTMLSelectElement
      expect(select.value).toBe("")
    })

    it("renders with empty value when value is undefined", () => {
      render(
        <ContextSelect
          value={undefined}
          contexts={mockContexts}
          onChange={vi.fn()}
        />
      )

      const select = screen.getByLabelText("Context assignment") as HTMLSelectElement
      expect(select.value).toBe("")
    })

    it("displays context icons when available", () => {
      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={vi.fn()}
        />
      )

      mockContexts.forEach((context) => {
        if (context.icon) {
          // Icon is part of the option text, check for option with icon+name
          expect(
            screen.getByRole("option", { name: new RegExp(`${context.icon}.*${context.name}`) })
          ).toBeInTheDocument()
        }
      })
    })

    it("displays context name without icon when icon is null", () => {
      const contextWithoutIcon = createMockContext({ name: "Work", icon: null })

      render(
        <ContextSelect
          value={null}
          contexts={[contextWithoutIcon]}
          onChange={vi.fn()}
        />
      )

      expect(
        screen.getByRole("option", { name: "Work" })
      ).toBeInTheDocument()
    })

    it("applies green color styling", () => {
      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={vi.fn()}
        />
      )

      const select = screen.getByLabelText("Context assignment")
      expect(select).toHaveClass("bg-green-500/20")
      expect(select).toHaveClass("text-green-400")
    })
  })

  describe("user interaction", () => {
    it("calls onChange when context is selected", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={mockOnChange}
        />
      )

      const select = screen.getByLabelText("Context assignment")
      await user.selectOptions(select, mockContexts[0].id)

      expect(mockOnChange).toHaveBeenCalledWith(mockContexts[0].id)
    })

    it("calls onChange with null when 'No Context' is selected", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <ContextSelect
          value={mockContexts[0].id}
          contexts={mockContexts}
          onChange={mockOnChange}
        />
      )

      const select = screen.getByLabelText("Context assignment")
      await user.selectOptions(select, "")

      expect(mockOnChange).toHaveBeenCalledWith(null)
    })

    it("handles changing between different contexts", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      const { rerender } = render(
        <ContextSelect
          value={mockContexts[0].id}
          contexts={mockContexts}
          onChange={mockOnChange}
        />
      )

      const select = screen.getByLabelText("Context assignment")

      await user.selectOptions(select, mockContexts[1].id)
      expect(mockOnChange).toHaveBeenCalledWith(mockContexts[1].id)

      mockOnChange.mockClear()
      rerender(
        <ContextSelect
          value={mockContexts[1].id}
          contexts={mockContexts}
          onChange={mockOnChange}
        />
      )

      await user.selectOptions(select, mockContexts[2].id)
      expect(mockOnChange).toHaveBeenCalledWith(mockContexts[2].id)
    })
  })

  describe("disabled state", () => {
    it("renders disabled when disabled prop is true", () => {
      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={vi.fn()}
          disabled={true}
        />
      )

      const select = screen.getByLabelText("Context assignment")
      expect(select).toBeDisabled()
    })

    it("applies disabled styling", () => {
      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={vi.fn()}
          disabled={true}
        />
      )

      const select = screen.getByLabelText("Context assignment")
      expect(select).toHaveClass("disabled:cursor-not-allowed")
      expect(select).toHaveClass("disabled:opacity-50")
    })

    it("does not respond to changes when disabled", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={mockOnChange}
          disabled={true}
        />
      )

      const select = screen.getByLabelText("Context assignment")

      try {
        await user.selectOptions(select, mockContexts[0].id)
      } catch {
        // Expected to fail or not respond
      }

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it("renders enabled by default", () => {
      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={vi.fn()}
        />
      )

      const select = screen.getByLabelText("Context assignment")
      expect(select).not.toBeDisabled()
    })
  })

  describe("empty contexts list", () => {
    it("renders only 'No Context' when contexts list is empty", () => {
      render(
        <ContextSelect
          value={null}
          contexts={[]}
          onChange={vi.fn()}
        />
      )

      expect(
        screen.getByRole("option", { name: "No Context" })
      ).toBeInTheDocument()

      const options = screen.getAllByRole("option")
      expect(options).toHaveLength(1)
    })
  })

  describe("accessibility", () => {
    it("has proper aria-label", () => {
      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={vi.fn()}
        />
      )

      expect(
        screen.getByLabelText("Context assignment")
      ).toBeInTheDocument()
    })

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={mockOnChange}
        />
      )

      const select = screen.getByLabelText("Context assignment") as HTMLSelectElement
      select.focus()

      // Native select elements handle keyboard navigation natively
      expect(select).toHaveFocus()

      // Verify we can interact via selectOptions
      await user.selectOptions(select, mockContexts[0].id)
      expect(mockOnChange).toHaveBeenCalledWith(mockContexts[0].id)
    })
  })

  describe("edge cases", () => {
    it("handles invalid context id gracefully", () => {
      render(
        <ContextSelect
          value="non-existent-id"
          contexts={mockContexts}
          onChange={vi.fn()}
        />
      )

      const select = screen.getByLabelText("Context assignment") as HTMLSelectElement
      // HTML select normalizes invalid values to first valid value (empty string in this case)
      expect(select.value).toBe("")
    })

    it("updates when contexts list changes", () => {
      const newContext = createMockContext({ name: "Shopping", icon: "🛒" })
      const { rerender } = render(
        <ContextSelect
          value={null}
          contexts={mockContexts}
          onChange={vi.fn()}
        />
      )

      expect(
        screen.queryByRole("option", { name: /Shopping/ })
      ).not.toBeInTheDocument()

      rerender(
        <ContextSelect
          value={null}
          contexts={[...mockContexts, newContext]}
          onChange={vi.fn()}
        />
      )

      expect(
        screen.getByRole("option", { name: /Shopping/ })
      ).toBeInTheDocument()
    })

    it("handles contexts with empty icon", () => {
      const contextWithEmptyIcon = createMockContext({ name: "NoIcon", icon: "" })

      render(
        <ContextSelect
          value={null}
          contexts={[contextWithEmptyIcon]}
          onChange={vi.fn()}
        />
      )

      expect(
        screen.getByRole("option", { name: "NoIcon" })
      ).toBeInTheDocument()
    })
  })
})
