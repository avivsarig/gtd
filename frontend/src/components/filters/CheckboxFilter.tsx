interface CheckboxFilterProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * CheckboxFilter - Checkbox component for boolean filters.
 *
 * Used in filter bars for toggle-style filters like "Show completed" or "Include processed".
 */
export function CheckboxFilter({
  id,
  label,
  checked,
  onChange,
  disabled,
}: CheckboxFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <label
        htmlFor={id}
        className="cursor-pointer text-sm font-medium text-gray-700 select-none dark:text-gray-300"
      >
        {label}
      </label>
    </div>
  )
}
