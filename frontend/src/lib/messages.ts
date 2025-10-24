/**
 * User-facing messages
 *
 * Centralized message constants for consistent UX across the application.
 * Benefits:
 * - Single source of truth for all user-facing text
 * - Easy to audit and maintain
 * - Simplifies future i18n/localization
 * - Prevents typos and inconsistencies
 */

export const MESSAGES = {
  // Error messages
  errors: {
    // Generic operation errors
    DELETE_FAILED: "Failed to delete",
    UPDATE_FAILED: "Failed to update",
    CREATE_FAILED: "Failed to create",
    LOAD_FAILED: "Failed to load",
    CONVERT_FAILED: "Failed to convert",

    // Entity-specific errors
    DELETE_TASK_FAILED: "Failed to delete task",
    DELETE_CONTEXT_FAILED: "Failed to delete context",
    CAPTURE_FAILED: "Failed to capture",
    CREATE_CONTEXT_FAILED: "Failed to create context",
    LOAD_INBOX_FAILED: "Failed to load inbox",

    // Console error messages (for debugging)
    console: {
      LOAD_TASKS_FAILED: "Failed to load tasks:",
      LOAD_PROJECTS_FAILED: "Failed to load projects:",
      LOAD_NOTES_FAILED: "Failed to load notes:",
      LOAD_INBOX_FAILED: "Failed to load inbox:",
      LOAD_CONTEXTS_FAILED: "Failed to load contexts:",
      UPDATE_TASK_STATUS_FAILED: "Failed to update task status:",
      TOGGLE_TASK_COMPLETION_FAILED: "Failed to toggle task completion:",
      UPDATE_TASK_PROJECT_FAILED: "Failed to update task project:",
      UPDATE_TASK_CONTEXT_FAILED: "Failed to update task context:",
      DELETE_TASK_FAILED: "Failed to delete task:",
      CREATE_NOTE_FAILED: "Failed to create note:",
      UPDATE_NOTE_FAILED: "Failed to update note:",
      DELETE_NOTE_FAILED: "Failed to delete note:",
      DELETE_CONTEXT_FAILED: "Failed to delete context:",
    },
  },

  // Success messages
  success: {
    CONVERTED_TO_TASK: "✓ Converted to task!",
    CONVERTED_TO_NOTE: "✓ Converted to note!",
    CONVERTED_TO_PROJECT: "✓ Converted to project!",
  },

  // Confirmation messages
  confirmations: {
    DELETE_INBOX_ITEM: "Delete inbox item?",
    DELETE_CONTEXT: (name: string) => `Delete context "${name}"?`,
  },

  // Informational messages
  info: {
    COMING_SOON: "Edit functionality coming soon!",
    INBOX_ZERO: "Inbox Zero! 🎉",
    PROCESSING: "Processing...",
    LOADING_INBOX: "Loading inbox...",
  },

  // Validation messages
  validation: {
    REQUIRED_FIELD: "Please enter something",
    CONTEXT_NAME_REQUIRED: "Context name is required",
  },

  // Button labels
  buttons: {
    CAPTURING: "Capturing...",
    CAPTURE: "Capture",
    CREATING: "Creating...",
    CREATE_CONTEXT: "Create Context",
  },
} as const
