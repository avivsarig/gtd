import { useState, useCallback, type FormEvent } from "react"
import { type ValidationResult } from "@/types/entityModal"
import { getErrorMessage } from "@/lib/errorHandling"

interface EntityFormConfig<T extends Record<string, unknown>> {
  initialData: T
  validate?: (data: T) => ValidationResult
  onSubmit: (data: T) => Promise<unknown>
  onSuccess?: (result: unknown) => void
  resetOnSuccess?: boolean
  defaultErrorMessage?: string
}

interface EntityFormState<T extends Record<string, unknown>> {
  data: T
  updateField: <K extends keyof T>(field: K, value: T[K]) => void
  setData: React.Dispatch<React.SetStateAction<T>>
  isSubmitting: boolean
  error: string | null
  fieldErrors: Partial<Record<keyof T, string>>
  handleSubmit: (e: FormEvent) => Promise<void>
  reset: () => void
  clearError: () => void
}

export function useEntityForm<T extends Record<string, unknown>>({
  initialData,
  validate,
  onSubmit,
  onSuccess,
  resetOnSuccess = false,
  defaultErrorMessage = "An error occurred",
}: EntityFormConfig<T>): EntityFormState<T> {
  const [data, setData] = useState<T>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof T, string>>
  >({})

  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setData((prev) => ({ ...prev, [field]: value }))
      // Clear field error when user starts typing
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    [],
  )

  const clearError = useCallback(() => {
    setError(null)
    setFieldErrors({})
  }, [])

  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setFieldErrors({})
  }, [initialData])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      clearError()

      // Validate if validator provided
      if (validate) {
        const validationResult = validate(data)
        if (!validationResult.isValid) {
          setError(validationResult.error || "Validation failed")
          if (validationResult.fieldErrors) {
            setFieldErrors(
              validationResult.fieldErrors as Partial<Record<keyof T, string>>,
            )
          }
          return
        }
      }

      setIsSubmitting(true)

      try {
        const result = await onSubmit(data)

        if (resetOnSuccess) {
          reset()
        }

        onSuccess?.(result)
      } catch (err) {
        const errorMessage = getErrorMessage(err, defaultErrorMessage)
        setError(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      data,
      validate,
      onSubmit,
      onSuccess,
      resetOnSuccess,
      reset,
      clearError,
      defaultErrorMessage,
    ],
  )

  return {
    data,
    updateField,
    setData,
    isSubmitting,
    error,
    fieldErrors,
    handleSubmit,
    reset,
    clearError,
  }
}
