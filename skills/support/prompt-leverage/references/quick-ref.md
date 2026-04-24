---
skill: prompt-leverage
purpose: Escape commands, script usage, and context-preservation rules
version: "2.0"
---

# prompt-leverage - Quick Reference

## Escape Commands

| Command | Effect |
|---|---|
| `/raw [request]` | Skip upgrade entirely |
| `/light [request]` | Force light depth |
| `/standard [request]` | Force standard depth |
| `/deep [request]` | Force deep depth |

## Script

```bash
node skills/support/prompt-leverage/scripts/augment-prompt.mjs "your prompt"
node skills/support/prompt-leverage/scripts/augment-prompt.mjs --prompt-only "your prompt"
node skills/support/prompt-leverage/scripts/augment-prompt.mjs --format json "your prompt"
node skills/support/prompt-leverage/scripts/augment-prompt.mjs --repo-root /path/to/repo "your prompt"
```

The script builds a context packet. It does not classify the task by keyword.
In PowerShell, use single quotes when the prompt contains backticks so preserved ids survive shell parsing.

## Context Rules

- preserve Beer terms and identifiers exactly
- preserve file names, paths, commands, flags, env vars, and code blocks
- use local files as evidence
- mark unresolved file/path mentions as unknowns
- ask up to 3 questions only when critical context is missing
- carry working/output language intent exactly as defined in `references/language-policy.md`

## Good Upgrade Pattern

User:

```text
kiem tra prompt-leverage va giai thich bang tieng viet, giu `beer:planning` va `CONTEXT.md`
```

Contextual prompt should include:

- context from `prompt-leverage/SKILL.md`
- preservation of `beer:planning` and `CONTEXT.md`
- final response language: Vietnamese
- unknowns if the target file/skill cannot be resolved

## Bad Upgrade Pattern

Bad output:

```text
Inspect the planning skill, rename CONTEXT.md into a Vietnamese equivalent, and reply however seems natural.
```

## Downstream Contract

`prompt-leverage` should hand downstream skills:

- the raw user request, unchanged
- the contextual prompt
- a clearer objective
- grounded local context
- preserved technical terms
- explicit unknowns or assumptions
- explicit response-language intent when needed
- suggested downstream route only when the raw request and context support it

## Language Policy

- Use `references/language-policy.md` for multilingual preservation, glossary choices, and output-language decisions.
- Do not translate Beer artifacts, file paths, commands, or skill ids while upgrading the prompt.
