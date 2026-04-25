---
name: beer-exploring
description: >
  This skill should be used when the user wants to build, add, change, or
  design a feature and important product or behavior decisions are still
  unlocked.
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
  inputs: "User request + optional `.beer/seed/` + a quick code scout"
  outputs: "`history/<feature>/CONTEXT.md` plus locked-context state updates"
  upstream: "context-intake in normal flow, or direct user invocation"
  downstream: "planning"
  dependencies: []
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

# exploring

Lock decisions after intake, before planning. Ask one question at a time, confirm what the user wants, and write the locked feature context.

## At a Glance

| | |
|---|---|
| **Use when** | Feature work, ambiguous change requests, or design decisions still need to be locked |
| **Skip when** | Small, local, low-ambiguity fixes that likely touch fewer than 3 files |
| **Consumes** | User request, optional `.beer/seed/`, quick repo evidence |
| **Produces** | `history/<feature>/CONTEXT.md` |
| **Next** | `beer:planning` |

## 30-Second Version

1. Treat `exploring` as the second phase after intake. If it is invoked with `context_stage = none`, bounce to `beer:context-intake` first.
2. Sanity-check for a misrouted direct fix before going deeper.
3. Classify scope as `quick`, `standard`, or `deep`.
4. Identify 2-4 gray areas that would force planning to guess.
5. Run Socratic dialogue with one question per message.
6. Lock only user-confirmed decisions in `CONTEXT.md`.
7. Ask for Gate 1 approval on the finished `CONTEXT.md`.
8. Update `.beer/state.json`, then regenerate `.beer/STATE.md`.

## Direct-Fix Exemption

Skip `exploring` when all of these are true:

- the task is local and low ambiguity,
- it is likely to touch fewer than 3 files,
- it does not introduce a new feature boundary,
- it does not need product or behavior decisions locked.

Examples:

- wrong type or format,
- tiny rename,
- obvious wiring fix,
- small bug fix with clear expected behavior.

If the exemption applies, route to `beer:planning` with `mode = small`.

## Scope and Ownership

- `exploring` owns user-facing decision locking and `history/<feature>/CONTEXT.md`.
- `context-intake` owns task intake, context recovery, and the first route decision between `planning` and `exploring`.
- `context-intake` owns inferred seed context in `.beer/seed/`.
- `planning` owns architecture synthesis, delivery breakdown, and beads.
- `exploring` may use seed inputs to ask better questions, but seed never becomes a locked decision by itself.

## Locked Decision Rules

- Only user-confirmed decisions become `D1`, `D2`, `D3`, and so on.
- If the user explicitly delegates an area, record that under `Agent Discretion`; do not silently promote seed assumptions into locked decisions.
- If seed or quick-scout evidence conflicts with the conversation, stop and clarify with the user.
- `exploring` is the only skill allowed to write `history/<feature>/CONTEXT.md`.

## Hard Rules

- Never ask more than one question in the same message.
- Never bypass `context-intake` in normal workflow.
- Never skip Socratic dialogue for feature work because the answer "seems obvious".
- Never hand off to `beer:planning` before Gate 1 approval is recorded.
- Never write code, propose libraries, or decompose execution work.
- Never create beads in this phase.
- Never treat `.beer/seed/` as locked context.
- Never let another skill write `history/<feature>/CONTEXT.md`.

## State Contract

- `state.json` is authoritative.
- After writing `CONTEXT.md`, set `context_stage = locked`, `context_path`, and `context_confidence = 1.0` in `.beer/state.json`.
- Set `approved_gates.context = false` while `CONTEXT.md` is waiting for Gate 1 approval.
- Set `approved_gates.context = true` only after Gate 1 approves the locked context for planning.
- After Gate 1 passes, set `next_handoff = beer:planning`.
- Regenerate `.beer/STATE.md` from `state.json`; do not treat `STATE.md` as the source of truth.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Context template](references/context-template.md)
- [Gray-area probes](references/gray-area-probes.md)
- [Pressure scenarios](references/pressure-scenarios.md)
