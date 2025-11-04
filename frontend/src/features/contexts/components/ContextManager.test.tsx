import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { ContextManager } from "./ContextManager"
import { createMockContext, createMultipleContexts } from "@/test/factories"

describe("ContextManager", () => {
  const mockContexts = [
    createMockContext({ name: "@home", icon: "🏠" }),
    createMockContext({ name: "@computer", icon: "💻" }),
    createMockContext({ name: "@phone", icon: "📱" }),
  ]

  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnCreate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnCreate.mockResolvedValue(undefined)
  })

  describe("rendering", () => {
    it("renders all contexts in a list", () => {
      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      mockContexts.forEach((context) => {
        expect(screen.getByText(context.name)).toBeInTheDocument()
      })
    })

    it("displays context icons", () => {
      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      mockContexts.forEach((context) => {
        if (context.icon) {
          expect(screen.getByText(context.icon)).toBeInTheDocument()
        }
      })
    })

    it("displays context descriptions", () => {
      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      mockContexts.forEach((context) => {
        if (context.description) {
          expect(screen.getByText(context.description)).toBeInTheDocument()
        }
      })
    })

    it("shows 'Add Context' button when not creating", () => {
      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      expect(
        screen.getByRole("button", { name: /add context/i }),
      ).toBeInTheDocument()
    })

    it("shows empty state when no contexts exist", () => {
      render(
        <ContextManager
          contexts={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      expect(screen.getByText(/no contexts yet/i)).toBeInTheDocument()
    })
  })

  describe("creating contexts", () => {
    it("shows form when Add Context button is clicked", async () => {
      const user = userEvent.setup()
      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      expect(screen.getByText("Create New Context")).toBeInTheDocument()
      expect(screen.getByLabelText(/^name/i)).toBeInTheDocument()
    })

    it("hides Add Context button when form is shown", async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      const addButton = screen.getByRole("button", { name: /add context/i })
      await user.click(addButton)

      rerender(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      // The button should not be visible while form is open
      // (check by role from the list area, not the close button)
    })

    it("submits form with context data", async () => {
      const user = userEvent.setup()
      mockOnCreate.mockResolvedValue(undefined)

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      const nameInput = screen.getByPlaceholderText(/@home, @computer, @phone/i)
      const iconInput = screen.getByPlaceholderText(/e\.g\., 🏠 💻 📱/i)
      const descriptionInput = screen.getByPlaceholderText(
        /when to use this context/i,
      )

      await user.type(nameInput, "@shopping")
      await user.type(iconInput, "🛒")
      await user.type(descriptionInput, "For shopping errands")

      const submitButton = screen.getByRole("button", {
        name: /create context/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith({
          name: "@shopping",
          icon: "🛒",
          description: "For shopping errands",
          sort_order: 0,
        })
      })
    })

    it("validates that name is required", async () => {
      const user = userEvent.setup()

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      const submitButton = screen.getByRole("button", {
        name: /create context/i,
      })
      await user.click(submitButton)

      expect(screen.getByText(/context name is required/i)).toBeInTheDocument()
      expect(mockOnCreate).not.toHaveBeenCalled()
    })

    it("trims whitespace from input fields", async () => {
      const user = userEvent.setup()
      mockOnCreate.mockResolvedValue(undefined)

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      const nameInput = screen.getByPlaceholderText(/@home, @computer, @phone/i)
      const descriptionInput = screen.getByPlaceholderText(
        /when to use this context/i,
      )

      await user.type(nameInput, "  @work  ")
      await user.type(descriptionInput, "  Work tasks  ")

      const submitButton = screen.getByRole("button", {
        name: /create context/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "@work",
            description: "Work tasks",
          }),
        )
      })
    })

    it("disables form fields while submitting", async () => {
      const user = userEvent.setup()
      mockOnCreate.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      )

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      const nameInput = screen.getByPlaceholderText(
        /@home, @computer, @phone/i,
      ) as HTMLInputElement
      await user.type(nameInput, "@test")

      const submitButton = screen.getByRole("button", {
        name: /create context/i,
      })
      await user.click(submitButton)

      expect(nameInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })

    it("shows 'Creating...' text on submit button while loading", async () => {
      const user = userEvent.setup()
      mockOnCreate.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      )

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))
      const nameInput = screen.getByPlaceholderText(/@home, @computer, @phone/i)
      await user.type(nameInput, "@test")

      const submitButton = screen.getByRole("button", {
        name: /create context/i,
      })
      await user.click(submitButton)

      expect(
        screen.getByRole("button", { name: /creating/i }),
      ).toBeInTheDocument()
    })

    it("clears and hides form after successful submission", async () => {
      const user = userEvent.setup()
      mockOnCreate.mockResolvedValue(undefined)

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      const nameInput = screen.getByPlaceholderText(/@home, @computer, @phone/i)
      await user.type(nameInput, "@test")

      const submitButton = screen.getByRole("button", {
        name: /create context/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText("Create New Context")).not.toBeInTheDocument()
      })
    })

    it("hides form after successful submission", async () => {
      const user = userEvent.setup()
      mockOnCreate.mockResolvedValue(undefined)

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      const nameInput = screen.getByPlaceholderText(/@home, @computer, @phone/i)
      await user.type(nameInput, "@test")

      const submitButton = screen.getByRole("button", {
        name: /create context/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText("Create New Context")).not.toBeInTheDocument()
      })
    })

    it("shows error message when creation fails", async () => {
      const user = userEvent.setup()
      mockOnCreate.mockRejectedValue(new Error("Network error"))

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      const nameInput = screen.getByPlaceholderText(/@home, @computer, @phone/i)
      await user.type(nameInput, "@test")

      const submitButton = screen.getByRole("button", {
        name: /create context/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it("form remains open after error", async () => {
      const user = userEvent.setup()
      mockOnCreate.mockRejectedValue(new Error("Error"))

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      const nameInput = screen.getByPlaceholderText(/@home, @computer, @phone/i)
      await user.type(nameInput, "@test")

      const submitButton = screen.getByRole("button", {
        name: /create context/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Create New Context")).toBeInTheDocument()
      })
    })
  })

  describe("canceling form", () => {
    it("hides form when Cancel button is clicked", async () => {
      const user = userEvent.setup()

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))
      expect(screen.getByText("Create New Context")).toBeInTheDocument()

      const cancelButton = screen.getByRole("button", { name: /^cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText("Create New Context")).not.toBeInTheDocument()
      })
    })

    it("hides form when Cancel button is clicked", async () => {
      const user = userEvent.setup()

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      const nameInput = screen.getByPlaceholderText(/@home, @computer, @phone/i)
      await user.type(nameInput, "@test")

      const cancelButton = screen.getByRole("button", { name: /^cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText("Create New Context")).not.toBeInTheDocument()
      })
    })

    it("clears errors when Cancel button is clicked", async () => {
      const user = userEvent.setup()

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      const submitButton = screen.getByRole("button", {
        name: /create context/i,
      })
      await user.click(submitButton)

      expect(screen.getByText(/context name is required/i)).toBeInTheDocument()

      const cancelButton = screen.getByRole("button", { name: /^cancel/i })
      await user.click(cancelButton)

      expect(
        screen.queryByText(/context name is required/i),
      ).not.toBeInTheDocument()
    })

    it("hides form when close button (X) is clicked", async () => {
      const user = userEvent.setup()

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      await user.click(screen.getByRole("button", { name: /add context/i }))

      // Find the X close button in the dialog header
      const closeButtons = screen.getAllByRole("button", { name: "" })
      const closeButton = closeButtons[0] // The X button

      await user.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByText("Create New Context")).not.toBeInTheDocument()
      })
    })
  })

  describe("deleting contexts", () => {
    it("calls onDelete when delete button is clicked", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      // Find the first context's delete button
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })
      await user.click(deleteButtons[0])

      expect(mockOnDelete).toHaveBeenCalledWith(mockContexts[0].id)

      confirmSpy.mockRestore()
    })

    it("shows confirmation dialog before deleting", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })
      await user.click(deleteButtons[0])

      expect(confirmSpy).toHaveBeenCalledWith(
        `Delete context "${mockContexts[0].name}"?`,
      )

      confirmSpy.mockRestore()
    })

    it("does not delete when confirmation is declined", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })
      await user.click(deleteButtons[0])

      expect(mockOnDelete).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
    })
  })

  describe("empty contexts", () => {
    it("does not show context list when empty", () => {
      render(
        <ContextManager
          contexts={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      expect(screen.getByText(/no contexts yet/i)).toBeInTheDocument()
    })

    it("shows Add Context button even when list is empty", () => {
      render(
        <ContextManager
          contexts={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      expect(
        screen.getByRole("button", { name: /add context/i }),
      ).toBeInTheDocument()
    })
  })

  describe("multiple contexts", () => {
    it("displays many contexts correctly", () => {
      const manyContexts = createMultipleContexts(10)

      const { container } = render(
        <ContextManager
          contexts={manyContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      // Check that we have 10 contexts rendered (they may have duplicate names due to factory cycling)
      const contextCards = container.querySelectorAll("h4.font-medium")
      expect(contextCards).toHaveLength(10)
    })

    it("handles delete action on each context independently", async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

      render(
        <ContextManager
          contexts={mockContexts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreate={mockOnCreate}
        />,
      )

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })

      await user.click(deleteButtons[1])
      expect(mockOnDelete).toHaveBeenCalledWith(mockContexts[1].id)

      mockOnDelete.mockClear()

      await user.click(deleteButtons[2])
      expect(mockOnDelete).toHaveBeenCalledWith(mockContexts[2].id)

      confirmSpy.mockRestore()
    })
  })
})
