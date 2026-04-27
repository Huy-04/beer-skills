---
skill: planning
purpose: Workflow for feature planning, compact small-fix planning, and repair planning inside the main flow
version: "1.0"
---

# planning - Workflow Details

## Boundary

`planning` turns an already-bounded request into executable preparation. It does not lock new product decisions, write code, or bypass `validating`.

There are three entry routes:

1. `feature route`
2. `small-fix route`
3. `feature repair intent`

`planning` does not choose among those routes from scratch. Upstream phases provide the route:

- `context-intake` hands normal task work to `exploring`
- `exploring` hands off locked feature work as `feature`
- `exploring` also hands off small-fix exemptions as `small-fix`
- `debugging` hands off proven repair planning as `work_intent = repair`

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
if (Test-Path Docs\index.json) { Get-Content Docs\index.json }
if (Test-Path Docs\Flows\repo-flow.md) { Get-Content Docs\Flows\repo-flow.md }
rg -n "<keyword>" .
rg --files | Select-Object -First 80
```

If generated `Docs/` exists, use it only to find likely patterns, flow docs, and
verification targets; confirm any used fact against current source or locked
workflow evidence. If GitNexus is indexed and available, use it to accelerate
architecture and pattern lookup. Do not block on GitNexus.

### Outputs

Write:

- `history/<feature>/discovery.md`
- `history/<feature>/approach.md`
- `history/<feature>/phase-plan.md`

After approval, write:

- `history/<feature>/phase-<n>-contract.md`
- `history/<feature>/phase-<n>-story-map.md`
- current-phase beads only when decomposition is actually needed

## Route 2: Small-Fix Planning

Use this route when the request is local, low ambiguity, and likely under 3 files.

### Gate

Proceed only if all are true:

1. the task is not a new feature boundary
2. no product decision needs to be locked
3. expected scope is still bounded after a quick scout
4. the fix is small enough that a single-phase plan is believable
5. `exploring` already handed the work off as `route = small-fix`

If any of those fail, reject the route:

- bounce to `beer:exploring` when the task is no longer clearly a small fix
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

Write one compact plan/check note when the fix stays local and direct execution
remains credible:

- `history/<feature>/compact-plan.md`

Rules:

- one phase only
- directly implicated files are named
- scope, non-scope, and verification path are explicit
- chosen implementation pattern and evidence files are explicit
- direct `beer:executing` is still credible
- no forced story map
- no beads; if the work decomposes into multiple worker-sized tasks, reject the
  compact route and return to `beer:exploring` or feature planning
- confirm the incoming `single-worker` exemption constraint still holds

## Route 3: Feature Repair Planning

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
node .beer\scripts\commands\beer-planning-gate.mjs --route feature
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

Write the full trio only when the repair crosses feature or architecture
boundaries:

- `history/<feature>/discovery.md` with debug evidence up front
- `history/<feature>/approach.md` describing the repair strategy
- `history/<feature>/phase-plan.md` with one bounded repair phase unless multiple phases are truly required

For bounded repair, prefer `history/<feature>/compact-plan.md` with the proven
root cause, repair boundary, chosen implementation pattern, and verification
path.

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

Generated `Docs/` is optional context, not a refresh target for planning. When
present, it may contribute pattern names, repo-flow hints, and review targets,
but planning must cite current source or approved workflow artifacts for facts
that affect implementation.

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

For feature repair planning, preserve the root-cause sentence verbatim.
For refactor or modernization work that touches public contracts, legacy entry
points, or migration-sensitive behavior, also state one of these explicitly:

- the compatibility shim or adapter path
- the phased migration path
- the explicit breaking boundary if no compatibility path will be preserved

When the work adds or changes a backend boundary such as an API endpoint,
webhook, queue consumer, or external integration surface, also state:

- the contract shape that callers or producers must satisfy
- idempotency expectations
- retry behavior or ownership
- timeout/deadline expectations when they matter

## phase-plan.md

### Feature Route

- 2-4 meaningful phases
- each phase describes a real observable outcome
- each phase closes a small believable loop before the next one starts
- select only the first phase for current prep
- if a story map is prepared, every story must unlock, de-risk, or directly advance the phase exit state

### Small-Fix And Repair Routes

- single phase by default
- use a second phase only when there is a real before/after boundary
- keep the summary concrete and short
- use `compact-plan.md` instead of the full planning trio when a single note can honestly cover scope, files, verification, and direct execution

## Approval Gate

Without auto-accept:

```text
Plan artifact written.
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
- if `orchestration_strategy = multi-worker`, make worker-sized tasks, dependency edges, and verification ownership explicit enough that `swarming` can dispatch without guessing

### Small-Fix Route

Prepare:

- no extra artifact when `compact-plan.md` already captures execution scope and verification
- a compact phase contract when validating/executing needs explicit scope
- confirmation that the incoming `single-worker` exemption constraint still holds

Do not create a story map or beads for true `small-fix` work.
If the fix now needs story maps, beads, or `orchestration_strategy = multi-worker`,
it is no longer a `small-fix`; return to `beer:exploring` or feature planning
instead of stretching the compact path.

### Feature Repair Route

Prepare:

- a compact phase contract that preserves the root cause, repair boundary, and verification path
- the implementation pattern to follow and the evidence files that support it
- if public contracts or legacy paths are changing, the contract must also name the compatibility shim, migration path, or explicit breaking boundary
- if a backend boundary is changing, the contract must also name the contract shape plus any idempotency, retry, and timeout obligations

Only create a story map or beads when the repair is truly multi-step or multi-owner.
If `orchestration_strategy = multi-worker`, the compact contract still needs explicit worker-sized task boundaries and who verifies each boundary.

## Bead Policy

Beads are optional in `planning`, not automatic.

Create beads only when:

- more than one worker-sized task remains,
- dependencies need to be explicit,
- or direct execution would force guessing.

When beads are not used, the same worker boundaries and dependency notes still need to be recorded in the phase contract or equivalent planning artifact.

Never create beads before approval.

## State Update

Update `.beer/state.json` first, then regenerate `.beer/STATE.md`.

Record:

- route: `feature` | `small-fix`
- work_intent: `delivery` | `repair` | `investigation`
- `orchestration_strategy`
- `slice_count`
- `planned_workers`
- current phase name
- whether prep is `compact` or `full`
- `approved_gates.phase_plan`
- current artifacts

Do not mutate `route` just because planning disagrees with it. Reject the route and send the work back to the upstream phase that owns the classification.

## Troubleshooting

| Problem | Action |
|---|---|
| Only seed context exists | Stop and route to `beer:exploring` |
| Incoming route says `small-fix`, but the work now needs locked decisions or broader discovery | Stop and bounce to `beer:exploring` |
| Tiny fix is being overplanned | Keep the same `small-fix` route, but shrink the artifacts and prep depth |
| Debug repair lost the root-cause sentence | Stop and restore the debug evidence in the plan |
| Current slice still needs too many steps | Split it or create explicit beads after approval |
| Auto-accept would hide major risk | Pause for human approval |
