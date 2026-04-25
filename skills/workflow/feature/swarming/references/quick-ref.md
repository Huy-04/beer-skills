---
skill: swarming
purpose: Quick checks and coordinator reminders
version: "1.0"
---

# swarming Quick Reference

## Route Check

| Question | Required answer |
|---|---|
| What did validating approve? | `execution_target = swarming` and `approved_gates.execution = true` |
| Why not direct executing? | At least two independent work items justify coordination |
| What is the next owner after this slice? | `planning` or `reviewing` |

## Minimum Inputs

- `.beer/state.json`
- current phase contract
- `history/<feature>/CONTEXT.md`
- ready work-item list or bead list
- worker bootstrap note
- auto-accept policy result when launch is automatic
- `beer orchestrate --apply --json`
- `beer worker-bootstrap --json`

## Coordinator Checklist

- confirm route is really `swarming`
- confirm worker count is proportional
- confirm worker scope is bounded
- confirm each worker profile matches the task shape
- confirm blockers surface quickly
- confirm `state.json` stays authoritative
- confirm handoff target is explicit
- write aggregate worker evidence before review handoff

## Fast Decisions

| Situation | Action |
|---|---|
| Only one real task remains | route back to direct `executing` |
| Coordination tools missing | stop and return to validating |
| Auto-launch requested | run `beer-auto-accept.mjs --gate swarming` first |
| Worker blocked by new decision | escalate; do not guess |
| File collision between workers | resolve ownership before work continues |
| Scope unexpectedly expands | return to planning/validating |

## One-Line Reminder

`swarming` coordinates. `executing` implements.
Coordinator profile stays `orchestrator`; workers should use the resolved `coding` or `research_synthesis` profile as appropriate.

## Evidence Reminder

Before handing off to `reviewing`, set `execution_evidence_path` to the aggregate worker evidence file.
Use `history/<feature>/execution-evidence.md`.
