/**
 * Tests for Progress component
 *
 * Validates progress bar display with percentages and variants.
 */

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Progress, getProgressVariant } from "./progress"

describe("Progress", () => {
  describe("test_rendering_validProps_displaysProgressBar", () => {
    it("should render progress bar with correct percentage", () => {
      render(<Progress current={50} total={100} />)

      const progressBar = screen.getByRole("progressbar")
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute("aria-valuenow", "50")
      expect(progressBar).toHaveAttribute("aria-valuemin", "0")
      expect(progressBar).toHaveAttribute("aria-valuemax", "100")
    })

    it("should display label when showLabel is true", () => {
      render(<Progress current={25} total={100} showLabel />)

      expect(screen.getByText("25/100")).toBeInTheDocument()
    })

    it("should not display label when showLabel is false", () => {
      render(<Progress current={25} total={100} showLabel={false} />)

      expect(screen.queryByText("25/100")).not.toBeInTheDocument()
    })
  })

  describe("test_percentageCalculation_edgeCases_handlesCorrectly", () => {
    it("should handle 0 total as 0%", () => {
      render(<Progress current={10} total={0} />)

      const progressBar = screen.getByRole("progressbar")
      expect(progressBar).toHaveAttribute("aria-valuenow", "10")
      expect(progressBar).toHaveAttribute("aria-valuemax", "0")
    })

    it("should handle current > total by capping at 100%", () => {
      render(<Progress current={150} total={100} />)

      const progressBar = screen.getByRole("progressbar")
      expect(progressBar).toHaveAttribute("aria-valuenow", "150")
    })

    it("should handle negative values gracefully", () => {
      render(<Progress current={-10} total={100} />)

      const progressBar = screen.getByRole("progressbar")
      expect(progressBar).toBeInTheDocument()
    })

    it("should handle 100% completion", () => {
      render(<Progress current={100} total={100} showLabel />)

      expect(screen.getByText("100/100")).toBeInTheDocument()
    })

    it("should handle 0% completion", () => {
      render(<Progress current={0} total={100} showLabel />)

      expect(screen.getByText("0/100")).toBeInTheDocument()
    })
  })

  describe("test_variants_differentStates_appliesCorrectStyling", () => {
    it("should apply default variant styling", () => {
      const { container } = render(
        <Progress current={50} total={100} variant="default" />,
      )

      const progressFill = container.querySelector(
        ".bg-blue-500, .bg-yellow-500",
      )
      expect(progressFill).toBeInTheDocument()
    })

    it("should apply success variant styling", () => {
      const { container } = render(
        <Progress current={50} total={100} variant="success" />,
      )

      const progressFill = container.querySelector(".bg-green-500")
      expect(progressFill).toBeInTheDocument()
    })

    it("should apply warning variant styling", () => {
      const { container } = render(
        <Progress current={50} total={100} variant="warning" />,
      )

      const progressFill = container.querySelector(".bg-yellow-500")
      expect(progressFill).toBeInTheDocument()
    })

    it("should apply danger variant styling", () => {
      const { container } = render(
        <Progress current={50} total={100} variant="danger" />,
      )

      const progressFill = container.querySelector(".bg-red-500")
      expect(progressFill).toBeInTheDocument()
    })
  })

  describe("test_sizes_differentSizes_appliesCorrectHeight", () => {
    it("should apply small size", () => {
      const { container } = render(
        <Progress current={50} total={100} size="sm" />,
      )

      const progressBar = container.querySelector(".h-1")
      expect(progressBar).toBeInTheDocument()
    })

    it("should apply medium size by default", () => {
      const { container } = render(<Progress current={50} total={100} />)

      const progressBar = container.querySelector(".h-2")
      expect(progressBar).toBeInTheDocument()
    })

    it("should apply large size", () => {
      const { container } = render(
        <Progress current={50} total={100} size="lg" />,
      )

      const progressBar = container.querySelector(".h-3")
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe("test_accessibility_progressBar_hasCorrectAttributes", () => {
    it("should have proper aria labels", () => {
      render(<Progress current={30} total={100} />)

      const progressBar = screen.getByRole("progressbar")
      expect(progressBar).toHaveAttribute("aria-label", "Progress: 30 of 100")
    })

    it("should be accessible with screen readers", () => {
      render(<Progress current={75} total={150} />)

      const progressBar = screen.getByRole("progressbar")
      expect(progressBar).toHaveAttribute("aria-valuenow", "75")
      expect(progressBar).toHaveAttribute("aria-valuemin", "0")
      expect(progressBar).toHaveAttribute("aria-valuemax", "150")
    })
  })

  describe("test_customClassName_providedClass_appliesCorrectly", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <Progress current={50} total={100} className="custom-class" />,
      )

      const wrapper = container.querySelector(".custom-class")
      expect(wrapper).toBeInTheDocument()
    })
  })
})

describe("getProgressVariant", () => {
  describe("test_variantCalculation_differentPercentages_returnsCorrectVariant", () => {
    it("should return success for 100%", () => {
      expect(getProgressVariant(100)).toBe("success")
    })

    it("should return success for > 100%", () => {
      expect(getProgressVariant(150)).toBe("success")
    })

    it("should return default for 75-99%", () => {
      expect(getProgressVariant(75)).toBe("default")
      expect(getProgressVariant(90)).toBe("default")
      expect(getProgressVariant(99)).toBe("default")
    })

    it("should return warning for 25-74%", () => {
      expect(getProgressVariant(25)).toBe("warning")
      expect(getProgressVariant(50)).toBe("warning")
      expect(getProgressVariant(74)).toBe("warning")
    })

    it("should return danger for < 25%", () => {
      expect(getProgressVariant(0)).toBe("danger")
      expect(getProgressVariant(10)).toBe("danger")
      expect(getProgressVariant(24)).toBe("danger")
    })
  })
})
