/**
 * Tests for validation utilities
 */

import { describe, it, expect } from "vitest"
import {
  validateRequired,
  sanitizeInput,
  sanitizeFormData,
  validateMinLength,
  validateMaxLength,
  combineValidators,
} from "./validation"

describe("validateRequired", () => {
  it("should return null for non-empty values", () => {
    expect(validateRequired("test")).toBeNull()
    expect(validateRequired("  test  ")).toBeNull()
  })

  it("should return error for empty string", () => {
    const result = validateRequired("")
    expect(result).toBeTruthy()
    expect(result).toBe("Please enter something")
  })

  it("should return error for whitespace-only string", () => {
    const result = validateRequired("   ")
    expect(result).toBeTruthy()
    expect(result).toBe("Please enter something")
  })

  it("should use custom field name in error", () => {
    const result = validateRequired("", "Email")
    expect(result).toBe("Email is required")
  })

  it("should use generic message without field name", () => {
    const result = validateRequired("")
    expect(result).toBe("Please enter something")
  })
})

describe("sanitizeInput", () => {
  it("should trim whitespace from strings", () => {
    expect(sanitizeInput("  test  ")).toBe("test")
    expect(sanitizeInput("test")).toBe("test")
  })

  it("should return undefined for empty strings", () => {
    expect(sanitizeInput("")).toBeUndefined()
    expect(sanitizeInput("   ")).toBeUndefined()
  })

  it("should return undefined for undefined input", () => {
    expect(sanitizeInput(undefined)).toBeUndefined()
  })

  it("should preserve non-whitespace content", () => {
    expect(sanitizeInput("  hello world  ")).toBe("hello world")
    expect(sanitizeInput("a b c")).toBe("a b c")
  })
})

describe("sanitizeFormData", () => {
  it("should trim all string fields", () => {
    const input = {
      name: "  test  ",
      description: "  desc  ",
      age: 25,
    }

    const result = sanitizeFormData(input)

    expect(result.name).toBe("test")
    expect(result.description).toBe("desc")
    expect(result.age).toBe(25)
  })

  it("should convert empty strings to undefined", () => {
    const input = {
      name: "test",
      description: "",
      icon: "   ",
    }

    const result = sanitizeFormData(input)

    expect(result.name).toBe("test")
    expect(result.description).toBeUndefined()
    expect(result.icon).toBeUndefined()
  })

  it("should preserve non-string fields", () => {
    const input = {
      name: "test",
      count: 42,
      active: true,
      data: { nested: "object" },
    }

    const result = sanitizeFormData(input)

    expect(result.count).toBe(42)
    expect(result.active).toBe(true)
    expect(result.data).toEqual({ nested: "object" })
  })

  it("should not mutate original object", () => {
    const input = {
      name: "  test  ",
      description: "  desc  ",
    }

    const result = sanitizeFormData(input)

    expect(input.name).toBe("  test  ")
    expect(input.description).toBe("  desc  ")
    expect(result.name).toBe("test")
    expect(result.description).toBe("desc")
  })

  it("should handle empty objects", () => {
    const result = sanitizeFormData({})
    expect(result).toEqual({})
  })
})

describe("validateMinLength", () => {
  it("should return null when value meets minimum", () => {
    expect(validateMinLength("test", 4, "Field")).toBeNull()
    expect(validateMinLength("longer", 4, "Field")).toBeNull()
  })

  it("should return error when value is too short", () => {
    const result = validateMinLength("ab", 3, "Username")
    expect(result).toBe("Username must be at least 3 characters")
  })

  it("should handle zero-length minimum", () => {
    expect(validateMinLength("", 0, "Field")).toBeNull()
  })

  it("should use exact length boundary", () => {
    expect(validateMinLength("abc", 3, "Field")).toBeNull()
    expect(validateMinLength("ab", 3, "Field")).toBeTruthy()
  })
})

describe("validateMaxLength", () => {
  it("should return null when value is within limit", () => {
    expect(validateMaxLength("test", 10, "Field")).toBeNull()
    expect(validateMaxLength("test", 4, "Field")).toBeNull()
  })

  it("should return error when value exceeds limit", () => {
    const result = validateMaxLength("toolong", 5, "Title")
    expect(result).toBe("Title must not exceed 5 characters")
  })

  it("should use exact length boundary", () => {
    expect(validateMaxLength("abc", 3, "Field")).toBeNull()
    expect(validateMaxLength("abcd", 3, "Field")).toBeTruthy()
  })
})

describe("combineValidators", () => {
  it("should return null when all validators pass", () => {
    const validators = [
      (v: string) => validateRequired(v),
      (v: string) => validateMinLength(v, 3, "Field"),
      (v: string) => validateMaxLength(v, 10, "Field"),
    ]

    const result = combineValidators("valid", validators)
    expect(result).toBeNull()
  })

  it("should return first error encountered", () => {
    const validators = [
      (v: string) => validateRequired(v),
      (v: string) => validateMinLength(v, 3, "Field"),
      (v: string) => validateMaxLength(v, 10, "Field"),
    ]

    const result = combineValidators("", validators)
    expect(result).toBe("Please enter something")
  })

  it("should stop at first error", () => {
    let secondValidatorCalled = false

    const validators = [
      () => "First error",
      () => {
        secondValidatorCalled = true
        return null
      },
    ]

    combineValidators("test", validators)
    expect(secondValidatorCalled).toBe(false)
  })

  it("should handle empty validator array", () => {
    const result = combineValidators("test", [])
    expect(result).toBeNull()
  })

  it("should work with custom validators", () => {
    const customValidator = (v: string) =>
      v.includes("@") ? null : "Must contain @"

    const validators = [(v: string) => validateRequired(v), customValidator]

    expect(combineValidators("test@example", validators)).toBeNull()
    expect(combineValidators("test", validators)).toBe("Must contain @")
  })
})

describe("integration scenarios", () => {
  it("should validate form submission", () => {
    const formData = {
      name: "  John Doe  ",
      email: "",
      password: "short",
    }

    // Validate name
    const sanitizedName = sanitizeInput(formData.name)!
    expect(validateRequired(sanitizedName, "Name")).toBeNull()

    // Validate email
    const emailError = validateRequired(formData.email, "Email")
    expect(emailError).toBeTruthy()

    // Validate password
    const passwordError = combineValidators(formData.password, [
      (v) => validateRequired(v, "Password"),
      (v) => validateMinLength(v, 8, "Password"),
    ])
    expect(passwordError).toContain("at least 8")
  })

  it("should sanitize form data before submission", () => {
    const formData = {
      title: "  My Task  ",
      description: "   ",
      status: "next" as const,
      project_id: null,
    }

    const sanitized = sanitizeFormData(formData)

    expect(sanitized.title).toBe("My Task")
    expect(sanitized.description).toBeUndefined()
    expect(sanitized.status).toBe("next")
    expect(sanitized.project_id).toBeNull()
  })
})
