/**
 * ContextSelect - Reusable context selector component
 *
 * Displays a styled select dropdown for context assignment (@home, @computer, etc.).
 * Follows clean code principles with proper separation and reusability.
 */

import { type Context } from "@/lib/api"
import { BaseSelect, type Option } from "./ui/select"

interface ContextSelectProps {
  value: string | null | undefined
  contexts: Context[]
  onChange: (contextId: string | null) => void
  disabled?: boolean
}

export function ContextSelect({
  value,
  contexts,
  onChange,
  disabled,
}: ContextSelectProps) {
  const options: Option[] = contexts.map((context) => ({
    value: context.id,
    label: context.name,
    icon: context.icon ?? undefined,
  }))

  return (
    <BaseSelect
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      variant="context"
      placeholder="No Context"
      aria-label="Context assignment"
    />
  )
}
