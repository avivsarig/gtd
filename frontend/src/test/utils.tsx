/**
 * Test utilities
 *
 * Custom render functions and test helpers.
 */

import { render, type RenderOptions } from "@testing-library/react"
import  { type ReactElement } from "react"

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  // Add custom options here as needed
}

/**
 * Custom render function with providers
 *
 * Use this instead of @testing-library/react's render when you need
 * to wrap components with providers (Router, Context, etc.)
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

export * from "@testing-library/react"
export { renderWithProviders as render }
