import { type Task, type TaskStatus, type Project } from "@/lib/api"

interface TaskListProps {
  tasks: Task[]
  projects: Project[]
  onUpdateStatus: (taskId: string, status: TaskStatus) => void
  onToggleComplete: (task: Task) => void
  onUpdateProject: (taskId: string, projectId: string | null) => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  {
    value: "next",
    label: "Next",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    value: "waiting",
    label: "Waiting",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  {
    value: "someday",
    label: "Someday",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
]

export function TaskList({
  tasks,
  projects,
  onUpdateStatus,
  onToggleComplete,
  onUpdateProject,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        No tasks yet. Create one to get started!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`border-border hover:bg-accent rounded-lg border p-4 transition-colors ${
            task.completed_at ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Completion Checkbox */}
            <input
              type="checkbox"
              checked={!!task.completed_at}
              onChange={() => onToggleComplete(task)}
              className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300"
            />

            <div className="flex-1">
              <h3
                className={`font-medium ${
                  task.completed_at ? "text-muted-foreground line-through" : ""
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {task.description}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2">
                {/* Status Selector */}
                <select
                  value={task.status}
                  onChange={(e) =>
                    onUpdateStatus(task.id, e.target.value as TaskStatus)
                  }
                  className={`cursor-pointer rounded border px-2 py-1 text-xs font-medium ${
                    STATUS_OPTIONS.find((opt) => opt.value === task.status)
                      ?.color
                  }`}
                  disabled={!!task.completed_at}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Project Selector */}
                <select
                  value={task.project_id || ""}
                  onChange={(e) =>
                    onUpdateProject(task.id, e.target.value || null)
                  }
                  className="cursor-pointer rounded border border-purple-500/30 bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-400"
                  disabled={!!task.completed_at}
                >
                  <option value="">No Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>

                {/* Metadata */}
                <span className="text-muted-foreground text-xs">
                  {new Date(task.created_at).toLocaleDateString()}
                </span>

                {task.completed_at && (
                  <span className="text-xs text-green-400">
                    ✓ Completed{" "}
                    {new Date(task.completed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
