import { useEffect, useState, useMemo } from "react"
import { QuickCapture } from "@/components/QuickCapture"
import { TaskList } from "@/components/TaskList"
import { getTasks, createTask, healthCheck, updateTask, completeTask, uncompleteTask, getProjects, type Task, type TaskStatus, type Project } from "@/lib/api"

type StatusFilter = "all" | TaskStatus

export function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  // Check backend health on mount
  useEffect(() => {
    healthCheck()
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"))
  }, [])

  // Load tasks and projects on mount
  useEffect(() => {
    void loadTasks()
    void loadProjects()
  }, [])

  const loadTasks = async () => {
    try {
      setError(null)
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      setError("Failed to load tasks. Make sure the backend is running.")
      console.error(err)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await getProjects(true) // with stats
      setProjects(data)
    } catch (err) {
      console.error("Failed to load projects:", err)
    }
  }

  const handleCreateTask = async (input: { title: string; description?: string }) => {
    try {
      setIsLoading(true)
      setError(null)
      const newTask = await createTask(input)
      setTasks((prev) => [newTask, ...prev])
    } catch (err) {
      setError("Failed to create task")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updatedTask = await updateTask(taskId, { status })
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      )
    } catch (err) {
      setError("Failed to update task status")
      console.error(err)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = task.completed_at
        ? await uncompleteTask(task.id)
        : await completeTask(task.id)
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updatedTask : t))
      )
    } catch (err) {
      setError("Failed to toggle task completion")
      console.error(err)
    }
  }

  const handleUpdateProject = async (taskId: string, projectId: string | null) => {
    try {
      const updatedTask = await updateTask(taskId, { project_id: projectId })
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      )
    } catch (err) {
      setError("Failed to update task project")
      console.error(err)
    }
  }

  // Filter tasks based on status filter
  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks
    return tasks.filter((task) => task.status === statusFilter)
  }, [tasks, statusFilter])

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GTD Task Manager</h1>
        <div className="flex items-center gap-2 text-sm">
          <span>Backend:</span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              backendStatus === "online"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : backendStatus === "offline"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
            }`}
          >
            {backendStatus}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Quick Capture */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Capture</h2>
        <QuickCapture onSubmit={handleCreateTask} isLoading={isLoading} />
      </div>

      {/* Task List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Tasks ({filteredTasks.length})
          </h2>
          <button
            onClick={loadTasks}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Refresh
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "next", "waiting", "someday"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter !== "all" && (
                <span className="ml-2 opacity-70">
                  ({tasks.filter((t) => t.status === filter).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <TaskList
          tasks={filteredTasks}
          projects={projects}
          onUpdateStatus={handleUpdateStatus}
          onToggleComplete={handleToggleComplete}
          onUpdateProject={handleUpdateProject}
        />
      </div>
    </div>
  )
}
