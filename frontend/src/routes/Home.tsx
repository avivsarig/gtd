import { useEffect, useState } from "react"
import { QuickCapture } from "@/components/QuickCapture"
import { TaskList } from "@/components/TaskList"
import { getTasks, createTask, healthCheck, type Task } from "@/lib/api"

export function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")

  // Check backend health on mount
  useEffect(() => {
    healthCheck()
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"))
  }, [])

  // Load tasks on mount
  useEffect(() => {
    loadTasks()
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
                ? "bg-green-100 text-green-800"
                : backendStatus === "offline"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
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
            Tasks ({tasks.length})
          </h2>
          <button
            onClick={loadTasks}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Refresh
          </button>
        </div>
        <TaskList tasks={tasks} />
      </div>
    </div>
  )
}
