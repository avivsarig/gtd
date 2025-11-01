import { type EntityConfig } from "@/types/entityModal"
import { validateRequired, sanitizeInput } from "@/lib/validation"

interface InboxFormData extends Record<string, unknown> {
  content: string
}

export const inboxConfig: EntityConfig<InboxFormData> = {
  entityType: "inbox",
  entityLabel: "Inbox Item",
  fields: [
    {
      name: "content",
      type: "textarea",
      label: "What's on your mind?",
      placeholder: "Capture anything...",
      required: true,
      autoFocus: true,
      rows: 4,
    },
  ],
  validate: (data) => {
    const error = validateRequired(data.content, "Content")
    return error ? { isValid: false, error } : { isValid: true }
  },
  getInitialData: () => ({ content: "" }),
  formatForSubmit: (data) => ({
    content: sanitizeInput(data.content) || "",
  }),
}
