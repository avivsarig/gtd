interface DateFilterProps {
  id: string
  label: string
  value: string | undefined
  onChange: (date: string | undefined) => void
  disabled?: boolean
}

/**
 * DateFilter - Date input component for date range filtering.
 *
 * Used in filter bars for date-based filters like "Created after" or "Scheduled before".
 */
export function DateFilter({
  id,
  label,
  value,
  onChange,
  disabled,
}: DateFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <input
        type="date"
        id={id}
        value={value || ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        disabled={disabled}
        className="cursor-pointer rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      />
    </div>
  )
}
