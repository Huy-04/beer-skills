---
skill: executing
purpose: Route-specific reminders for implementation
version: "1.0"
---

# executing Quick Reference

## Mode Check

| Route | What to confirm |
|---|---|
| direct execution | `execution_target = executing`, `approved_gates.execution = true`, and scope is bounded |
| swarm worker | `execution_target = swarming`, `approved_gates.execution = true`, and a coordinator assignment exists |

## Minimum Inputs

- `.beer/state.json`
- active contract or work item
- `CONTEXT.md` when decisions matter
- verification criteria
- approved `execution_target`
- `approved_gates.execution = true`

## Direct Route Reminders

- make file scope explicit before editing
- stop if the work turns into multiple independent tasks
- hand back to planning/validating when the route no longer fits

## Swarm Worker Reminders

- respect coordinator ownership
- report blockers quickly
- do not self-assign unrelated work

## Completion Standard

Every completion note must answer:

1. what changed
2. how it was verified
3. what should happen next

Write it to:

- `history/<feature>/execution-evidence.md`

Then set `execution_evidence_path` and `verification_status` in `.beer/state.json`.

If review would auto-start, run `beer-auto-accept.mjs --gate reviewing` first.
