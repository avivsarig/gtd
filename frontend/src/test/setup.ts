import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock sonner toast globally
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
  Toaster: () => null,
}))

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})
