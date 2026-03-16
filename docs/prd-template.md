# PRD Template

Use this template to write PRDs that decompose cleanly into implementable waves. Create the PRD as a GitHub Issue.

---

## How to Write a Good PRD

### Structure Rules

1. **Phases group by domain** — auth, products, analytics — not by layer. Never "Phase 1: Database, Phase 2: API."
2. **The table is the contract** — every row becomes 1-2 GitHub issues. If it's not in the table, it doesn't get built.
3. **Adapt the table to project type**:
   - APIs: Method | Path | Purpose
   - Frontends: Screen | Route | Purpose
   - CLIs: Command | Arguments | Purpose
   - iOS: Screen | Flow | Purpose
4. **Open Questions block work** — unanswered questions mean that phase can't start. Forces decisions upfront.
5. **No implementation details** — the PRD defines *what*, not *how*. Implementation goes in wave plan files (`docs/plans/`).

### Phase Sizing

- Each phase should be independently deliverable (even if not independently useful)
- 2-15 implementable units per phase is ideal
- If a phase has >15 units, split it into two phases

### Wave Sizing (within a phase)

| Wave Type | Max Issues | Typical Scope |
|-----------|-----------|---------------|
| Foundation | 1 | Module scaffold, entities, config |
| Read operations | 2-4 | GET routes + DTOs + tests |
| Write operations | 2-3 | POST/PATCH/DELETE + validation |
| UI screens | 1-2 | Screen + components + hooks |
| Cross-cutting | 1-2 | Auth, analytics, notifications |

Wave 1 is always foundation. Subsequent waves group related units. Wave N+1 can depend on Wave N within a phase.

---

## Template

Copy everything below this line into your GitHub Issue:

---

```markdown
# [Feature/Project Name]

## Overview
[2-3 sentences. What are we building and why.]

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

## Phase 1: [Domain Name]
[One sentence describing this phase's goal.]

### [Endpoints / Screens / Commands]
| Method | Path | Purpose |
|--------|------|---------|
| GET | /items | List with filtering and pagination |
| GET | /items/:id | Single item with full details |
| POST | /items | Create new item |
| PATCH | /items/:id | Update item fields |
| DELETE | /items/:id | Soft delete item |

### Dependencies
- [External API, service, or data source this phase needs]
- [Auth provider, storage backend, etc.]

### Constraints
- [Auth: which roles can access what]
- [Performance: response time targets]
- [Compatibility: must work with existing system X]

## Phase 2: [Domain Name]
[Same structure repeats for each phase.]

### [Endpoints / Screens / Commands]
| Method | Path | Purpose |
|--------|------|---------|

### Dependencies
-

### Constraints
-

---

## Technical Decisions
[Decisions made upfront that affect implementation.]

- **Database**: [Choice and why]
- **Auth**: [Strategy — JWT, OAuth, session, etc.]
- **Hosting**: [Platform and deployment strategy]
- **[Other]**: [Decision and reasoning]

## Open Questions
[Items that MUST be resolved before implementation begins.]

- [ ] [Question 1 — who decides, by when]
- [ ] [Question 2]
```
