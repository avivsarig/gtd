import { type EntityConfig } from "@/types/entityModal"
import { validateRequired, sanitizeInput } from "@/lib/validation"
import { type Option } from "@/components/ui/select"
import { type Project } from "@/lib/api"

interface NoteFormData extends Record<string, unknown> {
  title: string
  content: string
  project_id: string | null
}

export function createNoteConfig(
  projects: Project[],
): EntityConfig<NoteFormData> {
  const projectOptions: Option<string>[] = projects.map((p) => ({
    label: p.name,
    value: p.id,
  }))

  return {
    entityType: "note",
    entityLabel: "Note",
    fields: [
      {
        name: "title",
        type: "text",
        label: "Title",
        placeholder: "Note title...",
        required: true,
        autoFocus: true,
      },
      {
        name: "content",
        type: "textarea",
        label: "Content",
        placeholder: "Write your note here...",
        rows: 8,
      },
      {
        name: "project_id",
        type: "select",
        label: "Project",
        placeholder: "Select a project (optional)",
        options: projectOptions,
        variant: "project",
      },
    ],
    validate: (data) => {
      const error = validateRequired(data.title, "Title")
      return error ? { isValid: false, error } : { isValid: true }
    },
    getInitialData: () => ({
      title: "",
      content: "",
      project_id: null,
    }),
    formatForSubmit: (data) => ({
      title: sanitizeInput(data.title) || "",
      content: sanitizeInput(data.content) || undefined,
      project_id: data.project_id || null,
    }),
  }
}
