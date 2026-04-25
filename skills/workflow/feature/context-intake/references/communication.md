---
skill: context-intake
purpose: Communication standards and anti-rationalization prompts
version: "1.0"
---

# context-intake - Communication Standards

## Standard Messages

### Locked Context Recovered

```text
Context recovered from locked artifacts.
Feature: [feature]
Source: history/[feature]/CONTEXT.md

Next step: hand off to `beer:exploring`.
```

### Resume Prompt

```text
Saved work was found for [feature].
Last action: [last_action]
Suggested next action: [next_action]

Resume? (yes / no / show state)
```

### Seeded Context Created

```text
No locked context was found. Inferred context was written to `.beer/seed/`.
Context stage: seeded
Confidence: [high|medium|low]

Next step: route through `beer:exploring` before planning.
```

### Planning Not Yet Honest

```text
Context was recovered, but the task is not yet bounded enough for planning.
Gap: [decision | root cause | scope boundary | stale resume ambiguity]

Next step: route through `beer:exploring`.
```

### Degraded Workflow Notice

```text
Running in degraded workflow mode.
Context was inferred from direct repo inspection, not graph-backed indexing.
See `.beer/seed/05-gaps.md` for uncertainties before treating this as stable context.
```

### Seed Conflict Notice

```text
Saved seeded context conflicts with current repo evidence.
Treating `.beer/seed/` as stale inferred context for this run.

Next step: refresh seed context or route through `beer:exploring` before planning.
```

## Red Flags

Stop immediately if:

1. Resume data exists and no user confirmation was requested.
2. Scout beads are being framed as delivery work.
3. Seeded context is being presented as if it were locked.
4. The skill is about to write `history/<feature>/CONTEXT.md`.
5. `.beer/knowledge-base/` is being used as a substitute for direct evidence.
6. Degraded context is being described as high-confidence without gaps.
7. Work is being handed past `beer:exploring`.

## Anti-Patterns

### Anti-Pattern 1: "Skip context to save time"

Wrong:
- Jump straight to `exploring` or `planning`.

Correct:
- Recover or seed context first.

### Anti-Pattern 2: "Auto-resume because the files are there"

Wrong:
- Continue from beads or `HANDOFF.json` without asking.

Correct:
- Present resume prompt.
- If the user declines, treat the request as a fresh start.

### Anti-Pattern 3: "Scout beads are just early planning"

Wrong:
- Use scout beads to create execution decomposition.

Correct:
- Use scout beads only to gather context for `.beer/seed/`.

### Anti-Pattern 4: "Seed equals contract"

Wrong:
- Treat `.beer/seed/` as final scope and locked decisions.

Correct:
- Route seeded context through `beer:exploring`.

### Anti-Pattern 5: "Graph unavailable means no context path exists"

Wrong:
- Claim the workflow is blocked because GitNexus is down.

Correct:
- Degrade cleanly to resume recovery, context scouts, or manual discovery.

### Anti-Pattern 6: "Old seed is close enough"

Wrong:
- Keep using `.beer/seed/` after the repo evidence contradicts it.

Correct:
- Trust current repo evidence.
- Treat the seed as stale inferred context.
- Refresh the seed or route through `beer:exploring`.

## Handoff Format

```text
Context phase complete.
Result: locked | seeded | none
Next owner: beer:exploring
```
