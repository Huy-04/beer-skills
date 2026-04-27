---
name: validating
description: >
  This skill should be used when a planned execution slice needs a go/no-go
  check before code is written, including feature work after planning,
  small-fix work that still needs a compact safety gate, or repair work that
  should be verified before execution.
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  tags:
    - beer/workflow
    - workflow
  dependencies:
    - id: beads-cli
      kind: command
      command: bd
      missing_effect: degraded
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
user-invocable: true
disable-model-invocation: false
---

# validating

Verify that the current execution slice is ready to execute. Scale the gate to the active route instead of forcing every task through full feature validation or a swarm path.

## At a Glance

| | |
|---|---|
| **Use when** | Planning has prepared the current slice and execution needs a go/no-go check |
| **Needs** | A planned route from upstream, a current slice, clear verification path, and enough artifacts for that route |
| **Produces** | PASS/FAIL validation result, optional spike findings, approval decision, and execution-route handoff |
| **Next** | `beer:swarming` for full feature execution, or direct `beer:executing` for compact routes |

## 30-Second Version

1. Read `.beer/state.json` and confirm the current planning route.
2. Check prerequisites for that route.
3. Run structural validation at the right depth for the route.
4. Run spikes only when route and risk actually require them.
5. Confirm the current slice has a believable demo and verification path.
6. Confirm `orchestration_strategy` still matches the planned slices.
7. Confirm the chosen implementation pattern, evidence files, and exact source facts that `executing` must re-check before coding.
8. Use generated `Docs/` verification targets only as hints; require source-backed evidence before approving execution.
9. For Beer skill, workflow, or routing changes, require a concrete post-edit semantic agent validation plan; command tests alone are insufficient.
10. If `orchestration_strategy = multi-worker`, confirm worker-sized task boundaries, dependency edges, and verification ownership are explicit.
11. Choose the proposed execution target for this slice.
12. Run the auto-accept policy check before crossing the execution gate.
13. Handoff only to the approved execution route.

## Validation Routes

### Feature Route

Use when planning prepared a real feature slice from locked context.

Expected artifacts:

- `history/<feature>/CONTEXT.md`
- `history/<feature>/discovery.md`
- `history/<feature>/approach.md`
- `history/<feature>/phase-plan.md`
- current phase contract
- story map when the phase needs explicit story ordering
- beads only when planning actually decomposed the phase

This is the full validation path.

### Small-Fix Route

Use when planning kept the work compact and local.

Expected artifacts:

- `history/<feature>/compact-plan.md`, or compact `discovery.md` / `approach.md` / single-phase `phase-plan.md` from an older route artifact
- optional compact phase contract

This route uses a compact gate. It must still verify scope, verification path, and execution safety.
`validating` must not invent this compact route locally; it should already arrive from `planning`.

### Repair Intent On Feature Route

Use when debugging proved the root cause but the repair needed planning inside the main feature route.

Expected artifacts:

- bounded repair: `history/<feature>/compact-plan.md`
- broad repair: debug-anchored `discovery.md`, repair `approach.md`, and bounded `phase-plan.md`
- optional compact phase contract

This route must preserve the root cause and keep the repair bounded.

Required compact check:

- the planned repair still maps back to the proven root-cause sentence

## Scope and Ownership

- `planning` owns the plan and current-slice preparation.
- `validating` owns readiness checks, optional spike findings, the orchestration sanity check, and the execution go/no-go decision.
- `validating` does not author a new feature plan from scratch.
- `validating` does not force beads or swarming when the approved route does not need them.
- `validating` may propose or reject an execution target, but it must not invent a new route locally; the gate only becomes approved when `approved_gates.execution = true`.

## Structural Checks

### Full Feature Route

Run the full validation set:

1. Current-slice clarity
2. Story coverage and order
3. Decision coverage
4. Dependency correctness
5. File-scope isolation
6. Context budget
7. Verification completeness
8. Exit-state completeness

### Compact Routes

For `small-fix` and repair-intent validation, focus on:

1. current-slice clarity
2. decision or root-cause coverage
3. file scope and collision risk
4. verification completeness
5. believable execution route
6. observable exit state for the slice, even when the artifact is only `compact-plan.md`
7. `orchestration_strategy = single-worker`

### Pattern Readiness Check

For all planned routes, validating must confirm:

1. the implementation pattern is named in `compact-plan.md` or the current phase contract
2. evidence files for that pattern are listed
3. the exact signatures, DTOs, commands, events, or source facts that `executing` must re-check before coding are explicit
4. pattern-looking assumptions are not treated as verified source facts
5. generated `Docs/` entries, when used, are treated as hints and confirmed against current source or approved artifacts

### Semantic Agent Validation For Beer Changes

When the current slice changes Beer skills, workflow routing, route selection, gates, or skill-authoring rules, validating must confirm that the verification path includes at least one semantic agent validation after the edit lands. At the validation gate, this means a concrete planned check. At final handoff or review, this means executed evidence or an explicit blocked/limited status.

A semantic agent validation means a real agent or authorized evaluator receives a realistic task, reads the current skill package, chooses its route or skill, performs the allowed behavior, and reports:

1. the prompt used
2. the route or skill selected
3. files read, artifacts created, or code edited
4. verification commands or manual checks run
5. violations, overreach, skipped gates, or cleanup status

Minimum depth is one affected route for a narrow trigger or wording change. If the edit changes route tables, default selection, gate transitions, or behavior shared by multiple workflow paths, require representative cases such as strategy-only, feature/small-fix, and debugging.

Command tests such as sync, link checks, install/uninstall, and unit tests remain required when relevant, but they do not prove agent behavior by themselves.

### Multi-Worker Readiness Check

If `orchestration_strategy = multi-worker`, validating must also confirm:

1. worker-sized task boundaries are explicit
2. dependency edges are explicit enough for dispatch
3. verification ownership is explicit per worker boundary
4. the slice is not being labeled `multi-worker` just to hide vague planning

## Spike Policy

- Spikes are optional, not default.
- Run spikes only when the current slice still has a high-risk unknown.
- High-risk auth, data, migration, security, or novel integration work can still force a spike even on a compact route.

## Hard Rules

- Never validate a feature route from seed-only context.
- Never require beads when the active route does not need them.
- Never approve execution without a believable verification path.
- Never approve a planned slice whose implementation pattern is still implicit or whose evidence files are missing.
- Never approve execution from generated `Docs/` hints alone.
- Never approve Beer workflow, routing, or skill-authoring changes for execution when the verification path lists only command tests and no concrete semantic agent validation plan.
- Never approve `small-fix` when `orchestration_strategy` is not `single-worker`.
- Never skip spikes when a true high-risk unknown remains.
- Never route to `beer:swarming` just because it exists; use the route approved by planning and validating.
- Never let auto-accept override high-risk pause conditions; use `beer-auto-accept.mjs --gate validating` as the executable policy.

## State Contract

- `state.json` is authoritative.
- Update `.beer/state.json` first, then regenerate `.beer/STATE.md`.
- Record the validated route, `orchestration_strategy`, approval status, and approved execution target.
- Record whether planning artifacts contain enough contract, pattern, and verification detail for execution to proceed without guessing with `contract_verified = true|false`.
- Record validator outcome with `validator_status = pass|fail`.
- Set `validation_status = pass | fail`.
- Set the proposed `execution_target = executing | swarming` before the execution approval ask.
- Set `approved_gates.execution = true` only after human approval or an `ALLOW` result from `beer-auto-accept.mjs --gate validating`.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
