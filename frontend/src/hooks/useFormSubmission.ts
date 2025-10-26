/**
 * useFormSubmission Hook
 *
 * Handles form submission with validation, loading, and error states.
 * Eliminates the repeated pattern found in QuickCapture, UniversalCapture,
 * ContextManager, and NoteForm components.
 *
 * Combines:
 * - Form state management
 * - Validation
 * - Submission loading/error states
 * - Success/error callbacks
 * - Form reset
 */

import { useState, useCallback } from "react"
import { getErrorMessage } from "@/lib/errorHandling"

export interface UseFormSubmissionOptions<T> {
  /** Validation function - returns error message or null */
  validate?: (data: T) => string | null
  /** Callback executed on successful submission */
  onSuccess?: () => void
  /** Callback executed on submission error */
  onError?: (error: Error) => void
  /** Default error message if submission fails */
  defaultErrorMessage?: string
  /** Whether to reset form after successful submission */
  resetOnSuccess?: boolean
}

export interface UseFormSubmissionResult<T> {
  /** Form data state */
  data: T
  /** Update form data */
  setData: React.Dispatch<React.SetStateAction<T>>
  /** Update a single field */
  updateField: <K extends keyof T>(field: K, value: T[K]) => void
  /** Whether form is currently submitting */
  isSubmitting: boolean
  /** Validation or submission error message */
  error: string | null
  /** Set error message manually */
  setError: (error: string | null) => void
  /** Clear error message */
  clearError: () => void
  /** Handle form submission */
  handleSubmit: (
    submitFn: (data: T) => Promise<void>,
  ) => (e: React.FormEvent) => Promise<void>
  /** Reset form to initial state */
  reset: () => void
}

/**
 * Hook for handling form submission with validation and state management
 *
 * @param initialData - Initial form data
 * @param options - Configuration options
 * @returns Form state and handlers
 *
 * @example
 * const { data, updateField, handleSubmit, isSubmitting, error } = useFormSubmission(
 *   { name: "", email: "" },
 *   {
 *     validate: (data) => {
 *       if (!data.name.trim()) return "Name is required"
 *       if (!data.email.trim()) return "Email is required"
 *       return null
 *     },
 *     onSuccess: () => console.log("Form submitted!"),
 *     resetOnSuccess: true
 *   }
 * )
 *
 * <form onSubmit={handleSubmit(async (data) => await api.create(data))}>
 *   <input
 *     value={data.name}
 *     onChange={(e) => updateField("name", e.target.value)}
 *   />
 *   {error && <p>{error}</p>}
 *   <button disabled={isSubmitting}>
 *     {isSubmitting ? "Submitting..." : "Submit"}
 *   </button>
 * </form>
 */
export function useFormSubmission<T>(
  initialData: T,
  options: UseFormSubmissionOptions<T> = {},
): UseFormSubmissionResult<T> {
  const [data, setData] = useState<T>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    validate,
    onSuccess,
    onError,
    defaultErrorMessage = "Submission failed",
    resetOnSuccess = false,
  } = options

  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setData((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setIsSubmitting(false)
  }, [initialData])

  const handleSubmit = useCallback(
    (submitFn: (data: T) => Promise<void>) => {
      return async (e: React.FormEvent) => {
        e.preventDefault()

        // Run validation if provided
        if (validate) {
          const validationError = validate(data)
          if (validationError) {
            setError(validationError)
            return
          }
        }

        setIsSubmitting(true)
        setError(null)

        try {
          await submitFn(data)

          if (resetOnSuccess) {
            setData(initialData)
          }

          onSuccess?.()
        } catch (err) {
          const errorMessage = getErrorMessage(err, defaultErrorMessage)
          setError(errorMessage)

          if (onError && err instanceof Error) {
            onError(err)
          }
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [
      data,
      validate,
      onSuccess,
      onError,
      defaultErrorMessage,
      resetOnSuccess,
      initialData,
    ],
  )

  return {
    data,
    setData,
    updateField,
    isSubmitting,
    error,
    setError,
    clearError,
    handleSubmit,
    reset,
  }
}
