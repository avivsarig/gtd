/**
 * ProjectsSection - Projects display section for dashboard
 *
 * Card wrapper with projects list and create button.
 * Presentational component that receives data and handlers as props.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProjectsList } from "@/features/projects/components/ProjectsList"
import { type Project } from "@/lib/api"

export interface ProjectsSectionProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onCreate: () => void
  onDelete: (projectId: string) => void
  onComplete: (projectId: string) => void
}

export function ProjectsSection({
  projects,
  onEdit,
  onCreate,
  onDelete,
  onComplete,
}: ProjectsSectionProps) {
  const activeProjects = projects.filter((p) => p.status === "active")

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Projects
          {projects.length > 0 && (
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              ({activeProjects.length} active)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        <div className="mb-3">
          <Button onClick={onCreate} size="sm">
            + New Project
          </Button>
        </div>
        <ProjectsList
          projects={projects}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
        />
      </CardContent>
    </Card>
  )
}
