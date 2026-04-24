---
skill: exploring
purpose: Quick commands, artifacts, and locking patterns
version: "1.0"
---

# exploring - Quick Reference

## Misroute Check

Exit `exploring` and route to `beer:planning` when the request is:

- local,
- low ambiguity,
- likely under 3 files,
- not a new feature or scope-shaping change.

Normal workflow should reach this conclusion in `beer:context-intake` first.

## Scope Classification

| Type | When | Action |
|---|---|---|
| `quick` | Small feature with a few decisions | Short exploring pass |
| `standard` | Normal feature work | Full flow |
| `deep` | Cross-cutting or high ambiguity | Full flow with extra depth |

## Useful Commands

```powershell
Get-Content .beer\state.json
if (Test-Path .beer\seed\00-metadata.json) { Get-Content .beer\seed\00-metadata.json }
rg -n "<keyword>" .
rg --files | Select-Object -First 50
if (Test-Path history\learnings\critical-patterns.md) { Get-Content history\learnings\critical-patterns.md }
```

## Artifact Map

| Artifact | Path |
|---|---|
| Locked context | `history/<feature>/CONTEXT.md` |
| Seed context | `.beer/seed/` |
| Template | `references/context-template.md` |
| Gray-area probes | `references/gray-area-probes.md` |
| State source of truth | `.beer/state.json` |
| Derived state summary | `.beer/STATE.md` |

## Entry Contract

- Normal entry comes from `beer:context-intake`.
- If `context_stage = none`, bounce back to `beer:context-intake`.
- If `context_stage = seeded`, use seed as inferred input only.
- If `context_stage = locked`, confirm whether the user is refining the same feature or reopening decisions.

## Seed Read Order

When `context_stage = seeded`, read in this order:

1. `.beer/seed/00-metadata.json`
2. `.beer/seed/01-task.md`
3. `.beer/seed/04-relevant-files.md`
4. `.beer/seed/05-gaps.md` if present

Seed informs questions. It does not create locked decisions.

## Decision Formats

### Locked Decision

```text
Locking decision D{N}: [concrete summary]. Confirmed?
```

### Delegated Area

```text
Delegated area: [area]. Agent may choose within these constraints: [constraints].
```

## Handoff

```text
Decisions captured. CONTEXT.md written to `history/<feature>/CONTEXT.md`.
CONTEXT.md is now the single source of truth for downstream planning.
Invoke `beer:planning`.
```
