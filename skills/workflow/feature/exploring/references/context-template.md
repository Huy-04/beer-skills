# CONTEXT.md Template

This template is written by `beer:exploring`.
It is read by `beer:planning`, `beer:validating`, and downstream workflow skills.

**Save to:** `history/<feature-slug>/CONTEXT.md`

Rules:

- be concrete,
- every locked decision must have a stable ID,
- code context must cite actual file paths found during the quick scout,
- if `.beer/seed/` exists, treat it as input only,
- do not copy seeded statements into locked decisions unless the user confirmed them,
- delegated areas belong in `Agent Discretion`, not in locked decision IDs.

## Template

```markdown
# <Feature Name> - Context

**Feature slug:** <kebab-case-slug>
**Date:** YYYY-MM-DD
**Exploring session:** complete
**Scope:** quick | standard | deep

## Feature Boundary

[One sentence describing what this feature delivers and where it stops.]

**Domain type(s):** SEE | CALL | RUN | READ | ORGANIZE

## Locked Decisions

These are fixed. Planning must implement them exactly.

### <Category>
- **D1** [Specific concrete decision]
  *Rationale: [Optional why]*

- **D2** [Specific concrete decision]

### Agent Discretion
- [Area the user explicitly delegated]
  *Constraints: [What the agent may or may not do]*

## Specific Ideas and References

- [Reference, example, or comparison the user mentioned]

## Seed Inputs Reviewed

[Remove this section if no seed was used.]

- `.beer/seed/00-metadata.json` - [source, confidence, why it mattered]
- `.beer/seed/01-task.md` - [what interpretation was reused or corrected]
- `.beer/seed/04-relevant-files.md` - [which files informed the dialogue]

These are inferred inputs, not locked decisions.

## Existing Code Context

### Reusable Assets
- `path/to/file` - [how it relates]

### Established Patterns
- [Pattern name] - [where it appears and why it matters]

### Integration Points
- `path/to/file` - [where new work would connect]

## Canonical References

[Remove if none.]

- `path/to/doc` - [what it defines]

## Outstanding Questions

### Resolve Before Planning
- [ ] [Blocking product question]

### Deferred to Planning
- [ ] [Technical question for later research]

## Deferred Ideas

- [Out-of-scope idea captured for later]

## Handoff Note

`CONTEXT.md` is the single source of truth for this feature.
Decision IDs are stable and must be referenced downstream.
```
