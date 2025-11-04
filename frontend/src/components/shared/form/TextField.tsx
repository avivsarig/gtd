import { Input } from "@/components/ui/input"
import { FormField } from "./FormField"

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string | null
  required?: boolean
  autoFocus?: boolean
  placeholder?: string
  helpText?: string
  disabled?: boolean
  className?: string
}

export function TextField({
  label,
  value,
  onChange,
  error,
  required,
  autoFocus,
  placeholder,
  helpText,
  disabled,
  className,
}: TextFieldProps) {
  const labelText = required ? `${label} *` : label

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      className={className}
    >
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-invalid={!!error}
        aria-label={labelText}
      />
    </FormField>
  )
}
