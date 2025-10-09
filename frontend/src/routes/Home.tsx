/**
 * Home - Main GTD dashboard
 *
 * Layout:
 * - Top: Quick Capture | Inbox (side by side)
 * - Middle: Tasks | Notes (side by side)
 * - Bottom: Projects | Contexts (placeholders)
 */

import { useEffect, useState } from "react"
import { QuickCapture } from "@/components/QuickCapture"
import { UniversalCapture } from "@/components/UniversalCapture"
import { TaskList } from "@/components/TaskList"
import { NotesList } from "@/components/NotesList"
import { NoteForm } from "@/components/NoteForm"
import { ItemCard } from "@/components/ItemCard"
import {
  getTasks,
  updateTask,
  completeTask,
  uncompleteTask,
  deleteTask,
  getProjects,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getInboxItems,
  deleteInboxItem,
  convertInboxToTask,
  convertInboxToNote,
  type Task,
  type TaskStatus,
  type Project,
  type Note,
  type InboxItem,
} from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/components/DeleteButton"
import { FileText, CheckSquare } from "lucide-react"

export function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([])
  const [showUniversalCapture, setShowUniversalCapture] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadTasks = async () => {
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      console.error("Failed to load tasks:", err)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await getProjects(true)
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

  const loadInbox = async () => {
    try {
      const data = await getInboxItems()
      setInboxItems(data)
    } catch (err) {
      console.error("Failed to load inbox:", err)
    }
  }

  useEffect(() => {
    void loadTasks()
    void loadProjects()
    void loadNotes()
    void loadInbox()
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Cmd+K / Ctrl+K - Universal capture
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setShowUniversalCapture(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Task handlers
  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updatedTask = await updateTask(taskId, { status })
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task)),
      )
    } catch (err) {
      console.error("Failed to update task status:", err)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = task.completed_at
        ? await uncompleteTask(task.id)
        : await completeTask(task.id)
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)))
    } catch (err) {
      console.error("Failed to toggle task completion:", err)
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
      console.error("Failed to update task project:", err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return

    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
    } catch (err) {
      console.error("Failed to delete task:", err)
      alert("Failed to delete task")
    }
  }

  // Note handlers
  const handleCreateNote = async (data: {
    title: string
    content?: string
    project_id?: string | null
  }) => {
    try {
      const newNote = await createNote(data)
      setNotes((prev) => [newNote, ...prev])
      setShowNoteForm(false)
    } catch (err) {
      console.error("Failed to create note:", err)
    }
  }

  const handleUpdateNote = async (data: {
    title: string
    content?: string
    project_id?: string | null
  }) => {
    if (!editingNote) return
    try {
      const updatedNote = await updateNote(editingNote.id, data)
      setNotes((prev) =>
        prev.map((note) => (note.id === editingNote.id ? updatedNote : note)),
      )
      setEditingNote(null)
      setShowNoteForm(false)
    } catch (err) {
      console.error("Failed to update note:", err)
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
      console.error("Failed to delete note:", err)
    }
  }

  const handleCancelNoteForm = () => {
    setEditingNote(null)
    setShowNoteForm(false)
  }

  // Inbox handlers
  const handleDeleteInboxItem = async (id: string) => {
    if (!confirm("Delete this inbox item?")) return

    try {
      setProcessingId(id)
      await deleteInboxItem(id)
      void loadInbox()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete")
    } finally {
      setProcessingId(null)
    }
  }

  const handleConvertToTask = async (item: InboxItem) => {
    try {
      setProcessingId(item.id)
      await convertInboxToTask(item.id, { title: item.content })
      void loadInbox()
      void loadTasks()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to convert")
    } finally {
      setProcessingId(null)
    }
  }

  const handleConvertToNote = async (item: InboxItem) => {
    try {
      setProcessingId(item.id)
      await convertInboxToNote(item.id, { content: item.content })
      void loadInbox()
      void loadNotes()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to convert")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">GTD Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Press Cmd+K for quick capture
          </p>
        </div>

        {/* Top Row: Quick Capture + Inbox */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Capture */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Capture</CardTitle>
              <p className="text-sm text-muted-foreground">
                Capture thoughts instantly to inbox
              </p>
            </CardHeader>
            <CardContent>
              <QuickCapture onSuccess={loadInbox} />
            </CardContent>
          </Card>

          {/* Inbox */}
          <Card>
            <CardHeader>
              <CardTitle>
                Inbox
                {inboxItems.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({inboxItems.length} {inboxItems.length === 1 ? "item" : "items"})
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Process into tasks, notes, or projects
              </p>
            </CardHeader>
            <CardContent>
              {inboxItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Inbox Zero! 🎉
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {inboxItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      onEdit={() => {
                        // TODO: Implement edit functionality for inbox items
                        alert("Edit functionality coming soon!")
                      }}
                      onDelete={() => handleDeleteInboxItem(item.id)}
                      deleteConfirmMessage={`Delete inbox item?`}
                      actions={
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConvertToTask(item)}
                            disabled={processingId === item.id}
                          >
                            <CheckSquare className="h-3 w-3 mr-1" />
                            Task
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConvertToNote(item)}
                            disabled={processingId === item.id}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Note
                          </Button>
                        </>
                      }
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {item.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </ItemCard>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Row: Tasks + Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>
                Tasks
                {tasks.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({tasks.filter((t) => !t.completed_at).length} active)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <TaskList
                tasks={tasks}
                projects={projects}
                onUpdateStatus={handleUpdateStatus}
                onToggleComplete={handleToggleComplete}
                onUpdateProject={handleUpdateProject}
                onEdit={(task) => {
                  // TODO: Implement edit functionality for tasks
                  alert("Edit functionality coming soon!")
                }}
                onDelete={handleDeleteTask}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>
                Notes
                {notes.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({notes.length})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <div className="mb-3">
                <Button onClick={() => setShowNoteForm(true)} size="sm">
                  + New Note
                </Button>
              </div>
              <NotesList
                notes={notes}
                projects={projects}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Projects + Contexts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Projects Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Projects view will show active projects and their progress
              </p>
            </CardContent>
          </Card>

          {/* Contexts Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Contexts</CardTitle>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Filter tasks by context (@home, @computer, @phone, etc.)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Universal Capture Modal (Cmd+K) */}
      <UniversalCapture
        open={showUniversalCapture}
        onOpenChange={setShowUniversalCapture}
        onSuccess={loadInbox}
      />

      {/* Note Form Modal */}
      {showNoteForm && (
        <NoteForm
          note={editingNote}
          projects={projects}
          onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
          onCancel={handleCancelNoteForm}
        />
      )}
    </div>
  )
}
