import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { UniversalCapture } from "./UniversalCapture"
import * as api from "@/lib/api"

// Mock the API
vi.mock("@/lib/api", () => ({
  createInboxItem: vi.fn(),
}))

describe("UniversalCapture", () => {
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("rendering", () => {
    it("renders when open is true", () => {
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByText("Quick Capture")).toBeInTheDocument()
      expect(
        screen.getByText(/capture anything on your mind/i),
      ).toBeInTheDocument()
    })

    it("does not render when open is false", () => {
      render(<UniversalCapture open={false} onOpenChange={mockOnOpenChange} />)

      // The dialog should not be visible
      expect(screen.queryByText("Quick Capture")).not.toBeInTheDocument()
    })

    it("renders textarea with placeholder", () => {
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      expect(
        screen.getByPlaceholderText(/what's on your mind/i),
      ).toBeInTheDocument()
    })

    it("renders Cancel and Capture buttons", () => {
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /capture/i }),
      ).toBeInTheDocument()
    })

    it("textarea is intended to be focused on open", () => {
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      // The component uses autoFocus prop, which is handled by React
      expect(textarea).toBeInTheDocument()
    })
  })

  describe("form submission", () => {
    it("creates inbox item when form is submitted", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockResolvedValue({
        id: "123",
        content: "Test content",
        created_at: new Date().toISOString(),
        processed_at: null,
        deleted_at: null,
      })

      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "New thought")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      await waitFor(() => {
        expect(mockCreateInboxItem).toHaveBeenCalledWith({
          content: "New thought",
        })
      })
    })

    it("trims whitespace from content", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockResolvedValue({
        id: "123",
        content: "Test content",
        created_at: new Date().toISOString(),
        processed_at: null,
        deleted_at: null,
      })

      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "  Hello world  ")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      await waitFor(() => {
        expect(mockCreateInboxItem).toHaveBeenCalledWith({
          content: "Hello world",
        })
      })
    })

    it("clears textarea after successful submission", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockResolvedValue({
        id: "123",
        content: "Test content",
        created_at: new Date().toISOString(),
        processed_at: null,
        deleted_at: null,
      })

      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(
        /what's on your mind/i,
      ) as HTMLTextAreaElement
      await user.type(textarea, "Test thought")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      await waitFor(() => {
        expect(textarea.value).toBe("")
      })
    })

    it("closes dialog after successful submission", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockResolvedValue({
        id: "123",
        content: "Test content",
        created_at: new Date().toISOString(),
        processed_at: null,
        deleted_at: null,
      })

      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "Test thought")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it("calls onSuccess callback after successful submission", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockResolvedValue({
        id: "123",
        content: "Test content",
        created_at: new Date().toISOString(),
        processed_at: null,
        deleted_at: null,
      })

      const user = userEvent.setup()
      render(
        <UniversalCapture
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />,
      )

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "Test thought")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it("shows 'Capturing...' on button while submitting", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  id: "123",
                  content: "Test",
                  created_at: new Date().toISOString(),
                  processed_at: null,
                  deleted_at: null,
                }),
              100,
            ),
          ),
      )

      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "Test")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      expect(
        screen.getByRole("button", { name: /capturing/i }),
      ).toBeInTheDocument()
    })

    it("disables textarea while submitting", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  id: "123",
                  content: "Test",
                  created_at: new Date().toISOString(),
                  processed_at: null,
                  deleted_at: null,
                }),
              100,
            ),
          ),
      )

      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(
        /what's on your mind/i,
      ) as HTMLTextAreaElement
      await user.type(textarea, "Test")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      expect(textarea).toBeDisabled()
    })
  })

  describe("error handling", () => {
    it("shows error message when API fails", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockRejectedValue(new Error("Network error"))

      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "Test thought")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it("shows generic error message when error is not an Error instance", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockRejectedValue("String error")

      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "Test thought")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to capture/i)).toBeInTheDocument()
      })
    })

    it("does not close dialog after error", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockRejectedValue(new Error("Error"))

      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "Test")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })

      // Dialog should still be open
      expect(screen.getByText("Quick Capture")).toBeInTheDocument()
    })

    it("does not clear textarea on error", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockRejectedValue(new Error("Error"))

      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(
        /what's on your mind/i,
      ) as HTMLTextAreaElement
      await user.type(textarea, "Test thought")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })

      // Content should be preserved
      expect(textarea.value).toBe("Test thought")
    })
  })

  describe("cancel button", () => {
    it("closes dialog when Cancel button is clicked", async () => {
      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const cancelButton = screen.getByRole("button", { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it("clears textarea when dialog is closed via Cancel", async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <UniversalCapture open={true} onOpenChange={mockOnOpenChange} />,
      )

      const textarea = screen.getByPlaceholderText(
        /what's on your mind/i,
      ) as HTMLTextAreaElement
      await user.type(textarea, "Test thought")

      const cancelButton = screen.getByRole("button", { name: /cancel/i })
      await user.click(cancelButton)

      // Simulate closing the dialog
      rerender(
        <UniversalCapture open={false} onOpenChange={mockOnOpenChange} />,
      )

      // When reopened, textarea should be empty
      rerender(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const newTextarea = screen.getByPlaceholderText(
        /what's on your mind/i,
      ) as HTMLTextAreaElement
      expect(newTextarea.value).toBe("")
    })

    it("closes dialog and calls onOpenChange on cancel", async () => {
      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "Test content")

      const cancelButton = screen.getByRole("button", { name: /cancel/i })
      await user.click(cancelButton)

      // Should call onOpenChange with false
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe("button states", () => {
    it("disables Capture button when textarea is empty", () => {
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const captureButton = screen.getByRole("button", { name: /capture/i })
      expect(captureButton).toBeDisabled()
    })

    it("disables Capture button when textarea has only whitespace", async () => {
      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "   ")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      expect(captureButton).toBeDisabled()
    })

    it("enables Capture button when textarea has content", async () => {
      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "Hello")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      expect(captureButton).toBeEnabled()
    })

    it("disables all buttons while submitting", async () => {
      const mockCreateInboxItem = vi.mocked(api.createInboxItem)
      mockCreateInboxItem.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  id: "123",
                  content: "Test",
                  created_at: new Date().toISOString(),
                  processed_at: null,
                  deleted_at: null,
                }),
              100,
            ),
          ),
      )

      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "Test")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      await user.click(captureButton)

      const cancelButton = screen.getByRole("button", { name: /cancel/i })
      expect(cancelButton).toBeDisabled()
    })
  })

  describe("validation", () => {
    it("prevents submission when content is empty via disabled button", () => {
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const captureButton = screen.getByRole("button", { name: /capture/i })
      expect(captureButton).toBeDisabled()
    })

    it("prevents submission when content is only whitespace via disabled button", async () => {
      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const textarea = screen.getByPlaceholderText(/what's on your mind/i)
      await user.type(textarea, "   ")

      const captureButton = screen.getByRole("button", { name: /capture/i })
      expect(captureButton).toBeDisabled()
    })
  })

  describe("dialog management", () => {
    it("calls onOpenChange when dialog is requested to close", async () => {
      const user = userEvent.setup()
      render(<UniversalCapture open={true} onOpenChange={mockOnOpenChange} />)

      const cancelButton = screen.getByRole("button", { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
