import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "./card"

describe("Card", () => {
  describe("Card", () => {
    it("renders card with default styling", () => {
      render(<Card data-testid="card">Card content</Card>)

      const card = screen.getByTestId("card")
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute("data-slot", "card")
    })

    it("applies custom className", () => {
      render(
        <Card data-testid="card" className="custom-class">
          Card content
        </Card>,
      )

      const card = screen.getByTestId("card")
      expect(card).toHaveClass("custom-class")
    })

    it("renders children correctly", () => {
      render(
        <Card>
          <div>Child content</div>
        </Card>,
      )

      expect(screen.getByText("Child content")).toBeInTheDocument()
    })
  })

  describe("CardHeader", () => {
    it("renders card header with default styling", () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>)

      const header = screen.getByTestId("header")
      expect(header).toBeInTheDocument()
      expect(header).toHaveAttribute("data-slot", "card-header")
    })

    it("applies custom className", () => {
      render(
        <CardHeader data-testid="header" className="custom-header">
          Header
        </CardHeader>,
      )

      const header = screen.getByTestId("header")
      expect(header).toHaveClass("custom-header")
    })

    it("renders children correctly", () => {
      render(<CardHeader>Header text</CardHeader>)

      expect(screen.getByText("Header text")).toBeInTheDocument()
    })
  })

  describe("CardTitle", () => {
    it("renders card title with default styling", () => {
      render(<CardTitle data-testid="title">Title text</CardTitle>)

      const title = screen.getByTestId("title")
      expect(title).toBeInTheDocument()
      expect(title).toHaveAttribute("data-slot", "card-title")
    })

    it("applies custom className", () => {
      render(
        <CardTitle data-testid="title" className="custom-title">
          Title
        </CardTitle>,
      )

      const title = screen.getByTestId("title")
      expect(title).toHaveClass("custom-title")
    })

    it("renders title text", () => {
      render(<CardTitle>My Card Title</CardTitle>)

      expect(screen.getByText("My Card Title")).toBeInTheDocument()
    })
  })

  describe("CardDescription", () => {
    it("renders card description with default styling", () => {
      render(
        <CardDescription data-testid="description">
          Description text
        </CardDescription>,
      )

      const description = screen.getByTestId("description")
      expect(description).toBeInTheDocument()
      expect(description).toHaveAttribute("data-slot", "card-description")
    })

    it("applies custom className", () => {
      render(
        <CardDescription data-testid="description" className="custom-desc">
          Description
        </CardDescription>,
      )

      const description = screen.getByTestId("description")
      expect(description).toHaveClass("custom-desc")
    })

    it("renders description text", () => {
      render(<CardDescription>Card description here</CardDescription>)

      expect(screen.getByText("Card description here")).toBeInTheDocument()
    })
  })

  describe("CardAction", () => {
    it("renders card action with default styling", () => {
      render(
        <CardAction data-testid="action">
          <button>Action</button>
        </CardAction>,
      )

      const action = screen.getByTestId("action")
      expect(action).toBeInTheDocument()
      expect(action).toHaveAttribute("data-slot", "card-action")
    })

    it("applies custom className", () => {
      render(
        <CardAction data-testid="action" className="custom-action">
          Action
        </CardAction>,
      )

      const action = screen.getByTestId("action")
      expect(action).toHaveClass("custom-action")
    })

    it("renders action buttons", () => {
      render(
        <CardAction>
          <button>Edit</button>
        </CardAction>,
      )

      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument()
    })
  })

  describe("CardContent", () => {
    it("renders card content with default styling", () => {
      render(<CardContent data-testid="content">Content text</CardContent>)

      const content = screen.getByTestId("content")
      expect(content).toBeInTheDocument()
      expect(content).toHaveAttribute("data-slot", "card-content")
    })

    it("applies custom className", () => {
      render(
        <CardContent data-testid="content" className="custom-content">
          Content
        </CardContent>,
      )

      const content = screen.getByTestId("content")
      expect(content).toHaveClass("custom-content")
    })

    it("renders content children", () => {
      render(
        <CardContent>
          <p>Paragraph content</p>
        </CardContent>,
      )

      expect(screen.getByText("Paragraph content")).toBeInTheDocument()
    })
  })

  describe("CardFooter", () => {
    it("renders card footer with default styling", () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>)

      const footer = screen.getByTestId("footer")
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveAttribute("data-slot", "card-footer")
    })

    it("applies custom className", () => {
      render(
        <CardFooter data-testid="footer" className="custom-footer">
          Footer
        </CardFooter>,
      )

      const footer = screen.getByTestId("footer")
      expect(footer).toHaveClass("custom-footer")
    })

    it("renders footer buttons", () => {
      render(
        <CardFooter>
          <button>Save</button>
          <button>Cancel</button>
        </CardFooter>,
      )

      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    })
  })

  describe("Complete Card Composition", () => {
    it("renders all card parts together", () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>
              <button>Edit</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Main content</p>
          </CardContent>
          <CardFooter>
            <button>Save</button>
          </CardFooter>
        </Card>,
      )

      expect(screen.getByTestId("complete-card")).toBeInTheDocument()
      expect(screen.getByText("Card Title")).toBeInTheDocument()
      expect(screen.getByText("Card Description")).toBeInTheDocument()
      expect(screen.getByText("Main content")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
    })
  })
})
