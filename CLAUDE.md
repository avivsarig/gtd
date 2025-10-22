# AI Developer Guide
This is a fullstack app built with python/FastAPI backend, React+Vite frontend, and PostgreSQL Database.
It runs using docker-compose.

Read more about the purpose and business logic of the app in @README.md

## Development Process
Development is done in small increments to deliever value quickly.
Clean Code/Architecture principles are followed:
- Separation of Layers
- Minimal and deliberate use of comments
- SOLID - Single Responsibility, Open/Close, Liskov Subtitution, Interface Segregation, Dependency Inversion
- DRY - reuse existing code over duplicating functionality

### Linting and Formating
Human devs have IDEs that autoformat code on every file save. After you edit files, you must do the equivalent using `make lint` and `make format`.
This command will also report linter errors that were not automatically fixable. Use your judgement as to which of the linter violations should be fixed.
Strong typing is highly encouraged.

### Testing
**Approach:**
- Test behavior, not implementation
- Arrange-Act-Assert pattern
- Test names: `test_<what>_<condition>_<expected>`
- Use factories/fixtures for data setup
- Independent tests (no shared state)


## Documentation
- The documentation of this project is divided between README and CLAUDE files; These are nested in multiple directories of this project
- A sub-directory documentation file should always contain more specific knowledge and instructions then files in the parent directory
- Documentation files in parent directories should always contain links to documentation in their direct sub-directories, if exist

### Project requirements
The following documents contain the business/product side of the app.
Read them carefully before developing any code:
- User Stories: `.claude/User Stories and User Flows.md`
- Technical Requirements: `.claude/Technical Requirements.md`
- Data Model: `.claude/Data Model.md`

> ⚠️ Important!
>
> Updating these files should be done only when explicitly asked for
> Alway request permission to edit them

### Project status file
The current status file - `.claude/status.md`, is designed to help both the users and the LLM to track the current state of the project.

> ⚠️ Important!
>
> Try to keep this file up to date whenever editing code

### README.md files
- README files are intended for human developers and LLM agents
- They contain primary documentation: business logic, technical instructions, setup, usage, and any information necessary to understand and work with the project
- READMEs are superior in hierarchy; they are the authoritative source of truth

### CLAUDE.md files
- CLAUDE files are intended only for LLM agents
- They contain instructions, context, or guidance that humans do not necessarily require
- CLAUDE files should never duplicate information in READMEs; they exist solely to assist automated reasoning or task execution

### Documentations edits
**Before updating docs:**
- [ ] Does this duplicate existing content? Check all docs first
- [ ] README or CLAUDE? Place correctly
- [ ] Can I condense by 50%? Remove filler words
- [ ] Are examples minimal? One working example > multiple verbose
- [ ] Is this still relevant? Delete deprecated content immediately

**Single source of truth:**
- Each concept explained once in the most appropriate file
- Other files link with context: "See [foo.md](foo.md) for bar pattern"
- No standalone topic files (TESTING.md, CODE_QUALITY.md, CONTRIBUTING.md, etc.)

> ⚠️ Important!
>
> Trust version control - documentation should describe the current code and only it.
> Avoid - `UPDATE`, `IMPLEMENTED`, `In Progress` - everything is implicitly implemented or it shouldn't be in the documentation.

## Recommended Workflow

**When coding:**
1. Check `.claude/status.md` for current state
2. Read relevant CLAUDE.md + README for context
3. Follow patterns in existing code
4. Write tests if possible
5. Write feature code
6. Run linters + tests before finalizing
7. Verify if test is broken OR code is failing (don't assume)
7. Update docs
