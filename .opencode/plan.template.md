---
# OpenCode Plan Template
# Copy this to plan.md and fill in for each task
tool: opencode
agent: orchestrator
status: active  # active | blocked | done
created_at: YYYY-MM-DDTHH:MM:SSZ
updated_at: YYYY-MM-DDTHH:MM:SSZ
---

# Plan: [Short Descriptive Title]

## Goal

[One sentence describing the end state. Be specific and measurable.]

**Success Criteria:**
- [ ] [Specific, testable outcome 1]
- [ ] [Specific, testable outcome 2]
- [ ] [Specific, testable outcome 3]

## Context

**User Request:**
> [Original user request, quoted]

**Relevant Files:**
- `path/to/file1.ts` - [why relevant]
- `path/to/file2.tsx` - [why relevant]

**Dependencies:**
- [External API, library, or system dependency]

**Constraints:**
- [Technical constraints]
- [Business rules]
- [Performance requirements]

## Scope

**In Scope:**
- [What we WILL do]
- [What we WILL do]

**Out of Scope:**
- [What we WON'T do - explicitly state to prevent scope creep]
- [What we WON'T do]

## Assumptions & Open Questions

**Assumptions:**
- [Assumption 1 - if wrong, impact is X]
- [Assumption 2]

**Open Questions:**
- [ ] [Question needing user clarification]
- [x] [Resolved question] → Answer: [answer]

## Architecture Decision

**Approach Chosen:** [Brief description]

**Alternatives Considered:**
1. [Alternative 1] - Rejected because: [reason]
2. [Alternative 2] - Rejected because: [reason]

**Trade-offs:**
- [What we gain]
- [What we sacrifice]

## Phase Status

| Phase | Status | Updated |
|-------|--------|---------|
| 0. Context | pending | - |
| 1. Plan | pending | - |
| 2. Delegate | pending | - |
| 3. Integrate | pending | - |
| 4. Review | pending | - |

## Subtasks

### Phase 2: Delegation

| ID | Task | Agent | Status | Done When |
|----|------|-------|--------|-----------|
| T1 | [Atomic task description] | @backend | pending | [Objective success criteria] |
| T2 | [Atomic task description] | @frontend | pending | [Objective success criteria] |
| T3 | [Atomic task description] | @web3 | pending | [Objective success criteria] |
| T4 | [Atomic task description] | @frontend | pending | [Objective success criteria] |

**Parallel Groups:**
- Group A (independent): T1, T2, T3
- Group B (depends on A): T4

### Phase 4: Review

| ID | Task | Agent | Status |
|----|------|-------|--------|
| R1 | Final code review | @reviewer | pending |

## Delegation Prompts

### T1: [Task Name]

```
@backend

TASK: [Atomic, specific goal]

EXPECTED OUTCOME:
- [Deliverable 1]
- [Deliverable 2]

MUST DO:
- [Requirement 1]
- [Requirement 2]
- Follow existing patterns in [file]

MUST NOT DO:
- [Forbidden action 1]
- Modify files outside scope

CONTEXT:
- See: [relevant file paths]
- Pattern to follow: [example file]

OUTPUT FORMAT:
## Result
- **Status**: completed|blocked|needs-info
- **Files changed**: [list]
- **What was done**: [1-2 sentences]
```

### T2: [Task Name]

```
@frontend

TASK: [Atomic, specific goal]

EXPECTED OUTCOME:
- [Deliverable 1]

MUST DO:
- [Requirement 1]
- Use Server Component unless interactivity needed

MUST NOT DO:
- [Forbidden action 1]

CONTEXT:
- Component location: [path]
- Similar component: [path to example]

OUTPUT FORMAT:
## Result
- **Status**: completed|blocked|needs-info
- **Files changed**: [list]
- **What was done**: [1-2 sentences]
```

## Notes & Decisions

- [YYYY-MM-DD] [Decision or important note]
- [YYYY-MM-DD] [Decision or important note]

## Blockers

| Blocker | Impact | Resolution | Status |
|---------|--------|------------|--------|
| [Description] | [What's blocked] | [How to resolve] | open |

## Artifacts

**Created/Modified:**
- `.opencode/plan.md` - This plan
- [Other files created]

**References:**
- [Link to docs]
- [Link to related PR]

---

## Quick Reference: Agent Capabilities

| Agent | Model | Best For |
|-------|-------|----------|
| @backend | GLM-4.7 | API, services, caching |
| @backend-deep | GLM-4.7+thinking | Architecture, DB design |
| @frontend | GLM-4.7 | Components, hooks, UI |
| @frontend-deep | GLM-4.7+thinking | Complex state, perf |
| @web3 | GLM-4.7 | Contracts, wallet |
| @web3-deep | GLM-4.7+thinking | Security, DeFi |
| @reviewer | GPT-4.1 | Code review |

## Quick Reference: Status Values

- `pending` - Not started
- `in_progress` - Currently being worked on
- `blocked` - Waiting on something
- `completed` - Done and verified
- `cancelled` - No longer needed

