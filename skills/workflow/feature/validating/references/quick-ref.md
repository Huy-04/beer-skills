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
| `feature + repair` | Full validation + root-cause retention | direct `beer:executing` by default; `swarming` only when the repair truly becomes multi-task |
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

### Feature Repair

- current-slice clarity
- root-cause coverage
- repair boundary integrity
- verification completeness
- execution credibility

## Useful Commands

```powershell
Get-Content .beer\state.json
if (Test-Path .beer\STATE.md) { Get-Content .beer\STATE.md }
if (Test-Path history\<feature>\phase-plan.md) { Get-Content history\<feature>\phase-plan.md }
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
