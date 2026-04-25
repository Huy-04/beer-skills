---
skill: prompt-leverage
purpose: Communication standards for transparent contextual prompt upgrades
version: "2.0"
---

# prompt-leverage - Communication Standards

## Upgrade Log Style

Keep upgrade logs short, explicit, and trustworthy.

Good:

```text
[UPGRADE] Contextual prompt built. Used README.md and `prompt-leverage/SKILL.md`. Raw request retained. Preserved commands, paths, skill IDs, and Beer artifacts. Final response language: Vietnamese/Chinese/English as requested.
```

Bad:

```text
[UPGRADE] Fully translated and transformed request.
```

## Transparency Rule

Say what context was used and what stayed unresolved:

```text
Context packet built from repo docs and mentioned skill files. `CONTEXT.md` was preserved as an artifact name but was not found as a local file.
```

State who should receive the result next:

```text
Return to: beer:<calling skill> | user
```

## Routing Safety Note

When handing off to `using-beer` or another skill, include:

```text
Route using both the raw request and contextual prompt. Do not route solely from the rewritten prompt if it narrows the user's original intent.
```

## Non-Negotiable Rule

Never imply that a command, file name, path, or Beer artifact was translated if it was preserved. Never imply that unresolved context was found.
