---
name: agent-docs-sync
description: >
  This skill should be used when the user asks to "update CLAUDE.md", "edit AGENTS.md",
  "sync agent docs", "inject guidelines", "update project context", or "manage agent rules".
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  tags:
    - beer/support
    - context-management
  dependencies: []
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
user-invocable: true
disable-model-invocation: false
---

# agent-docs-sync

Surgically inject or update behavioral guidelines into CLAUDE.md and AGENTS.md without destroying existing project-specific rules.

---

## At a Glance

| | |
|---|---|
| **Use when** | User wants to add, update, or merge behavioral guidelines into CLAUDE.md or AGENTS.md |
| **Needs** | Source guidelines and target context file paths |
| **Produces** | Surgically updated context file with merged guidelines and preserved project rules |
| **Next** | `beer:writing-beer-skills` if the guidelines themselves need authoring, or user handoff |

---

## 30-Second Version

1. **Discover targets**: Find existing `CLAUDE.md` and `AGENTS.md` in the project.
2. **Read before touching**: Read the full content of every target file before editing.
3. **Filter unsafe content**: Exclude secrets, local machine data, transient Beer state, logs, and one-off session handoffs.
4. **Surgical merge**: Compare new guidelines against existing content. Append, insert, or update sections. Never overwrite project-specific rules.
5. **Match existing style**: Preserve the tone, formatting, and section structure of the target file.
6. **Verify output**: Read the modified file back and confirm the merge is clean and complete.
7. **Report handoff**: State what was added, what was preserved, and what file changed.

---

## Core Workflow

### Capability First

- Make agent docs materially better when the user asks: merge clear rules, remove duplication, align wording, and preserve project-specific intent.
- Read broadly enough to understand existing instruction hierarchy before editing.
- Prefer a clean durable instruction over a literal paste of transient notes.

### Ownership Boundary

- This skill owns discovery, classification, merge strategy, and verification for `CLAUDE.md` and `AGENTS.md` updates.
- The calling workflow or user owns the actual guideline content when that content still needs to be authored or decided.
- This skill may create or update the target doc files, but it does not invent new behavioral policy when the incoming rule is ambiguous or conflicting.

### Phase 1: Discover Targets

- Search for existing context files:
  - `CLAUDE.md` in repo root
  - `AGENTS.md` in repo root or `.claude/`
- If a target file does not exist, create it at the canonical location.
- If the user does not specify a target, default to `CLAUDE.md` in the repo root.
- If the user says "agent docs" and both `CLAUDE.md` and `AGENTS.md` exist, confirm whether to update one or both before editing.

### Phase 2: Read Before Touching

- Read the entire target file before making any edit.
- Capture:
  - Existing behavioral guidelines
  - Project-specific rules or constraints
  - Section structure and heading levels
  - Tone and formatting style
- Do not skip this step. Guessing existing content leads to duplication or data loss.

### Phase 3: Surgical Merge

- Compare the new guidelines against the existing file content.
- If a guideline already exists in similar form, do not duplicate it.
- If a guideline conflicts with an existing rule, surface the conflict to the user and ask for resolution.
- If the existing file has a clear section for behavioral rules, insert the new guidelines there.
- If no behavioral section exists, append new guidelines at the end of the file, separated by a clear header.
- Never remove project-specific rules, custom constraints, or team conventions unless the user explicitly asks.

### Safety Boundaries

- `AGENTS.md` is a high-priority agent instruction file. Treat changes there as behavioral instruction changes, not casual notes.
- Convert transient Beer state such as `.beer/state.json`, `.beer/HANDOFF.json`, active bead/session IDs, current execution evidence, temporary cache paths, or local run logs into durable guidance only when there is a real reusable rule.
- Filter secrets, tokens, credentials, `.env` values, personal machine paths, or one-off branch/worktree details unless the user explicitly asks and the content is safe.
- If incoming content looks like copied command output, a handoff snapshot, or current branch-only state, exclude it or ask for a durable rewrite.

### Phase 4: Match Existing Style

- Use the same heading level and formatting as surrounding sections.
- Mirror the existing tone: if the file uses imperative lists, continue using imperative lists.
- If the file uses prose paragraphs, write new guidelines in prose paragraphs.
- Do not introduce a new formatting style unless the existing file is empty.

### Phase 5: Verify Output

- Read the modified file back after writing.
- Confirm:
  - New guidelines are present.
  - Existing project rules are intact.
  - No duplicate sections were created.
  - File formatting is valid markdown.
  - No secrets, tokens, env values, credentials, transient Beer state, stale handoff state, command logs, or personal machine paths were added.
- If verification fails, fix the issue before handoff.

### Phase 6: Report Handoff

- State which files were modified.
- List what guidelines were injected or updated.
- Confirm what existing content was preserved.
- Flag any conflicts that require user resolution.
- State whether unsafe/transient content was filtered out.

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|---|---|
| Overwrite the entire file | Destroys project-specific rules and team conventions |
| Blind append without reading | Creates duplicate sections and conflicting rules |
| Change file style to personal preference | Breaks consistency with existing context |
| Persist transient Beer state or secrets | Turns short-lived execution context into durable agent instructions |
| Skip verification | Silent data loss or formatting corruption goes unnoticed |

---

## Key References

- [Workflow detail](references/workflow.md) - Full discovery, merge, and verification sequence
- [Quick reference](references/quick-ref.md) - File paths, checklist, and conflict resolution
- [Communication templates](references/communication.md) - Handoff message formats and conflict reports
- [beer:writing-beer-skills](../../meta/writing-beer-skills/SKILL.md) - Use when the guidelines themselves need to be authored as a Beer skill
