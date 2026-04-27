---
skill: validating
purpose: Route checks, validation depth, spike rules, and execution handoff
version: "1.0"
---

# validating - Quick Reference

## Route Depth

| Route | Required depth | Execution target rule |
|---|---|---|
| `feature` | Full validation | `swarming` only for a real parallel slice; otherwise direct `executing` |
| `feature + repair` | Compact when bounded, full when broad, always root-cause anchored | direct `beer:executing` by default; `swarming` only when the repair truly becomes multi-task |
| `small-fix` | Compact validation | direct `beer:executing` |

## Required Checks

### Feature

- current-slice clarity
- story coverage
- decision coverage
- dependency correctness
- file-scope isolation
- context budget
- verification completeness
- exit-state completeness

### Small Fix

- current-slice clarity
- bounded scope
- file-scope sanity
- verification completeness
- direct execution credibility
- `orchestration_strategy = single-worker`

### Feature Repair

- current-slice clarity
- root-cause coverage
- repair boundary integrity
- verification completeness
- execution credibility

### Multi-Worker Sanity

- worker-sized task boundaries are explicit
- dependency edges are explicit
- verification ownership is explicit
- `swarming` is chosen for a real parallel slice, not as a fallback for vague planning

### Pattern Readiness

- chosen implementation pattern is named
- evidence files are listed
- exact source facts for `executing` to re-check are explicit
- unverified pattern assumptions are called out
- generated `Docs/` verification targets are confirmed against source before approval

### Beer Skill / Workflow Changes

- validation gate names a concrete post-edit semantic agent validation plan
- final handoff or review includes executed semantic evidence or blocked/limited status
- prompt/task shape, expected route, allowed behavior, forbidden overreach, evidence, and cleanup are named
- routing or workflow-wide changes use representative route cases when route tables, defaults, gates, or shared behavior changed
- command tests remain required but do not prove agent behavior by themselves

## Useful Commands

```powershell
Get-Content .beer\state.json
if (Test-Path .beer\STATE.md) { Get-Content .beer\STATE.md }
if (Test-Path history\<feature>\compact-plan.md) { Get-Content history\<feature>\compact-plan.md }
if (Test-Path history\<feature>\phase-plan.md) { Get-Content history\<feature>\phase-plan.md }
if (Test-Path Docs\index.json) { Get-Content Docs\index.json }
rg -n "<keyword>" history\<feature>
bd ready --json
node .beer\scripts\commands\beer-auto-accept.mjs --gate validating --json
```

## Spike Rule

Run a spike only when a high-risk unknown still blocks safe execution.

## Approval Rule

- No approval -> no execution
- `approved_gates.phase_plan` must already be `true` before validation starts
- `approved_gates.execution` becomes `true` only after the execution gate passes
- Auto-accept requires `beer-auto-accept.mjs --gate validating` to return `ALLOW`
- validating proposes `swarming` vs direct `executing` based on the route and actual slice size, then approves that target through the execution gate
- `small-fix` is valid only when it arrived as a compact plan from upstream; validating does not invent the compact route locally
- `contract_verified = true` means the plan has enough contract, pattern, and verification detail for execution to proceed without guessing
- generated `Docs/` is read-only context; it cannot replace source-backed evidence
- Beer skill, workflow, or routing changes cannot pass with command tests only; semantic agent validation must be planned before execution and evidenced or marked blocked/limited before handoff
