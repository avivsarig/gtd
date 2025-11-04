/**
 * useProjectOperations Hook
 *
 * Encapsulates all project-related business logic and operations.
 * Uses useEntityOperations base hook plus project-specific operations.
 *
 * Single Responsibility: Project domain operations only
 */

import { useCallback } from "react"
import {
  createProject,
  updateProject,
  deleteProject,
  completeProject,
  type Project,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/api"
import { MESSAGES } from "@/lib/messages"
import { useEntityOperations, type EntityAPI } from "./useEntityOperations"

export interface UseProjectOperationsOptions {
  /** Callback to reload projects after operations */
  onReload: () => Promise<void>
  /** Callback for optimistic updates */
  onUpdate?: (updater: (projects: Project[]) => Project[]) => void
}

export interface UseProjectOperationsResult {
  showProjectForm: boolean
  editingProject: Project | null
  handleCreate: (data: CreateProjectInput) => Promise<void>
  handleUpdate: (data: UpdateProjectInput) => Promise<void>
  handleEdit: (project: Project) => void
  handleDelete: (projectId: string) => Promise<void>
  handleComplete: (projectId: string) => Promise<void>
  handleCancelForm: () => void
  openProjectForm: () => void
}

/**
 * Hook for project operations
 *
 * @param options - Configuration options
 * @returns Project operation handlers
 *
 * @example
 * const projectOps = useProjectOperations({
 *   onReload: loadProjects,
 *   onUpdate: setProjects
 * })
 */
export function useProjectOperations(
  options: UseProjectOperationsOptions,
): UseProjectOperationsResult {
  const { onReload, onUpdate } = options

  const api: EntityAPI<Project, CreateProjectInput, UpdateProjectInput> = {
    create: createProject,
    update: updateProject,
    delete: deleteProject,
  }

  const base = useEntityOperations(api, {
    onReload,
    onUpdate,
    entityName: "project",
  })

  const handleComplete = useCallback(
    async (projectId: string) => {
      try {
        const completedProject = await completeProject(projectId)

        if (onUpdate) {
          onUpdate((prev) =>
            prev.map((project) =>
              project.id === projectId ? completedProject : project,
            ),
          )
        } else {
          await onReload()
        }
      } catch (err) {
        console.error(MESSAGES.errors.console.COMPLETE_PROJECT_FAILED, err)
        await onReload()
      }
    },
    [onReload, onUpdate],
  )

  return {
    showProjectForm: base.showForm,
    editingProject: base.editingEntity,
    handleCreate: base.handleCreate,
    handleUpdate: base.handleUpdate,
    handleEdit: base.handleEdit,
    handleDelete: base.handleDelete,
    handleComplete,
    handleCancelForm: base.handleCancelForm,
    openProjectForm: base.openForm,
  }
}
