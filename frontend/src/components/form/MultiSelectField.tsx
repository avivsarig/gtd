import { type Option } from "@/components/ui/select"
import { FormField } from "./FormField"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiSelectFieldProps<T> {
  label: string
  value: T[]
  onChange: (value: T[]) => void
  options: Option<T>[]
  error?: string | null
  required?: boolean
  placeholder?: string
  helpText?: string
  disabled?: boolean
  className?: string
}

export function MultiSelectField<T = string>({
  label,
  value,
  onChange,
  options,
  error,
  required,
  placeholder = "Select options...",
  helpText,
  disabled,
  className,
}: MultiSelectFieldProps<T>) {
  const selectedOptions = options.filter((opt) => value.includes(opt.value))
  const availableOptions = options.filter((opt) => !value.includes(opt.value))

  const handleAdd = (optionValue: T) => {
    onChange([...value, optionValue])
  }

  const handleRemove = (optionValue: T) => {
    onChange(value.filter((v) => v !== optionValue))
  }

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      className={className}
    >
      <div className="space-y-2">
        {/* Selected items */}
        {selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <div
                key={String(option.value)}
                className="inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/20 px-2 py-1 text-sm"
              >
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(option.value)}
                  disabled={disabled}
                  className="hover:text-red-500"
                  aria-label={`Remove ${option.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Available options dropdown */}
        {availableOptions.length > 0 ? (
          <select
            onChange={(e) => {
              const selectedValue = options.find(
                (opt) => String(opt.value) === e.target.value,
              )?.value
              if (selectedValue !== undefined) {
                handleAdd(selectedValue)
                e.target.value = "" // Reset select
              }
            }}
            disabled={disabled}
            className={cn(
              "border-input bg-background w-full rounded-md border px-3 py-2 text-sm",
              "focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            aria-label={label}
            defaultValue=""
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {availableOptions.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.icon ? `${option.icon} ${option.label}` : option.label}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-muted-foreground text-sm">All options selected</p>
        )}
      </div>
    </FormField>
  )
}
