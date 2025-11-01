import { type EntityConfig } from "@/types/entityModal"
import { type Option } from "@/components/ui/select"
import { TextField } from "./TextField"
import { TextareaField } from "./TextareaField"
import { SelectField } from "./SelectField"
import { MultiSelectField } from "./MultiSelectField"

interface FieldRendererProps<T extends Record<string, unknown>> {
  config: EntityConfig<T>
  data: T
  updateField: <K extends keyof T>(field: K, value: T[K]) => void
  errors: Partial<Record<keyof T, string>>
  disabled?: boolean
}

export function FieldRenderer<T extends Record<string, unknown>>({
  config,
  data,
  updateField,
  errors,
  disabled = false,
}: FieldRendererProps<T>) {
  return (
    <div className="space-y-4">
      {config.fields
        .filter((field) => !field.condition || field.condition(data))
        .map((field) => {
          const fieldName = field.name
          const value = data[fieldName]
          const error = errors[fieldName]

          switch (field.type) {
            case "text":
              return (
                <TextField
                  key={String(fieldName)}
                  label={field.label}
                  value={(value as string) || ""}
                  onChange={(newValue) =>
                    updateField(fieldName, newValue as T[keyof T])
                  }
                  error={error}
                  required={field.required}
                  autoFocus={field.autoFocus}
                  placeholder={field.placeholder}
                  helpText={field.helpText}
                  disabled={disabled || field.disabled}
                />
              )

            case "textarea":
              return (
                <TextareaField
                  key={String(fieldName)}
                  label={field.label}
                  value={(value as string) || ""}
                  onChange={(newValue) =>
                    updateField(fieldName, newValue as T[keyof T])
                  }
                  error={error}
                  required={field.required}
                  autoFocus={field.autoFocus}
                  placeholder={field.placeholder}
                  helpText={field.helpText}
                  disabled={disabled || field.disabled}
                  rows={field.rows}
                />
              )

            case "select":
              return (
                <SelectField
                  key={String(fieldName)}
                  label={field.label}
                  value={value as string | null}
                  onChange={(newValue) =>
                    updateField(fieldName, newValue as T[keyof T])
                  }
                  options={(field.options || []) as Option<string>[]}
                  error={error}
                  required={field.required}
                  placeholder={field.placeholder}
                  helpText={field.helpText}
                  disabled={disabled || field.disabled}
                  variant={field.variant}
                />
              )

            case "multi-select":
              return (
                <MultiSelectField
                  key={String(fieldName)}
                  label={field.label}
                  value={(value as string[]) || []}
                  onChange={(newValue) =>
                    updateField(fieldName, newValue as T[keyof T])
                  }
                  options={field.options || []}
                  error={error}
                  required={field.required}
                  placeholder={field.placeholder}
                  helpText={field.helpText}
                  disabled={disabled || field.disabled}
                />
              )

            case "date":
              return (
                <TextField
                  key={String(fieldName)}
                  label={field.label}
                  value={(value as string) || ""}
                  onChange={(newValue) =>
                    updateField(fieldName, newValue as T[keyof T])
                  }
                  error={error}
                  required={field.required}
                  placeholder={field.placeholder}
                  helpText={field.helpText}
                  disabled={disabled || field.disabled}
                />
              )

            case "checkbox":
              return (
                <div
                  key={String(fieldName)}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    id={String(fieldName)}
                    checked={(value as boolean) || false}
                    onChange={(e) =>
                      updateField(fieldName, e.target.checked as T[keyof T])
                    }
                    disabled={disabled || field.disabled}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label
                    htmlFor={String(fieldName)}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field.label}
                  </label>
                </div>
              )

            default:
              return null
          }
        })}
    </div>
  )
}
