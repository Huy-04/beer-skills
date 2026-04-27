---
name: swarming
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
| **Use when** | `state.json` says `execution_target = swarming`, `approved_gates.execution = true`, `contract_verified = true`, and the slice has real parallel work |
| **Needs** | Verified current slice, worker boundaries from the validated artifacts, coordinator identity, and a working coordination substrate |
| **Produces** | Active worker coordination, completed current slice, and a clean handoff |
| **Next** | `beer:planning` for the next phase, or `beer:reviewing` when the feature is done |

## 30-Second Version

1. Confirm the active slice was validated for `swarming`.
2. Confirm `approved_gates.execution = true` before launch.
3. Confirm `contract_verified = true`; if it is false or missing, return to `beer:validating`.
4. Confirm the slice is still swarm-worthy and worker boundaries came from validated planning artifacts.
5. Confirm each worker assignment can carry the route artifact, implementation pattern, evidence files, source facts to re-check, verification target, and TDD disposition expectation.
6. Treat generated `Docs/` as read-only context; worker assignments may cite it only when they also require source re-checks.
7. Run `beer-auto-accept.mjs --gate swarming` when launch would auto-advance.
8. Run `beer orchestrate --apply` to materialize the coordinator/worker plan in `.beer/state.json`.
9. Run `beer worker-bootstrap --json` and use the generated assignments as the spawn-ready contract for workers.
10. Follow [Host Runtime Contract](../../../../docs/host-runtime-contract.md) when the runtime must actually launch and collect workers.
11. Tend the swarm: monitor progress, resolve collisions, and surface blockers.
12. Close the slice only after every required worker result records pattern/source-fact/TDD evidence, the swarm finishes cleanly, and aggregate execution evidence exists.
13. Hand off to `beer:planning` or `beer:reviewing`.

## Scope and Ownership

- `validating` decides whether the execution target is `swarming` or direct `executing`.
- `swarming` owns worker orchestration, active coordination, and phase-complete handoff.
- `executing` owns the actual implementation loop.
- `swarming` does not rewrite the plan, expand scope, or implement code directly.
- `swarming` chooses worker model profiles from Beer config; it does not hardcode one model for every worker.
- `swarming` may use beads when available, but Beer-owned runtime state is an acceptable substrate when the host runtime can still track assignments and worker results honestly.

## Readiness Contract

Use `swarming` only when all of the following are true:

- `.beer/state.json` records `phase = validating` or `phase = executing` with `execution_target = swarming`
- `.beer/state.json` records `approved_gates.execution = true`
- `.beer/state.json` records `contract_verified = true`
- the current slice is approved by the validated route artifact
- at least two meaningful work items from validated planning artifacts can proceed independently
- each worker assignment includes the route artifact, implementation pattern, evidence files, exact source facts to re-check, verification target, and TDD disposition expectation
- the coordinator can identify the next handoff target
- the coordination substrate is available and live enough for worker assignments, worker status, and handoff messages

If those conditions are not met, stop and route back to `beer:validating` or
`beer:planning`. Do not fake a swarm for work that should run directly.

## Hard Rules

- Never invoke `swarming` for a route that validating approved for direct `executing`.
- Never launch a swarm when `approved_gates.execution` is still false.
- Never launch a swarm when `contract_verified` is not true.
- Never implement the slice directly as the orchestrator.
- Never silently continue when the coordination substrate is unavailable.
- Never send a worker to code from a task label alone; every assignment needs the route artifact, implementation pattern, evidence files, and source facts to re-check.
- Never refresh generated `Docs/` inside a swarm or let workers treat Docs entries as source facts.
- Never auto-launch a swarm without an `ALLOW` result from `beer-auto-accept.mjs --gate swarming`.
- Never leave workers idle while ready work remains.
- Never expand the validated slice without routing back through `planning` and `validating`.
- Never treat `STATE.md` as authoritative; update `state.json` first.
- Never hand off without recording whether the next owner is `planning` or `reviewing`.
- Never pretend bead state exists when the host runtime is actually using Beer-owned worker artifacts instead.

## State Contract

- `state.json` is authoritative.
- Record `phase`, `execution_target`, `swarm_status`, active workers, and next handoff target in `.beer/state.json`.
- Record each active worker with the assigned role/profile when coordination tooling supports it.
- Keep a real worker lifecycle:
  - `queued`
  - `active`
  - `blocked`
  - `stalled`
  - `completed`
- Keep `active_workers[*].status` and `active_workers[*].notes` current enough
  that a resumed coordinator can tell whether each worker is active, complete,
  blocked, or stalled.
- Record worker assignment artifacts and per-worker result updates when the host runtime supports them, even if beads are absent.
- Record per-worker results with the implementation pattern followed, source facts re-checked, files changed, verification run, TDD disposition, blockers, and deviations from the approved artifact.
- Record aggregate worker evidence at `history/<feature>/execution-evidence.md` and store that path in `execution_evidence_path` before handing off to `reviewing`.
- Regenerate `.beer/STATE.md` after `state.json` changes.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
- [Worker bootstrap template](references/worker-template.md)
- [Message templates](references/message-templates.md)
