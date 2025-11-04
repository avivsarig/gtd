/**
 * ProjectFormModal - Create/Edit project modal
 *
 * Thin wrapper around EntityModal for projects.
 * Uses unified modal system with projectConfig.
 */

import { EntityModal } from "@/components/shared/EntityModal"
import { createProjectConfig } from "@/features/projects/config"
import { type Project, type CreateProjectInput } from "@/lib/api"

interface ProjectFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  projects: Project[]
  onSubmit: (data: CreateProjectInput) => Promise<void>
}

function projectToFormData(project: Project) {
  return {
    name: project.name,
    outcome_statement: project.outcome_statement || "",
    status: project.status,
    parent_project_id: project.parent_project_id || null,
  }
}

export function ProjectFormModal({
  open,
  onOpenChange,
  project,
  projects,
  onSubmit,
}: ProjectFormModalProps) {
  const config = createProjectConfig(projects)

  return (
    <EntityModal
      config={config}
      mode={project ? "edit" : "create"}
      open={open}
      onOpenChange={onOpenChange}
      editData={project ? projectToFormData(project) : null}
      onSubmit={onSubmit}
    />
  )
}
