/**
 * Home - Main GTD dashboard
 *
 * Orchestrates the dashboard layout by composing section components.
 * Business logic delegated to custom hooks for separation of concerns.
 *
 * Layout:
 * - Top: Quick Capture | Inbox (side by side)
 * - Middle: Tasks | Notes (side by side)
 * - Bottom: Projects | Contexts (placeholders)
 */

import { QuickCapture } from "@/components/QuickCapture"
import { UniversalCapture } from "@/components/UniversalCapture"
import { SearchBar } from "@/components/SearchBar"
import { NoteFormModal } from "@/components/NoteFormModal"
import { TaskFormModal } from "@/components/TaskFormModal"
import { InboxFormModal } from "@/components/InboxFormModal"
import { ContextFormModal } from "@/components/ContextFormModal"
import { DashboardHeader } from "@/components/DashboardHeader"
import { InboxSection } from "@/components/InboxSection"
import { TasksSection } from "@/components/TasksSection"
import { NotesSection } from "@/components/NotesSection"
import { ContextsSection } from "@/components/ContextsSection"
import { ProjectsSection } from "@/components/ProjectsSection"
import { ProjectFormModal } from "@/components/ProjectFormModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getTasks,
  getProjects,
  getNotes,
  getInboxItems,
  getContexts,
} from "@/lib/api"
import { MESSAGES } from "@/lib/messages"
import { useResourceLoader } from "@/hooks/useResourceLoader"
import { useTaskOperations } from "@/hooks/useTaskOperations"
import { useNoteOperations } from "@/hooks/useNoteOperations"
import { useInboxOperations } from "@/hooks/useInboxOperations"
import { useContextOperations } from "@/hooks/useContextOperations"
import { useProjectOperations } from "@/hooks/useProjectOperations"
import { useModalState } from "@/hooks/useModalState"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

export function Home() {
  // Data layer - using useResourceLoader to eliminate duplicated load functions
  const {
    data: tasks,
    setData: setTasks,
    reload: loadTasks,
  } = useResourceLoader(getTasks, {
    errorContext: MESSAGES.errors.console.LOAD_TASKS_FAILED,
  })

  const { data: projects, reload: loadProjects } = useResourceLoader(
    () => getProjects(true),
    {
      errorContext: MESSAGES.errors.console.LOAD_PROJECTS_FAILED,
    },
  )

  const { data: notes, reload: loadNotes } = useResourceLoader(getNotes, {
    errorContext: MESSAGES.errors.console.LOAD_NOTES_FAILED,
  })

  const { data: inboxItems, reload: loadInbox } = useResourceLoader(
    getInboxItems,
    {
      errorContext: MESSAGES.errors.console.LOAD_INBOX_FAILED,
    },
  )

  const { data: contexts, reload: loadContexts } = useResourceLoader(
    getContexts,
    {
      errorContext: MESSAGES.errors.console.LOAD_CONTEXTS_FAILED,
    },
  )

  // Business logic hooks - each handles a domain concern
  const taskOps = useTaskOperations({
    onReload: loadTasks,
    onUpdate: (updater) => {
      setTasks((prev) => (prev ? updater(prev) : null))
    },
  })

  const noteOps = useNoteOperations({
    onReload: loadNotes,
  })

  const inboxOps = useInboxOperations({
    onReloadInbox: loadInbox,
    onReloadTasks: loadTasks,
    onReloadNotes: loadNotes,
  })

  const contextOps = useContextOperations({
    onReload: loadContexts,
  })

  const projectOps = useProjectOperations({
    onReload: loadProjects,
  })

  // Modal state management
  const modals = useModalState()

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onOpenCapture: modals.openUniversalCapture,
    onOpenSearch: modals.openSearchBar,
  })

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHeader />

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
          <InboxSection
            inboxItems={inboxItems ?? []}
            processingId={inboxOps.processingId}
            onConvertToTask={inboxOps.handleConvertToTask}
            onConvertToNote={inboxOps.handleConvertToNote}
            onEdit={inboxOps.handleEdit}
            onDelete={inboxOps.handleDelete}
          />
        </div>

        {/* Middle Row: Tasks + Notes */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TasksSection
            tasks={tasks ?? []}
            projects={projects ?? []}
            contexts={contexts ?? []}
            onUpdateStatus={taskOps.handleUpdateStatus}
            onToggleComplete={taskOps.handleToggleComplete}
            onUpdateProject={taskOps.handleUpdateProject}
            onUpdateContext={taskOps.handleUpdateContext}
            onEdit={taskOps.handleEdit}
            onDelete={taskOps.handleDelete}
          />

          <NotesSection
            notes={notes ?? []}
            projects={projects ?? []}
            onEdit={noteOps.handleEdit}
            onDelete={noteOps.handleDelete}
            onNewNote={noteOps.openNoteForm}
          />
        </div>

        {/* Bottom Row: Projects + Contexts */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ProjectsSection
            projects={projects ?? []}
            onEdit={projectOps.handleEdit}
            onCreate={projectOps.openProjectForm}
            onDelete={projectOps.handleDelete}
            onComplete={projectOps.handleComplete}
          />

          <ContextsSection
            contexts={contexts ?? []}
            onEdit={contextOps.handleEdit}
            onCreate={contextOps.handleCreate}
            onDelete={contextOps.handleDelete}
          />
        </div>
      </div>

      {/* Universal Capture Modal (Cmd+K) */}
      <UniversalCapture
        open={modals.showUniversalCapture}
        onOpenChange={modals.setShowUniversalCapture}
        onSuccess={loadInbox}
      />

      {/* Search Modal (Cmd+/) */}
      <SearchBar
        open={modals.showSearchBar}
        onOpenChange={modals.setShowSearchBar}
        onNavigate={(result) => {
          console.log("Navigate to:", result)
        }}
      />

      {/* Note Form Modal */}
      <NoteFormModal
        open={noteOps.showNoteForm}
        onOpenChange={(open) => {
          if (!open) noteOps.handleCancelForm()
        }}
        note={noteOps.editingNote}
        projects={projects ?? []}
        onSubmit={
          noteOps.editingNote ? noteOps.handleUpdate : noteOps.handleCreate
        }
      />

      {/* Task Form Modal */}
      <TaskFormModal
        open={taskOps.showTaskForm}
        onOpenChange={(open) => {
          if (!open) taskOps.handleCancelForm()
        }}
        task={taskOps.editingTask}
        projects={projects ?? []}
        contexts={contexts ?? []}
        onSubmit={
          taskOps.editingTask ? taskOps.handleUpdate : taskOps.handleCreate
        }
      />

      {/* Inbox Form Modal */}
      <InboxFormModal
        open={inboxOps.showInboxForm}
        onOpenChange={(open) => {
          if (!open) inboxOps.handleCancelForm()
        }}
        inboxItem={inboxOps.editingInboxItem}
        onSubmit={
          inboxOps.editingInboxItem
            ? inboxOps.handleUpdate
            : inboxOps.handleCreate
        }
      />

      {/* Context Form Modal */}
      <ContextFormModal
        open={contextOps.showContextForm}
        onOpenChange={(open) => {
          if (!open) contextOps.handleCancelForm()
        }}
        context={contextOps.editingContext}
        onSubmit={
          contextOps.editingContext
            ? contextOps.handleUpdate
            : contextOps.handleCreate
        }
      />

      {/* Project Form Modal */}
      <ProjectFormModal
        open={projectOps.showProjectForm}
        onOpenChange={(open) => {
          if (!open) projectOps.handleCancelForm()
        }}
        project={projectOps.editingProject}
        projects={projects ?? []}
        onSubmit={
          projectOps.editingProject
            ? projectOps.handleUpdate
            : projectOps.handleCreate
        }
      />
    </div>
  )
}
