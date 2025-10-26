/**
 * StatusSelect - Reusable status selector component
 *
 * Displays a color-coded select dropdown for task status management.
 * Follows clean code principles with proper separation and reusability.
 */

import { TaskStatusEnum, type TaskStatus } from "@/lib/api"
import { BaseSelect, type Option } from "./ui/select"

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
  const options: Option<TaskStatus>[] = STATUS_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    color: opt.color,
  }))

  return (
    <BaseSelect<TaskStatus>
      value={value}
      options={options}
      onChange={(newValue) => {
        if (newValue) onChange(newValue)
      }}
      disabled={disabled}
      variant="status"
      aria-label="Task status"
      placeholder=""
    />
  )
}

export { STATUS_OPTIONS }
export type { StatusOption }
