/**
 * Tests for error handling utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  getErrorMessage,
  logError,
  notifyError,
  handleError,
} from "./errorHandling"

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
  let alertSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    alertSpy.mockRestore()
  })

  it("should notify and log by default", () => {
    notifyError("Something went wrong")

    expect(consoleErrorSpy).toHaveBeenCalledWith("Something went wrong")
    expect(alertSpy).toHaveBeenCalledWith("Something went wrong")
  })

  it("should notify without logging when log=false", () => {
    notifyError("Something went wrong", { log: false })

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    expect(alertSpy).toHaveBeenCalledWith("Something went wrong")
  })

  it("should accept duration option for future use", () => {
    // Should not throw even though duration isn't used yet
    expect(() => {
      notifyError("Test message", { duration: 3000 })
    }).not.toThrow()

    expect(alertSpy).toHaveBeenCalledWith("Test message")
  })

  it("should accept severity option for future use", () => {
    // Should not throw even though severity isn't used yet
    expect(() => {
      notifyError("Warning message", { severity: "warning" })
    }).not.toThrow()

    expect(alertSpy).toHaveBeenCalledWith("Warning message")
  })
})

describe("handleError", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let alertSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    alertSpy.mockRestore()
  })

  it("should extract message, log, but not notify by default", () => {
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
    expect(alertSpy).not.toHaveBeenCalled()
  })

  it("should notify when notify=true", () => {
    const error = new Error("Delete failed")
    const result = handleError(error, "Failed to delete task", "Fallback", {
      notify: true,
    })

    expect(result).toBe("Delete failed")
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[Failed to delete task]:",
      error,
    )
    expect(alertSpy).toHaveBeenCalledWith("Delete failed")
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

  it("should handle notify=true and log=false together", () => {
    const error = new Error("Test error")
    handleError(error, "Context", "Fallback", { notify: true, log: false })

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    expect(alertSpy).toHaveBeenCalledWith("Test error")
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
  let alertSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    alertSpy.mockRestore()
  })

  it("should handle typical component error scenario", () => {
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
    expect(alertSpy).not.toHaveBeenCalled()
  })

  it("should handle delete operation with user notification", () => {
    const error = new Error("Task not found")
    handleError(error, "Delete task failed", "Failed to delete task", {
      notify: true,
    })

    expect(alertSpy).toHaveBeenCalledWith("Task not found")
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
