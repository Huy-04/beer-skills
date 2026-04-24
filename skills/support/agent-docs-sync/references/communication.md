---
name: agent-docs-sync
description: Communication templates for CLAUDE.md and AGENTS.md injection handoffs and conflict reports
version: "1.0.0"
---

# agent-docs-sync - Communication Templates

## Clean Merge Handoff

```text
Updated <file-path>.

Injected guidelines:
- <guideline 1>
- <guideline 2>

Preserved existing content:
- <section 1>
- <section 2>

Filtered out:
- <transient state/secrets/local paths/logs, or "none">

No conflicts detected. File is ready.
```

## Conflict Report

```text
Updated <file-path> with new guidelines, but one conflict requires your input:

Existing rule: "<verbatim existing text>"
Incoming guideline: "<verbatim new text>"

Resolution options:
1. Keep existing rule, skip incoming guideline.
2. Replace existing rule with incoming guideline.
3. Rewrite both into a merged rule.

Reply with 1, 2, 3, or a custom rewrite.
```

## Multi-File Handoff

```text
Updated <N> context files:

<file 1>
  Injected: <count> guidelines
  Preserved: <summary>

<file 2>
  Injected: <count> guidelines
  Preserved: <summary>

All files verified. No conflicts.
```

## Ambiguous Target Prompt

```text
I found both CLAUDE.md and AGENTS.md. AGENTS.md is a high-priority agent instruction file. Which file should receive the new guidelines, or should I update both?
```

## Unsafe Content Report

```text
I did not add the following content to <file-path> because it is transient or unsafe for durable agent instructions:

- <.beer state / active handoff / command log / secret / local path>

Send a durable rewrite if this should become a project rule.
```

## File Not Found / Creation

```text
<file-path> did not exist. Created it with the requested guidelines.

If this file should live elsewhere (e.g., .claude/AGENTS.md), let me know and I will move it.
```
