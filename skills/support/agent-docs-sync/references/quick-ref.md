---
name: agent-docs-sync
description: Quick reference for CLAUDE.md and AGENTS.md injection workflow
version: "1.0.0"
---

# agent-docs-sync - Quick Reference

## Target File Paths

| File | Default Location | Notes |
|---|---|---|
| `CLAUDE.md` | Repo root | Global Claude Code context |
| `AGENTS.md` | Repo root or `.claude/` | Agent-specific rules |

## Pre-Edit Checklist

- [ ] Read the entire target file before editing
- [ ] Identify existing behavioral sections
- [ ] Note project-specific rules to preserve
- [ ] Confirm target when both `CLAUDE.md` and `AGENTS.md` exist and the request is ambiguous
- [ ] Treat `AGENTS.md` as high-priority agent instructions
- [ ] Filter out secrets, transient Beer state, logs, and local machine details

## Merge Checklist

- [ ] Compare new guidelines against existing content
- [ ] Skip exact duplicates
- [ ] Surface conflicts instead of silently overwriting
- [ ] Exclude `.beer/state.json`, `.beer/HANDOFF.json`, active session IDs, execution evidence, temp/cache paths, and run logs
- [ ] Insert into existing behavioral section when possible
- [ ] Append with clear header if no section exists
- [ ] Match heading level, tone, and formatting of surrounding content

## Post-Edit Verification

- [ ] Read the modified file back
- [ ] Spot-check that original content is intact
- [ ] Confirm no duplicate sections
- [ ] Validate markdown formatting
- [ ] Confirm no secrets, tokens, env values, credentials, stale handoff state, or personal absolute paths were added

## Conflict Resolution

| Situation | Action |
|---|---|
| Exact duplicate | Skip |
| Minor overlap | Merge wording |
| Direct contradiction | Stop and ask user |
| Ambiguous overlap | Stop and ask user |

## Anti-Patterns to Block

- Overwrite entire file
- Blind append without reading
- Change file style to personal preference
- Persist transient Beer state as durable instructions
- Copy secrets, env values, command logs, or personal machine paths into agent docs
- Skip verification readback
