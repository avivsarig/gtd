import { TaskStatusEnum, type TaskStatus } from "@/lib/api"
import { BaseSelect, type Option } from "../ui/select"
import { STATUS_OPTIONS } from "../StatusSelect"

interface StatusFilterProps {
  value: TaskStatus | undefined
  onChange: (status: TaskStatus | undefined) => void
  disabled?: boolean
}

/**
 * StatusFilter - Filter variant of StatusSelect with "All" option.
 *
 * Used in filter bars to allow users to filter by task status or view all statuses.
 */
export function StatusFilter({ value, onChange, disabled }: StatusFilterProps) {
  const options: Option<TaskStatus | "all">[] = [
    { value: "all", label: "All Statuses", color: "" },
    ...STATUS_OPTIONS.map((opt) => ({
      value: opt.value,
      label: opt.label,
      color: opt.color,
    })),
  ]

  const currentValue = value || "all"

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="status-filter"
        className="text-xs font-medium text-gray-700 dark:text-gray-300"
      >
        Status
      </label>
      <BaseSelect<TaskStatus | "all">
        id="status-filter"
        value={currentValue}
        options={options}
        onChange={(newValue) => {
          onChange(newValue === "all" ? undefined : (newValue as TaskStatus))
        }}
        disabled={disabled}
        variant="status"
        aria-label="Filter by status"
        placeholder=""
      />
    </div>
  )
}
