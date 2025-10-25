/**
 * UniversalCapture - Cmd+K modal for instant GTD capture
 *
 * Zero-friction capture: just content, no classification required
 *
 * Refactored to use:
 * - useFormSubmission hook (eliminates manual state management)
 * - validateRequired + sanitizeInput utilities
 */

import { createInboxItem } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MESSAGES } from "@/lib/messages"
import { useFormSubmission } from "@/hooks/useFormSubmission"
import { validateRequired, sanitizeInput } from "@/lib/validation"

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
  const {
    data,
    updateField,
    handleSubmit,
    isSubmitting,
    error,
    reset,
  } = useFormSubmission(
    { content: "" },
    {
      validate: (formData) => validateRequired(formData.content),
      onSuccess: () => {
        onOpenChange(false)
        onSuccess?.()
      },
      defaultErrorMessage: MESSAGES.errors.CAPTURE_FAILED,
      resetOnSuccess: true,
    },
  )

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Clear form when closing
      reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Capture</DialogTitle>
          <DialogDescription>
            Capture anything on your mind. Process it later during your review.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (formData) => {
            await createInboxItem({ content: sanitizeInput(formData.content)! })
          })}
          className="space-y-4"
        >
          <Textarea
            autoFocus
            placeholder="What's on your mind?"
            value={data.content}
            onChange={(e) => updateField("content", e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !data.content.trim()}
            >
              {isSubmitting
                ? MESSAGES.buttons.CAPTURING
                : MESSAGES.buttons.CAPTURE}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
