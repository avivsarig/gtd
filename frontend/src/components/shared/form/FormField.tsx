import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  error?: string | null
  required?: boolean
  helpText?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  error,
  required,
  helpText,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="text-muted-foreground text-sm">{helpText}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
