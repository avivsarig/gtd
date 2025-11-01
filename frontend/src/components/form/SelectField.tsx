import { BaseSelect, type Option } from "@/components/ui/select"
import { FormField } from "./FormField"

interface SelectFieldProps<T extends string> {
  label: string
  value: T | null | undefined
  onChange: (value: T | null) => void
  options: Option<T>[]
  error?: string | null
  required?: boolean
  placeholder?: string
  helpText?: string
  disabled?: boolean
  variant?: "default" | "status" | "project" | "context"
  className?: string
}

export function SelectField<T extends string = string>({
  label,
  value,
  onChange,
  options,
  error,
  required,
  placeholder,
  helpText,
  disabled,
  variant = "default",
  className,
}: SelectFieldProps<T>) {
  return (
    <FormField
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      className={className}
    >
      <BaseSelect
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        variant={variant}
        aria-invalid={!!error}
        aria-label={label}
      />
    </FormField>
  )
}
