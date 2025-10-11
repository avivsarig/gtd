/**
 * ContextManager - Component for managing contexts
 *
 * Provides UI for viewing, creating, editing, and deleting contexts.
 * Follows clean code principles with clear responsibilities.
 */

import { useState } from "react"
import { type Context, type CreateContextInput } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/ItemCard"
import { EmptyState } from "@/components/EmptyState"
import { Plus, X } from "lucide-react"

interface ContextManagerProps {
  contexts: Context[]
  onDelete: (id: string) => void
  onCreate: (data: CreateContextInput) => Promise<void>
}

export function ContextManager({
  contexts,
  onDelete,
  onCreate,
}: ContextManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<CreateContextInput>({
    name: "",
    description: "",
    icon: "",
    sort_order: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError("Context name is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onCreate({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        icon: formData.icon?.trim() || undefined,
        sort_order: formData.sort_order,
      })
      setFormData({ name: "", description: "", icon: "", sort_order: 0 })
      setIsCreating(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create context")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setFormData({ name: "", description: "", icon: "", sort_order: 0 })
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* Add Context Button */}
      {!isCreating && (
        <Button onClick={() => setIsCreating(true)} size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Context
        </Button>
      )}

      {/* Create Form */}
      {isCreating && (
        <div className="bg-accent/50 space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Create New Context</h3>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="context-name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="context-name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., @home, @computer, @phone"
                className="bg-background mt-1 w-full rounded border px-3 py-2 text-sm"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="context-icon" className="text-sm font-medium">
                Icon (emoji)
              </label>
              <input
                id="context-icon"
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="e.g., 🏠 💻 📱"
                className="bg-background mt-1 w-full rounded border px-3 py-2 text-sm"
                disabled={isSubmitting}
                maxLength={10}
              />
            </div>

            <div>
              <label
                htmlFor="context-description"
                className="text-sm font-medium"
              >
                Description
              </label>
              <input
                id="context-description"
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="When to use this context"
                className="bg-background mt-1 w-full rounded border px-3 py-2 text-sm"
                disabled={isSubmitting}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} size="sm">
                {isSubmitting ? "Creating..." : "Create Context"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Contexts List */}
      {contexts.length === 0 ? (
        <EmptyState message="No contexts yet. Create one to get started!" />
      ) : (
        <div className="space-y-2">
          {contexts.map((context) => (
            <ItemCard
              key={context.id}
              onDelete={() => onDelete(context.id)}
              deleteConfirmMessage={`Delete context "${context.name}"?`}
            >
              <div className="flex items-start gap-2">
                {context.icon && (
                  <span className="text-lg" aria-hidden="true">
                    {context.icon}
                  </span>
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{context.name}</h4>
                  {context.description && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {context.description}
                    </p>
                  )}
                </div>
              </div>
            </ItemCard>
          ))}
        </div>
      )}
    </div>
  )
}
