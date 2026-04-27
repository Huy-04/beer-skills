---
skill: using-beer
purpose: Detailed workflow guides for onboarding, session scouting, state bootstrap, and go run style
version: "1.1"
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

## Small-Fix Signal

Intake should recognize when the request is a `small-fix`, but normal task work still enters through `beer:context-intake`.

Treat it as a small-fix exemption when all of these are true:

- the task is local and low ambiguity,
- it is a bug fix or cleanup like type, format, rename, or obvious wiring repair,
- it is likely to touch fewer than 3 files,
- it does not introduce a new feature boundary or product decision.

If the small-fix signal applies:

- keep `beer:context-intake` as the intake gate,
- still hand off to `beer:exploring`,
- let `beer:exploring` take the small-fix exemption into `beer:planning` with `route = small-fix` and `orchestration_strategy = single-worker`.

If the signal does not apply, intake still hands work to `beer:exploring`.

## Strategy-Shaping Signal

Use `beer:strategy-shaping` before `beer:context-intake` when the user is not
asking for an implementation task yet. Typical signals:

- "Which direction should we take?"
- "Is this overkill?"
- "Compare these approaches."
- "How should we optimize this feature?"
- "Let's discuss strategy first."

`strategy-shaping` returns a strategy brief and handoff seed. It does not lock
context, approve gates, mutate `.beer/state.json`, write a plan, or start code
edits. Once the user chooses a direction, pass the raw request plus the strategy
brief into `beer:context-intake`.

## Prompt Normalization Overlay

Use `prompt-leverage` before routing only when the raw request needs help to
stay executable:

- mixed-language prompt where output language and preserved Beer terms matter
- prompt references repo files, skills, commands, or Beer artifacts that need local context
- prompt is vague but likely resolvable from repo/session context
- user explicitly asks to improve, structure, or leverage a prompt

Return from `prompt-leverage` with:

- raw request unchanged
- contextual prompt packet
- context sources used or skipped
- unresolved unknowns or assumptions
- `return_to = beer:using-beer` or the calling owner

Route using the raw request and contextual prompt together. Do not route solely
from the rewritten prompt, and do not let prompt upgrade bypass
`beer:context-intake` for normal task work. `prompt-leverage` does not mutate
`.beer/state.json`, approve gates, write plans, edit code, or refresh generated
`Docs/`.

## Generated Docs Request

Route directly to `beer:codebase-knowledge` only when the user explicitly asks
to scan, build, or refresh generated project `Docs/`. Normal feature,
debugging, planning, validation, execution, and review work reads `Docs/` as
optional context only and does not refresh it mid-flow.

## Support And Helper Handoff

Support and helper skills are evidence producers or bounded overlays. They must
return to the invoking owner instead of silently becoming the active workflow.

Every support/helper handoff should include:

- `status`: complete, blocked, degraded, or not-needed
- `evidence`: files, commands, graph tools, docs, or tests actually used
- `decision_or_guardrail`: what the workflow owner should do with the result
- `state_changes_or_none`: exact state fields changed, or `none`
- `return_to`: the invoking Beer skill
- `next_owner`: the next Beer skill that should act

If the support/helper run discovers implementation work, routing risk, stale
generated `Docs/`, or a broader repair, return that signal to `using-beer` or
the current workflow owner. Do not continue by expanding the support/helper
scope.

## Instruction Guardrails Request

Route directly to `beer:beer-agent-guidelines` only when the user asks to
install, update, or tighten repo instruction files. Instruction-only requests
should edit only `AGENTS.md` and/or `CLAUDE.md`; do not run full `beer refresh`
unless the user asks for managed Beer refresh/install/update.

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
3. If `context_stage = locked`, reopen `history/<feature>/CONTEXT.md` and hand off to `beer:exploring`.
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
3. Route strategy-first requests through `beer:strategy-shaping`; do not force them into implementation workflow while the direction is still open.
4. Run context intake first once normal task direction is chosen.
5. Read `node .beer/scripts/commands/beer-status.mjs --json`.
6. Check GitNexus readiness.
7. If a feature is already active and `context_stage = locked`, reopen its `history/<feature>/CONTEXT.md` and hand off to `beer:exploring`.
8. If a feature is already active and `context_stage = seeded`, reopen `.beer/seed/` and route to `beer:exploring`.
9. Read `history/learnings/critical-patterns.md` when it exists.

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

`beer:test-driven-development` is not a full pipeline phase. Route to it
directly only when the user asks for bounded TDD work, fail-first tests, or a
regression test before a local fix. If that request becomes feature-sized,
approval-sensitive, or ownership-unclear, TDD returns the proposed RED target to
the normal Beer route before production code changes.

During normal Beer work, pull it in from:

- `beer:executing` when a bead adds or changes behavior and a meaningful failing-test path exists
- `beer:debugging` after root cause is known and the fix should leave a regression test
- `beer:reviewing` when changed behavior has no fail-first proof or regression coverage

Behavior-changing slices should record `tdd_required = true` in
`.beer/state.json` and set `tdd_status = required` before required TDD starts.
Automatic review handoff requires `tdd_status = complete` and
`tdd_evidence_path` when TDD was required.

### Gate behavior

| Gate | Present to user | Hard rule |
|---|---|---|
| Gate 1 | `CONTEXT.md` | Do not start planning before approval |
| Gate 2 | `phase-plan.md` or compact plan plus any prepared current-phase scope | Do not create current-phase work before approval unless `beer-auto-accept.mjs --gate planning` returns `ALLOW` |
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

At the end of any state-owning workflow skill, update `.beer/state.json` first,
then regenerate `.beer/STATE.md` from `state.json`. `STATE.md` is derived and
human-readable; `state.json` is the authoritative source of truth.

Support/helper skills do not mutate state unless their own contract explicitly
says they own a state field. For example, `prompt-leverage` and `graph-explore`
return packets only, while TDD state is recorded only when a Beer route requires
fail-first proof.

Required route fields in `.beer/state.json`:

- `feature_slug`: active feature identity for feature-sized or repair work
- `route`: `feature` or `small-fix`
- `work_intent`: `delivery`, `repair`, or `investigation`
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
- `knowledge_base_refresh_status`: generated `Docs/` closeout state, using internal compatibility field name

### Minimal Transition Baseline

Use this as the minimum state handoff contract:

| Phase owner | Minimum state written before handoff |
|---|---|
| `context-intake` | `phase`, `context_stage`, `feature_slug` when known, `route` when already credible, `next_handoff = beer:exploring` |
| `exploring` | `phase = exploring`, `context_stage = locked`, `context_path`, `context_confidence = 1.0`, `approved_gates.context = true` only after Gate 1 passes, then `next_handoff = beer:planning` |
| `planning` | `phase = planning`, `route`, `orchestration_strategy`, `current_phase_name`, `current_slice`, `slice_count`, `planned_workers`, `prep_depth`, `approved_gates.phase_plan = true` only after Gate 2 passes, then `next_handoff = beer:validating` |
| `validating` | `phase = validating`, `validation_status`, proposed then approved `execution_target`, `approved_gates.execution = true` only after Gate 3 passes, then `next_handoff = beer:executing | beer:swarming` |
| `executing` / `swarming` | `phase = executing | swarming`, `active_work_item`, `execution_evidence_path`, `verification_status`, then `next_handoff = beer:reviewing` |
| `reviewing` | `phase = reviewing`, `review_route`, `review_status`, `open_findings_count`, `approved_gates.review = true` only after Gate 4 passes, then `next_handoff = beer:compounding` or the repair route |
| `compounding` | `phase = idle`, clear transient feature-cycle fields and gate approvals, preserve `compounding_route`, `learnings_file`, `critical_promotions`, clear `next_handoff` for normal closeout |
