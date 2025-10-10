## User Stories
### Core Capture
**US-1.00**: As a user, I want to instantly capture any thought to an inbox without deciding what it is so I can minimize friction during capture
- **Acceptance**: Single keypress (Cmd+K / Ctrl+K) opens universal capture, captured in <2 seconds, no required fields except content, auto-timestamp, unique ID assigned
- **Note**: Classic GTD principle - capture everything without processing

**US-1.01**: As a user, I want to quickly create a task with a title so I can capture what needs to be done
- **Acceptance**: Create task in <3 clicks, auto-timestamp, unique ID assigned
- **Note**: Can be created from inbox during processing OR directly when I know it's a task

**US-1.02**: As a user, I want to create a note with rich text so I can store reference information
- **Acceptance**: Support markdown, auto-save every 10 seconds, link to tasks
- **Note**: Can be created from inbox during processing OR directly when I know it's reference material

**US-1.03**: As a user, I want to assign contexts (@home, @computer, @phone) to tasks so I can filter by location/tool
- **Acceptance**: Predefined contexts, multiple contexts per task, quick toggle
**US-1.04**: As a user, I want to optionally schedule tasks on specific days so I can plan my calendar
- **Acceptance**: Optional date field, time-of-day support, calendar view, "unscheduled" by default
- **Note**: Prepares for future Google Calendar sync
### Organization
**US-1.04.5**: As a user, I want to process inbox items by converting them to tasks, notes, or projects so I can maintain inbox zero
- **Acceptance**: Process view shows inbox items, keyboard shortcuts to convert (T=task, N=note, P=project, D=delete), can edit during conversion, processed items removed from inbox
- **Note**: Core GTD weekly review workflow

**US-1.05**: As a user, I want to group tasks into projects so I can track larger outcomes
- **Acceptance**: Project has outcome statement, can contain tasks and notes, shows progress
- **Note**: Can be created from inbox during processing OR directly

**US-1.06**: As a user, I want to move tasks between lists (Next/Waiting/Someday) so I can manage task states
- **Acceptance**: Keyboard shortcuts (1/2/3), maintains history, bulk operations via shift+select

**US-1.07**: As a user, I want to mark task dependencies so I can see what's blocking progress
- **Acceptance**: "Blocked by" relationship, visual indicator, auto-move to Waiting when blocked
- **Note**: Simple parent-child for now, full graph in later phases
### Discovery
**US-1.08**: As a user, I want to search across all tasks and notes so I can find information quickly
- **Acceptance**: Full-text search, results in <1s, search history, keyboard navigation
**US-1.09**: As a user, I want to filter tasks by context/project/status/date so I can focus on relevant items
- **Acceptance**: Combinable filters, saved filter sets, result count, keyboard shortcuts for common filters
### Review
**US-1.09.5**: As a user, I want to see my inbox item count so I know when to process
- **Acceptance**: Badge/counter showing unprocessed inbox items, visual indicator when >10 items, accessible from main view

**US-1.10**: As a user, I want to see project timeline and progress so I can assess status at a glance
- **Acceptance**: Task list view, progress bar, stalled indicator, dependency chains visible
- **Note**: Timeline/Gantt view prepared in schema but not required for Phase 1

**US-1.11**: As a user, I want to mark tasks complete and archive them so I maintain a clean workspace
- **Acceptance**: Space bar to complete, archived searchable, completion timestamp, bulk complete

**US-1.12**: As a user, I want to review projects holistically to ensure they're progressing
- **Acceptance**: Project dashboard, last activity, task completion rate, next action highlighted

**US-1.12.5**: As a user, I want inbox processing integrated into my weekly review so I maintain inbox zero
- **Acceptance**: Weekly review includes "Process Inbox" step, shows count of unprocessed items, can't mark review complete until inbox processed
## User Flows
### Universal Inbox Capture Flow (Classic GTD)
```
1. Press Cmd+K / Ctrl+K from anywhere in the app
2. Type whatever is on your mind (no classification needed)
3. Hit Enter to save
4. See quick confirmation, modal auto-closes
5. Item lands in Inbox for later processing
6. Total time: <2 seconds
```

### Quick Task Capture Flow (When you know it's a task)
```
1. Hit 'C' hotkey to open quick task modal
2. Type task description
3. Optional: Tab to date field, type "tom" for tomorrow or pick date
4. Optional: Tab to context field, type "@" for autocomplete menu
5. Optional: Tab to project field, start typing for autocomplete
6. Hit Enter to save (or Ctrl+Enter to save and create another)
7. See confirmation toast, modal closes
8. Task appears in appropriate list (Today/Next Actions)
```

### Inbox Processing Flow (GTD Weekly Review)
```
1. Hit 'I' hotkey for Inbox view (or click sidebar)
2. See all unprocessed inbox items (oldest first)
3. For each item, navigate with J/K keys:
   - Hit 'T' to convert to Task (opens task form with content pre-filled)
   - Hit 'N' to convert to Note (opens note form with content pre-filled)
   - Hit 'P' to convert to Project (opens project form with content pre-filled)
   - Hit 'D' to delete (asks for confirmation)
   - Hit 'Enter' to keep in inbox (skip for now)
4. Make quick edits during conversion (add context, project, etc.)
5. Hit Enter to save conversion, automatically moves to next item
6. Inbox counter decreases in real-time
7. Goal: Inbox Zero (all items processed)
```
### Project Planning Flow
```
1. Hit 'P' hotkey for Projects view (or click sidebar)
2. Hit 'N' for New Project
3. Enter project name and desired outcome
4. Hit Enter to create
5. In project view, hit 'A' to add tasks inline
6. Type first task, hit Enter for next task
7. Use Tab/Shift+Tab to indent/outdent (creates dependencies)
8. Hit 'Esc' when done adding
9. Use J/K to navigate tasks, Shift+J/K to reorder
10. Hit 'R' to open project review pane (stats, timeline, blockers)
```
### Context Review Flow
```
1. Hit 'G' then 'C' for Contexts view (vim-style navigation)
2. Type context name or use number keys (1=@computer, 2=@phone, etc.)
3. See all tasks for that context across all projects
4. Navigate tasks with J/K keys
5. Hit Space to complete task
6. Hit 'W' to move to Waiting, 'S' for Someday, 'N' for Next
7. Hit 'X' to select, then action key for bulk operations
8. Completed tasks fade out then disappear (archived)
```
### Calendar Planning Flow
```
1. Hit 'G' then 'D' for Day view (or Week with 'W')
2. See scheduled tasks in time blocks
3. Hit 'A' to add task at specific time
4. Drag tasks between days (or use Shift+</> to move by day)
5. Hit 'U' on a task to unschedule (moves to Next Actions)
6. Space bar to mark complete
7. Overdue tasks show in red at top
```
### Weekly Review Flow
```
1. Hit 'G' then 'R' for Review dashboard
2. See five sections in order:
   - **Process Inbox** (unprocessed items count, link to Inbox view)
   - Stalled Projects (no activity >7 days)
   - Orphan Tasks (no project assigned)
   - Waiting For >14 days
   - Someday/Maybe candidates
3. If inbox count > 0:
   - Click "Process Inbox" or hit 'I'
   - Complete inbox processing flow (see above)
   - Return to review dashboard when inbox = 0
4. Use 1/2/3/4 to focus remaining quadrants
5. Navigate items with J/K
6. Hit 'Enter' to jump to item detail
7. Hit 'B' for bulk select mode, then:
   - 'A' to archive
   - 'S' to move to Someday
   - 'P' to assign project
8. Review dashboard shows "✓ Inbox Zero" when processed
9. Hit 'C' to mark review complete (timestamps, requires inbox=0)
```