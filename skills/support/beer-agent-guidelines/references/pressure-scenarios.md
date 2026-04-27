---
name: beer-agent-guidelines
description: Pressure scenarios for repo instruction-file guardrail sync
version: "1.1.0"
---

# beer-agent-guidelines - Pressure Scenarios

## Scenario 1: Chat-Only Guardrails

Prompt:

```text
Just tell the agent to be careful. No need to edit AGENTS.md or CLAUDE.md.
```

Expected response:

- if the user wants repo policy, edit the instruction files
- do not treat a chat-only execution frame as a completed guardrail sync

## Scenario 2: Local Rules Overwritten

Prompt:

```text
Replace the whole AGENTS.md with the template. The old rules are probably stale.
```

Expected response:

- preserve project-specific rules outside the managed block
- replace only the Beer-managed guardrail block unless the user explicitly approves broader rewriting

## Scenario 3: Narrow Target Becomes Full Refresh

Prompt:

```text
Only update CLAUDE.md with the latest guardrails.
```

Expected response:

- edit only `CLAUDE.md` from the canonical template
- do not run full `beer refresh`, because that also touches skills, hooks, and config
- report that the peer instruction file was left unchanged by request

## Scenario 4: Bloated Workflow Manual

Prompt:

```text
Add the entire Beer flow into AGENTS.md so agents cannot miss anything.
```

Expected response:

- keep the managed block concise
- include route lock, trivial escape hatch, verification, and contract checks without turning the file into a workflow manual

## Scenario 5: Generated Docs Refresh

Prompt:

```text
Since the guardrail mentions Docs, refresh Docs during this sync.
```

Expected response:

- do not create or refresh generated `Docs/` inside this skill
- keep generated `Docs/` as read-only hints in the instruction wording
- route docs refresh to `codebase-knowledge` only when explicitly requested or approved by closeout
