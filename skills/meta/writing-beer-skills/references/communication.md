---
name: writing-beer-skills
description: Communication standards and templates for pressure-tested Beer skill authoring
version: "1.0.0"
---

# writing-beer-skills - Communication Standards

## Tone

- Use direct instruction for rules that must not be bypassed.
- Use concrete, observable language for failure modes.
- Avoid vague claims like "be careful" or "use best judgment" when a stronger rule is possible.

## What Good Skill Writing Sounds Like

Prefer:

- "Run baseline scenarios before editing the skill."
- "Do not summarize the workflow in `description`."
- "Capture the exact rationalization verbatim."

Avoid:

- "Make sure testing happens somehow."
- "Document the reasoning if relevant."
- "Keep the wording clear and robust."

## Rationalization Capture Standard

When documenting pressure failures, record:

- the scenario name
- the combined pressures
- the exact wrong action
- the verbatim rationalization

Bad:

```text
The agent skipped validation because it was rushed.
```

Good:

```text
Exact rationalization: "This is a minor wording tweak, so running the validation stack would be overkill."
```

## Rule-Writing Standard

Every strong rule should answer at least one of these:

- what shortcut is forbidden
- what artifact must exist before proceeding
- what exact validation step proves the skill is ready
- what temporary authoring artifact must be removed before completion

## Description Standard

The `description` field is for triggering conditions only.

It must not:

- summarize the workflow
- promise outputs
- include validation steps

When workflow route metadata is present, validate it separately from `description`.

## Final Output Standard

The final deliverable is the skill package itself.

It must:

- match the Beer skill pattern
- contain only the files needed by the final skill
- exclude temporary scenario/instruction/refactor artifacts unless the user explicitly asks to keep them

---

## Pressure Coverage Report Template

```markdown
Internal pressure coverage complete for `<skill-name>`

Pressure depth: `full RED` | `focused RED`
Scenarios run: N
Scenario execution status:
- Scenario "<name>": executed | focused/manual | blocked (<reason>)
Baseline failures captured: N
Change-specific scenarios run: N

Key rationalizations:
- Scenario "<name>": "<verbatim rationalization 1>"
- Scenario "<name>": "<verbatim rationalization 2>"
- Scenario "<name>": "<verbatim rationalization 3>"

Late-detected lapse:
- Behavior-changing edit made before pressure coverage: yes | no
- If yes, retroactive coverage run before handoff: yes | no

Changed rule or behavior targeted:
- <exact rule, template, checklist item, or behavior changed>

Change-specific scenario pressures:
- Scenario "<name>": <pressure 1>, <pressure 2>

Observable failure:
- Scenario "<name>": <wrong action or failed decision>

Patterns observed:
- <pattern 1>
- <pattern 2>

Ready to tighten the draft skill using these failures.
```

---

## Mechanical Waiver Template

```markdown
Pressure coverage waived for `<skill-name>`

Reason:
- edit is mechanical-only: yes
- behavior, routing, required artifacts, and validation rules unchanged: yes
- examples, templates, emphasis, and interpretation unchanged: yes

Change scope:
- <spelling | formatting | broken link | similar mechanical fix>

Why pressure coverage was not needed:
- <brief justification>
```

---

## INSTRUCTION GREEN Phase Report Template

```markdown
INSTRUCTION GREEN phase complete for `<skill-name>`

Rules added: N
References added: <list>

Scenarios re-run with skill present:
- Pass: N
- Fail: N

If any fail: revise wording and re-run before proceeding.
```

---

## PATTERN REFACTOR Phase Report Template

```markdown
PATTERN REFACTOR phase complete for `<skill-name>`

New loopholes found: N
Wording changes:
- <change 1>
- <change 2>

Red flags added: <list>
Rationalization-table updated: yes | no

All scenarios re-run: pass | fail
```

---

## Validation Report Template

```markdown
Validation complete for `<skill-name>`

- `node scripts/maintenance/check-markdown-links.mjs`: pass | fail
- `node scripts/maintenance/sync-skills.mjs --dry-run`: pass | fail
- manual semantic checklist: pass | fail

Temporary artifacts removed: yes | no
Pressure depth: full RED | focused RED | mechanical waiver
Manual review evidence:
- <checklist item>: <file:line or field value> -> <what this proves>
- <second checklist item>: <file:line or field value> -> <what this proves>
- <route metadata item if present>: <file:line or field value> -> <what this proves>
Final package matches pattern: yes | no
Remaining weaknesses: <list or "none">
```

---

## Handoff Template

```markdown
Skill updated: <skill-name>
Internal pressure scenarios run: <N>
New loopholes closed: <N>
Pressure depth: full RED | focused RED | mechanical waiver
Pressure summary:
- Scenario execution status: <executed summary or blocked reasons>
- Changed rule or behavior targeted: <item>
- Strongest rationalization found: <quote or "waived legitimately">
Validation:
- check-markdown-links.mjs: pass | fail
- sync-skills.mjs --dry-run: pass | fail
- manual semantic checklist: pass | fail
Manual review evidence:
- <checklist item>: <file:line or field value> -> <what this proves>
- <second checklist item>: <file:line or field value> -> <what this proves>
- <route metadata item if present>: <file:line or field value> -> <what this proves>

Final package is clean and ready for review.
```
