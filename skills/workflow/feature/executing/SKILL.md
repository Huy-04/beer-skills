---
name: beer-executing
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

## Execution Modes

### Swarm Worker

Use when:

- `execution_target = swarming`
- `approved_gates.execution = true`
- a coordinator assigned the work
- the worker has an explicit task or bead

### Direct Execution

Use when:

- `execution_target = executing`
- `approved_gates.execution = true`
- the slice was explicitly approved for direct work
- scope stays bounded enough that no coordinator is needed

## Scope and Ownership

- `planning` and `validating` decide the slice.
- `swarming` coordinates workers when the route is parallel.
- `executing` implements and verifies the slice.
- `executing` consumes an already approved current slice; it does not approve its own entry.
- `executing` does not widen scope, invent new decisions, or silently promote direct work into a swarm.

## 30-Second Version

1. Read `AGENTS.md`, Beer state, the current contract, and any active handoff note.
2. Confirm `approved_gates.execution = true` before starting code changes.
3. Confirm whether this run is direct execution or swarm-worker execution.
4. Load the exact approved work item, file scope, and verification target.
5. Implement only the approved slice.
6. Verify before claiming completion.
7. Run `beer-auto-accept.mjs --gate reviewing` if the handoff to review would auto-advance.
8. Record what changed, what passed, and what the next owner should do.
9. Stop and escalate if scope expands, verification fails repeatedly, or context safety drops.

## Hard Rules

- Never start work without an approved slice.
- Never start work when `approved_gates.execution` is still false.
- Never widen scope just because the nearby code is convenient to change.
- Never skip verification.
- Never ignore locked decisions from `CONTEXT.md`.
- Never lose the debug root-cause anchor on a debug-escalation route.
- Never turn a direct route into a pseudo-swarm; if coordination becomes necessary, route back to `planning` and `validating`.
- Never treat `STATE.md` as authoritative; update `state.json` first.
- Never mark work complete without a traceable completion note.
- Never auto-handoff to review without execution evidence and an `ALLOW` result from `beer-auto-accept.mjs --gate reviewing`.

## TDD Trigger

If the slice adds or changes behavior and a meaningful failing-test path exists,
invoke `beer:test-driven-development` before treating the implementation as
complete. For behavior-changing slices, record `tdd_required = true` in
`.beer/state.json`; after the RED/GREEN/REFACTOR loop, record
`tdd_status = complete` and `tdd_evidence_path`.

## State Contract

- `state.json` is authoritative.
- Record execution mode, active work item, verification status, and next handoff in `.beer/state.json`.
- Record TDD state for behavior changes: `tdd_required`, `tdd_status`, and `tdd_evidence_path`.
- Write execution evidence to `history/<feature>/execution-evidence.md` for every Beer route that reached approved execution.
- Store that path in `execution_evidence_path`.
- Regenerate `.beer/STATE.md` after `state.json` changes.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
- [TDD support](../../../support/test-driven-development/SKILL.md)
