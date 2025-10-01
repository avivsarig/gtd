import type { Task } from "@/lib/api"

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
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
          className="border border-border rounded-lg p-4 hover:bg-accent transition-colors"
        >
          <h3 className="font-medium">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-secondary rounded">
              {task.status}
            </span>
            <span>{new Date(task.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
