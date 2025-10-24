import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { ItemCard } from "./ItemCard"

describe("ItemCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("rendering", () => {
    it("renders children content", () => {
      render(
        <ItemCard>
          <div>Test content</div>
        </ItemCard>,
      )

      expect(screen.getByText("Test content")).toBeInTheDocument()
    })

    it("renders complex children content", () => {
      render(
        <ItemCard>
          <div>
            <h3>Title</h3>
            <p>Description</p>
            <span>Details</span>
          </div>
        </ItemCard>,
      )

      expect(screen.getByText("Title")).toBeInTheDocument()
      expect(screen.getByText("Description")).toBeInTheDocument()
      expect(screen.getByText("Details")).toBeInTheDocument()
    })

    it("applies default styling", () => {
      const { container } = render(
        <ItemCard>
          <div>Content</div>
        </ItemCard>,
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass("rounded-lg")
      expect(card).toHaveClass("border")
      expect(card).toHaveClass("p-4")
    })

    it("applies custom className", () => {
      const { container } = render(
        <ItemCard className="custom-class">
          <div>Content</div>
        </ItemCard>,
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass("custom-class")
    })

    it("combines default and custom className", () => {
      const { container } = render(
        <ItemCard className="custom-class">
          <div>Content</div>
        </ItemCard>,
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass("rounded-lg")
      expect(card).toHaveClass("custom-class")
    })
  })

  describe("edit button", () => {
    it("shows edit button when onEdit is provided", () => {
      const mockOnEdit = vi.fn()

      render(
        <ItemCard onEdit={mockOnEdit}>
          <div>Content</div>
        </ItemCard>,
      )

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument()
    })

    it("does not show edit button when onEdit is not provided", () => {
      render(
        <ItemCard>
          <div>Content</div>
        </ItemCard>,
      )

      expect(
        screen.queryByRole("button", { name: /edit/i }),
      ).not.toBeInTheDocument()
    })

    it("calls onEdit when edit button is clicked", async () => {
      const user = userEvent.setup()
      const mockOnEdit = vi.fn()

      render(
        <ItemCard onEdit={mockOnEdit}>
          <div>Content</div>
        </ItemCard>,
      )

      const editButton = screen.getByRole("button", { name: /edit/i })
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledOnce()
    })

    it("edit button has proper accessibility attributes", () => {
      const mockOnEdit = vi.fn()

      render(
        <ItemCard onEdit={mockOnEdit}>
          <div>Content</div>
        </ItemCard>,
      )

      const editButton = screen.getByRole("button", { name: /edit/i })
      expect(editButton).toHaveAttribute("title", "Edit")
    })
  })

  describe("delete button", () => {
    it("shows delete button when onDelete is provided", () => {
      const mockOnDelete = vi.fn()

      render(
        <ItemCard onDelete={mockOnDelete}>
          <div>Content</div>
        </ItemCard>,
      )

      expect(
        screen.getByRole("button", { name: /delete/i }),
      ).toBeInTheDocument()
    })

    it("does not show delete button when onDelete is not provided", () => {
      render(
        <ItemCard>
          <div>Content</div>
        </ItemCard>,
      )

      expect(
        screen.queryByRole("button", { name: /delete/i }),
      ).not.toBeInTheDocument()
    })

    it("calls onDelete when delete button is clicked without confirmation", async () => {
      const user = userEvent.setup()
      const mockOnDelete = vi.fn()

      render(
        <ItemCard onDelete={mockOnDelete}>
          <div>Content</div>
        </ItemCard>,
      )

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      await user.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledOnce()
    })

    it("delete button has proper accessibility attributes", () => {
      const mockOnDelete = vi.fn()

      render(
        <ItemCard onDelete={mockOnDelete}>
          <div>Content</div>
        </ItemCard>,
      )

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      expect(deleteButton).toHaveAttribute("title", "Delete")
    })

    it("delete button has destructive styling", () => {
      const mockOnDelete = vi.fn()

      render(
        <ItemCard onDelete={mockOnDelete}>
          <div>Content</div>
        </ItemCard>,
      )

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      expect(deleteButton).toHaveClass("text-destructive")
    })
  })

  describe("delete confirmation", () => {
    it("shows confirmation dialog when deleteConfirmMessage is provided", async () => {
      const user = userEvent.setup()
      const mockOnDelete = vi.fn()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

      render(
        <ItemCard onDelete={mockOnDelete} deleteConfirmMessage="Are you sure?">
          <div>Content</div>
        </ItemCard>,
      )

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      await user.click(deleteButton)

      expect(confirmSpy).toHaveBeenCalledWith("Are you sure?")
      confirmSpy.mockRestore()
    })

    it("calls onDelete when confirmation is accepted", async () => {
      const user = userEvent.setup()
      const mockOnDelete = vi.fn()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

      render(
        <ItemCard onDelete={mockOnDelete} deleteConfirmMessage="Are you sure?">
          <div>Content</div>
        </ItemCard>,
      )

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      await user.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledOnce()
      confirmSpy.mockRestore()
    })

    it("does not call onDelete when confirmation is declined", async () => {
      const user = userEvent.setup()
      const mockOnDelete = vi.fn()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)

      render(
        <ItemCard onDelete={mockOnDelete} deleteConfirmMessage="Are you sure?">
          <div>Content</div>
        </ItemCard>,
      )

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      await user.click(deleteButton)

      expect(mockOnDelete).not.toHaveBeenCalled()
      confirmSpy.mockRestore()
    })

    it("does not show confirmation when deleteConfirmMessage is not provided", async () => {
      const user = userEvent.setup()
      const mockOnDelete = vi.fn()
      const confirmSpy = vi.spyOn(window, "confirm")

      render(
        <ItemCard onDelete={mockOnDelete}>
          <div>Content</div>
        </ItemCard>,
      )

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      await user.click(deleteButton)

      expect(confirmSpy).not.toHaveBeenCalled()
      expect(mockOnDelete).toHaveBeenCalledOnce()
      confirmSpy.mockRestore()
    })
  })

  describe("custom actions", () => {
    it("renders custom actions when provided", () => {
      render(
        <ItemCard actions={<button type="button">Custom Action</button>}>
          <div>Content</div>
        </ItemCard>,
      )

      expect(
        screen.getByRole("button", { name: /custom action/i }),
      ).toBeInTheDocument()
    })

    it("renders multiple custom actions", () => {
      render(
        <ItemCard
          actions={
            <>
              <button type="button">Action 1</button>
              <button type="button">Action 2</button>
            </>
          }
        >
          <div>Content</div>
        </ItemCard>,
      )

      expect(
        screen.getByRole("button", { name: /action 1/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /action 2/i }),
      ).toBeInTheDocument()
    })

    it("renders custom actions before edit and delete buttons", () => {
      const mockOnEdit = vi.fn()
      const mockOnDelete = vi.fn()

      render(
        <ItemCard
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          actions={
            <button type="button" data-testid="custom">
              Custom
            </button>
          }
        >
          <div>Content</div>
        </ItemCard>,
      )

      const buttons = screen.getAllByRole("button")
      expect(buttons[0]).toHaveAttribute("data-testid", "custom")
    })
  })

  describe("button combinations", () => {
    it("renders both edit and delete buttons when both handlers provided", () => {
      const mockOnEdit = vi.fn()
      const mockOnDelete = vi.fn()

      render(
        <ItemCard onEdit={mockOnEdit} onDelete={mockOnDelete}>
          <div>Content</div>
        </ItemCard>,
      )

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /delete/i }),
      ).toBeInTheDocument()
    })

    it("renders only edit button when only onEdit provided", () => {
      const mockOnEdit = vi.fn()

      render(
        <ItemCard onEdit={mockOnEdit}>
          <div>Content</div>
        </ItemCard>,
      )

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument()
      expect(
        screen.queryByRole("button", { name: /delete/i }),
      ).not.toBeInTheDocument()
    })

    it("renders only delete button when only onDelete provided", () => {
      const mockOnDelete = vi.fn()

      render(
        <ItemCard onDelete={mockOnDelete}>
          <div>Content</div>
        </ItemCard>,
      )

      expect(
        screen.getByRole("button", { name: /delete/i }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole("button", { name: /edit/i }),
      ).not.toBeInTheDocument()
    })

    it("renders no action buttons when no handlers provided", () => {
      render(
        <ItemCard>
          <div>Content</div>
        </ItemCard>,
      )

      expect(
        screen.queryByRole("button", { name: /edit/i }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole("button", { name: /delete/i }),
      ).not.toBeInTheDocument()
    })

    it("renders custom actions with edit and delete buttons", () => {
      const mockOnEdit = vi.fn()
      const mockOnDelete = vi.fn()

      render(
        <ItemCard
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          actions={<button type="button">Custom</button>}
        >
          <div>Content</div>
        </ItemCard>,
      )

      expect(
        screen.getByRole("button", { name: /custom/i }),
      ).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /delete/i }),
      ).toBeInTheDocument()
    })
  })

  describe("layout", () => {
    it("renders content area separate from actions", () => {
      render(
        <ItemCard onEdit={vi.fn()}>
          <div data-testid="content">Main content</div>
        </ItemCard>,
      )

      const contentArea = screen.getByTestId("content")
      const editButton = screen.getByRole("button", { name: /edit/i })

      expect(contentArea).toBeInTheDocument()
      expect(editButton).toBeInTheDocument()
      expect(contentArea.parentElement).not.toBe(editButton.parentElement)
    })

    it("content takes up flexible space", () => {
      const { container } = render(
        <ItemCard>
          <div>Long content that should flex</div>
        </ItemCard>,
      )

      const contentWrapper = container.querySelector(".flex-1")
      expect(contentWrapper).toBeInTheDocument()
    })
  })

  describe("interaction", () => {
    it("handles multiple button clicks independently", async () => {
      const user = userEvent.setup()
      const mockOnEdit = vi.fn()
      const mockOnDelete = vi.fn()

      render(
        <ItemCard onEdit={mockOnEdit} onDelete={mockOnDelete}>
          <div>Content</div>
        </ItemCard>,
      )

      const editButton = screen.getByRole("button", { name: /edit/i })
      const deleteButton = screen.getByRole("button", { name: /delete/i })

      await user.click(editButton)
      expect(mockOnEdit).toHaveBeenCalledOnce()
      expect(mockOnDelete).not.toHaveBeenCalled()

      await user.click(deleteButton)
      expect(mockOnEdit).toHaveBeenCalledOnce()
      expect(mockOnDelete).toHaveBeenCalledOnce()
    })

    it("handles rapid multiple clicks on edit button", async () => {
      const user = userEvent.setup()
      const mockOnEdit = vi.fn()

      render(
        <ItemCard onEdit={mockOnEdit}>
          <div>Content</div>
        </ItemCard>,
      )

      const editButton = screen.getByRole("button", { name: /edit/i })

      await user.click(editButton)
      await user.click(editButton)
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledTimes(3)
    })
  })

  describe("edge cases", () => {
    it("handles empty children gracefully", () => {
      const { container } = render(
        <ItemCard>
          <div data-testid="empty-child" />
        </ItemCard>,
      )

      expect(screen.getByTestId("empty-child")).toBeInTheDocument()
      expect(container.firstChild).toBeInTheDocument()
    })

    it("handles null deleteConfirmMessage", async () => {
      const user = userEvent.setup()
      const mockOnDelete = vi.fn()
      const confirmSpy = vi.spyOn(window, "confirm")

      render(
        <ItemCard onDelete={mockOnDelete} deleteConfirmMessage={undefined}>
          <div>Content</div>
        </ItemCard>,
      )

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      await user.click(deleteButton)

      expect(confirmSpy).not.toHaveBeenCalled()
      expect(mockOnDelete).toHaveBeenCalledOnce()

      confirmSpy.mockRestore()
    })

    it("handles empty string deleteConfirmMessage", async () => {
      const user = userEvent.setup()
      const mockOnDelete = vi.fn()
      const confirmSpy = vi.spyOn(window, "confirm")

      render(
        <ItemCard onDelete={mockOnDelete} deleteConfirmMessage="">
          <div>Content</div>
        </ItemCard>,
      )

      const deleteButton = screen.getByRole("button", { name: /delete/i })
      await user.click(deleteButton)

      expect(confirmSpy).not.toHaveBeenCalled()
      expect(mockOnDelete).toHaveBeenCalledOnce()

      confirmSpy.mockRestore()
    })

    it("handles empty className gracefully", () => {
      const { container } = render(
        <ItemCard className="">
          <div>Content</div>
        </ItemCard>,
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass("rounded-lg")
    })
  })
})
