---
name: executing
description: >
  This skill should be used when a validated execution slice is approved for
  implementation, whether on the direct path or as a swarm worker.
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
    - id: bd
      kind: mcp_server
      server_names: [bd]
      missing_effect: degraded
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
user-invocable: true
disable-model-invocation: false
---

# executing

Implement the approved slice and stop when the slice is complete, blocked, or
no longer trustworthy to continue.

## At a Glance

| | |
|---|---|
| **Use when** | `beer:validating` approved direct execution, or `beer:swarming` assigned worker work |
| **Needs** | Validated slice, locked decisions or proven root cause, explicit scope, and verification criteria |
| **Produces** | Implemented slice, verification evidence, and a completion or blocker handoff |
| **Next** | `beer:reviewing` for finished work, or back to the coordinator/local state for more approved work |

## Execution Strategies

### Multi-Worker Execution

Use when:

- `execution_target = swarming`
- `orchestration_strategy = multi-worker`
- `approved_gates.execution = true`
- a coordinator assigned the work
- the worker has an explicit task or bead

### Single-Worker Execution

Use when:

- `execution_target = executing`
- `orchestration_strategy = single-worker`
- `approved_gates.execution = true`
- the slice was explicitly approved for direct work
- scope stays bounded enough that no coordinator is needed

## Scope and Ownership

- `planning` and `validating` decide the slice.
- the orchestrator owns route lock, gate approval, and next-phase control.
- `swarming` coordinates workers when the route is parallel.
- `executing` implements and verifies the slice.
- `executing` consumes an already approved current slice; it does not approve its own entry.
- `executing` does not widen scope, invent new decisions, or silently promote direct work into a swarm.
- `executing` does not choose a new route, execution target, or review handoff on its own; it either reports back to the coordinator or hands the approved direct route forward with evidence.

## 30-Second Version

1. Read `AGENTS.md`, Beer state, the current contract, and any active handoff note.
2. Confirm `approved_gates.execution = true` before starting code changes.
3. Confirm `contract_verified = true`; if it is false or missing, return to `beer:validating`.
4. Confirm whether this run is direct execution or swarm-worker execution.
5. Load the exact route artifact: `compact-plan.md`, current phase contract, or coordinator assignment.
6. Read the implementation pattern, evidence files, verification target, and any target type definitions the slice depends on.
7. Re-check exact constructors, factories, events, DTOs, commands, and value objects before coding against them.
8. Treat generated `Docs/` as read-only hints only; do not refresh Docs during execution.
9. Verify before claiming completion.
10. Run `beer-auto-accept.mjs --gate reviewing` if the handoff to review would auto-advance.
11. Record what changed, what passed, what pattern/source facts were re-checked, and what the next owner should do.
12. Stop and escalate if scope expands, verification fails repeatedly, source facts contradict the plan, or context safety drops.

## Hard Rules

- Never start work without an approved slice.
- Never start work when `approved_gates.execution` is still false.
- Never start work when `contract_verified` is not true.
- Never widen scope just because the nearby code is convenient to change.
- Never skip verification.
- Never ignore locked decisions from `CONTEXT.md`.
- Never code from a pattern name alone; open the evidence files and verify exact source facts first.
- Never treat generated `Docs/` as approval to code or refresh Docs inside execution.
- Never lose the debug root-cause anchor on repair work.
- Never turn a direct route into a pseudo-swarm; if coordination becomes necessary, route back to `planning` and `validating`.
- Never treat `STATE.md` as authoritative; update `state.json` first.
- Never mark work complete without a traceable completion note.
- Never auto-handoff to review without execution evidence and an `ALLOW` result from `beer-auto-accept.mjs --gate reviewing`.
- Never infer constructors, factories, event payloads, DTO shapes, or value-object APIs from naming alone.
- Never use build or compile failures as the first time those contracts are verified.

## TDD Trigger

If the slice adds or changes behavior and a meaningful failing-test path exists,
invoke `beer:test-driven-development` before treating the implementation as
complete. For behavior-changing slices, record `tdd_required = true` in
`.beer/state.json` and set `tdd_status = required` before the loop starts.
After the RED/GREEN/REFACTOR loop, record `tdd_status = complete` and
`tdd_evidence_path`.

If TDD is not used for a behavior-changing slice, record the disposition:
`tdd_status = waived` with the reason, or `tdd_status = not-required` when the
slice is non-behavioral. Do not silently skip the decision.

## State Contract

- `state.json` is authoritative.
- Record `orchestration_strategy`, active work item, verification status, and next handoff in `.beer/state.json`.
- Record TDD state for behavior changes: `tdd_required`, `tdd_status`, and `tdd_evidence_path`.
- Write execution evidence to `history/<feature>/execution-evidence.md` for every Beer route that reached approved execution.
- Store that path in `execution_evidence_path`.
- Execution evidence must include the route artifact read, implementation pattern followed, source facts re-checked, files changed, verification run, TDD disposition, and any deviation from the approved plan.
- For swarm-worker execution, report completion or blockers back to the coordinator instead of self-advancing the global route.
- For swarm-worker execution, the completion report should always name:
  - files touched
  - verification run
  - blocker or `no blocker`
  - recommended next owner action
- For swarm-worker execution, treat the worker result as a stable record, not a casual chat note; if the runtime uses Beer-owned worker state instead of beads, update that state before claiming the assignment is complete.
- Regenerate `.beer/STATE.md` after `state.json` changes.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
- [TDD support](../../../support/test-driven-development/SKILL.md)
