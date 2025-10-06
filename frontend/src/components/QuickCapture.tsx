import { useState } from "react"
import { type CreateTaskInput } from "@/lib/api"

interface QuickCaptureProps {
  onSubmit: (task: CreateTaskInput) => void
  isLoading?: boolean
}

export function QuickCapture({ onSubmit, isLoading }: QuickCaptureProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
    })

    // Reset form
    setTitle("")
    setDescription("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          className="border-border focus:ring-ring w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
          autoFocus
        />
      </div>
      <div>
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
          className="border-border focus:ring-ring w-full resize-none rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={!title.trim() || isLoading}
        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Creating..." : "Create Task"}
      </button>
    </form>
  )
}
