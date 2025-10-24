/**
 * StatusSelect - Reusable status selector component
 *
 * Displays a color-coded select dropdown for task status management.
 * Follows clean code principles with proper separation and reusability.
 */

import { TaskStatusEnum, type TaskStatus } from "@/lib/api"

interface StatusOption {
  value: TaskStatus
  label: string
  color: string
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: TaskStatusEnum.NEXT,
    label: "Next",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    value: TaskStatusEnum.WAITING,
    label: "Waiting",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  {
    value: TaskStatusEnum.SOMEDAY,
    label: "Someday",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
]

interface StatusSelectProps {
  value: TaskStatus
  onChange: (status: TaskStatus) => void
  disabled?: boolean
}

export function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  const selectedOption = STATUS_OPTIONS.find((opt) => opt.value === value)

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      disabled={disabled}
      className={`cursor-pointer rounded border px-2 py-1 text-xs font-medium transition-colors ${
        selectedOption?.color || ""
      } disabled:cursor-not-allowed disabled:opacity-50`}
      aria-label="Task status"
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export { STATUS_OPTIONS }
export type { StatusOption }
