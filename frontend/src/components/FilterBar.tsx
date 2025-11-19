import React from "react"

interface FilterBarProps {
  children: React.ReactNode
  onReset?: () => void
  hasActiveFilters?: boolean
}

/**
 * FilterBar component - Container for filter controls.
 *
 * Provides a consistent layout for filter UI elements with an optional reset button.
 */
export function FilterBar({
  children,
  onReset,
  hasActiveFilters = false,
}: FilterBarProps) {
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-center gap-3">
        {children}
        {onReset && hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            type="button"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
