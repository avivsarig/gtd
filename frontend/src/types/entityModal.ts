import { type Option } from "@/components/ui/select"

export type EntityType = "task" | "note" | "project" | "context" | "inbox"

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "multi-select"
  | "date"
  | "checkbox"

export interface ValidationResult {
  isValid: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

export interface FieldConfig<T> {
  name: keyof T
  type: FieldType
  label: string
  placeholder?: string
  required?: boolean
  autoFocus?: boolean
  rows?: number // for textarea
  options?: Option<unknown>[] // for select/multi-select
  condition?: (data: T) => boolean // conditional rendering
  helpText?: string
  variant?: "default" | "status" | "project" | "context" // for select styling
  disabled?: boolean
}

export interface EntityConfig<T extends Record<string, unknown>> {
  entityType: EntityType
  entityLabel: string
  fields: FieldConfig<T>[]
  validate?: (data: T) => ValidationResult
  getInitialData: () => T
  formatForSubmit?: (data: T) => unknown
}

export type ModalMode = "create" | "edit"

export interface EntityModalProps<T extends Record<string, unknown>> {
  config: EntityConfig<T>
  mode: ModalMode
  open: boolean
  onOpenChange: (open: boolean) => void
  editData?: T | null
  onSubmit: (data: T) => Promise<unknown>
  onSuccess?: () => void
}
