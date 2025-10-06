import { useState, useEffect } from "react"
import  { type Note, type Project } from "@/lib/api"

interface NoteFormProps {
  note?: Note | null
  projects: Project[]
  onSubmit: (data: { title: string; content?: string; project_id?: string | null }) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function NoteForm({ note, projects, onSubmit, onCancel, isLoading }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [projectId, setProjectId] = useState<string | null>(note?.project_id ?? null)

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
        <label htmlFor="note-title" className="block text-sm font-medium mb-2">
          Title *
        </label>
        <input
          id="note-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="note-content" className="block text-sm font-medium mb-2">
          Content
        </label>
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter note content..."
          rows={6}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="note-project" className="block text-sm font-medium mb-2">
          Project
        </label>
        <select
          id="note-project"
          value={projectId ?? ""}
          onChange={(e) => setProjectId(e.target.value || null)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        >
          <option value="">No Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Saving..." : note ? "Update Note" : "Create Note"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
