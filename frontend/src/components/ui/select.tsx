import { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const selectVariants = cva(
  "cursor-pointer rounded border px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-background border-border focus:ring-primary focus:outline-none focus:ring-2",
        status: "", // Dynamic color applied per selection
        project: "border-purple-500/30 bg-purple-500/20 text-purple-400",
        context: "border-green-500/30 bg-green-500/20 text-green-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface Option<T = string> {
  value: T
  label: string
  color?: string // For status variant - full Tailwind classes
  icon?: string // For context variant - emoji or icon
}

export interface SelectProps<T = string>
  extends Omit<
      React.SelectHTMLAttributes<HTMLSelectElement>,
      "onChange" | "value"
    >,
    VariantProps<typeof selectVariants> {
  value: T | null | undefined
  options: Option<T>[]
  onChange: (value: T | null) => void
  placeholder?: string
  "aria-label"?: string
  id?: string
}

const BaseSelectInner = <T extends string>(
  {
    value,
    options,
    onChange,
    disabled,
    placeholder = "Select an option",
    variant = "default",
    className,
    "aria-label": ariaLabel,
    id,
    ...props
  }: SelectProps<T>,
  ref: React.ForwardedRef<HTMLSelectElement>,
) => {
  const selectedOption = options.find((opt) => opt.value === value)

  // For status variant, apply dynamic color based on selection
  // Always include base variant classes, add color classes for status variant
  const baseClassName = selectVariants({ variant })
  const colorClassName =
    variant === "status" && selectedOption?.color ? selectedOption.color : ""
  const dynamicClassName =
    variant === "status" && colorClassName
      ? cn(baseClassName, colorClassName)
      : baseClassName

  // Validate that value exists in options, otherwise use empty string
  const validValue =
    value && options.some((opt) => opt.value === value) ? value : ""

  return (
    <select
      ref={ref}
      id={id}
      value={validValue}
      onChange={(e) => {
        const newValue = e.target.value as T
        onChange(newValue || null)
      }}
      disabled={disabled}
      className={cn(dynamicClassName, className)}
      aria-label={ariaLabel}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={String(option.value)} value={String(option.value)}>
          {option.icon ? `${option.icon} ` : ""}
          {option.label}
        </option>
      ))}
    </select>
  )
}

// Type-safe forwardRef wrapper
export const BaseSelect = forwardRef(BaseSelectInner) as <T extends string>(
  props: SelectProps<T> & { ref?: React.ForwardedRef<HTMLSelectElement> },
) => ReturnType<typeof BaseSelectInner>

export { selectVariants }
