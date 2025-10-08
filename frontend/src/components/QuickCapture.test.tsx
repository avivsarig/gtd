import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QuickCapture } from "./QuickCapture"
import * as api from "@/lib/api"

// Mock the API
vi.mock("@/lib/api", () => ({
  createInboxItem: vi.fn(),
}))

describe("QuickCapture", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the form with textarea and button", () => {
    render(<QuickCapture />)

    expect(
      screen.getByPlaceholderText(/what's on your mind/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /capture to inbox/i }),
    ).toBeInTheDocument()
  })

  it("button is disabled when content is empty", () => {
    render(<QuickCapture />)

    const button = screen.getByRole("button", { name: /capture to inbox/i })
    expect(button).toBeDisabled()
  })

  it("button is enabled when content has text", async () => {
    const user = userEvent.setup()
    render(<QuickCapture />)

    const textarea = screen.getByPlaceholderText(/what's on your mind/i)
    await user.type(textarea, "New thought")

    const button = screen.getByRole("button", { name: /capture to inbox/i })
    expect(button).toBeEnabled()
  })

  it("creates inbox item when form is submitted", async () => {
    const mockCreateInboxItem = vi.mocked(api.createInboxItem)
    mockCreateInboxItem.mockResolvedValue({
      id: "123",
      content: "New thought",
      created_at: new Date().toISOString(),
      processed_at: null,
      deleted_at: null,
    })

    const user = userEvent.setup()
    render(<QuickCapture />)

    const textarea = screen.getByPlaceholderText(/what's on your mind/i)
    await user.type(textarea, "New thought")

    const button = screen.getByRole("button", { name: /capture to inbox/i })
    await user.click(button)

    await waitFor(() => {
      expect(mockCreateInboxItem).toHaveBeenCalledWith({
        content: "New thought",
      })
    })
  })

  it("resets form after successful submission", async () => {
    const mockCreateInboxItem = vi.mocked(api.createInboxItem)
    mockCreateInboxItem.mockResolvedValue({
      id: "123",
      content: "New thought",
      created_at: new Date().toISOString(),
      processed_at: null,
      deleted_at: null,
    })

    const user = userEvent.setup()
    render(<QuickCapture />)

    const textarea = screen.getByPlaceholderText(
      /what's on your mind/i,
    ) as HTMLTextAreaElement

    await user.type(textarea, "New thought")
    const button = screen.getByRole("button", { name: /capture to inbox/i })
    await user.click(button)

    await waitFor(() => {
      expect(textarea.value).toBe("")
    })
  })

  it("calls onSuccess callback after successful submission", async () => {
    const mockCreateInboxItem = vi.mocked(api.createInboxItem)
    mockCreateInboxItem.mockResolvedValue({
      id: "123",
      content: "New thought",
      created_at: new Date().toISOString(),
      processed_at: null,
      deleted_at: null,
    })

    const mockOnSuccess = vi.fn()
    const user = userEvent.setup()
    render(<QuickCapture onSuccess={mockOnSuccess} />)

    const textarea = screen.getByPlaceholderText(/what's on your mind/i)
    await user.type(textarea, "New thought")

    const button = screen.getByRole("button", { name: /capture to inbox/i })
    await user.click(button)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it("shows error message when API call fails", async () => {
    const mockCreateInboxItem = vi.mocked(api.createInboxItem)
    mockCreateInboxItem.mockRejectedValue(new Error("API Error"))

    const user = userEvent.setup()
    render(<QuickCapture />)

    const textarea = screen.getByPlaceholderText(/what's on your mind/i)
    await user.type(textarea, "New thought")

    const button = screen.getByRole("button", { name: /capture to inbox/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument()
    })
  })

  it("submits on Enter key (but not Shift+Enter)", async () => {
    const mockCreateInboxItem = vi.mocked(api.createInboxItem)
    mockCreateInboxItem.mockResolvedValue({
      id: "123",
      content: "New thought",
      created_at: new Date().toISOString(),
      processed_at: null,
      deleted_at: null,
    })

    const user = userEvent.setup()
    render(<QuickCapture />)

    const textarea = screen.getByPlaceholderText(/what's on your mind/i)
    await user.type(textarea, "New thought")
    await user.keyboard("{Enter}")

    await waitFor(() => {
      expect(mockCreateInboxItem).toHaveBeenCalled()
    })
  })
})
