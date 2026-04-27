---
skill: executing
purpose: Route-specific reminders for implementation
version: "1.0"
---

# executing Quick Reference

## Execution Path Check

| Route | What to confirm |
|---|---|
| direct execution | `execution_target = executing`, `approved_gates.execution = true`, and scope is bounded |
| swarm worker | `execution_target = swarming`, `approved_gates.execution = true`, and a coordinator assignment exists |

Both routes require `contract_verified = true`.

## Minimum Inputs

- `.beer/state.json`
- `compact-plan.md`, current phase contract, or coordinator assignment
- `CONTEXT.md` when decisions matter
- implementation pattern and evidence files
- exact source facts to re-check before coding
- verification criteria
- approved `execution_target`
- `approved_gates.execution = true`
- `contract_verified = true`

## Pattern Re-Check

- open the evidence files named by planning
- verify exact constructors, factories, events, DTOs, commands, value objects, enum/string shapes, and namespace/module targets
- stop if source facts contradict the plan
- do not code from a pattern name alone
- generated `Docs/` is read-only context; do not refresh it during execution

## Direct Route Reminders

- make file scope explicit before editing
- stop if the work turns into multiple independent tasks
- hand back to planning/validating when the route no longer fits

## Swarm Worker Reminders

- respect coordinator ownership
- report blockers quickly
- do not self-assign unrelated work
- update the worker-result record before claiming the assignment is done
- keep worker status explicit: `active`, `blocked`, `stalled`, or `completed`

## Completion Standard

Every completion note must answer:

1. what changed
2. which route artifact and implementation pattern were followed
3. which source facts were re-checked
4. how it was verified
5. TDD disposition
6. what should happen next

Write it to:

- `history/<feature>/execution-evidence.md`

Then set `execution_evidence_path` and `verification_status` in `.beer/state.json`.

If review would auto-start, run `beer-auto-accept.mjs --gate reviewing` first.

Direct execution may hand off to review.
Swarm-worker execution reports back to the coordinator; it does not self-advance the whole workflow.
