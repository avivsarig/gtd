import { type EntityConfig } from "@/types/entityModal"
import { validateRequired, sanitizeInput } from "@/lib/validation"
import { type Option } from "@/components/ui/select"
import { type Project, type Context, type TaskStatus } from "@/lib/api"

interface TaskFormData extends Record<string, unknown> {
  title: string
  description: string
  status: TaskStatus
  project_id: string | null
  context_id: string | null
}

export function createTaskConfig(
  projects: Project[],
  contexts: Context[],
): EntityConfig<TaskFormData> {
  const projectOptions: Option<string>[] = projects.map((p) => ({
    label: p.name,
    value: p.id,
  }))

  const contextOptions: Option<string>[] = contexts.map((c) => ({
    label: c.name,
    value: c.id,
    icon: c.icon || undefined,
  }))

  const statusOptions: Option<TaskStatus>[] = [
    { label: "Next", value: "next" },
    { label: "Waiting", value: "waiting" },
    { label: "Someday", value: "someday" },
  ]

  return {
    entityType: "task",
    entityLabel: "Task",
    fields: [
      {
        name: "title",
        type: "text",
        label: "Task Title",
        placeholder: "What needs to be done?",
        required: true,
        autoFocus: true,
      },
      {
        name: "description",
        type: "textarea",
        label: "Description",
        placeholder: "Additional details...",
        rows: 3,
      },
      {
        name: "status",
        type: "select",
        label: "Status",
        options: statusOptions,
        required: true,
        variant: "status",
      },
      {
        name: "project_id",
        type: "select",
        label: "Project",
        placeholder: "Select a project (optional)",
        options: projectOptions,
        variant: "project",
      },
      {
        name: "context_id",
        type: "select",
        label: "Context",
        placeholder: "Select a context (optional)",
        options: contextOptions,
        variant: "context",
      },
    ],
    validate: (data) => {
      const error = validateRequired(data.title, "Title")
      return error ? { isValid: false, error } : { isValid: true }
    },
    getInitialData: () => ({
      title: "",
      description: "",
      status: "next" as TaskStatus,
      project_id: null,
      context_id: null,
    }),
    formatForSubmit: (data) => ({
      title: sanitizeInput(data.title) || "",
      description: sanitizeInput(data.description) || undefined,
      status: data.status,
      project_id: data.project_id || undefined,
      context_id: data.context_id || undefined,
    }),
  }
}
