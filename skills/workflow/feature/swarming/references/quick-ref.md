---
skill: swarming
purpose: Quick checks and coordinator reminders
version: "1.0"
---

# swarming Quick Reference

## Route Check

| Question | Required answer |
|---|---|
| What did validating approve? | `execution_target = swarming`, `approved_gates.execution = true`, and `contract_verified = true` |
| Why not direct executing? | At least two independent work items justify coordination |
| What is the next owner after this slice? | `planning` or `reviewing` |

## Minimum Inputs

- `.beer/state.json`
- `contract_verified = true`
- current route artifact: `compact-plan.md`, phase contract, or validated coordinator assignment
- `history/<feature>/CONTEXT.md`
- ready work-item list or bead list
- worker bootstrap note with implementation pattern, evidence files, source facts to re-check, verification target, and TDD disposition expectation
- auto-accept policy result when launch is automatic
- `beer orchestrate --apply --json`
- `beer worker-bootstrap --json`

## Coordinator Checklist

- confirm route is really `swarming`
- confirm `contract_verified = true`
- confirm worker count is proportional
- confirm worker scope comes from validated planning artifacts
- confirm each worker payload includes route artifact, pattern, evidence files, source facts, verification target, and TDD expectation
- confirm any generated `Docs/` hint remains read-only and is paired with source facts to re-check
- confirm each worker profile matches the task shape
- confirm worker-result ingestion is real, not implied
- confirm worker results include pattern followed, source facts re-checked, TDD disposition, and deviations
- confirm blockers surface quickly
- confirm `state.json` stays authoritative
- confirm handoff target is explicit
- write aggregate worker evidence before review handoff

## Fast Decisions

| Situation | Action |
|---|---|
| Only one real task remains | route back to direct `executing` |
| `contract_verified` is false or missing | return to validating |
| Worker assignment lacks pattern/source facts/evidence files | return to planning or validating before launch |
| Worker assignment treats generated `Docs/` as source facts | return to validating before launch |
| Coordination tools missing | stop and return to validating |
| Beads unavailable but Beer-owned worker state is honest | proceed only if assignments and worker results can still be tracked explicitly |
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
It must include route artifact used, implementation pattern followed, source
facts re-checked, files touched, verification run, TDD disposition, deviations,
and unresolved limitations for each worker.
Do not rely on memory-only swarm completion.
