/**
 * ProjectSelect - Reusable project selector component
 *
 * Displays a styled select dropdown for project assignment.
 * Follows clean code principles with proper separation and reusability.
 */

import { type Project } from "@/lib/api"
import { BaseSelect, type Option } from "./ui/select"

interface ProjectSelectProps {
  value: string | null | undefined
  projects: Project[]
  onChange: (projectId: string | null) => void
  disabled?: boolean
  id?: string
}

export function ProjectSelect({
  value,
  projects,
  onChange,
  disabled,
  id,
}: ProjectSelectProps) {
  const options: Option[] = projects.map((project) => ({
    value: project.id,
    label: project.name,
  }))

  return (
    <BaseSelect
      id={id}
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      variant="project"
      placeholder="No Project"
      aria-label="Project assignment"
    />
  )
}
