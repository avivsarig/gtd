/**
 * UniversalCapture - Cmd+K modal for instant GTD capture
 *
 * Zero-friction capture: just content, no classification required
 *
 * Refactored to use EntityModal infrastructure with custom UI text
 */

import { createInboxItem } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEntityForm } from "@/hooks/useEntityForm"
import { inboxConfig } from "@/config/entities/inboxConfig"
import { TextareaField } from "./form/TextareaField"
import { useEffect } from "react"

interface UniversalCaptureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UniversalCapture({
  open,
  onOpenChange,
  onSuccess,
}: UniversalCaptureProps) {
  const formState = useEntityForm({
    initialData: inboxConfig.getInitialData(),
    validate: inboxConfig.validate,
    onSubmit: async (data) => {
      const submitData = inboxConfig.formatForSubmit?.(data) ?? data
      return createInboxItem(submitData as { content: string })
    },
    onSuccess: () => {
      onSuccess?.()
      onOpenChange(false)
    },
    resetOnSuccess: true,
    defaultErrorMessage: "Failed to capture",
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      formState.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Capture</DialogTitle>
          <DialogDescription>
            Capture anything on your mind. Process it later during your review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formState.handleSubmit} className="space-y-4">
          <TextareaField
            label="Content"
            value={formState.data.content}
            onChange={(value) => formState.updateField("content", value)}
            error={formState.fieldErrors.content}
            placeholder="What's on your mind?"
            autoFocus
            rows={4}
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
            <Button
              type="submit"
              disabled={
                formState.isSubmitting || !formState.data.content.trim()
              }
            >
              {formState.isSubmitting ? "Capturing..." : "Capture"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
