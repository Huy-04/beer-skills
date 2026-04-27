---
name: context-intake
description: >
  This skill should be used when the user asks to "load context", "resume state",
  "recover handoff", "start from zero context", or otherwise needs Beer
  session context restored before routing.
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
  inputs: "User request + optional GitNexus readiness + optional `bd ready --json` + .beer/state.json + optional .beer/HANDOFF.json"
  outputs: "Recovered context from graph, resume state, loaded locked CONTEXT.md, or inferred `.beer/seed/` plus state.context_stage updates and an exploring handoff"
  upstream: "using-beer"
  downstream: "exploring"
  dependencies:
    - id: beads-cli
      kind: command
      command: bd
      missing_effect: degraded
    - id: gitnexus
      kind: mcp_server
      server_names: [gitnexus]
      missing_effect: degraded
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
user-invocable: true
disable-model-invocation: false
---

# context-intake

Recover current Beer task context before normal workflow. Prefer graph or saved state when available; otherwise gather enough signal to write inferred seed context in `.beer/seed/` and always hand work to `exploring`.

## At a Glance

| | |
|---|---|
| **Use when** | Starting or resuming Beer task work, recovering a handoff, checking state, or handling zero context before routing |
| **Needs** | Any of GitNexus, `bd`, `.beer/state.json`, `.beer/HANDOFF.json`, or manual repo inspection |
| **Produces** | Loaded graph/saved/locked context, resume prompt, or inferred `.beer/seed/` plus an exploring handoff |
| **Next** | `exploring` |

## 30-Second Version

1. Read preflight, `state.json`, and optional `HANDOFF.json`.
2. Prefer GitNexus when the server is ready and the repo is already indexed.
3. If saved state or active beads exist, use them only to recover context and present a resume prompt.
4. Prepare the request for `exploring`; do not skip past it.
5. If there is no usable context, gather context through research-only context scouts or direct scout passes.
6. Write inferred findings to `.beer/seed/` and mark `context_stage = seeded` when `exploring` needs context input.
7. Never write locked `CONTEXT.md`; `exploring` owns that promotion step.

## Scope and Ownership

- `context-intake` owns task intake, context recovery, context quality classification, scout-context gathering, `.beer/seed/`, and the handoff into `exploring`.
- `exploring` owns locked decisions and `history/<feature>/CONTEXT.md`.
- `planning` owns delivery beads, story/bead graphs, and execution decomposition.
- Scout beads are research-only context scouts. They are not delivery beads and must not be treated as phase execution work.
- Generated `Docs/` is an optional accelerator only. It never outranks locked context or direct repo evidence, and `context-intake` must not refresh it.
- Do not auto-resume from beads or `HANDOFF.json`; always ask the user first.
- `context-intake` does not choose execution target, worker topology, or review path.
- `context-intake` may preserve or confirm `route` and `work_intent`, but it must not silently expand scope or skip `exploring`.

## Context Paths

| Path | Use when | Output |
|---|---|---|
| GitNexus path | Server ready and repo indexed | Graph-backed context and relevant files |
| Resume and scout path | Saved state, active beads, or handoff exists; or `bd` can orchestrate research scouts | Resume prompt, loaded locked context, or seeded context |
| Degraded manual path | GitNexus and `bd` are unavailable or insufficient | Inferred `.beer/seed/` with confidence notes and gaps |

## Output Contract

Every successful run should leave one of these states:

- `context_stage = locked` after reading existing locked context.
- `context_stage = seeded` after writing inferred seed files.
- `context_stage = none` only when the user explicitly clears context or no context should be carried forward.

And it should leave this next-phase outcome:

- hand off to `beer:exploring` when normal task work continues.

If existing `.beer/seed/` conflicts with direct repo evidence:

- trust current repo evidence for analysis,
- treat the seed as stale inferred context,
- refresh the seed or route through `exploring` with a mismatch note,
- never treat the stale seed as locked context.

When writing `.beer/seed/`, include:

- `00-metadata.json` with source and confidence.
- `01-task.md`, `02-structure.md`, `03-conventions.md`, `04-relevant-files.md`.
- `05-gaps.md` when context is degraded or low confidence.
- enough scope signals that `exploring` can honestly re-check `small-fix` vs feature flow without treating seed as a locked route decision.

## Hard Rules

- Never skip context recovery.
- Never auto-resume from beads or `HANDOFF.json`.
- Never treat scout beads as delivery beads.
- Never let task intake drift into decision locking.
- Never let task intake drift into execution planning.
- Never write `history/<feature>/CONTEXT.md`.
- Never let `.beer/seed/` substitute for locked context.
- Never let stale seed context outrank direct repo evidence.
- Never treat generated `Docs/` as a source of truth.
- Never claim repo-wide certainty from a degraded or partial scan.
- Never hand work past `beer:exploring`.

## State Contract

- `state.json` is authoritative.
- `context-intake` may update `phase`, `active_skill`, `context_stage`, `seed_path`, `context_path`, `context_confidence`, `feature_slug` when known, and `next_handoff = beer:exploring`.
- `context-intake` may preserve or confirm `route` and `work_intent`, but it should not invent downstream execution details.
- `context-intake` must not set `orchestration_strategy`; that belongs to `planning` after `exploring` finishes the route boundary honestly.
- `context-intake` must not set `approved_gates.context = true`; only `exploring` may prepare that handoff for Gate 1 approval.
- `context-intake` must not set `approved_gates.phase_plan`, `approved_gates.execution`, or `approved_gates.review`.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication templates](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
