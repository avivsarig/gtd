import { type Context } from "@/lib/api"
import { BaseSelect, type Option } from "../ui/select"

interface ContextFilterProps {
  value: string | undefined
  contexts: Context[]
  onChange: (contextId: string | undefined) => void
  disabled?: boolean
}

/**
 * ContextFilter - Filter variant of ContextSelect with "All" option.
 *
 * Used in filter bars to allow users to filter by context or view all contexts.
 */
export function ContextFilter({
  value,
  contexts,
  onChange,
  disabled,
}: ContextFilterProps) {
  const options: Option[] = [
    { value: "all", label: "All Contexts" },
    ...contexts.map((context) => ({
      value: context.id,
      label: context.name,
      icon: context.icon ?? undefined,
    })),
  ]

  const currentValue = value || "all"

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="context-filter"
        className="text-xs font-medium text-gray-700 dark:text-gray-300"
      >
        Context
      </label>
      <BaseSelect
        id="context-filter"
        value={currentValue}
        options={options}
        onChange={(newValue) => {
          onChange(
            newValue === "all" || newValue === null ? undefined : newValue,
          )
        }}
        disabled={disabled}
        variant="context"
        aria-label="Filter by context"
        placeholder=""
      />
    </div>
  )
}
