/**
 * Form Validation Utilities
 *
 * Reusable validation functions to eliminate duplication and provide
 * consistent validation logic across forms.
 *
 * Benefits:
 * - DRY: Single implementation of common validation patterns
 * - Consistency: Uniform validation behavior
 * - Testability: Pure functions, easy to test
 * - Maintainability: Centralized validation rules
 */

import { MESSAGES } from "./messages"

/**
 * Validate that a field is not empty
 *
 * @param value - The value to validate
 * @param fieldName - Optional field name for custom error message
 * @returns Error message if invalid, null if valid
 *
 * @example
 * const error = validateRequired(formData.name, "Name")
 * if (error) {
 *   setError(error)
 *   return
 * }
 */
export function validateRequired(
  value: string,
  fieldName?: string,
): string | null {
  if (!value || !value.trim()) {
    if (fieldName) {
      return `${fieldName} is required`
    }
    return MESSAGES.validation.REQUIRED_FIELD
  }
  return null
}

/**
 * Sanitize user input by trimming whitespace
 *
 * Eliminates the repeated `.trim()` pattern throughout the codebase.
 *
 * @param value - The value to sanitize
 * @returns Trimmed value, or undefined if original was undefined
 *
 * @example
 * const sanitized = sanitizeInput(formData.description)
 * // Use directly: createTask({ title: sanitizeInput(title) })
 */
export function sanitizeInput(value: string | undefined): string | undefined {
  return value?.trim() || undefined
}

/**
 * Sanitize an object's string fields
 *
 * Applies sanitizeInput to all string fields in an object.
 * Useful for form submission where multiple fields need trimming.
 *
 * @param obj - Object with string fields to sanitize
 * @returns New object with sanitized fields
 *
 * @example
 * const sanitizedData = sanitizeFormData({
 *   name: "  Test  ",
 *   description: "  Some text  ",
 *   icon: ""
 * })
 * // Result: { name: "Test", description: "Some text", icon: undefined }
 */
export function sanitizeFormData<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj }

  for (const key in result) {
    const value = result[key]
    if (typeof value === "string") {
      const trimmed = value.trim()
      // @ts-expect-error - Type system doesn't know we're handling strings correctly
      result[key] = trimmed || undefined
    }
  }

  return result
}

/**
 * Validate minimum length
 *
 * @param value - The value to validate
 * @param minLength - Minimum required length
 * @param fieldName - Field name for error message
 * @returns Error message if invalid, null if valid
 *
 * @example
 * const error = validateMinLength(password, 8, "Password")
 * // Returns: "Password must be at least 8 characters"
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string,
): string | null {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`
  }
  return null
}

/**
 * Validate maximum length
 *
 * @param value - The value to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - Field name for error message
 * @returns Error message if invalid, null if valid
 *
 * @example
 * const error = validateMaxLength(title, 100, "Title")
 * // Returns: "Title must not exceed 100 characters"
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string,
): string | null {
  if (value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`
  }
  return null
}

/**
 * Combine multiple validation functions
 *
 * Runs validators in order and returns the first error encountered.
 *
 * @param value - The value to validate
 * @param validators - Array of validation functions
 * @returns First error message encountered, or null if all pass
 *
 * @example
 * const error = combineValidators(username, [
 *   (v) => validateRequired(v, "Username"),
 *   (v) => validateMinLength(v, 3, "Username"),
 *   (v) => validateMaxLength(v, 20, "Username")
 * ])
 */
export function combineValidators(
  value: string,
  validators: Array<(value: string) => string | null>,
): string | null {
  for (const validator of validators) {
    const error = validator(value)
    if (error) {
      return error
    }
  }
  return null
}
