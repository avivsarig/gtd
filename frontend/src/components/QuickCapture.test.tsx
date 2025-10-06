import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QuickCapture } from "./QuickCapture"

describe("QuickCapture", () => {
  it("renders the form with inputs and button", () => {
    const mockOnSubmit = vi.fn()
    render(<QuickCapture onSubmit={mockOnSubmit} />)

    expect(
      screen.getByPlaceholderText(/what needs to be done/i),
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /create task/i }),
    ).toBeInTheDocument()
  })

  it("button is disabled when title is empty", () => {
    const mockOnSubmit = vi.fn()
    render(<QuickCapture onSubmit={mockOnSubmit} />)

    const button = screen.getByRole("button", { name: /create task/i })
    expect(button).toBeDisabled()
  })

  it("button is enabled when title has content", async () => {
    const mockOnSubmit = vi.fn()
    const user = userEvent.setup()
    render(<QuickCapture onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByPlaceholderText(/what needs to be done/i)
    await user.type(titleInput, "New task")

    const button = screen.getByRole("button", { name: /create task/i })
    expect(button).toBeEnabled()
  })

  it("calls onSubmit with title and description when form is submitted", async () => {
    const mockOnSubmit = vi.fn()
    const user = userEvent.setup()
    render(<QuickCapture onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByPlaceholderText(/what needs to be done/i)
    const descInput = screen.getByPlaceholderText(/description/i)

    await user.type(titleInput, "New task")
    await user.type(descInput, "Task description")

    const button = screen.getByRole("button", { name: /create task/i })
    await user.click(button)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: "New task",
      description: "Task description",
    })
  })

  it("resets form after submission", async () => {
    const mockOnSubmit = vi.fn()
    const user = userEvent.setup()
    render(<QuickCapture onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByPlaceholderText(
      /what needs to be done/i,
    ) as HTMLInputElement
    const descInput = screen.getByPlaceholderText(
      /description/i,
    ) as HTMLTextAreaElement

    await user.type(titleInput, "New task")
    await user.type(descInput, "Task description")

    const button = screen.getByRole("button", { name: /create task/i })
    await user.click(button)

    await waitFor(() => {
      expect(titleInput.value).toBe("")
      expect(descInput.value).toBe("")
    })
  })

  it("trims whitespace from title and description", async () => {
    const mockOnSubmit = vi.fn()
    const user = userEvent.setup()
    render(<QuickCapture onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByPlaceholderText(/what needs to be done/i)
    await user.type(titleInput, "  Whitespace task  ")

    const button = screen.getByRole("button", { name: /create task/i })
    await user.click(button)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: "Whitespace task",
      description: undefined,
    })
  })

  it("shows loading state when isLoading is true", () => {
    const mockOnSubmit = vi.fn()
    render(<QuickCapture onSubmit={mockOnSubmit} isLoading={true} />)

    expect(
      screen.getByRole("button", { name: /creating/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("disables inputs when loading", () => {
    const mockOnSubmit = vi.fn()
    render(<QuickCapture onSubmit={mockOnSubmit} isLoading={true} />)

    const titleInput = screen.getByPlaceholderText(/what needs to be done/i)
    const descInput = screen.getByPlaceholderText(/description/i)

    expect(titleInput).toBeDisabled()
    expect(descInput).toBeDisabled()
  })
})
