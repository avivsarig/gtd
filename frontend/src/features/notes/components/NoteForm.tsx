import { useState, useEffect } from "react"
import { type Note, type Project } from "@/lib/api"
import { ProjectSelect } from "./ProjectSelect"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"

interface NoteFormProps {
  note?: Note | null
  projects: Project[]
  onSubmit: (data: {
    title: string
    content?: string
    project_id?: string | null
  }) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function NoteForm({
  note,
  projects,
  onSubmit,
  onCancel,
  isLoading,
}: NoteFormProps) {
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [projectId, setProjectId] = useState<string | null>(
    note?.project_id ?? null,
  )

  useEffect(() => {
    setTitle(note?.title ?? "")
    setContent(note?.content ?? "")
    setProjectId(note?.project_id ?? null)
  }, [note])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await onSubmit({
      title: title.trim(),
      content: content.trim() || undefined,
      project_id: projectId,
    })

    // Reset form if creating new note
    if (!note) {
      setTitle("")
      setContent("")
      setProjectId(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="note-title" className="mb-2 block text-sm font-medium">
          Title *
        </label>
        <Input
          id="note-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          disabled={isLoading}
          autoFocus
        />
      </div>

      <div>
        <label
          htmlFor="note-content"
          className="mb-2 block text-sm font-medium"
        >
          Content
        </label>
        <Textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter note content..."
          rows={6}
          className="resize-y"
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="note-project"
          className="mb-2 block text-sm font-medium"
        >
          Project
        </label>
        <ProjectSelect
          id="note-project"
          value={projectId}
          projects={projects}
          onChange={setProjectId}
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Saving..." : note ? "Update Note" : "Create Note"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg px-4 py-2 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
