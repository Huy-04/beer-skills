---
skill: planning
purpose: Route checks, commands, artifact depth, and approval rules
version: "1.0"
---

# planning - Quick Reference

## Route Selection

| Route | Use when | Depth |
|---|---|---|
| `feature` | Incoming `planning_route = feature` and locked `CONTEXT.md` exists | Full |
| `small-fix` | Incoming `planning_route = small-fix` and the work is still local, low ambiguity, likely under 3 files | Compact |
| `debug-escalation` | Incoming `planning_route = debug-escalation` and root cause is proven | Compact by default |

## Route Gates

### Feature

- `history/<feature>/CONTEXT.md` exists
- `.beer/state.json` has `context_stage = "locked"`

### Small Fix

- no new feature boundary
- no product decision needs locking
- bounded quick scout

### Debug Escalation

- root-cause sentence exists
- repair boundary is explicit
- not drifting into unrelated feature work

## Useful Commands

```powershell
Get-Content .beer\state.json
Get-Content history\<feature>\CONTEXT.md
if (Test-Path history\learnings\critical-patterns.md) { Get-Content history\learnings\critical-patterns.md }
node .beer\scripts\commands\beer-planning-gate.mjs --route feature
node .beer\scripts\commands\beer-auto-accept.mjs --gate planning --json
rg -n "<keyword>" .
rg --files | Select-Object -First 80
bd ready --json
```

## Artifact Depth

| Route | Always write | After approval |
|---|---|---|
| `feature` | `discovery.md`, `approach.md`, `phase-plan.md` | contract, story map, optional beads |
| `small-fix` | short `discovery.md`, short `approach.md`, single-phase `phase-plan.md` | optional compact contract |
| `debug-escalation` | debug-anchored `discovery.md`, repair `approach.md`, bounded `phase-plan.md` | optional compact contract |

All three routes write under the existing `history/<feature>/...` path from `.beer/state.json`.

## Bead Rule

Create beads only when:

- more than one worker-sized task remains,
- dependencies need to be explicit,
- direct execution would force guessing.

## Approval Rule

- Never create beads before approval.
- Never invent or reclassify the route inside `planning`.
- Auto-accept requires `beer-auto-accept.mjs --gate planning` to return `ALLOW`.
- `planning` always hands off to `beer:validating`.
