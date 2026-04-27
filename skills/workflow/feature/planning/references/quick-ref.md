---
skill: planning
purpose: Route checks, commands, artifact depth, and approval rules
version: "1.0"
---

# planning - Quick Reference

## Route Selection

| Route | Use when | Depth |
|---|---|---|
| `feature` | Incoming `route = feature` and locked `CONTEXT.md` exists | Full |
| `feature + repair` | Incoming `route = feature`, `work_intent = repair`, and root cause is proven | Compact when bounded; full only when it crosses feature or architecture boundaries |
| `small-fix` | Incoming `route = small-fix` and the work is still local, low ambiguity, likely under 3 files | Compact |

## Route Gates

### Feature

- `history/<feature>/CONTEXT.md` exists
- `.beer/state.json` has `context_stage = "locked"`

### Small Fix

- no new feature boundary
- no product decision needs locking
- bounded quick scout

### Feature Repair

- root-cause sentence exists
- repair boundary is explicit
- not drifting into unrelated feature work
- if public contracts or legacy paths change, the compatibility shim, migration path, or explicit breaking boundary is stated
- if a backend boundary changes, contract shape plus idempotency/retry/timeout obligations are stated

## Useful Commands

```powershell
Get-Content .beer\state.json
Get-Content history\<feature>\CONTEXT.md
if (Test-Path history\learnings\critical-patterns.md) { Get-Content history\learnings\critical-patterns.md }
if (Test-Path Docs\index.json) { Get-Content Docs\index.json }
if (Test-Path Docs\Flows\repo-flow.md) { Get-Content Docs\Flows\repo-flow.md }
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
| `feature + repair` | `compact-plan.md` for bounded repair, or debug-anchored `discovery.md` / `approach.md` / `phase-plan.md` when broad | optional compact contract |
| `small-fix` | `compact-plan.md` | optional compact contract only when validating/executing needs more scope detail |

All three routes write under the existing `history/<feature>/...` path from `.beer/state.json`.

## Bead Rule

Create beads only when:

- more than one worker-sized task remains,
- dependencies need to be explicit,
- direct execution would force guessing.

If `orchestration_strategy = multi-worker`, record worker-sized task boundaries and verification ownership even when you do not create beads.
On the `small-fix` route, that signal means the route should be rejected and
escalated instead of creating beads inside compact planning.
On the `small-fix` route, planning confirms the incoming `single-worker`
constraint still holds; it does not reclassify the route into a worker strategy.
If the work is refactor or modernization, also record the compatibility path or explicit breaking boundary before handoff.
If the work changes an API, webhook, consumer, or integration surface, also record contract shape and idempotency/retry/timeout obligations before handoff.

## Approval Rule

- Never create beads before approval.
- Never invent or reclassify the route inside `planning`.
- Never treat generated `Docs/` as source of truth; use it only for pattern, flow, and verification-target hints that source confirms.
- Auto-accept requires `beer-auto-accept.mjs --gate planning` to return `ALLOW`.
- `planning` always hands off to `beer:validating`.
