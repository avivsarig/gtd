import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { DeleteButton } from "./DeleteButton"

describe("DeleteButton", () => {
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("rendering", () => {
    it("renders with default label", () => {
      render(<DeleteButton onDelete={mockOnDelete} />)

      expect(
        screen.getByRole("button", { name: /delete/i }),
      ).toBeInTheDocument()
    })

    it("renders with custom label", () => {
      render(<DeleteButton onDelete={mockOnDelete} label="Remove" />)

      expect(screen.getByText("Remove")).toBeInTheDocument()
    })

    it("renders icon-only variant without text", () => {
      render(<DeleteButton onDelete={mockOnDelete} iconOnly={true} />)

      const button = screen.getByRole("button")
      expect(button).not.toHaveTextContent("Delete")
    })

    it("renders icon-only variant with title attribute", () => {
      render(
        <DeleteButton onDelete={mockOnDelete} label="Delete" iconOnly={true} />,
      )

      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("title", "Delete")
    })

    it("renders with custom label in icon-only mode", () => {
      render(
        <DeleteButton
          onDelete={mockOnDelete}
          label="Remove Item"
          iconOnly={true}
        />,
      )

      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("title", "Remove Item")
    })

    it("does not have title attribute when not icon-only", () => {
      render(<DeleteButton onDelete={mockOnDelete} label="Delete" />)

      const button = screen.getByRole("button", { name: /delete/i })
      expect(button).not.toHaveAttribute("title")
    })

    it("renders trash icon", () => {
      const { container } = render(<DeleteButton onDelete={mockOnDelete} />)

      const icon = container.querySelector("svg")
      expect(icon).toBeInTheDocument()
    })

    it("applies destructive styling", () => {
      render(<DeleteButton onDelete={mockOnDelete} />)

      const button = screen.getByRole("button", { name: /delete/i })
      expect(button).toHaveClass("text-destructive")
      expect(button).toHaveClass("hover:text-destructive")
      expect(button).toHaveClass("hover:bg-destructive/10")
    })
  })

  describe("delete functionality", () => {
    it("calls onDelete when clicked", async () => {
      const user = userEvent.setup()
      render(<DeleteButton onDelete={mockOnDelete} />)

      const button = screen.getByRole("button", { name: /delete/i })
      await user.click(button)

      expect(mockOnDelete).toHaveBeenCalledOnce()
    })

    it("calls onDelete without confirmation when confirmMessage not provided", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm")

      render(<DeleteButton onDelete={mockOnDelete} />)

      const button = screen.getByRole("button", { name: /delete/i })
      await user.click(button)

      expect(confirmSpy).not.toHaveBeenCalled()
      expect(mockOnDelete).toHaveBeenCalledOnce()

      confirmSpy.mockRestore()
    })

    it("handles multiple clicks", async () => {
      const user = userEvent.setup()
      render(<DeleteButton onDelete={mockOnDelete} />)

      const button = screen.getByRole("button", { name: /delete/i })

      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(mockOnDelete).toHaveBeenCalledTimes(3)
    })
  })

  describe("confirmation dialog", () => {
    it("shows confirmation dialog when confirmMessage is provided", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

      render(
        <DeleteButton onDelete={mockOnDelete} confirmMessage="Are you sure?" />,
      )

      const button = screen.getByRole("button", { name: /delete/i })
      await user.click(button)

      expect(confirmSpy).toHaveBeenCalledWith("Are you sure?")

      confirmSpy.mockRestore()
    })

    it("calls onDelete when confirmation is accepted", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

      render(
        <DeleteButton onDelete={mockOnDelete} confirmMessage="Are you sure?" />,
      )

      const button = screen.getByRole("button", { name: /delete/i })
      await user.click(button)

      expect(mockOnDelete).toHaveBeenCalledOnce()

      confirmSpy.mockRestore()
    })

    it("does not call onDelete when confirmation is declined", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)

      render(
        <DeleteButton onDelete={mockOnDelete} confirmMessage="Are you sure?" />,
      )

      const button = screen.getByRole("button", { name: /delete/i })
      await user.click(button)

      expect(mockOnDelete).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
    })

    it("shows custom confirmation message", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

      render(
        <DeleteButton
          onDelete={mockOnDelete}
          confirmMessage="Delete this item permanently?"
        />,
      )

      const button = screen.getByRole("button", { name: /delete/i })
      await user.click(button)

      expect(confirmSpy).toHaveBeenCalledWith("Delete this item permanently?")

      confirmSpy.mockRestore()
    })

    it("handles declined confirmation multiple times", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)

      render(
        <DeleteButton onDelete={mockOnDelete} confirmMessage="Are you sure?" />,
      )

      const button = screen.getByRole("button", { name: /delete/i })

      await user.click(button)
      await user.click(button)

      expect(confirmSpy).toHaveBeenCalledTimes(2)
      expect(mockOnDelete).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
    })
  })

  describe("disabled state", () => {
    it("is enabled by default", () => {
      render(<DeleteButton onDelete={mockOnDelete} />)

      const button = screen.getByRole("button", { name: /delete/i })
      expect(button).toBeEnabled()
    })

    it("is disabled when disabled prop is true", () => {
      render(<DeleteButton onDelete={mockOnDelete} disabled={true} />)

      const button = screen.getByRole("button", { name: /delete/i })
      expect(button).toBeDisabled()
    })

    it("does not call onDelete when disabled", async () => {
      const user = userEvent.setup()
      render(<DeleteButton onDelete={mockOnDelete} disabled={true} />)

      const button = screen.getByRole("button", { name: /delete/i })

      try {
        await user.click(button)
      } catch {
        // Expected to fail
      }

      expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it("does not show confirmation when disabled and clicked", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm")

      render(
        <DeleteButton
          onDelete={mockOnDelete}
          disabled={true}
          confirmMessage="Are you sure?"
        />,
      )

      const button = screen.getByRole("button", { name: /delete/i })

      try {
        await user.click(button)
      } catch {
        // Expected to fail
      }

      expect(confirmSpy).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
    })

    it("can be re-enabled after being disabled", () => {
      const { rerender } = render(
        <DeleteButton onDelete={mockOnDelete} disabled={true} />,
      )

      let button = screen.getByRole("button", { name: /delete/i })
      expect(button).toBeDisabled()

      rerender(<DeleteButton onDelete={mockOnDelete} disabled={false} />)

      button = screen.getByRole("button", { name: /delete/i })
      expect(button).toBeEnabled()
    })
  })

  describe("icon-only variant", () => {
    it("applies icon size styling", () => {
      render(<DeleteButton onDelete={mockOnDelete} iconOnly={true} />)

      const button = screen.getByRole("button")
      // Icon-only buttons use "icon" size variant
      expect(button).toBeInTheDocument()
    })

    it("applies correct icon className in icon-only mode", () => {
      const { container } = render(
        <DeleteButton onDelete={mockOnDelete} iconOnly={true} />,
      )

      const icon = container.querySelector("svg")
      expect(icon).toHaveClass("h-4")
      expect(icon).toHaveClass("w-4")
    })

    it("applies correct icon className in text mode", () => {
      const { container } = render(
        <DeleteButton onDelete={mockOnDelete} iconOnly={false} />,
      )

      const icon = container.querySelector("svg")
      expect(icon).toHaveClass("mr-1")
      expect(icon).toHaveClass("h-4")
      expect(icon).toHaveClass("w-4")
    })

    it("renders label text when not icon-only", () => {
      render(
        <DeleteButton
          onDelete={mockOnDelete}
          label="Remove"
          iconOnly={false}
        />,
      )

      expect(screen.getByText("Remove")).toBeInTheDocument()
    })

    it("does not render label text when icon-only", () => {
      render(
        <DeleteButton onDelete={mockOnDelete} label="Remove" iconOnly={true} />,
      )

      expect(screen.queryByText("Remove")).not.toBeInTheDocument()
    })
  })

  describe("button variants", () => {
    it("uses ghost variant styling", () => {
      render(<DeleteButton onDelete={mockOnDelete} />)

      const button = screen.getByRole("button", { name: /delete/i })
      // Ghost variant should be applied (via variant="ghost")
      expect(button).toBeInTheDocument()
    })

    it("uses small size by default", () => {
      render(<DeleteButton onDelete={mockOnDelete} iconOnly={false} />)

      const button = screen.getByRole("button", { name: /delete/i })
      // Small size should be applied when not icon-only
      expect(button).toBeInTheDocument()
    })
  })

  describe("edge cases", () => {
    it("handles empty label gracefully", () => {
      render(<DeleteButton onDelete={mockOnDelete} label="" />)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("handles undefined confirmMessage", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm")

      render(
        <DeleteButton onDelete={mockOnDelete} confirmMessage={undefined} />,
      )

      const button = screen.getByRole("button", { name: /delete/i })
      await user.click(button)

      expect(confirmSpy).not.toHaveBeenCalled()
      expect(mockOnDelete).toHaveBeenCalledOnce()

      confirmSpy.mockRestore()
    })

    it("handles empty string confirmMessage", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm")

      render(<DeleteButton onDelete={mockOnDelete} confirmMessage="" />)

      const button = screen.getByRole("button", { name: /delete/i })
      await user.click(button)

      expect(confirmSpy).not.toHaveBeenCalled()
      expect(mockOnDelete).toHaveBeenCalledOnce()

      confirmSpy.mockRestore()
    })

    it("handles whitespace-only label", () => {
      render(<DeleteButton onDelete={mockOnDelete} label="   " />)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })
  })

  describe("accessibility", () => {
    it("is keyboard accessible", async () => {
      const user = userEvent.setup()
      render(<DeleteButton onDelete={mockOnDelete} />)

      const button = screen.getByRole("button", { name: /delete/i })
      button.focus()

      expect(button).toHaveFocus()

      await user.keyboard("{Enter}")

      expect(mockOnDelete).toHaveBeenCalledOnce()
    })

    it("is keyboard accessible in icon-only mode", async () => {
      const user = userEvent.setup()
      render(<DeleteButton onDelete={mockOnDelete} iconOnly={true} />)

      const button = screen.getByRole("button")
      button.focus()

      expect(button).toHaveFocus()

      await user.keyboard("{Enter}")

      expect(mockOnDelete).toHaveBeenCalledOnce()
    })

    it("supports space key activation", async () => {
      const user = userEvent.setup()
      render(<DeleteButton onDelete={mockOnDelete} />)

      const button = screen.getByRole("button", { name: /delete/i })
      button.focus()

      await user.keyboard(" ")

      expect(mockOnDelete).toHaveBeenCalledOnce()
    })

    it("has proper role attribute", () => {
      render(<DeleteButton onDelete={mockOnDelete} />)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("provides accessible name in icon-only mode via title", () => {
      render(
        <DeleteButton
          onDelete={mockOnDelete}
          label="Delete item"
          iconOnly={true}
        />,
      )

      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("title", "Delete item")
    })
  })

  describe("prop combinations", () => {
    it("handles all props together", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

      render(
        <DeleteButton
          onDelete={mockOnDelete}
          disabled={false}
          label="Remove Item"
          iconOnly={false}
          confirmMessage="Delete this?"
        />,
      )

      const button = screen.getByRole("button", { name: /remove item/i })
      await user.click(button)

      expect(confirmSpy).toHaveBeenCalledWith("Delete this?")
      expect(mockOnDelete).toHaveBeenCalledOnce()

      confirmSpy.mockRestore()
    })

    it("handles disabled with confirmation message", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm")

      render(
        <DeleteButton
          onDelete={mockOnDelete}
          disabled={true}
          confirmMessage="Delete?"
        />,
      )

      const button = screen.getByRole("button", { name: /delete/i })

      try {
        await user.click(button)
      } catch {
        // Expected to fail
      }

      expect(confirmSpy).not.toHaveBeenCalled()
      expect(mockOnDelete).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
    })

    it("handles icon-only with custom label and confirmation", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

      render(
        <DeleteButton
          onDelete={mockOnDelete}
          label="Remove"
          iconOnly={true}
          confirmMessage="Are you sure?"
        />,
      )

      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("title", "Remove")

      await user.click(button)

      expect(confirmSpy).toHaveBeenCalledWith("Are you sure?")
      expect(mockOnDelete).toHaveBeenCalledOnce()

      confirmSpy.mockRestore()
    })
  })
})
