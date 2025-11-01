import { type EntityConfig } from "@/types/entityModal"
import { validateRequired, sanitizeInput } from "@/lib/validation"

interface ContextFormData extends Record<string, unknown> {
  name: string
  description: string
  icon: string
  sort_order: number
}

export const contextConfig: EntityConfig<ContextFormData> = {
  entityType: "context",
  entityLabel: "Context",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Context Name",
      placeholder: "e.g., @home, @computer, @phone",
      required: true,
      autoFocus: true,
    },
    {
      name: "icon",
      type: "text",
      label: "Icon",
      placeholder: "🏠",
      helpText: "Optional emoji or icon",
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      placeholder: "When to use this context...",
      rows: 2,
    },
    {
      name: "sort_order",
      type: "text",
      label: "Sort Order",
      placeholder: "0",
      helpText: "Lower numbers appear first",
    },
  ],
  validate: (data) => {
    const error = validateRequired(data.name, "Context name")
    return error ? { isValid: false, error } : { isValid: true }
  },
  getInitialData: () => ({
    name: "",
    description: "",
    icon: "",
    sort_order: 0,
  }),
  formatForSubmit: (data) => ({
    name: sanitizeInput(data.name) || "",
    description: sanitizeInput(data.description) || undefined,
    icon: sanitizeInput(data.icon) || undefined,
    sort_order:
      typeof data.sort_order === "number"
        ? data.sort_order
        : parseInt(String(data.sort_order)) || 0,
  }),
}
