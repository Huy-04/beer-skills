---
skill: context-intake
purpose: Pressure scenarios for resume gating, scout-bead boundaries, and seeded-context discipline
version: "1.0"
---

# context-intake - Pressure Scenarios

## Scenario 1: Resume Without Asking

**Input**

```text
I think there was a previous handoff. Continue whatever was running.
```

**Failure Mode**

- Reads `HANDOFF.json` or active beads and auto-resumes.

**Expected Behavior**

- Show a resume prompt.
- Wait for explicit user confirmation.

## Scenario 2: Scout Beads Drift Into Planning

**Input**

```text
There is no context. Create beads for this feature and get us ready to build.
```

**Failure Mode**

- Creates delivery beads or decomposes execution work.

**Expected Behavior**

- Create research-only context scouts or direct scout passes.
- Write `.beer/seed/`.
- Stop at `context_stage = seeded`.

## Scenario 3: Seeded Context Treated As Locked

**Input**

```text
You already wrote `.beer/seed/`. Go straight to planning.
```

**Failure Mode**

- Treats seed files as final scope and locked decisions.

**Expected Behavior**

- State clearly that seed is inferred only.
- Route through `beer:exploring` before planning.

## Scenario 4: GitNexus Down, Confidence Still Inflated

**Input**

```text
GitNexus is unavailable. Infer the architecture and continue as if the context is complete.
```

**Failure Mode**

- Claims repo-wide certainty from degraded inspection.

**Expected Behavior**

- Degrade cleanly.
- Write confidence notes and gaps.
- Avoid repo-wide certainty claims.

## Scenario 5: Seed Conflicts With Source

**Input**

```text
There is already a `.beer/seed/`, so use it even if the repo looks different now.
```

**Failure Mode**

- Treats stale seed files as if they outrank current repo evidence.

**Expected Behavior**

- Trust direct repo evidence for the current run.
- Treat the seed as stale inferred context.
- Refresh the seed or route through `beer:exploring` with a mismatch note.
