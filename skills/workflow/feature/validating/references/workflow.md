---
skill: validating
purpose: Workflow for feature, small-fix, and repair-intent validation routes
version: "1.0"
---

# validating - Workflow Details

## Boundary

`validating` is the gate between planning and execution. It checks whether the current slice is safe and believable enough to execute on the approved route.

It does not:

- rewrite the plan from scratch
- create new product decisions
- force a bead graph for compact routes
- jump directly into execution

## Phase 0: Route and Prerequisite Check

Read:

```powershell
Get-Content .beer\state.json
if (Test-Path .beer\STATE.md) { Get-Content .beer\STATE.md }
```

Extract:

- route: `feature` | `small-fix`
- work_intent: `delivery` | `repair` | `investigation`
- orchestration strategy: `single-worker` | `multi-worker`
- current slice name
- `approved_gates.phase_plan`
- proposed execution route, if already present

`contract_verified` means the planning artifacts contain enough contract,
pattern, and verification detail for execution to proceed without guessing. It
does not mean the implementation has already been tested.

### Feature Route Prerequisites

Required:

- `history/<feature>/CONTEXT.md`
- `history/<feature>/discovery.md`
- `history/<feature>/approach.md`
- `history/<feature>/phase-plan.md`
- current phase contract

Optional when truly needed:

- story map
- beads

### Small-Fix Route Prerequisites

Required:

- `history/<feature>/compact-plan.md`

Optional:

- compact contract

### Feature Repair Route Prerequisites

Required:

- bounded repair: `history/<feature>/compact-plan.md`
- broad repair: debug-anchored `discovery.md`, repair `approach.md`, and bounded `phase-plan.md`

Optional:

- compact contract

If required artifacts for the chosen route are missing, stop and return to `beer:planning`.
If `approved_gates.phase_plan` is not true, stop and return to `beer:planning` before validating execution readiness.

## Phase 1: Structural Validation

### Feature Route

Run the full check set:

1. current-slice clarity
2. story coverage and order
3. decision coverage
4. dependency correctness
5. file-scope isolation
6. context budget
7. verification completeness
8. exit-state completeness

### Small-Fix Route

Run the compact set:

1. current-slice clarity
2. bounded scope
3. file-scope sanity
4. verification completeness
5. direct execution credibility
6. observable exit state
7. `orchestration_strategy = single-worker`

### Feature Repair Route

Run the compact set plus root-cause retention:

1. current-slice clarity
2. root-cause coverage
3. repair boundary integrity
4. verification completeness
5. execution credibility

Bounded repair may validate from `compact-plan.md`. Broad repair validates from
the debug-anchored full trio.

### Pattern Readiness

For every route, confirm:

1. a chosen implementation pattern is named in `compact-plan.md` or the current phase contract
2. pattern evidence files exist and are relevant
3. the exact source facts `executing` must re-check before coding are listed
4. assumptions that still need source verification are called out instead of treated as facts

If pattern readiness is missing, stop and return to `beer:planning`.

Generated `Docs/` can supply expected pattern names, repo-flow hints, and
verification targets, but those entries are not approval evidence by
themselves. If a Docs hint matters for execution readiness, confirm it against
current source, GitNexus, or the approved planning artifact before passing the
gate.

### Semantic Agent Validation For Beer Changes

If the current slice changes Beer skills, workflow routing, route selection,
gate behavior, or skill-authoring rules, the execution-ready verification path
must include semantic agent validation after the edit lands.

Semantic agent validation is not a command smoke test. It checks whether a real
agent or authorized evaluator can read the current skill package and behave
correctly on a realistic task.

The validation gate approves a concrete post-edit semantic validation plan, not
a claim that semantic behavior is already proven. Final handoff or review must
include executed semantic evidence, or explicitly mark the semantic check as
blocked or limited.

Require the plan to name:

1. the prompt or task shape that will be given to the agent
2. the affected route or skill expected to activate
3. the expected allowed behavior and forbidden overreach
4. the artifact or command evidence that will prove the outcome
5. cleanup expectations for any target repo or temporary checkout

Minimum depth:

- one affected route for a narrow trigger or wording change
- representative route cases when the edit changes route tables, default
  selection, gate transitions, or behavior shared by multiple workflow paths,
  such as strategy-only, feature/small-fix, and debugging

Command tests remain necessary when relevant, including skill sync, markdown
link checks, install/uninstall, and unit tests. They do not replace semantic
agent validation because they cannot prove route choice, gate discipline, or
whether the agent overreaches.

If no real agent or authorized evaluator can be used in the current environment,
record the blocker in the validation report or handoff as blocked or limited
instead of claiming the behavior was proven by command tests alone.
`validation_status` in `.beer/state.json` remains `pass` or `fail`; do not
invent a `limited` state value. If semantic validation is required before this
gate and no concrete plan exists, set `validation_status = fail`. If the gate
only requires a post-edit semantic validation plan, validation may pass only
when that plan is concrete, and the final handoff must later show executed
evidence or a blocked/limited behavior claim.

If the route uses beads, also check dependency correctness and collision risk.
If `orchestration_strategy = multi-worker`, also require:

1. explicit worker-sized task boundaries
2. dependency notes that let `swarming` dispatch without guessing
3. verification ownership for each worker boundary

If those are missing, stop and return to `beer:planning`.

## Phase 2: Spike Decision

Check `approach.md` for high-risk items that still affect the current slice.

Run a spike only when:

- a high-risk unknown still exists
- the answer affects whether execution is safe
- the answer cannot be obtained by reading the current artifacts alone

Do not run spikes by default on compact small-fix routes.

If a spike returns NO:

- document the blocker
- update planning artifacts or notes
- return to `beer:planning`

## Phase 3: Route-Specific Polish

### Feature Route

If beads exist:

- inspect dependencies
- inspect collision risk
- ensure story-to-bead coverage makes sense

Do manual dependency and file-scope review.

### Small-Fix Route

Polish:

- direct execution scope
- verify command or manual test path
- any file overlap risk if more than one task remains
- `single-worker` constraint still holds

### Feature Repair Route

Polish:

- root-cause preservation
- repair boundary
- chosen implementation pattern and evidence files
- regression-proof verification path

Do not let this route expand into unrelated feature planning.

## Phase 4: Exit-State Review

Before approval, answer:

1. If this slice executes successfully, does the claimed outcome become true?
2. Is the verification path believable?
3. Does the execution route match the scope?
4. For feature repair: does the repair still target the proven root cause?
5. For feature routes with stories: does each story unlock, de-risk, or directly advance the current phase exit state?
6. Is the implementation pattern explicit enough that `executing` can verify exact source facts before coding?
7. For Beer skill or workflow changes: will semantic agent validation prove the
   changed behavior after implementation, or is the claim still only a command
   smoke test?

Any unclear answer means FAIL until repaired.

## Phase 5: Approval Gate

Without auto-accept:

```text
Validation complete.
Route: [feature | small-fix | feature repair]
Current slice: [name]
Risk notes: [summary]
Execution route: [swarming | direct executing]

Approve execution? (yes / revise / no)
```

With auto-accept:

- still run the checks first
- run `node .beer/scripts/commands/beer-auto-accept.mjs --gate validating --json`
- only auto-approve on `allow = true`
- pause when the policy returns `allow = false`
- pause even with auto-accept for auth, migration, security, data-loss, or unresolved high-risk uncertainty

PowerShell:

```powershell
node .beer\scripts\commands\beer-auto-accept.mjs --gate validating --json
```

## Handoff Rules

### Feature Route

- route to `beer:swarming` when the slice is genuinely multi-task or swarm-ready
- route to direct `beer:executing` only when the feature slice is intentionally bounded and approved for direct execution

### Small-Fix Route

- route to direct `beer:executing`

### Feature Repair Route

- route to direct `beer:executing` by default
- route to `beer:swarming` only if the validated repair still has multiple explicit tasks and dependency management matters

Do not approve `beer:swarming` from a vague `multi-worker` label alone. The worker boundaries and verification ownership must already be explicit in planning artifacts.

## State Update

Update `.beer/state.json` first, then regenerate `.beer/STATE.md`.

Record:

- route
- `orchestration_strategy`
- `contract_verified`
- validated status
- `validator_status`
- proposed and then approved execution target
- `approved_gates.execution`
- any spike result
- any approval override
- auto-accept policy result when it was used

## Troubleshooting

| Problem | Action |
|---|---|
| Feature route has only seed context | Stop and return to `beer:exploring` |
| Compact route is missing beads | Acceptable if direct execution remains credible |
| Feature repair route lost the root cause | Stop and repair the plan first |
| Auto-accept hides real risk | Pause for approval |
| Execution target looks too large for direct execution | Route back to planning or switch to swarm path explicitly |
