import { useEffect, useState, useMemo } from "react"
import { QuickCapture } from "@/components/QuickCapture"
import { TaskList } from "@/components/TaskList"
import { NotesList } from "@/components/NotesList"
import { NoteForm } from "@/components/NoteForm"
import {
  getTasks,
  createTask,
  healthCheck,
  updateTask,
  completeTask,
  uncompleteTask,
  getProjects,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  type Task,
  type TaskStatus,
  type Project,
  type Note,
} from "@/lib/api"

type StatusFilter = "all" | TaskStatus

export function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showNoteForm, setShowNoteForm] = useState(false)

  // Check backend health on mount
  useEffect(() => {
    healthCheck()
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"))
  }, [])

  // Load tasks, projects, and notes on mount
  useEffect(() => {
    void loadTasks()
    void loadProjects()
    void loadNotes()
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

  const loadNotes = async () => {
    try {
      const data = await getNotes()
      setNotes(data)
    } catch (err) {
      console.error("Failed to load notes:", err)
    }
  }

  const handleCreateTask = async (input: {
    title: string
    description?: string
  }) => {
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
        prev.map((task) => (task.id === taskId ? updatedTask : task)),
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
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)))
    } catch (err) {
      setError("Failed to toggle task completion")
      console.error(err)
    }
  }

  const handleUpdateProject = async (
    taskId: string,
    projectId: string | null,
  ) => {
    try {
      const updatedTask = await updateTask(taskId, { project_id: projectId })
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task)),
      )
    } catch (err) {
      setError("Failed to update task project")
      console.error(err)
    }
  }

  const handleCreateNote = async (data: {
    title: string
    content?: string
    project_id?: string | null
  }) => {
    try {
      setIsLoading(true)
      const newNote = await createNote(data)
      setNotes((prev) => [newNote, ...prev])
      setShowNoteForm(false)
    } catch (err) {
      setError("Failed to create note")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateNote = async (data: {
    title: string
    content?: string
    project_id?: string | null
  }) => {
    if (!editingNote) return
    try {
      setIsLoading(true)
      const updatedNote = await updateNote(editingNote.id, data)
      setNotes((prev) =>
        prev.map((note) => (note.id === editingNote.id ? updatedNote : note)),
      )
      setEditingNote(null)
      setShowNoteForm(false)
    } catch (err) {
      setError("Failed to update note")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setShowNoteForm(true)
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId)
      setNotes((prev) => prev.filter((note) => note.id !== noteId))
    } catch (err) {
      setError("Failed to delete note")
      console.error(err)
    }
  }

  const handleCancelNoteForm = () => {
    setEditingNote(null)
    setShowNoteForm(false)
  }

  // Filter tasks based on status filter
  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks
    return tasks.filter((task) => task.status === statusFilter)
  }, [tasks, statusFilter])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">GTD Task Manager</h1>
        <div className="flex items-center gap-2 text-sm">
          <span>Backend:</span>
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${
              backendStatus === "online"
                ? "border border-green-500/30 bg-green-500/20 text-green-400"
                : backendStatus === "offline"
                  ? "border border-red-500/30 bg-red-500/20 text-red-400"
                  : "border border-gray-500/30 bg-gray-500/20 text-gray-400"
            }`}
          >
            {backendStatus}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive mb-6 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Quick Capture */}
      <div className="bg-card border-border mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Quick Capture</h2>
        <QuickCapture onSubmit={handleCreateTask} isLoading={isLoading} />
      </div>

      {/* Task List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Tasks ({filteredTasks.length})
          </h2>
          <button
            onClick={loadTasks}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Refresh
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-4 flex gap-2">
          {(["all", "next", "waiting", "someday"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
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

      {/* Notes Section */}
      <div className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Notes ({notes.length})</h2>
          <button
            onClick={() => {
              setEditingNote(null)
              setShowNoteForm(!showNoteForm)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm transition-colors"
          >
            {showNoteForm ? "Cancel" : "+ New Note"}
          </button>
        </div>

        {showNoteForm && (
          <div className="bg-card border-border mb-6 rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-semibold">
              {editingNote ? "Edit Note" : "Create Note"}
            </h3>
            <NoteForm
              note={editingNote}
              projects={projects}
              onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
              onCancel={handleCancelNoteForm}
              isLoading={isLoading}
            />
          </div>
        )}

        <NotesList
          notes={notes}
          projects={projects}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      </div>
    </div>
  )
}
