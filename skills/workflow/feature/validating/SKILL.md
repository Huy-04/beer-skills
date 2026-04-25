---
name: validating
description: >
  This skill should be used when a planned execution slice needs a go/no-go
  check before code is written, including feature work after planning, small
  direct-fix work that still needs a compact safety gate, or debug-escalation
  repairs that should be verified before execution.
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
| **Needs** | A planned route, a current slice, clear verification path, and enough artifacts for that route |
| **Produces** | PASS/FAIL validation result, optional spike findings, approval decision, and execution-route handoff |
| **Next** | `beer:swarming` for full feature execution, or direct `beer:executing` for compact routes |

## 30-Second Version

1. Read `.beer/state.json` and confirm the current planning route.
2. Check prerequisites for that route.
3. Run structural validation at the right depth for the route.
4. Run spikes only when route and risk actually require them.
5. Confirm the current slice has a believable demo and verification path.
6. Confirm `orchestration_strategy` still matches the planned slices.
7. Choose the proposed execution target for this slice.
8. Run the auto-accept policy check before crossing the execution gate.
9. Handoff only to the approved execution route.

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

### Small Direct-Fix Route

Use when planning kept the work compact and local.

Expected artifacts:

- compact `discovery.md`
- compact `approach.md`
- single-phase `phase-plan.md`
- optional compact phase contract

This route uses a compact gate. It must still verify scope, verification path, and execution safety.

### Debug-Escalation Route

Use when debugging proved the root cause but the repair needed planning.

Expected artifacts:

- debug-anchored `discovery.md`
- repair `approach.md`
- bounded `phase-plan.md`
- optional compact phase contract

This route must preserve the root cause and keep the repair bounded.

Required compact check:

- the planned repair still maps back to the proven root-cause sentence

## Scope and Ownership

- `planning` owns the plan and current-slice preparation.
- `validating` owns readiness checks, optional spike findings, the orchestration sanity check, and the execution go/no-go decision.
- `validating` does not author a new feature plan from scratch.
- `validating` does not force beads or swarming when the approved route does not need them.
- `validating` may propose or reject an execution target, but the gate only becomes approved when `approved_gates.execution = true`.

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

For `small direct-fix` and `debug-escalation`, focus on:

1. current-slice clarity
2. decision or root-cause coverage
3. file scope and collision risk
4. verification completeness
5. believable execution route

## Spike Policy

- Spikes are optional, not default.
- Run spikes only when the current slice still has a high-risk unknown.
- High-risk auth, data, migration, security, or novel integration work can still force a spike even on a compact route.

## Hard Rules

- Never validate a feature route from seed-only context.
- Never require beads when the active route does not need them.
- Never approve execution without a believable verification path.
- Never skip spikes when a true high-risk unknown remains.
- Never route to `beer:swarming` just because it exists; use the route approved by planning and validating.
- Never let auto-accept override high-risk pause conditions; use `beer-auto-accept.mjs --gate validating` as the executable policy.

## State Contract

- `state.json` is authoritative.
- Update `.beer/state.json` first, then regenerate `.beer/STATE.md`.
- Record the validated route, `orchestration_strategy`, approval status, and approved execution target.
- Record whether critical contracts were verified before execution with `contract_verified = true|false`.
- Record validator outcome with `validator_status = pass|fail`.
- Set `validation_status = pass | fail`.
- Set the proposed `execution_target = executing | swarming` before the execution approval ask.
- Set `approved_gates.execution = true` only after human approval or an `ALLOW` result from `beer-auto-accept.mjs --gate validating`.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
