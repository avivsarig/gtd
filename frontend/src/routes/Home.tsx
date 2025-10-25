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
import { SearchBar } from "@/components/SearchBar"
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
  getContexts,
  createContext,
  deleteContext,
  type Task,
  type TaskStatus,
  type Project,
  type Note,
  type InboxItem,
  type Context,
  type CreateContextInput,
} from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ContextManager } from "@/components/ContextManager"
import { FileText, CheckSquare } from "lucide-react"
import { MESSAGES } from "@/lib/messages"

export function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [contexts, setContexts] = useState<Context[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([])
  const [showUniversalCapture, setShowUniversalCapture] = useState(false)
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadTasks = async () => {
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      console.error(MESSAGES.errors.console.LOAD_TASKS_FAILED, err)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await getProjects(true)
      setProjects(data)
    } catch (err) {
      console.error(MESSAGES.errors.console.LOAD_PROJECTS_FAILED, err)
    }
  }

  const loadNotes = async () => {
    try {
      const data = await getNotes()
      setNotes(data)
    } catch (err) {
      console.error(MESSAGES.errors.console.LOAD_NOTES_FAILED, err)
    }
  }

  const loadInbox = async () => {
    try {
      const data = await getInboxItems()
      setInboxItems(data)
    } catch (err) {
      console.error(MESSAGES.errors.console.LOAD_INBOX_FAILED, err)
    }
  }

  const loadContexts = async () => {
    try {
      const data = await getContexts()
      setContexts(data)
    } catch (err) {
      console.error(MESSAGES.errors.console.LOAD_CONTEXTS_FAILED, err)
    }
  }

  useEffect(() => {
    void loadTasks()
    void loadProjects()
    void loadNotes()
    void loadInbox()
    void loadContexts()
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

      // Cmd+/ / Ctrl+/ - Search
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault()
        setShowSearchBar(true)
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
      console.error(MESSAGES.errors.console.UPDATE_TASK_STATUS_FAILED, err)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = task.completed_at
        ? await uncompleteTask(task.id)
        : await completeTask(task.id)
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)))
    } catch (err) {
      console.error(MESSAGES.errors.console.TOGGLE_TASK_COMPLETION_FAILED, err)
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
      console.error(MESSAGES.errors.console.UPDATE_TASK_PROJECT_FAILED, err)
    }
  }

  const handleUpdateContext = async (
    taskId: string,
    contextId: string | null,
  ) => {
    try {
      const updatedTask = await updateTask(taskId, { context_id: contextId })
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task)),
      )
    } catch (err) {
      console.error(MESSAGES.errors.console.UPDATE_TASK_CONTEXT_FAILED, err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
    } catch (err) {
      console.error(MESSAGES.errors.console.DELETE_TASK_FAILED, err)
      alert(MESSAGES.errors.DELETE_TASK_FAILED)
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
      console.error(MESSAGES.errors.console.CREATE_NOTE_FAILED, err)
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
      console.error(MESSAGES.errors.console.UPDATE_NOTE_FAILED, err)
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
      console.error(MESSAGES.errors.console.DELETE_NOTE_FAILED, err)
    }
  }

  const handleCancelNoteForm = () => {
    setEditingNote(null)
    setShowNoteForm(false)
  }

  // Inbox handlers
  const handleDeleteInboxItem = async (id: string) => {
    try {
      setProcessingId(id)
      await deleteInboxItem(id)
      void loadInbox()
    } catch (err) {
      alert(err instanceof Error ? err.message : MESSAGES.errors.DELETE_FAILED)
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
      alert(err instanceof Error ? err.message : MESSAGES.errors.CONVERT_FAILED)
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
      alert(err instanceof Error ? err.message : MESSAGES.errors.CONVERT_FAILED)
    } finally {
      setProcessingId(null)
    }
  }

  // Context handlers
  const handleCreateContext = async (data: CreateContextInput) => {
    try {
      await createContext(data)
      void loadContexts()
    } catch (err) {
      throw err
    }
  }

  const handleDeleteContext = async (contextId: string) => {
    try {
      await deleteContext(contextId)
      void loadContexts()
    } catch (err) {
      console.error(MESSAGES.errors.console.DELETE_CONTEXT_FAILED, err)
      alert(MESSAGES.errors.DELETE_CONTEXT_FAILED)
    }
  }

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">GTD Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Press Cmd+K for quick capture
          </p>
        </div>

        {/* Top Row: Quick Capture + Inbox */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Quick Capture */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Capture</CardTitle>
              <p className="text-muted-foreground text-sm">
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
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    ({inboxItems.length}{" "}
                    {inboxItems.length === 1 ? "item" : "items"})
                  </span>
                )}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Process into tasks, notes, or projects
              </p>
            </CardHeader>
            <CardContent>
              {inboxItems.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  {MESSAGES.info.INBOX_ZERO}
                </p>
              ) : (
                <div className="max-h-[400px] space-y-2 overflow-y-auto">
                  {inboxItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      onEdit={() => {
                        // TODO: Implement edit functionality for inbox items
                        alert(MESSAGES.info.COMING_SOON)
                      }}
                      onDelete={() => handleDeleteInboxItem(item.id)}
                      deleteConfirmMessage={
                        MESSAGES.confirmations.DELETE_INBOX_ITEM
                      }
                      actions={
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConvertToTask(item)}
                            disabled={processingId === item.id}
                          >
                            <CheckSquare className="mr-1 h-3 w-3" />
                            Task
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConvertToNote(item)}
                            disabled={processingId === item.id}
                          >
                            <FileText className="mr-1 h-3 w-3" />
                            Note
                          </Button>
                        </>
                      }
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {item.content}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>
                Tasks
                {tasks.length > 0 && (
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    ({tasks.filter((t) => !t.completed_at).length} active)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <TaskList
                tasks={tasks}
                projects={projects}
                contexts={contexts}
                onUpdateStatus={handleUpdateStatus}
                onToggleComplete={handleToggleComplete}
                onUpdateProject={handleUpdateProject}
                onUpdateContext={handleUpdateContext}
                onEdit={(_task) => {
                  // TODO: Implement edit functionality for tasks
                  alert(MESSAGES.info.COMING_SOON)
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
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Projects Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <p className="text-muted-foreground text-sm">Coming soon</p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground py-8 text-center">
                Projects view will show active projects and their progress
              </p>
            </CardContent>
          </Card>

          {/* Contexts */}
          <Card>
            <CardHeader>
              <CardTitle>
                Contexts
                {contexts.length > 0 && (
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    ({contexts.length})
                  </span>
                )}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Manage contexts for task filtering
              </p>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <ContextManager
                contexts={contexts}
                onCreate={handleCreateContext}
                onDelete={handleDeleteContext}
              />
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

      {/* Search Modal (Cmd+/) */}
      <SearchBar
        open={showSearchBar}
        onOpenChange={setShowSearchBar}
        onNavigate={(result) => {
          console.log("Navigate to:", result)
        }}
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
