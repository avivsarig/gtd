import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { type EntityModalProps } from "@/types/entityModal"
import { useEntityForm } from "@/hooks/useEntityForm"
import { FieldRenderer } from "./form/FieldRenderer"
import { useEffect } from "react"

export function EntityModal<T extends Record<string, unknown>>({
  config,
  mode,
  open,
  onOpenChange,
  editData,
  onSubmit,
  onSuccess,
}: EntityModalProps<T>) {
  const formState = useEntityForm<T>({
    initialData: editData || config.getInitialData(),
    validate: config.validate,
    onSubmit: async (data) => {
      const submitData = config.formatForSubmit?.(data) ?? data
      return onSubmit(submitData as T)
    },
    onSuccess: () => {
      onSuccess?.()
      onOpenChange(false)
    },
    resetOnSuccess: mode === "create",
    defaultErrorMessage: `Failed to ${mode} ${config.entityLabel.toLowerCase()}`,
  })

  // Reset form data when editData changes or when switching between create/edit
  useEffect(() => {
    formState.setData(editData || config.getInitialData())
    formState.clearError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, mode, open])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? `Create ${config.entityLabel}`
              : `Edit ${config.entityLabel}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formState.handleSubmit} className="space-y-4">
          <FieldRenderer
            config={config}
            data={formState.data}
            updateField={formState.updateField}
            errors={formState.fieldErrors}
            disabled={formState.isSubmitting}
          />

          {formState.error && (
            <p className="text-sm text-red-500">{formState.error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? `Create ${config.entityLabel}`
                  : `Update ${config.entityLabel}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
