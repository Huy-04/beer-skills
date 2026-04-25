---
skill: context-intake
purpose: Quick commands, path checks, and seed-file checklist
version: "1.0"
---

# context-intake - Quick Reference

## Authority Rules

- Prefer existing locked context over any inferred source.
- Treat `.beer/seed/` as inferred only.
- Treat `.beer/knowledge-base/` as an optional accelerator only.
- Use scout beads for context gathering only, never for delivery decomposition.
- Never auto-resume from beads or `HANDOFF.json`.
- Decide the next phase deliberately: `planning` for bounded work, `exploring` for unlocked decisions.

## Core Checks

```powershell
node scripts/commands/beer-preflight.mjs --json
if (Test-Path .beer/state.json) { Get-Content .beer/state.json } else { "No state.json" }
if (Test-Path .beer/HANDOFF.json) { Get-Content .beer/HANDOFF.json } else { "No HANDOFF.json" }
bd ready --json
```

## GitNexus Path

Use when the repo is already indexed and the server is ready.

Typical queries:

```text
mcp__gitnexus__list_repos
mcp__gitnexus__query "Find entry points for [feature]"
mcp__gitnexus__query "Find existing [pattern] implementations"
mcp__gitnexus__cypher "MATCH ..."
```

If the repo is not indexed:

- record degraded workflow status,
- do not auto-index here,
- continue to resume or scout path.

## Resume and Context Scout Path

Resume signals:

```powershell
bd ready --json
if (Test-Path .beer/HANDOFF.json) { Get-Content .beer/HANDOFF.json }
```

Research-only scout bead examples:

```text
bd create "Scout: map structure" -t task -p 1 --notes="Gather folder and module context"
bd create "Scout: read conventions" -t task -p 1 --notes="Read AGENTS, README, critical patterns"
bd create "Scout: relevant files" -t task -p 1 --notes="Find likely files for [feature]"
bd create "Scout: write seed" -t task -p 1 --notes="Synthesize findings into .beer/seed/"
```

Scout bead rule:

- output must be `.beer/seed/`
- output must not be a delivery plan

## Degraded Manual Path

```powershell
Get-ChildItem -Force
rg --files -g "README.md" -g "AGENTS.md" -g "package.json" -g "pyproject.toml" -g "go.mod"
rg -n "<user keyword>" .
rg --files | Select-Object -First 50
```

Read:

1. README / AGENTS
2. one manifest
3. 3-5 representative files
4. request-adjacent files

## Seed Folder Contract

Required files:

- `.beer/seed/00-metadata.json`
- `.beer/seed/01-task.md`
- `.beer/seed/02-structure.md`
- `.beer/seed/03-conventions.md`
- `.beer/seed/04-relevant-files.md`

Add `.beer/seed/05-gaps.md` when confidence is degraded or low.

## State Outcomes

| Context found | State change |
|---|---|
| Locked `CONTEXT.md` | `context_stage = locked` |
| Inferred `.beer/seed/` | `context_stage = seeded` |
| Explicit clear/new session | `context_stage = none` |

## Route Outcomes

| Situation | Next phase |
|---|---|
| Bounded task, context already sufficient | `beer:planning` |
| Seeded or partial context, decisions still unlocked | `beer:exploring` |
| Existing locked context and no decision reopen | `beer:planning` |

## Quality Checklist

- [ ] Preflight checked
- [ ] `state.json` checked
- [ ] `HANDOFF.json` checked if present
- [ ] Resume prompt shown before any resume
- [ ] Scout path kept research-only
- [ ] `.beer/seed/` written when context is inferred
- [ ] `05-gaps.md` written for degraded context
- [ ] Locked context never overwritten

## Red Flags

| Flag | Action |
|---|---|
| Auto-resume temptation | Stop and ask user |
| Scout beads drifting into planning | Stop and relabel as context-only |
| Seed treated as locked context | Route to `beer:exploring` |
| GitNexus unavailable | Continue with Path 2 or 3 |
| Repo not indexed | Degrade cleanly; do not auto-index here |
