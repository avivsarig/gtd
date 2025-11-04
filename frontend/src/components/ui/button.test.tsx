import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "./button"

describe("Button", () => {
  describe("Basic Rendering", () => {
    it("renders button with text", () => {
      render(<Button>Click me</Button>)

      expect(
        screen.getByRole("button", { name: "Click me" }),
      ).toBeInTheDocument()
    })

    it("renders button with children", () => {
      render(
        <Button>
          <span>Button Text</span>
        </Button>,
      )

      expect(screen.getByText("Button Text")).toBeInTheDocument()
    })

    it("applies custom className", () => {
      render(<Button className="custom-class">Button</Button>)

      const button = screen.getByRole("button")
      expect(button).toHaveClass("custom-class")
    })
  })

  describe("Variants", () => {
    it("renders default variant", () => {
      render(<Button variant="default">Default</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("renders destructive variant", () => {
      render(<Button variant="destructive">Delete</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("renders outline variant", () => {
      render(<Button variant="outline">Outline</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("renders secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("renders ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("renders link variant", () => {
      render(<Button variant="link">Link</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })
  })

  describe("Sizes", () => {
    it("renders default size", () => {
      render(<Button size="default">Default Size</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("renders small size", () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("renders large size", () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })

    it("renders icon size", () => {
      render(<Button size="icon">Icon</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })
  })

  describe("Variant and Size Combinations", () => {
    it("renders destructive small button", () => {
      render(
        <Button variant="destructive" size="sm">
          Delete
        </Button>,
      )

      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("renders outline large button", () => {
      render(
        <Button variant="outline" size="lg">
          Outline Large
        </Button>,
      )

      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("renders ghost icon button", () => {
      render(
        <Button variant="ghost" size="icon">
          X
        </Button>,
      )

      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("renders secondary small button", () => {
      render(
        <Button variant="secondary" size="sm">
          Secondary Small
        </Button>,
      )

      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("renders link default button", () => {
      render(
        <Button variant="link" size="default">
          Link Button
        </Button>,
      )

      expect(screen.getByRole("button")).toBeInTheDocument()
    })
  })

  describe("Interactions", () => {
    it("handles click events", async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(<Button onClick={handleClick}>Click me</Button>)

      await user.click(screen.getByRole("button"))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("does not trigger click when disabled", async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      )

      const button = screen.getByRole("button")
      expect(button).toBeDisabled()

      await user.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe("HTML Attributes", () => {
    it("accepts type attribute", () => {
      render(<Button type="submit">Submit</Button>)

      const button = screen.getByRole("button")
      expect(button).toHaveAttribute("type", "submit")
    })

    it("accepts disabled attribute", () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeDisabled()
    })

    it("accepts aria-label attribute", () => {
      render(<Button aria-label="Close dialog">X</Button>)

      const button = screen.getByRole("button", { name: "Close dialog" })
      expect(button).toBeInTheDocument()
    })

    it("accepts data attributes", () => {
      render(<Button data-testid="custom-button">Button</Button>)

      expect(screen.getByTestId("custom-button")).toBeInTheDocument()
    })
  })

  describe("asChild Prop", () => {
    it("renders as child component when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>,
      )

      const link = screen.getByRole("link", { name: "Link Button" })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute("href", "/test")
    })

    it("applies button styles to child component", () => {
      render(
        <Button asChild variant="outline">
          <a href="/test">Styled Link</a>
        </Button>,
      )

      const link = screen.getByRole("link")
      expect(link).toBeInTheDocument()
    })
  })

  describe("With Icons", () => {
    it("renders button with icon", () => {
      render(
        <Button>
          <svg data-testid="icon">
            <path />
          </svg>
          <span>With Icon</span>
        </Button>,
      )

      expect(screen.getByTestId("icon")).toBeInTheDocument()
      expect(screen.getByText("With Icon")).toBeInTheDocument()
    })

    it("renders icon-only button", () => {
      render(
        <Button size="icon" aria-label="Settings">
          <svg data-testid="settings-icon">
            <path />
          </svg>
        </Button>,
      )

      expect(screen.getByTestId("settings-icon")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Settings" }),
      ).toBeInTheDocument()
    })
  })
})
