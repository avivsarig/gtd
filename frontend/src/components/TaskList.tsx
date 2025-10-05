import { type Task, type TaskStatus, type Project } from "@/lib/api"

interface TaskListProps {
  tasks: Task[]
  projects: Project[]
  onUpdateStatus: (taskId: string, status: TaskStatus) => void
  onToggleComplete: (task: Task) => void
  onUpdateProject: (taskId: string, projectId: string | null) => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "next", label: "Next", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "waiting", label: "Waiting", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "someday", label: "Someday", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
]

export function TaskList({ tasks, projects, onUpdateStatus, onToggleComplete, onUpdateProject }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No tasks yet. Create one to get started!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`border border-border rounded-lg p-4 hover:bg-accent transition-colors ${
            task.completed_at ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Completion Checkbox */}
            <input
              type="checkbox"
              checked={!!task.completed_at}
              onChange={() => onToggleComplete(task)}
              className="mt-1 h-4 w-4 rounded border-gray-300 cursor-pointer"
            />

            <div className="flex-1">
              <h3
                className={`font-medium ${
                  task.completed_at ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {task.description}
                </p>
              )}

              <div className="flex items-center gap-2 mt-3">
                {/* Status Selector */}
                <select
                  value={task.status}
                  onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                  className={`px-2 py-1 text-xs font-medium rounded border cursor-pointer ${
                    STATUS_OPTIONS.find((opt) => opt.value === task.status)?.color
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
                  onChange={(e) => onUpdateProject(task.id, e.target.value || null)}
                  className="px-2 py-1 text-xs font-medium rounded border border-purple-500/30 bg-purple-500/20 text-purple-400 cursor-pointer"
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
                <span className="text-xs text-muted-foreground">
                  {new Date(task.created_at).toLocaleDateString()}
                </span>

                {task.completed_at && (
                  <span className="text-xs text-green-400">
                    ✓ Completed {new Date(task.completed_at).toLocaleDateString()}
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
