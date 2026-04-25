---
name: beer-agent-guidelines
description: >
  This skill should be used when the user asks to "use Karpathy guidelines",
  "install execution guardrails", "make the repo instructions more surgical",
  "sync guardrails into CLAUDE.md or AGENTS.md", or otherwise wants
  repository instruction files updated with assumption, simplicity, Beer flow
  discipline, scope, and verification rules.
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  tags:
    - beer/support
    - guardrails
    - execution
  dependencies: []
allowed-tools:
  - Read
  - Bash
user-invocable: true
disable-model-invocation: false
---

# beer-agent-guidelines

Install or refresh Karpathy-style coding guardrails in repo instruction files so the working behavior lives in `CLAUDE.md` and `AGENTS.md`, not only inside this skill package.

---

## At a Glance

| | |
|---|---|
| **Use when** | The user wants Karpathy-style guardrails installed, updated, or tightened in repo instructions |
| **Needs** | The current repo instructions plus the desired target files (`CLAUDE.md`, `AGENTS.md`, or both) |
| **Produces** | Updated instruction files with a compact managed guardrail section |
| **Next** | Continue working under the synced instructions |

---

## 30-Second Version

1. **Read the current repo instructions** before changing anything.
2. **Sync the canonical guardrails** into `CLAUDE.md` and `AGENTS.md` unless the user narrowed the target.
3. **Preserve repo-specific instructions** outside the managed guardrail block.
4. **Keep the content compact** so it behaves like the reference repo: one concise instruction payload, not a bulky workflow.
5. **Report exactly what changed** and any file that still needs manual follow-up.

---

## When to Invoke

| Scenario | Action |
|---|---|
| User wants Karpathy-style behavior installed in the repo | Update `CLAUDE.md` and `AGENTS.md` with the canonical guardrails |
| Repo already has instruction files | Merge by replacing the managed block, not by overwriting project-specific rules |
| Only one instruction file exists | Update that file and create the missing peer file unless the user said otherwise |
| Existing instructions conflict with the canonical guardrails | Keep local project rules outside the managed block and flag the conflict explicitly |
| The user wants lighter or heavier wording | Adjust the canonical block, then sync the same intent to both files |
| Beer is onboarded but agents keep bypassing the workflow | Add explicit route-lock rules and a narrow trivial-task escape hatch |

---

## Capability First

- Make the repo feel like the reference pattern: concise guardrails living in instruction files.
- Prefer a single compact rules section over a large skill-specific framework.
- Keep project-specific instructions intact by editing only the managed block or creating the file when missing.
- Maintain parity between `CLAUDE.md` and `AGENTS.md` unless the user explicitly wants them to diverge.
- Make the Beer workflow sticky enough that agents do not ask a few questions and then code outside the active route.

## Sync Rules

### 1. Target the Repo Instructions First

- Default target files are `CLAUDE.md` and `AGENTS.md`.
- Read existing copies before editing so local rules are preserved.
- If only one file exists, use it as context for the missing peer file.

### 2. Use the Canonical Templates

- Use `references/claude-template.md` for `CLAUDE.md`.
- Use `references/agents-template.md` for `AGENTS.md`.
- Keep the two files aligned in meaning even when the headings differ slightly.

### 3. Merge Surgically

- Replace only the Beer-managed guardrail block when it already exists.
- If no managed block exists, append the new block after existing project-specific content or create the file if missing.
- Do not rewrite unrelated repo rules, formatting, or adjacent guidance.

### 4. Keep It Compact

- The installed content should read like a single concise instruction file, similar to the reference repo.
- Do not turn the block into a long workflow manual.
- Keep examples and wording short enough to stay usable inside instruction files.

### 5. Verify the Result

- Confirm both files now contain the same four principles: thinking first, simplicity, surgical changes, and goal-driven verification.
- Confirm both files now contain the Beer route-lock rule and the narrow trivial-task escape hatch.
- Confirm both files now require contract verification before coding against constructors, factories, events, DTOs, and value objects.
- Confirm project-specific rules outside the managed block were preserved.
- Report whether each file was created or updated.

---

## Managed Block Contract

Use a stable wrapper when the repo already contains other instructions:

```md
<!-- beer-agent-guidelines:start -->
[canonical guardrail content]
<!-- beer-agent-guidelines:end -->
```

- Replace the whole block on refresh.
- If the file is fully dedicated to the guardrails, the wrapper may still remain; consistency matters more than aesthetics.
- If the user asks for a different marker format, keep it consistent across both files.

## Ownership Boundary

- `beer-agent-guidelines` owns the canonical guardrail wording and where it lands inside repo instruction files.
- Project-specific repo rules remain outside the managed block unless the user explicitly asks to rewrite them.
- Workflow skills still own planning, execution, validation, and review after the instructions are synced.
- This skill can require agents to route through Beer before coding, but it does not replace the workflow skills that own those phases.

---

## Output Contract

Return:

- target files updated
- whether each file was created or refreshed
- whether the managed block was added or replaced
- any project-specific instruction conflict that still needs a decision

---

## Integration

- Use when the user wants the guardrails installed as repo policy, not only applied ad hoc in one session.
- After syncing the files, continue the active task under those instructions.
- If the user only wants live execution discipline without editing repo instructions, another workflow skill may apply directly and this skill is unnecessary.

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|---|---|
| Returning only a one-off execution frame | The repo behavior does not actually change |
| Overwriting the whole file | Destroys project-specific instructions the user did not ask to remove |
| Letting `CLAUDE.md` and `AGENTS.md` drift | Different agents end up following different rules |
| Writing a long workflow manifesto | Loses the concise feel of the reference repo |
| Editing unrelated repo guidance while "cleaning up" | Expands scope without user approval |
| Asking a few setup questions and then coding outside Beer | The workflow becomes optional and state loses authority |
| Using build failures to discover missing type or constructor details | Verification turns into discovery instead of proof |

---

## Key References

- `references/workflow.md` - full repo-instruction sync flow
- `references/communication.md` - concise templates for file sync and merge notes
- `references/quick-ref.md` - one-page checklist for live use
- `references/claude-template.md` - canonical `CLAUDE.md` content
- `references/agents-template.md` - canonical `AGENTS.md` content

---

## Handoff

> Execution guardrails synced into the repo instruction files. Continue under `CLAUDE.md` and `AGENTS.md`.
