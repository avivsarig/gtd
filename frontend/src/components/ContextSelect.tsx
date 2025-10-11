/**
 * ContextSelect - Reusable context selector component
 *
 * Displays a styled select dropdown for context assignment (@home, @computer, etc.).
 * Follows clean code principles with proper separation and reusability.
 */

import { type Context } from "@/lib/api"

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
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
      className="cursor-pointer rounded border border-green-500/30 bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Context assignment"
    >
      <option value="">No Context</option>
      {contexts.map((context) => (
        <option key={context.id} value={context.id}>
          {context.icon ? `${context.icon} ` : ""}
          {context.name}
        </option>
      ))}
    </select>
  )
}
