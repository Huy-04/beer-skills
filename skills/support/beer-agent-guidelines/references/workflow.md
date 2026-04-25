---
name: beer-agent-guidelines
description: Detailed workflow for syncing Karpathy-style coding guardrails into repo instruction files
version: "1.0.0"
---

# beer-agent-guidelines - Workflow Detail

## Purpose

Use this support skill to install or refresh concise Karpathy-style guardrails in `CLAUDE.md` and `AGENTS.md`. The result should look like a compact instruction payload, not a large workflow document.

## Phase 1: Read the Existing Instruction Surface

Start from the repo files that already shape agent behavior.

Capture:

- whether `CLAUDE.md` exists
- whether `AGENTS.md` exists
- whether either file already contains a Beer-managed guardrail block
- any project-specific rules that must survive untouched

Decision rule:

- Default to updating both files.
- If the user explicitly named only one file, honor that narrower target.
- If local repo instructions conflict with the canonical block, keep the local rules outside the managed block and report the conflict instead of silently rewriting it.

## Phase 2: Load the Canonical Guardrails

Use the reference templates shipped with this skill:

- `references/claude-template.md`
- `references/agents-template.md`

Those files are the source of truth for the installed content. Keep them compact and aligned with the four principles:

- think before coding
- simplicity first
- surgical changes
- goal-driven execution

Do not expand the installed block into a long Beer workflow explanation. The reference repo works because the instructions stay short enough to be read and applied repeatedly.

## Phase 3: Merge Surgically

When editing existing repo instructions, prefer a stable managed wrapper:

```md
<!-- beer-agent-guidelines:start -->
[canonical guardrail content]
<!-- beer-agent-guidelines:end -->
```

Rules:

- If the wrapper exists, replace only the block contents.
- If the wrapper does not exist, append the block after existing repo-specific instructions with a blank line separator.
- If the file does not exist, create it with the canonical content.
- Do not rewrite unrelated sections just to "make the file cleaner."

If the repo keeps both files, sync both in the same pass so future agents do not see divergent rules.

## Phase 4: Preserve Local Instructions

Preserve any local material that is not part of the managed block, including:

- project-specific coding conventions
- repo commands
- review rules
- deployment notes
- team-specific do and do not guidance

Do not absorb those rules into the canonical block unless the user explicitly asks for consolidation. This skill installs guardrails; it does not take ownership of the entire instruction file.

## Phase 5: Verify the Sync

Before handoff, confirm:

- the targeted files exist
- each targeted file contains the Beer-managed wrapper or the canonical content
- both files express the same four principles
- project-specific content outside the wrapper still exists
- the diff stayed limited to the instruction files requested or implied by the task

## Pressure Scenarios

Use these as fast checks while authoring or reviewing this skill.

### Scenario A: Current skill returns only an execution frame

Bad behavior:

- answer with assumptions / scope / verification only
- leave `CLAUDE.md` and `AGENTS.md` untouched

Correct behavior:

- treat the file edits as the primary deliverable
- report which instruction files changed

### Scenario B: Existing `CLAUDE.md` already contains repo rules

Bad behavior:

- replace the whole file with the canonical template

Correct behavior:

- preserve local rules outside the managed block
- replace only the Beer-managed section

### Scenario C: `AGENTS.md` is missing

Bad behavior:

- update only `CLAUDE.md` because it already exists

Correct behavior:

- create `AGENTS.md` from the canonical template unless the user limited the scope

### Scenario D: The installed block is bloated

Bad behavior:

- add a long Beer workflow manual and many examples

Correct behavior:

- compress the wording until it reads like a short behavioral policy

## Minimum Handoff Shape

Return:

- `Target files`
- `Created`
- `Updated`
- `Conflict notes`
- `Follow-up`

Keep the handoff short enough that the repo owner can see exactly what happened without rereading the full templates.
