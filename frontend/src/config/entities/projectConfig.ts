import { type EntityConfig } from "@/types/entityModal"
import { validateRequired, sanitizeInput } from "@/lib/validation"
import { type Option } from "@/components/ui/select"
import { type Project, type ProjectStatus } from "@/lib/api"

interface ProjectFormData extends Record<string, unknown> {
  name: string
  outcome_statement: string
  status: ProjectStatus
  parent_project_id: string | null
}

export function createProjectConfig(
  projects: Project[],
): EntityConfig<ProjectFormData> {
  const parentProjectOptions: Option<string>[] = projects.map((p) => ({
    label: p.name,
    value: p.id,
  }))

  const statusOptions: Option<ProjectStatus>[] = [
    { label: "Active", value: "active" },
    { label: "On Hold", value: "on_hold" },
    { label: "Completed", value: "completed" },
  ]

  return {
    entityType: "project",
    entityLabel: "Project",
    fields: [
      {
        name: "name",
        type: "text",
        label: "Project Name",
        placeholder: "Enter project name...",
        required: true,
        autoFocus: true,
      },
      {
        name: "outcome_statement",
        type: "textarea",
        label: "Outcome Statement",
        placeholder: "What does 'done' look like?",
        helpText: "Describe the desired outcome for this project",
        rows: 3,
      },
      {
        name: "status",
        type: "select",
        label: "Status",
        options: statusOptions,
        required: true,
      },
      {
        name: "parent_project_id",
        type: "select",
        label: "Parent Project",
        placeholder: "Select parent project (optional)",
        options: parentProjectOptions,
        helpText: "Organize as a sub-project",
      },
    ],
    validate: (data) => {
      const error = validateRequired(data.name, "Project name")
      return error ? { isValid: false, error } : { isValid: true }
    },
    getInitialData: () => ({
      name: "",
      outcome_statement: "",
      status: "active" as ProjectStatus,
      parent_project_id: null,
    }),
    formatForSubmit: (data) => ({
      name: sanitizeInput(data.name) || "",
      outcome_statement: sanitizeInput(data.outcome_statement) || undefined,
      status: data.status,
      parent_project_id: data.parent_project_id || undefined,
    }),
  }
}
