/**
 * useResourceLoader Hook
 *
 * Handles data fetching with loading, error, and reload functionality.
 * Eliminates the repeated pattern found in Home.tsx:
 * - loadTasks()
 * - loadProjects()
 * - loadNotes()
 * - loadInbox()
 * - loadContexts()
 *
 * All these functions follow the identical pattern of:
 * try { const data = await api(); setState(data) } catch { console.error() }
 */

import { useState, useEffect, useCallback, type DependencyList } from "react"
import { logError } from "@/lib/errorHandling"

export interface UseResourceLoaderOptions {
  /** Context string for error logging */
  errorContext?: string
  /** Whether to load immediately on mount (default: true) */
  immediate?: boolean
  /** Dependencies that trigger reload when changed */
  deps?: DependencyList
}

export interface UseResourceLoaderResult<T> {
  /** The loaded data, null if not yet loaded or error occurred */
  data: T | null
  /** Whether data is currently loading */
  loading: boolean
  /** Error message if loading failed, null otherwise */
  error: string | null
  /** Manually trigger a reload */
  reload: () => Promise<void>
  /** Clear the error state */
  clearError: () => void
  /** Set data manually (useful for optimistic updates) */
  setData: React.Dispatch<React.SetStateAction<T | null>>
}

/**
 * Hook for loading resources with loading/error states and reload capability
 *
 * @param loader - Async function that fetches the data
 * @param options - Configuration options
 * @returns Resource state and reload function
 *
 * @example
 * // Basic usage
 * const { data: tasks, loading, error, reload } = useResourceLoader(
 *   () => getTasks(),
 *   { errorContext: "Failed to load tasks" }
 * )
 *
 * // With dependencies (reload when status changes)
 * const { data: tasks, loading } = useResourceLoader(
 *   () => getTasks({ status }),
 *   { deps: [status] }
 * )
 *
 * // Conditional loading
 * const { data, reload } = useResourceLoader(
 *   () => getProject(projectId),
 *   { immediate: false }
 * )
 * // Later: reload()
 *
 * @example
 * // Usage in component:
 * const { data: tasks, loading, reload } = useResourceLoader(getTasks)
 *
 * if (loading) return <div>Loading...</div>
 * if (!tasks) return <div>No data</div>
 *
 * return (
 *   <div>
 *     {tasks.map(task => <TaskItem key={task.id} task={task} />)}
 *     <button onClick={reload}>Refresh</button>
 *   </div>
 * )
 */
export function useResourceLoader<T>(
  loader: () => Promise<T>,
  options: UseResourceLoaderOptions = {},
): UseResourceLoaderResult<T> {
  const {
    errorContext = "Failed to load resource",
    immediate = true,
    deps = [],
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await loader()
      setData(result)
    } catch (err) {
      logError(errorContext, err)
      setError(errorContext)
    } finally {
      setLoading(false)
    }
  }, [loader, errorContext])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load on mount if immediate=true
  useEffect(() => {
    if (immediate) {
      void load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps])

  return {
    data,
    loading,
    error,
    reload: load,
    clearError,
    setData,
  }
}
