---
skill: using-beer
purpose: Detailed workflow guides for onboarding, session scouting, state bootstrap, and go run style
version: "1.0"
---

# using-beer - Workflow Details

## Plugin Onboarding

Before normal routing, verify Node.js and the Beer-managed state for the target repo.

### Check Node.js

```bash
node --version
```

If Node.js is missing or below 18, stop.

### Run onboarding check

From the Beer repo:

```bash
node scripts/commands/onboard-beer.mjs --repo-root <repo-root>
```

From an already-onboarded repo:

```bash
node .beer/scripts/commands/onboard-beer.mjs
```

### Response handling

| Status | Action |
|---|---|
| `up_to_date` | Proceed immediately |
| `needs_onboarding` | Run with `--apply` to install or refresh managed assets |
| `missing_runtime` | Stop and install Node.js 18+ |

### Onboarding creates

- `.beer/onboarding.json`
- `.beer/state.json`
- `.beer/STATE.md`
- `.beer/config.json`
- `.beer/scripts/` - managed copy of Beer utility scripts
- `.beer/skills/` - managed snapshot of the Beer skill bundle

## Direct-Fix Signal

Intake should recognize when the request is a small direct fix, but normal task work still enters through `beer:context-intake`.

Treat it as a direct-fix exemption when all of these are true:

- the task is local and low ambiguity,
- it is a bug fix or cleanup like type, format, rename, or obvious wiring repair,
- it is likely to touch fewer than 3 files,
- it does not introduce a new feature boundary or product decision.

If the direct-fix signal applies:

- keep `beer:context-intake` as the intake gate,
- let intake skip `beer:exploring`,
- route to `beer:planning` with `route = small-fix` and `orchestration_strategy = single-worker`.

If the signal does not apply, intake decides whether the work needs `beer:exploring` or can move straight to `beer:planning`.

## Context Intake (Step 0)

Never start session scouting blind.

### 3-path context loading

```text
Check GitNexus -> Path 1 if ready
              -> else check beads / HANDOFF -> Path 2
              -> else fall back to manual discovery -> Path 3
```

### Steps

1. Check active bead and handoff context.
2. Check `.beer/state.json` and inspect `context_stage`.
3. If `context_stage = locked`, reopen `history/<feature>/CONTEXT.md` and let intake decide whether to continue with `beer:planning` or reopen decisions in `beer:exploring`.
4. If `context_stage = seeded`, reopen `.beer/seed/` and route to `beer:exploring`.
5. If no reliable context exists, create seed-backed context before exploring.
6. Enrich incomplete bead descriptions instead of guessing.

See `beer:context-intake` for the full path-specific rules.

## Session Scout

After onboarding, read the current Beer status snapshot:

```bash
node .beer/scripts/commands/beer-status.mjs --json
```

Scout output includes:

- onboarding health
- `.beer/state.json`
- `.beer/STATE.md`
- `.beer/HANDOFF.json`
- recommended next reads

## State Bootstrap

Run these checks on every session start:

1. **Preflight probe**: Run `node scripts/commands/beer-preflight.mjs --json` (or `node .beer/scripts/commands/beer-preflight.mjs` from an onboarded repo).
2. Verify `.beer/onboarding.json`.
3. Run context intake first for normal task intake.
4. Read `node .beer/scripts/commands/beer-status.mjs --json`.
5. Check GitNexus readiness.
6. If a feature is already active and `context_stage = locked`, reopen its `history/<feature>/CONTEXT.md` and let intake choose `beer:planning` or `beer:exploring`.
7. If a feature is already active and `context_stage = seeded`, reopen `.beer/seed/` and route to `beer:exploring`.
8. Read `history/learnings/critical-patterns.md` when it exists.

### Preflight Degradation Routing

If preflight reports `workflow_status: degraded`, adjust the session before routing:

| Missing Tool | Adjustment |
|--------------|------------|
| `bd` | Use manual bead management (markdown files in `.beads/`). Skip graph-assisted validation. If `bd` is missing, route to direct single-worker execution; do not spawn swarm. |
| GitNexus MCP or repo index | Use local `rg`/file inspection. Do not claim graph-backed certainty. |

## Go Run Style (Full Pipeline)

```text
context-intake -> exploring -> [GATE 1] -> planning -> [GATE 2]
                     -> validating -> [GATE 3] -> swarming or executing
                     -> reviewing -> [GATE 4] -> compounding
```

### TDD routing overlay

`beer:test-driven-development` is not a full pipeline phase. Route to it directly when the user asks for TDD, fail-first tests, or a regression test before a fix.

During normal Beer work, pull it in from:

- `beer:executing` when a bead adds or changes behavior and a meaningful failing-test path exists
- `beer:debugging` after root cause is known and the fix should leave a regression test
- `beer:reviewing` when changed behavior has no fail-first proof or regression coverage

Behavior-changing slices should record `tdd_required = true` in
`.beer/state.json`. Automatic review handoff requires `tdd_status = complete`
and `tdd_evidence_path` when TDD was required.

### Gate behavior

| Gate | Present to user | Hard rule |
|---|---|---|
| Gate 1 | `CONTEXT.md` | Do not start planning before approval |
| Gate 2 | `phase-plan.md` and prepared current phase | Do not create current-phase work before approval unless `beer-auto-accept.mjs --gate planning` returns `ALLOW` |
| Gate 3 | Risk summary, spike results, execution target | Do not execute before approval unless `beer-auto-accept.mjs --gate validating` returns `ALLOW` |
| Gate 4 | Review counts and merge recommendation | P1 findings always block; compounding requires `beer-auto-accept.mjs --gate compounding` for automatic handoff |

### Confidence override

Low-confidence SEED context can disable downstream auto-accept even when it is globally enabled.
Seeded context is never enough to skip `beer:exploring`.

## Resume Logic

If `.beer/HANDOFF.json` exists:

1. Read the handoff and current state.
2. Surface the paused phase and suggested next action.
3. Resume only after explicit user confirmation.

## Dependency Declaration Contract

Every packaged Beer skill must declare dependencies in `metadata.dependencies`.

### Valid states

1. Command-backed dependency
2. MCP-backed dependency
3. Explicit `metadata.dependencies: []`

### Verification commands

```bash
node scripts/commands/onboard-beer.mjs --repo-root <repo-root>
node scripts/commands/beer-status.mjs --json
node scripts/commands/beer-dependencies.mjs
```

From an onboarded repo:

```bash
node .beer/scripts/commands/onboard-beer.mjs
node .beer/scripts/commands/beer-status.mjs --json
node .beer/scripts/commands/beer-dependencies.mjs
```

## State Reconciliation

At the end of every skill, update `.beer/state.json` first, then regenerate `.beer/STATE.md` from `state.json`. `STATE.md` is derived and human-readable; `state.json` is the authoritative source of truth.

Required route fields in `.beer/state.json`:

- `feature_slug`: active feature identity for feature-sized or debug-escalated work
- `route`: `feature`, `small-fix`, or `debug-escalation`
- `orchestration_strategy`: `single-worker` or `multi-worker`
- `validation_status`: `pending`, `pass`, or `fail`
- `execution_target`: proposed or approved `executing` / `swarming`
- `next_handoff`: explicit next Beer owner when the workflow is waiting on a normal handoff
- `approved_gates.context`: boolean gate result for Gate 1 approval of locked context
- `approved_gates.phase_plan`: boolean gate result for planning approval
- `approved_gates.execution`: boolean gate result for execution approval
- `approved_gates.review`: boolean gate result for review approval
- `tdd_required`: boolean marker for behavior-changing slices that need fail-first proof
- `tdd_status`: `not-required`, `required`, `blocked`, `waived`, or `complete`
- `tdd_evidence_path`: path to the TDD handoff note when required TDD is complete
- `execution_evidence_path`: path to the execution evidence note when implementation completes
- `review_status`: `pending`, `pass`, `repair-needed`, or `review-only`

### Minimal Transition Baseline

Use this as the minimum state handoff contract:

| Phase owner | Minimum state written before handoff |
|---|---|
| `context-intake` | `phase`, `context_stage`, `feature_slug` when known, `route` when routing to planning, `next_handoff = beer:planning | beer:exploring` |
| `exploring` | `phase = exploring`, `context_stage = locked`, `context_path`, `context_confidence = 1.0`, `approved_gates.context = true` only after Gate 1 passes, then `next_handoff = beer:planning` |
| `planning` | `phase = planning`, `route`, `orchestration_strategy`, `current_phase_name`, `current_slice`, `slice_count`, `planned_workers`, `prep_depth`, `approved_gates.phase_plan = true` only after Gate 2 passes, then `next_handoff = beer:validating` |
| `validating` | `phase = validating`, `validation_status`, proposed then approved `execution_target`, `approved_gates.execution = true` only after Gate 3 passes, then `next_handoff = beer:executing | beer:swarming` |
| `executing` / `swarming` | `phase = executing | swarming`, `active_work_item`, `execution_evidence_path`, `verification_status`, then `next_handoff = beer:reviewing` |
| `reviewing` | `phase = reviewing`, `review_route`, `review_status`, `open_findings_count`, `approved_gates.review = true` only after Gate 4 passes, then `next_handoff = beer:compounding` or the repair route |
| `compounding` | `phase = idle`, clear transient feature-cycle fields and gate approvals, preserve `compounding_route`, `learnings_file`, `critical_promotions`, clear `next_handoff` for normal closeout |
