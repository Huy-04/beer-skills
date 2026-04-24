---
name: agent-docs-sync
description: Detailed workflow for surgically injecting behavioral guidelines into CLAUDE.md and AGENTS.md
version: "1.0.0"
---

# agent-docs-sync - Workflow Details

## Overview

This workflow turns a guideline-injection request into a clean, verified merge that preserves project-specific context in CLAUDE.md and AGENTS.md.

The quality bar is:

- The target file contains the new guidelines.
- The target file still contains all original project-specific rules.
- No duplicate sections exist.
- The file formatting remains valid and consistent.

## Phase 1: Discover Targets

### Step 1.1: Scan for Existing Files

Run discovery in this order:

1. `CLAUDE.md` in repo root
2. `AGENTS.md` in repo root or `.claude/AGENTS.md`
3. Any path explicitly provided by the user

If a file is missing, note it. The user may want it created.

### Step 1.2: Confirm Target with User (When Ambiguous)

If both files exist and the user did not specify a target, ask:

> "I found CLAUDE.md and AGENTS.md. Which file should receive the new guidelines, or should I update both?"

If the user says "both," process each file sequentially.

If the user says "agent docs" or similar and both `CLAUDE.md` and `AGENTS.md` exist, treat that as ambiguous. `AGENTS.md` is a high-priority agent instruction file, so confirm before updating both.

## Phase 2: Read Before Touching

### Step 2.1: Full File Read

Read the entire target file. Do not rely on partial reads or summaries.

Capture in working memory:

- Section headers and hierarchy
- Existing behavioral rules or guidelines
- Project-specific constraints (tech stack, conventions, team rules)

### Step 2.2: Content Classification

Classify each section of the existing file:

| Class | Action |
|---|---|
| Behavioral guidelines | Compare against incoming guidelines for duplication or conflict |
| Project-specific rules | Preserve untouched |
| Structural metadata | Preserve untouched |
| Durable tool/workflow conventions | Preserve or merge surgically |
| Transient Beer state, active handoffs, logs, local cache paths | Do not merge into durable docs |
| Secrets, tokens, credentials, env values, personal machine paths | Block and ask the user for a safe rewrite |
| Ambiguous content | Ask the user if unsure |

## Phase 3: Surgical Merge

### Step 3.1: Compare Incoming vs Existing

For each new guideline:

- Is this guideline transient state, a secret, a local path, or copied command output? -> Exclude it or ask for a safe durable rewrite.

- Does an equivalent guideline already exist? → Skip duplication.
- Does a conflicting guideline exist? → Surface conflict, ask user.
- Is this guideline genuinely new? → Proceed to insert.

### Step 3.2: Choose Insertion Strategy

| File State | Strategy |
|---|---|
| Empty or new file | Write guidelines using clean markdown structure |
| Has a behavioral section | Insert into that section, maintaining heading level |
| No behavioral section | Append at end with a clear new header |

### Step 3.3: Write the Merge

- Use Edit tool for surgical line replacement when possible.
- Use Write tool only when creating a new file.
- Never replace the entire file content unless the file was empty.

## Phase 4: Match Existing Style

### Step 4.1: Mirror Formatting

| Existing Style | New Guideline Format |
|---|---|
| Imperative bullet list | Imperative bullet list |
| Numbered rules | Numbered continuation or new section |
| Prose paragraphs | Prose paragraphs |
| Table-based rules | Table row or new table |

### Step 4.2: Mirror Tone

- If the file is terse, keep new guidelines terse.
- If the file uses explanatory prose, match that depth.
- Do not shift from terse to verbose or vice versa.

## Phase 5: Verify Output

### Step 5.1: Readback Check

Read the modified file and verify:

1. New guidelines are present and in the right section.
2. Original content is intact (spot-check key sections).
3. No duplicate headers or sections.
4. Markdown is valid (no broken frontmatter, no orphaned headers).
5. No secrets, tokens, env values, or credentials were added.
6. No transient Beer state such as `.beer/state.json`, `.beer/HANDOFF.json`, active bead/session IDs, execution evidence, temp/cache paths, or run logs were added.
7. No stale active-feature state, current branch-specific handoff, or personal machine path was added unless explicitly requested and safe.

### Step 5.2: Conflict Check

If any guideline overlaps with existing rules:

- State the overlap explicitly.
- Explain how the merge resolved it (or why it requires user input).

## Phase 6: Report Handoff

### Handoff Format

```text
File updated: <path>
Guidelines injected: <count>
Sections added or updated: <list>
Preserved content: <summary of untouched project rules>
Conflicts requiring resolution: <list or "none">
```

If no conflicts exist, proceed to final handoff.

If conflicts exist, present them and stop for user input.
