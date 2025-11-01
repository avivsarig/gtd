import { Textarea } from "@/components/ui/textarea"
import { FormField } from "./FormField"

interface TextareaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string | null
  required?: boolean
  autoFocus?: boolean
  placeholder?: string
  helpText?: string
  disabled?: boolean
  rows?: number
  className?: string
}

export function TextareaField({
  label,
  value,
  onChange,
  error,
  required,
  autoFocus,
  placeholder,
  helpText,
  disabled,
  rows = 3,
  className,
}: TextareaFieldProps) {
  return (
    <FormField
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      className={className}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        disabled={disabled}
        rows={rows}
        aria-invalid={!!error}
        aria-label={label}
      />
    </FormField>
  )
}
