import { type Project } from "@/lib/api"
import { BaseSelect, type Option } from "../ui/select"

interface ProjectFilterProps {
  value: string | undefined
  projects: Project[]
  onChange: (projectId: string | undefined) => void
  disabled?: boolean
}

/**
 * ProjectFilter - Filter variant of ProjectSelect with "All" option.
 *
 * Used in filter bars to allow users to filter by project or view all projects.
 */
export function ProjectFilter({
  value,
  projects,
  onChange,
  disabled,
}: ProjectFilterProps) {
  const options: Option[] = [
    { value: "all", label: "All Projects" },
    ...projects.map((project) => ({
      value: project.id,
      label: project.name,
    })),
  ]

  const currentValue = value || "all"

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="project-filter"
        className="text-xs font-medium text-gray-700 dark:text-gray-300"
      >
        Project
      </label>
      <BaseSelect
        id="project-filter"
        value={currentValue}
        options={options}
        onChange={(newValue) => {
          onChange(
            newValue === "all" || newValue === null ? undefined : newValue,
          )
        }}
        disabled={disabled}
        variant="project"
        aria-label="Filter by project"
        placeholder=""
      />
    </div>
  )
}
