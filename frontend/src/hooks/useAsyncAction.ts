/**
 * useAsyncAction Hook
 *
 * Handles async operations with loading and error states.
 * Eliminates the repeated pattern of:
 * - useState for loading
 * - useState for error
 * - try-catch-finally boilerplate
 *
 * This hook is used for actions that don't directly return data to display,
 * but trigger side effects (like delete, update, etc.)
 */

import { useState, useCallback } from "react"
import { getErrorMessage } from "@/lib/errorHandling"

export interface UseAsyncActionOptions<T> {
  /** Callback executed on successful completion */
  onSuccess?: (data: T) => void
  /** Callback executed on error */
  onError?: (error: Error) => void
  /** Default error message if error doesn't have one */
  defaultErrorMessage?: string
}

export interface UseAsyncActionResult<TArgs extends unknown[]> {
  /** Execute the async action with given arguments */
  execute: (...args: TArgs) => Promise<void>
  /** Whether the action is currently executing */
  loading: boolean
  /** Error message if action failed, null otherwise */
  error: string | null
  /** Clear the error state */
  clearError: () => void
  /** Reset all state (loading and error) */
  reset: () => void
}

/**
 * Hook for handling async actions with loading and error states
 *
 * @param action - The async function to execute
 * @param options - Configuration options
 * @returns Object with execute function, loading state, and error state
 *
 * @example
 * const { execute: deleteTask, loading, error } = useAsyncAction(
 *   async (taskId: string) => {
 *     await api.deleteTask(taskId)
 *   },
 *   {
 *     onSuccess: () => {
 *       setTasks(prev => prev.filter(t => t.id !== taskId))
 *     },
 *     defaultErrorMessage: "Failed to delete task"
 *   }
 * )
 *
 * // Usage in component:
 * <button onClick={() => execute(task.id)} disabled={loading}>
 *   {loading ? "Deleting..." : "Delete"}
 * </button>
 */
export function useAsyncAction<T = void, TArgs extends unknown[] = []>(
  action: (...args: TArgs) => Promise<T>,
  options: UseAsyncActionOptions<T> = {},
): UseAsyncActionResult<TArgs> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { onSuccess, onError, defaultErrorMessage = "Operation failed" } = options

  const execute = useCallback(
    async (...args: TArgs) => {
      setLoading(true)
      setError(null)

      try {
        const result = await action(...args)
        onSuccess?.(result)
      } catch (err) {
        const errorMessage = getErrorMessage(err, defaultErrorMessage)
        setError(errorMessage)

        if (onError && err instanceof Error) {
          onError(err)
        }
      } finally {
        setLoading(false)
      }
    },
    [action, onSuccess, onError, defaultErrorMessage],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return {
    execute,
    loading,
    error,
    clearError,
    reset,
  }
}
