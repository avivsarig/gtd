/**
 * ProjectSelect - Reusable project selector component
 *
 * Displays a styled select dropdown for project assignment.
 * Follows clean code principles with proper separation and reusability.
 */

import { type Project } from "@/lib/api"

interface ProjectSelectProps {
  value: string | null | undefined
  projects: Project[]
  onChange: (projectId: string | null) => void
  disabled?: boolean
}

export function ProjectSelect({
  value,
  projects,
  onChange,
  disabled,
}: ProjectSelectProps) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
      className="cursor-pointer rounded border border-purple-500/30 bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Project assignment"
    >
      <option value="">No Project</option>
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  )
}
