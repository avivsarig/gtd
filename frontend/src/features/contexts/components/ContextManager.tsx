/**
 * ContextManager - Component for managing contexts
 *
 * Provides UI for viewing, creating, editing, and deleting contexts.
 * Follows clean code principles with clear responsibilities.
 *
 * Refactored to use:
 * - useFormSubmission hook (eliminates manual state management)
 * - validateRequired + sanitizeFormData utilities
 */

import { useState } from "react"
import { type Context, type CreateContextInput } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/shared/ItemCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { Plus, X } from "lucide-react"
import { MESSAGES } from "@/lib/messages"
import { useFormSubmission } from "@/hooks/useFormSubmission"
import { validateRequired, sanitizeInput } from "@/lib/validation"
import { Input } from "@/components/ui/input"

interface ContextManagerProps {
  contexts: Context[]
  onEdit: (context: Context) => void
  onDelete: (id: string) => void
  onCreate: (data: CreateContextInput) => Promise<void>
}

export function ContextManager({
  contexts,
  onEdit,
  onDelete,
  onCreate,
}: ContextManagerProps) {
  const [isCreating, setIsCreating] = useState(false)

  const {
    data: formData,
    updateField,
    handleSubmit,
    isSubmitting,
    error,
    reset,
  } = useFormSubmission<CreateContextInput>(
    {
      name: "",
      description: "",
      icon: "",
      sort_order: 0,
    },
    {
      validate: (data) =>
        validateRequired(data.name, MESSAGES.validation.CONTEXT_NAME_REQUIRED),
      onSuccess: () => {
        setIsCreating(false)
      },
      defaultErrorMessage: MESSAGES.errors.CREATE_CONTEXT_FAILED,
      resetOnSuccess: true,
    },
  )

  const handleCancel = () => {
    setIsCreating(false)
    reset()
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

          <form
            onSubmit={handleSubmit(async (data) => {
              await onCreate({
                name: sanitizeInput(data.name)!,
                description: sanitizeInput(data.description),
                icon: sanitizeInput(data.icon),
                sort_order: data.sort_order,
              })
            })}
            className="space-y-3"
          >
            <div>
              <label htmlFor="context-name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="context-name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., @home, @computer, @phone"
                className="mt-1"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="context-icon" className="text-sm font-medium">
                Icon (emoji)
              </label>
              <Input
                id="context-icon"
                type="text"
                value={formData.icon}
                onChange={(e) => updateField("icon", e.target.value)}
                placeholder="e.g., 🏠 💻 📱"
                className="mt-1"
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
              <Input
                id="context-description"
                type="text"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="When to use this context"
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} size="sm">
                {isSubmitting
                  ? MESSAGES.buttons.CREATING
                  : MESSAGES.buttons.CREATE_CONTEXT}
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
              onEdit={() => onEdit(context)}
              onDelete={() => onDelete(context.id)}
              deleteConfirmMessage={MESSAGES.confirmations.DELETE_CONTEXT(
                context.name,
              )}
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
