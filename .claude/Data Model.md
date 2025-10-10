# GTD Data Model

## Overview
This document describes what data the GTD system needs to store and how different pieces of information relate to each other.

## How Everything Connects

```
Inbox Items are the entry point (universal capture bucket)
Inbox Items can be converted to → Tasks, Notes, or Projects
Projects contain Tasks and Notes
Tasks can belong to Projects
Tasks can have multiple Contexts (like @home, @computer)
Tasks can block other Tasks (dependencies)
Notes can reference Tasks
```

## What We Store

### Inbox Items
The universal capture bucket - the entry point for everything in GTD.

**What we track:**
- Content (the raw thought/idea captured)
- When it was captured
- Whether it's been processed yet

**Why:**
- Classic GTD requires frictionless capture without classification
- Users dump thoughts here without deciding if they're tasks/notes/projects
- Processing happens later during review
- Maintains "inbox zero" discipline

**Processing:**
- Items can be converted to tasks, notes, or projects
- Items can be deleted if not actionable
- Items remain until explicitly processed
- Count displayed to encourage processing

---

### Tasks
The core of GTD - things you need to do.

**What we track:**
- Title and description
- Current state (Next Action, Waiting For, Someday/Maybe, Completed, Archived)
- When it's scheduled (optional)
- When it's due (optional)
- Which project it belongs to (optional)
- What other task is blocking it (optional)
- When it was created, updated, completed

**Why:**
- Users need to capture tasks quickly (either directly OR from inbox)
- Tasks move between different GTD lists
- Tasks can be scheduled for specific days
- Tasks can be grouped into projects
- Tasks can wait on other tasks to finish first

**Creation paths:**
- Direct: User knows it's a task, creates immediately
- From inbox: During processing, convert inbox item to task

---

### Projects
Collections of tasks working toward a specific outcome.

**What we track:**
- Project name
- What "done" looks like (outcome statement)
- Current state (Active, On Hold, Completed, Archived)
- When tasks were last touched (to find stalled projects)
- Sub-projects (optional hierarchy)
- When it was created, updated, completed

**Why:**
- Multi-step outcomes need coordination
- Weekly reviews need to identify stalled projects (no activity in 7+ days)
- Users need to see progress toward outcomes
- Some projects contain sub-projects

**Creation paths:**
- Direct: User knows it's a project, creates immediately
- From inbox: During processing, convert inbox item to project

---

### Contexts
Tags that describe where or with what tool you can do a task.

**What we track:**
- Context name (like @home, @computer, @phone)
- Description of when to use it
- Icon for display
- Sort order for UI

**Why:**
- GTD methodology filters by context ("what can I do right now at my computer?")
- Tasks can have multiple contexts
- Predefined set for consistency
- Quick filtering in the UI

---

### Notes
Reference material and supporting information.

**What we track:**
- Title and content (in Markdown)
- Which project it supports (optional)
- Which tasks it references (optional)
- When it was created and updated

**Why:**
- Project planning needs supporting documentation
- Reference material doesn't belong in task descriptions
- Auto-saves while editing (every 10 seconds)
- Can link to multiple tasks

**Creation paths:**
- Direct: User knows it's reference material, creates immediately
- From inbox: During processing, convert inbox item to note

---

### Saved Filters
User's frequently used filter combinations.

**What we track:**
- Filter name and description
- What filters to apply (contexts, projects, dates, statuses)
- How often it's used
- Optional keyboard shortcut

**Why:**
- Users have common filter patterns ("@computer + Next Actions")
- Quick access via keyboard shortcuts
- Track which filters are most useful
- Faster than re-creating filters each time

---

### Review History
Tracks when weekly/daily reviews were completed.

**What we track:**
- Type of review (weekly, daily, project)
- When it was completed
- Optional notes from the review
- How long it took
- Statistics snapshot (tasks completed, projects reviewed, etc.)

**Why:**
- GTD requires regular reviews
- Track review habits over time
- See progress between reviews
- Motivate consistent review practice

---

## How Items Move Through the System (GTD Workflow)

**Phase 1: Capture (Inbox)**
1. User presses Cmd+K / Ctrl+K anywhere in app
2. Types whatever is on their mind (no classification)
3. Item saved to inbox with timestamp
4. Total time: <2 seconds

**Phase 2: Process (Inbox → Organized)**
During weekly review or dedicated processing time:
1. Open inbox view (shows unprocessed items oldest-first)
2. For each item, decide:
   - **Convert to Task** (if actionable)
   - **Convert to Note** (if reference material)
   - **Convert to Project** (if multi-step outcome)
   - **Delete** (if not relevant/actionable)
3. Conversion pre-fills content, allows editing before save
4. Item removed from inbox once processed
5. Goal: Inbox Zero

**Phase 3: Organize (Tasks)**
1. During review, move tasks between lists (Next/Waiting/Someday)
2. Assign to projects
3. Add contexts
4. Schedule on calendar

**Phase 4: Engage (Do the Work)**
1. Filter by context, project, or date
2. Work on tasks from "Next Actions" list
3. Mark complete (space bar) when done

**Phase 5: Archive (Completion)**
1. Mark task complete (space bar)
2. Automatically record completion time
3. Task moves to archive
4. Completed tasks stay searchable
5. Soft delete means nothing is ever truly lost

## Key Design Decisions

**Soft Deletes:**
- Nothing is ever truly deleted
- Just marked as deleted with a timestamp
- Allows undo and audit trail
- Old data stays searchable

**UUIDs for IDs:**
- Better for distributed systems
- No sequential ID guessing
- Future-proof for syncing

**Timestamps Everywhere:**
- Created, updated, completed, archived dates
- Essential for GTD review workflows
- Find stalled projects
- Track productivity over time

**Simple Dependencies:**
- Task can be blocked by ONE other task (for Phase 1)
- Auto-move to "Waiting" when blocked
- Full dependency graphs in later phases

**Full-Text Search:**
- Search across tasks, projects, and notes
- Find information in under 1 second
- Rank by relevance
- Essential for large task lists (10k+ tasks)

**Flexible Metadata:**
- Some fields stored as JSON for flexibility
- Filter criteria can grow without database changes
- Stats snapshots capture point-in-time data
- Easy to add new features

## Migration Plan

**Phase 1 (MVP):**
- **Inbox Items** (universal capture)
- Tasks, Projects, Contexts, Notes
- Task-Context relationships
- Note-Task links
- **Inbox-to-Task/Note/Project conversion**
- Search support
- Automatic timestamp updates

**Phase 2:**
- Saved Filters
- Review History
- Activity Log (for undo)
- Advanced inbox processing (bulk operations)

**Future:**
- Multi-user support
- Recurring tasks
- File attachments
- Integration logs
- Smart inbox parsing (recognize @contexts, #projects inline)

## What Makes a Good Inbox Item?

**Required:**
- Content (the raw thought/idea)

**Optional:**
- Nothing! Zero friction capture

**Automatic:**
- Unique ID
- Creation timestamp
- Processed flag (defaults to false)

---

## What Makes a Good Task?

**Required:**
- Title (1-500 characters)

**Optional but recommended:**
- Description (for details)
- Context (@where or @tool)
- Project (if multi-step)
- Schedule date (if time-specific)

**Automatic:**
- Unique ID
- Creation timestamp
- Status (defaults to "Next")
- Source (direct creation OR inbox conversion)

## What Makes a Good Project?

**Required:**
- Name

**Optional but recommended:**
- Outcome statement ("what done looks like")
- Tasks assigned to it

**Automatic:**
- Activity tracking (updates when tasks change)
- Stalled detection (no activity in 7+ days)
- Progress calculation (tasks completed vs total)

## Context Examples

Pre-seeded contexts users should have:
- `@computer` - Tasks requiring a computer
- `@phone` - Calls to make
- `@home` - Tasks to do at home
- `@office` - Tasks to do at office
- `@errands` - Things to do while out
- `@waiting` - Waiting for someone else
- `@anywhere` - Can do from anywhere

Users can create their own as needed.

## Search Capabilities

**What's searchable:**
- Task titles and descriptions
- Project names and outcomes
- Note titles and content

**How it works:**
- Type natural language queries
- Results ranked by relevance
- Title matches ranked higher than descriptions
- Returns up to 50 results
- Under 1 second response time

**Use cases:**
- "Find all tasks mentioning client name"
- "What notes mention the budget?"
- "Search for database migration tasks"

## Data Volumes We Support

**Expected usage:**
- **1,000+ inbox items** (should be processed regularly to maintain inbox zero)
- 10,000+ tasks over time (most archived)
- 100-500 active projects
- 20-50 contexts
- 1,000+ notes

**Performance targets:**
- **Inbox capture: <2 seconds** (total time from keypress to saved)
- **Inbox processing: <500ms** (conversion to task/note/project)
- Search: <1 second
- Filter tasks: <500ms
- Load project: <200ms
- Create task: <100ms

## What We DON'T Store (Phase 1)

- User accounts (single-user system)
- Passwords or authentication
- File attachments
- External service integrations
- Time tracking data
- Recurring task patterns
- Team/collaboration data
- Activity notifications
