---
name: beer-agent-guidelines
description: Communication templates for syncing execution guardrails into repo instruction files
version: "1.1.0"
---

# beer-agent-guidelines - Communication Templates

## Sync Summary

```text
Execution guardrails synced.

Target files:
- [CLAUDE.md]
- [AGENTS.md]

Sync method:
- [manual instruction-only sync | Beer managed refresh/install/update]

Created:
- [file or none]

Updated:
- [file or none]

Managed block:
- [added | replaced | created]

Extra managed surfaces touched:
- [none | skills/hooks/config refreshed because full managed refresh was requested]
```

## Managed Block Note

```text
I kept project-specific instructions outside the managed block and only replaced:

- <!-- beer-agent-guidelines:start -->
- <!-- beer-agent-guidelines:end -->
```

## Create Missing Peer File

```text
`[existing file]` already existed, but `[missing file]` did not.

I used the canonical template to create `[missing file]` so both instruction surfaces now carry the same guardrails.
```

## Conflict Note

```text
I found a local instruction that overlaps with the canonical guardrails:

- [local rule]

I preserved it outside the managed block instead of silently rewriting it.
```

## Narrow Scope Confirmation

```text
You asked for guardrails only in `[single file]`, so I left the other instruction file unchanged.
```

## Instruction-Only Scope Note

```text
I did not run a full Beer refresh for this instruction-only sync. Only the requested instruction files changed.
```

## Canonical Block Reminder

```text
The managed block should stay concise:

- concise principles
- short bullets
- no workflow sprawl
```
