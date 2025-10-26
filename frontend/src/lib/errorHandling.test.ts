/**
 * Tests for error handling utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  getErrorMessage,
  logError,
  notifyError,
  notifySuccess,
  notifyInfo,
  handleError,
} from "./errorHandling"

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}))

describe("getErrorMessage", () => {
  it("should extract message from Error instance", () => {
    const error = new Error("Network timeout")
    const result = getErrorMessage(error, "Fallback message")

    expect(result).toBe("Network timeout")
  })

  it("should return fallback for non-Error objects", () => {
    const result = getErrorMessage({ foo: "bar" }, "Fallback message")

    expect(result).toBe("Fallback message")
  })

  it("should return fallback for null", () => {
    const result = getErrorMessage(null, "Fallback message")

    expect(result).toBe("Fallback message")
  })

  it("should return fallback for undefined", () => {
    const result = getErrorMessage(undefined, "Fallback message")

    expect(result).toBe("Fallback message")
  })

  it("should return fallback for string errors (untrusted)", () => {
    const result = getErrorMessage("String error", "Fallback message")

    expect(result).toBe("Fallback message")
  })

  it("should return fallback for numbers", () => {
    const result = getErrorMessage(404, "Fallback message")

    expect(result).toBe("Fallback message")
  })

  it("should handle custom Error subclasses", () => {
    class CustomError extends Error {
      constructor(message: string) {
        super(message)
        this.name = "CustomError"
      }
    }

    const error = new CustomError("Custom error occurred")
    const result = getErrorMessage(error, "Fallback message")

    expect(result).toBe("Custom error occurred")
  })
})

describe("logError", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it("should log Error instances with context", () => {
    const error = new Error("Test error")
    logError("Failed to load data", error)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[Failed to load data]:",
      error,
    )
  })

  it("should log non-Error values with context", () => {
    const errorValue = "Something went wrong"
    logError("Operation failed", errorValue)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[Operation failed]:",
      errorValue,
    )
  })

  it("should log objects with context", () => {
    const errorObj = { status: 404, message: "Not found" }
    logError("API call failed", errorObj)

    expect(consoleErrorSpy).toHaveBeenCalledWith("[API call failed]:", errorObj)
  })

  it("should handle null errors", () => {
    logError("Null error", null)

    expect(consoleErrorSpy).toHaveBeenCalledWith("[Null error]:", null)
  })
})

describe("notifyError", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it("should notify and log by default", async () => {
    const { toast } = await import("sonner")
    notifyError("Something went wrong")

    expect(consoleErrorSpy).toHaveBeenCalledWith("Something went wrong")
    expect(toast.error).toHaveBeenCalledWith("Something went wrong", {
      duration: 4000,
    })
  })

  it("should notify without logging when log=false", async () => {
    const { toast } = await import("sonner")
    notifyError("Something went wrong", { log: false })

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith("Something went wrong", {
      duration: 4000,
    })
  })

  it("should accept duration option", async () => {
    const { toast } = await import("sonner")
    notifyError("Test message", { duration: 3000 })

    expect(toast.error).toHaveBeenCalledWith("Test message", { duration: 3000 })
  })

  it("should accept severity option for future use", async () => {
    const { toast } = await import("sonner")
    expect(() => {
      notifyError("Warning message", { severity: "warning" })
    }).not.toThrow()

    expect(toast.error).toHaveBeenCalled()
  })
})

describe("notifySuccess", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should call toast.success with default duration", async () => {
    const { toast } = await import("sonner")
    notifySuccess("Task completed!")

    expect(toast.success).toHaveBeenCalledWith("Task completed!", {
      duration: 3000,
    })
  })

  it("should accept custom duration", async () => {
    const { toast } = await import("sonner")
    notifySuccess("Task completed!", { duration: 5000 })

    expect(toast.success).toHaveBeenCalledWith("Task completed!", {
      duration: 5000,
    })
  })
})

describe("notifyInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should call toast.info with default duration", async () => {
    const { toast } = await import("sonner")
    notifyInfo("Feature coming soon")

    expect(toast.info).toHaveBeenCalledWith("Feature coming soon", {
      duration: 3000,
    })
  })

  it("should accept custom duration", async () => {
    const { toast } = await import("sonner")
    notifyInfo("Feature coming soon", { duration: 2000 })

    expect(toast.info).toHaveBeenCalledWith("Feature coming soon", {
      duration: 2000,
    })
  })
})

describe("handleError", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it("should extract message, log, but not notify by default", async () => {
    const { toast } = await import("sonner")
    const error = new Error("Network error")
    const result = handleError(
      error,
      "Failed to fetch data",
      "Fallback message",
    )

    expect(result).toBe("Network error")
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[Failed to fetch data]:",
      error,
    )
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("should notify when notify=true", async () => {
    const { toast } = await import("sonner")
    const error = new Error("Delete failed")
    const result = handleError(error, "Failed to delete task", "Fallback", {
      notify: true,
    })

    expect(result).toBe("Delete failed")
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[Failed to delete task]:",
      error,
    )
    expect(toast.error).toHaveBeenCalledWith("Delete failed", {
      duration: 4000,
    })
  })

  it("should not log when log=false", () => {
    const error = new Error("Test error")
    handleError(error, "Context", "Fallback", { log: false })

    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  it("should use fallback for non-Error types", () => {
    const result = handleError(
      { unknown: "object" },
      "Failed operation",
      "Operation failed",
    )

    expect(result).toBe("Operation failed")
  })

  it("should handle notify=true and log=false together", async () => {
    const { toast } = await import("sonner")
    const error = new Error("Test error")
    handleError(error, "Context", "Fallback", { notify: true, log: false })

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith("Test error", { duration: 4000 })
  })

  it("should return extracted message for state management", () => {
    const error = new Error("Validation failed")
    const message = handleError(error, "Form submission", "Submit failed")

    // Useful for: setError(message)
    expect(message).toBe("Validation failed")
    expect(typeof message).toBe("string")
  })

  it("should return fallback for string errors (untrusted)", () => {
    const result = handleError(
      "String error message",
      "Operation context",
      "Fallback",
    )

    expect(result).toBe("Fallback")
  })

  it("should pass through additional options", () => {
    const error = new Error("Test")

    // Should not throw even with extra options
    expect(() => {
      handleError(error, "Context", "Fallback", {
        notify: true,
        duration: 5000,
        severity: "error",
      })
    }).not.toThrow()
  })
})

describe("integration scenarios", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it("should handle typical component error scenario", async () => {
    const { toast } = await import("sonner")
    // Simulating: try { await api() } catch (err) { handleError(...) }
    const apiError = new Error("Network timeout")
    const message = handleError(
      apiError,
      "Failed to load tasks",
      "Could not load tasks",
      { notify: false },
    )

    expect(message).toBe("Network timeout")
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("should handle delete operation with user notification", async () => {
    const { toast } = await import("sonner")
    const error = new Error("Task not found")
    handleError(error, "Delete task failed", "Failed to delete task", {
      notify: true,
    })

    expect(toast.error).toHaveBeenCalledWith("Task not found", {
      duration: 4000,
    })
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
