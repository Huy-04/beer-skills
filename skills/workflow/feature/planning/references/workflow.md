---
skill: planning
purpose: Workflow for feature planning, small direct-fix planning, and debug-escalation planning
version: "1.0"
---

# planning - Workflow Details

## Boundary

`planning` turns an already-bounded request into executable preparation. It does not lock new product decisions, write code, or bypass `validating`.

There are three entry routes:

1. `feature route`
2. `small direct-fix route`
3. `debug-escalation route`

`planning` does not choose among those routes from scratch. Upstream phases provide the route:

- `context-intake` provides `small-fix` or routes the work onward to `exploring`
- `exploring` hands off locked feature work as `feature`
- `debugging` hands off proven repair planning as `debug-escalation`

## Route 1: Feature Planning

Use this route only when context is locked.

### Gate

Preferred gate:

```powershell
node .beer\scripts\commands\beer-planning-gate.mjs --route feature
```

If the script is missing or exits non-zero, use the manual checklist:

1. `history/<feature>/CONTEXT.md` exists and is readable
2. `.beer/state.json` reports `context_stage = "locked"`
3. `.beer/state.json` reports `approved_gates.context = true`
4. `history/learnings/critical-patterns.md` is readable or intentionally absent
5. there are no blocking repo changes that would invalidate planning
6. the feature name is known and recorded in state

Any failure means planning must stop and route back to the prerequisite step.

### Discovery Depth

Research:

- architecture topology
- existing patterns to reuse
- technical constraints
- optional external research only when the feature is genuinely novel

Recommended commands:

```powershell
Get-Content history\<feature>\CONTEXT.md
if (Test-Path history\learnings\critical-patterns.md) { Get-Content history\learnings\critical-patterns.md }
rg -n "<keyword>" .
rg --files | Select-Object -First 80
```

If GitNexus is indexed and available, use it to accelerate architecture and pattern lookup. Do not block on GitNexus.

### Outputs

Write:

- `history/<feature>/discovery.md`
- `history/<feature>/approach.md`
- `history/<feature>/phase-plan.md`

After approval, write:

- `history/<feature>/phase-<n>-contract.md`
- `history/<feature>/phase-<n>-story-map.md`
- current-phase beads only when decomposition is actually needed

## Route 2: Small Direct-Fix Planning

Use this route when the request is local, low ambiguity, and likely under 3 files.

### Gate

Proceed only if all are true:

1. the task is not a new feature boundary
2. no product decision needs to be locked
3. expected scope is still bounded after a quick scout
4. the fix is small enough that a single-phase plan is believable

If any of those fail, reject the route:

- bounce to `beer:context-intake` when the task is no longer clearly a small fix
- bounce to `beer:debugging` when the work is actually an unproven repair path

Technical gate:

```powershell
node .beer\scripts\commands\beer-planning-gate.mjs --route small-fix
```

### Discovery Depth

Stay compact:

- read the request
- read the directly implicated files
- read one nearby pattern file if it lowers risk
- read prior learnings if relevant

Do not inflate a tiny fix into architecture research.

### Outputs

Write short versions of:

- `history/<feature>/discovery.md`
- `history/<feature>/approach.md`
- `history/<feature>/phase-plan.md`

Rules:

- one phase only
- 1-2 stories at most
- no forced story map
- no beads unless the work still decomposes into multiple worker-sized tasks

## Route 3: Debug-Escalation Planning

Use this route after `debugging` proved the root cause but the repair is too large or risky for a direct patch.

### Gate

Proceed only if all are true:

1. a concrete root-cause sentence exists
2. the intended repair boundary is explicit
3. the plan does not quietly expand into unrelated feature work
4. the next step is repair planning, not more debugging of the same symptom

If the root cause is still vague, reject the route and return to `debugging`.

Technical gate:

```powershell
node .beer\scripts\commands\beer-planning-gate.mjs --route debug-escalation
```

### Discovery Depth

Start from:

- the root-cause sentence
- the original failing command
- the files implicated by debugging
- locked `CONTEXT.md` if the bug sits inside an existing feature boundary
- prior learnings and similar fix patterns

Do not rerun broad feature discovery unless the repair genuinely crosses architecture boundaries.

### Outputs

Write:

- `history/<feature>/discovery.md` with debug evidence up front
- `history/<feature>/approach.md` describing the repair strategy
- `history/<feature>/phase-plan.md` with one bounded repair phase unless multiple phases are truly required

After approval:

- write a compact current-phase contract if needed
- skip story-map and beads unless decomposition is needed for safety

## Shared Phase Sequence

Regardless of route, run this sequence:

1. Confirm incoming route and feature slug from `.beer/state.json`
2. Learnings retrieval
3. Discovery
4. Synthesis in `approach.md`
5. Phase plan
6. Approval gate
7. Current-slice preparation
8. Handoff to `beer:validating`

## Learnings Retrieval

Always read:

```powershell
if (Test-Path history\learnings\critical-patterns.md) { Get-Content history\learnings\critical-patterns.md }
rg -n "<keyword>" history\learnings
```

Document the applied learnings near the top of `discovery.md`.

## discovery.md

Capture only the reality needed for this route:

- what exists today
- what pattern should be reused
- what constraint limits the implementation
- what risk or unknown still matters

Feature route can be broad.
Small and debug routes should stay compact.

For all routes, use the active feature slug already recorded in `.beer/state.json`. `planning` writes under `history/<feature>/...`; it does not create a new slug on its own.

## approach.md

Must include:

- the implementation gap
- the chosen approach
- alternatives rejected when they matter
- risk map
- how learnings changed the plan

For debug escalation, preserve the root-cause sentence verbatim.

## phase-plan.md

### Feature Route

- 2-4 meaningful phases
- each phase describes a real observable outcome
- select only the first phase for current prep

### Small and Debug Routes

- single phase by default
- use a second phase only when there is a real before/after boundary
- keep the summary concrete and short

## Approval Gate

Without auto-accept:

```text
Phase plan written.
Review the route, current phase, and risks.

Approve before current-phase preparation? (yes / revise / no)
```

With auto-accept:

- still write the artifacts first
- run `node .beer/scripts/commands/beer-auto-accept.mjs --gate planning --json`
- proceed automatically only when the policy returns `allow = true`
- log the auto-accept decision plainly

Pause even with auto-accept when:

- a feature phase is high risk
- the repair touches security, auth, data migration, or cross-cutting behavior
- the current slice still looks too large or unclear

PowerShell:

```powershell
node .beer\scripts\commands\beer-auto-accept.mjs --gate planning --json
```

## Current-Slice Preparation

### Feature Route

Prepare:

- phase contract
- story map
- beads if decomposition is needed

### Small Direct-Fix Route

Prepare:

- a compact phase contract when validating/executing needs explicit scope

Do not create a story map or beads unless the fix still needs them.

### Debug-Escalation Route

Prepare:

- a compact phase contract that preserves the root cause, repair boundary, and verification path

Only create a story map or beads when the repair is truly multi-step or multi-owner.

## Bead Policy

Beads are optional in `planning`, not automatic.

Create beads only when:

- more than one worker-sized task remains,
- dependencies need to be explicit,
- or direct execution would force guessing.

Never create beads before approval.

## State Update

Update `.beer/state.json` first, then regenerate `.beer/STATE.md`.

Record:

- route: `feature` | `small-fix` | `debug-escalation`
- `planning_route`
- current phase name
- whether prep is `compact` or `full`
- `approved_gates.phase_plan`
- current artifacts

Do not mutate `planning_route` just because planning disagrees with it. Reject the route and send the work back to the upstream phase that owns the classification.

## Troubleshooting

| Problem | Action |
|---|---|
| Only seed context exists | Stop and route to `beer:exploring` |
| Incoming route says `small-fix`, but the work now needs locked decisions or broader intake | Stop and bounce to `beer:context-intake` |
| Tiny fix is being overplanned | Keep the same `small-fix` route, but shrink the artifacts and prep depth |
| Debug repair lost the root-cause sentence | Stop and restore the debug evidence in the plan |
| Current slice still needs too many steps | Split it or create explicit beads after approval |
| Auto-accept would hide major risk | Pause for human approval |
