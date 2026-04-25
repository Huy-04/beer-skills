---
skill: validating
purpose: Workflow for feature, small direct-fix, and debug-escalation validation routes
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

- route: `feature` | `small-fix` | `debug-escalation`
- orchestration strategy: `single-worker` | `multi-worker`
- current slice name
- `approved_gates.phase_plan`
- proposed execution route, if already present

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

### Small Direct-Fix Route Prerequisites

Required:

- compact `discovery.md`
- compact `approach.md`
- bounded `phase-plan.md`

Optional:

- compact contract

### Debug-Escalation Route Prerequisites

Required:

- debug-anchored `discovery.md`
- repair `approach.md`
- bounded `phase-plan.md`

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

### Small Direct-Fix Route

Run the compact set:

1. current-slice clarity
2. bounded scope
3. file-scope sanity
4. verification completeness
5. direct execution credibility

### Debug-Escalation Route

Run the compact set plus root-cause retention:

1. current-slice clarity
2. root-cause coverage
3. repair boundary integrity
4. verification completeness
5. execution credibility

If the route uses beads, also check dependency correctness and collision risk.

## Phase 2: Spike Decision

Check `approach.md` for high-risk items that still affect the current slice.

Run a spike only when:

- a high-risk unknown still exists
- the answer affects whether execution is safe
- the answer cannot be obtained by reading the current artifacts alone

Do not run spikes by default on small direct fixes.

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

### Small Direct-Fix Route

Polish:

- direct execution scope
- verify command or manual test path
- any file overlap risk if more than one task remains

### Debug-Escalation Route

Polish:

- root-cause preservation
- repair boundary
- regression-proof verification path

Do not let this route expand into unrelated feature planning.

## Phase 4: Exit-State Review

Before approval, answer:

1. If this slice executes successfully, does the claimed outcome become true?
2. Is the verification path believable?
3. Does the execution route match the scope?
4. For debug escalation: does the repair still target the proven root cause?

Any unclear answer means FAIL until repaired.

## Phase 5: Approval Gate

Without auto-accept:

```text
Validation complete.
Route: [feature | small direct fix | debug escalation]
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

### Small Direct-Fix Route

- route to direct `beer:executing`

### Debug-Escalation Route

- route to direct `beer:executing` by default
- route to `beer:swarming` only if the validated repair still has multiple explicit tasks and dependency management matters

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
| Debug route lost the root cause | Stop and repair the plan first |
| Auto-accept hides real risk | Pause for approval |
| Execution target looks too large for direct execution | Route back to planning or switch to swarm path explicitly |
