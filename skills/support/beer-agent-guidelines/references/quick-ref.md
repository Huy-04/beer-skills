---
name: beer-agent-guidelines
description: Fast checklist for installing Karpathy-style execution guardrails into repo instruction files
version: "1.1.0"
---

# beer-agent-guidelines - Quick Reference

## Invoke When

- the user wants Karpathy-style rules installed in the repo
- `CLAUDE.md` or `AGENTS.md` should be created or refreshed
- repo instruction files drifted and need one canonical guardrail block
- the current skill is too abstract and does not change repo behavior

## Default Targets

| File | Source |
|---|---|
| `CLAUDE.md` | `references/claude-template.md` |
| `AGENTS.md` | `references/agents-template.md` |

## Merge Rule

Use or insert:

```md
<!-- beer-agent-guidelines:start -->
[canonical content]
<!-- beer-agent-guidelines:end -->
```

- replace the block if present
- append the block if missing
- create the file if it does not exist
- preserve local rules outside the block
- if the user names only one file, edit only that file from its template
- do not run full `beer refresh` for an instruction-only request

## Canonical Principles

- think before coding
- simplicity first
- surgical changes
- goal-driven execution
- contract verification before coding against source shapes
- generated `Docs/` are hints, not authority

## Smell Test

- returned only an execution frame
- rewrote the whole file
- updated one instruction file and forgot the other
- turned the block into a workflow manifesto
- deleted project-specific rules during sync
- changed `.beer/state.json`, generated `Docs/`, hooks, or skill installs for a narrow instruction-file request

## Good Default Output

- target files
- sync method
- created vs updated
- managed block added vs replaced
- extra managed surfaces touched, normally none
- any surviving local conflict
