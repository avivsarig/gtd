import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

describe("Dialog", () => {
  describe("Dialog Root", () => {
    it("renders dialog trigger", () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
        </Dialog>,
      )

      expect(screen.getByText("Open Dialog")).toBeInTheDocument()
    })

    it("opens dialog when trigger is clicked", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      expect(screen.getByText("Dialog Title")).toBeInTheDocument()
    })
  })

  describe("DialogContent", () => {
    it("renders dialog content when open", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <div>Dialog content</div>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      expect(screen.getByText("Dialog content")).toBeInTheDocument()
    })

    it("renders close button", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
    })

    it("applies custom className to content", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent className="custom-dialog" data-testid="dialog-content">
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      const content = screen.getByTestId("dialog-content")
      expect(content).toHaveClass("custom-dialog")
    })
  })

  describe("DialogHeader", () => {
    it("renders dialog header", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader data-testid="header">
              <DialogTitle>Header Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      expect(screen.getByTestId("header")).toBeInTheDocument()
      expect(screen.getByText("Header Title")).toBeInTheDocument()
    })

    it("applies custom className to header", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader className="custom-header" data-testid="header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      expect(screen.getByTestId("header")).toHaveClass("custom-header")
    })
  })

  describe("DialogTitle", () => {
    it("renders dialog title", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>My Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      expect(screen.getByText("My Dialog Title")).toBeInTheDocument()
    })

    it("applies custom className to title", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle className="custom-title" data-testid="title">
              Title
            </DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      expect(screen.getByTestId("title")).toHaveClass("custom-title")
    })
  })

  describe("DialogDescription", () => {
    it("renders dialog description", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Dialog description text</DialogDescription>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      expect(screen.getByText("Dialog description text")).toBeInTheDocument()
    })

    it("applies custom className to description", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription
              className="custom-desc"
              data-testid="description"
            >
              Description
            </DialogDescription>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      expect(screen.getByTestId("description")).toHaveClass("custom-desc")
    })
  })

  describe("DialogFooter", () => {
    it("renders dialog footer", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter data-testid="footer">
              <button>Save</button>
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      expect(screen.getByTestId("footer")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    })

    it("applies custom className to footer", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter className="custom-footer" data-testid="footer">
              <button>OK</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open"))

      expect(screen.getByTestId("footer")).toHaveClass("custom-footer")
    })
  })

  describe("Complete Dialog Composition", () => {
    it("renders complete dialog with all parts", async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Dialog</DialogTitle>
              <DialogDescription>This is a complete dialog</DialogDescription>
            </DialogHeader>
            <div>Dialog body content</div>
            <DialogFooter>
              <button>Cancel</button>
              <button>Submit</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByText("Open Dialog"))

      expect(screen.getByText("Complete Dialog")).toBeInTheDocument()
      expect(screen.getByText("This is a complete dialog")).toBeInTheDocument()
      expect(screen.getByText("Dialog body content")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
    })
  })

  describe("Controlled Dialog", () => {
    it("can be controlled with open prop", () => {
      const { rerender } = render(
        <Dialog open={false}>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      expect(screen.queryByText("Controlled Dialog")).not.toBeInTheDocument()

      rerender(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>,
      )

      expect(screen.getByText("Controlled Dialog")).toBeInTheDocument()
    })
  })
})
