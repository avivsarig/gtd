import { useCallback, useState } from "react"

export interface FilterValues {
  [key: string]: string | boolean | undefined
}

interface UseFiltersOptions {
  defaultFilters?: FilterValues
}

interface UseFiltersReturn {
  filters: FilterValues
  setFilter: (key: string, value: string | boolean | undefined) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}

/**
 * Custom hook for managing filter state.
 *
 * Features:
 * - Manages filter state
 * - Provides reset functionality
 * - Tracks if any filters are active
 *
 * @param options Configuration options
 * @returns Filter state and manipulation functions
 */
export function useFilters(options: UseFiltersOptions = {}): UseFiltersReturn {
  const { defaultFilters = {} } = options

  const [filters, setFilters] = useState<FilterValues>(defaultFilters)

  const setFilter = useCallback(
    (key: string, value: string | boolean | undefined) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    [],
  )

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [defaultFilters])

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "" && value !== null,
  )

  return {
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
  }
}
