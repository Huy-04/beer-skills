---
name: beer-swarming
description: >
  This skill should be used when `beer:validating` approved the current
  slice with `execution_target = swarming`, when the user asks to launch the
  swarm for a validated multi-worker slice, or when parallel execution must be
  coordinated across bounded workers.
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
      missing_effect: unavailable
    - id: bd
      kind: mcp_server
      server_names: [bd]
      missing_effect: unavailable
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Agent
  - TaskCreate
  - TaskUpdate
user-invocable: true
disable-model-invocation: false
---

# swarming

Coordinate parallel execution for a validated slice that actually needs worker
orchestration. `swarming` exists to manage concurrency, not to do the work.

## At a Glance

| | |
|---|---|
| **Use when** | `state.json` says `execution_target = swarming`, `approved_gates.execution = true`, and the slice has real parallel work |
| **Needs** | Validated current slice, ready work items, coordinator identity, and working coordination substrate |
| **Produces** | Active worker coordination, completed current slice, and a clean handoff |
| **Next** | `beer:planning` for the next phase, or `beer:reviewing` when the feature is done |

## 30-Second Version

1. Confirm the active slice was validated for `swarming`.
2. Confirm `approved_gates.execution = true` before launch.
3. Confirm the slice is still swarm-worthy and coordination tools are available.
4. Run `beer-auto-accept.mjs --gate swarming` when launch would auto-advance.
5. Initialize coordinator state and launch only the workers the slice actually needs.
6. Tend the swarm: monitor progress, resolve collisions, and surface blockers.
7. Close the slice only after the swarm finishes cleanly and execution evidence exists.
8. Hand off to `beer:planning` or `beer:reviewing`.

## Scope and Ownership

- `validating` decides whether the execution target is `swarming` or direct `executing`.
- `swarming` owns worker orchestration, active coordination, and phase-complete handoff.
- `executing` owns the actual implementation loop.
- `swarming` does not rewrite the plan, expand scope, or implement code directly.

## Readiness Contract

Use `swarming` only when all of the following are true:

- `.beer/state.json` records `phase = validating` or `phase = executing` with `execution_target = swarming`
- `.beer/state.json` records `approved_gates.execution = true`
- the current slice is approved
- at least two meaningful work items can proceed independently
- the coordinator can identify the next handoff target
- the coordination substrate is available and live enough for worker status and handoff messages

If those conditions are not met, stop and route back to `beer:validating` or
`beer:planning`. Do not fake a swarm for work that should run directly.

## Hard Rules

- Never invoke `swarming` for a route that validating approved for direct `executing`.
- Never launch a swarm when `approved_gates.execution` is still false.
- Never implement the slice directly as the orchestrator.
- Never silently continue when the coordination substrate is unavailable.
- Never auto-launch a swarm without an `ALLOW` result from `beer-auto-accept.mjs --gate swarming`.
- Never leave workers idle while ready work remains.
- Never expand the validated slice without routing back through `planning` and `validating`.
- Never treat `STATE.md` as authoritative; update `state.json` first.
- Never hand off without recording whether the next owner is `planning` or `reviewing`.

## State Contract

- `state.json` is authoritative.
- Record `phase`, `execution_target`, `swarm_status`, active workers, and next handoff target in `.beer/state.json`.
- Record aggregate worker evidence at `history/<feature>/execution-evidence.md` and store that path in `execution_evidence_path` before handing off to `reviewing`.
- Regenerate `.beer/STATE.md` after `state.json` changes.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
- [Worker bootstrap template](references/worker-template.md)
- [Message templates](references/message-templates.md)
