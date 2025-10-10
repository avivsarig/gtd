# Functional Requirements
## Inbox Management
- FR-1.00: Universal capture of any thought/idea without classification
- FR-1.00.1: Single keypress (Cmd+K/Ctrl+K) opens universal capture modal
- FR-1.00.2: Inbox items stored with content, timestamp, and unique ID only
- FR-1.00.3: View all unprocessed inbox items
- FR-1.00.4: Convert inbox items to tasks, notes, or projects during processing
- FR-1.00.5: Delete inbox items that aren't actionable or relevant
- FR-1.00.6: Display unprocessed inbox count throughout UI
- FR-1.00.7: Inbox processing integrated into weekly review workflow

## Task Management
- FR-1.01: Create, read, update, and archive tasks
- FR-1.01.1: Tasks can be created directly OR from inbox during processing
- FR-1.02: Assign multiple contexts to tasks
- FR-1.03: Set optional due dates and scheduled times
- FR-1.04: Move tasks between states (Next/Waiting/Someday/Complete)
- FR-1.05: Bulk operations on multiple selected tasks
- FR-1.06: Track task dependencies (simple blocking relationships)
## Note Management
- FR-1.07: Create and edit notes with markdown support
- FR-1.07.1: Notes can be created directly OR from inbox during processing
- FR-1.08: Link notes to projects and tasks
- FR-1.09: Auto-save note content during editing

## Project Management
- FR-1.10: Create projects with outcome statements
- FR-1.10.1: Projects can be created directly OR from inbox during processing
- FR-1.11: Associate tasks and notes with projects
- FR-1.12: View project progress and last activity
- FR-1.13: Identify stalled projects (no activity in 7+ days)
## Search & Navigation
- FR-1.14: Full-text search across tasks and notes
- FR-1.15: Filter by context, project, status, and date range
- FR-1.16: Save and recall filter combinations
- FR-1.17: Keyboard navigation throughout interface
## Review & Planning
- FR-1.18: Weekly review dashboard with inbox processing, orphan tasks, and stalled projects
- FR-1.18.1: Weekly review cannot be marked complete until inbox is empty
- FR-1.19: Calendar view for scheduled tasks
- FR-1.20: Universal inbox capture with zero required fields (content only)
- FR-1.20.1: Quick task/note/project creation for when classification is known
# Non-Functional Requirements
## Performance
- NFR-1.00: Inbox capture completes in <2 seconds total time
- NFR-1.01: Search results within 1 second for typical queries
- NFR-1.02: Handle 10,000+ tasks AND 1,000+ inbox items without significant slowdown
- NFR-1.03: Page loads within 2 seconds on local network
- NFR-1.04: Inbox item conversion to task/note/project completes in <500ms
## Usability
- NFR-1.05: Keyboard shortcuts for all common actions (Cmd+K for inbox capture, I for inbox view, T/N/P for conversion)
- NFR-1.06: Works on screens 1024px and wider
- NFR-1.07: Clear visual feedback for all actions
- NFR-1.08: Undo capability for destructive operations
- NFR-1.09: Inbox count badge visible throughout UI
## Reliability
- NFR-1.10: No data loss during normal operations (including inbox items)
- NFR-1.11: Graceful handling of network interruptions
- NFR-1.12: Manual backup capability via database export
## Extensibility
- NFR-1.13: RESTful API for future integrations (including inbox endpoints)
- NFR-1.14: Schema supports additional fields without breaking changes
- NFR-1.15: Frontend components reusable across views (inbox, tasks, notes, projects)
## Constraints
- C-1.01: Single-user system (no auth required in Phase 1)
- C-1.02: PostgreSQL as primary database
- C-1.03: Modern browsers only (latest 2 versions)
- C-1.04: Docker deployment
- C-1.05: Keyboard-first interaction design
- C-1.06: No external service dependencies
# Out of Scope for Phase 1
- User authentication and multi-user support
- Mobile interface
- Voice input
- AI/LLM processing
- External service integrations (Google, Mattermost)
- Automated task creation or classification
- Real-time collaboration features
- Advanced visualizations (Gantt charts, graphs)