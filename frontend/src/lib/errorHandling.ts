/**
 * Error Handling Utilities
 *
 * Centralized error handling to eliminate duplication and provide
 * consistent error management across the application.
 *
 * Benefits:
 * - DRY: Single implementation of error extraction logic
 * - Consistency: Uniform error handling patterns
 * - Testability: Pure functions, easy to test
 * - Future-proof: Easy to add toast notifications or error tracking
 */

import { toast } from "sonner"

/**
 * Extract a user-friendly error message from an unknown error type
 *
 * Handles the common pattern: `err instanceof Error ? err.message : fallback`
 *
 * Only Error instances are considered trusted error messages.
 * All other types (strings, objects, null, etc.) use the fallback for security.
 *
 * @param error - The error to extract a message from (can be Error or unknown)
 * @param fallback - Default message if error is not an Error instance
 * @returns User-friendly error message
 *
 * @example
 * try {
 *   await api.call()
 * } catch (err) {
 *   const message = getErrorMessage(err, 'Failed to perform action')
 *   setError(message)
 * }
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

/**
 * Log an error to the console with context
 *
 * Provides structured error logging with consistent formatting.
 * In production, this could be extended to send to error tracking services.
 *
 * @param context - Description of where/when the error occurred
 * @param error - The error object or message
 *
 * @example
 * logError('Failed to load tasks', error)
 * // Console: [Failed to load tasks]: Error: Network timeout
 */
export function logError(context: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(`[${context}]:`, error)
  } else {
    console.error(`[${context}]:`, error)
  }
}

/**
 * Options for error notifications
 */
export interface NotifyErrorOptions {
  /** Whether to also log the error to console (default: true) */
  log?: boolean
  /** Duration to show the notification in ms (future use with toast) */
  duration?: number
  /** Severity level (future use) */
  severity?: "error" | "warning" | "info"
}

/**
 * Notify the user of an error
 *
 * Uses toast notification system for non-blocking error feedback.
 *
 * @param message - The error message to display
 * @param options - Notification options
 *
 * @example
 * notifyError('Failed to delete task', { log: true })
 */
export function notifyError(
  message: string,
  options: NotifyErrorOptions = {},
): void {
  const { log = true, duration = 4000 } = options

  if (log) {
    console.error(message)
  }

  toast.error(message, { duration })
}

/**
 * Notify the user of a success action
 *
 * @param message - The success message to display
 * @param options - Notification options
 *
 * @example
 * notifySuccess('Task created successfully')
 */
export function notifySuccess(
  message: string,
  options: Omit<NotifyErrorOptions, "severity"> = {},
): void {
  const { duration = 3000 } = options
  toast.success(message, { duration })
}

/**
 * Notify the user with informational message
 *
 * @param message - The info message to display
 * @param options - Notification options
 *
 * @example
 * notifyInfo('Feature coming soon!')
 */
export function notifyInfo(
  message: string,
  options: Omit<NotifyErrorOptions, "severity"> = {},
): void {
  const { duration = 3000 } = options
  toast.info(message, { duration })
}

/**
 * Combined error handler for async operations
 *
 * Handles error extraction, logging, and notification in one call.
 * Eliminates the common try-catch boilerplate.
 *
 * @param error - The caught error
 * @param context - Context string for logging
 * @param fallback - Fallback error message
 * @param options - Additional options
 * @returns The error message (for setting state if needed)
 *
 * @example
 * try {
 *   await deleteTask(id)
 * } catch (err) {
 *   const message = handleError(err, 'Failed to delete task', MESSAGES.errors.DELETE_TASK_FAILED, {
 *     notify: true
 *   })
 *   setError(message)
 * }
 */
export function handleError(
  error: unknown,
  context: string,
  fallback: string,
  options: NotifyErrorOptions & { notify?: boolean } = {},
): string {
  const message = getErrorMessage(error, fallback)
  const { notify = false, log = true } = options

  if (log) {
    logError(context, error)
  }

  if (notify) {
    notifyError(message, { log: false }) // Already logged above
  }

  return message
}
