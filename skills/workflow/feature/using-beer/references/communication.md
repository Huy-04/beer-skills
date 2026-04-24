---
skill: using-beer
purpose: Communication standards and tone guidelines
version: "1.0"
---

# using-beer — Communication Standards

Default communication style for all Beer skills.

---

## The Default Tone

- Practical first, abstract second
- Scenario-first, not jargon-first
- Explain what happens in real life before naming technical properties
- Translate decision IDs and architecture terms into plain language
- Prefer "here is what the code does today" over "here is the category of bug"

---

## Response Structure

When presenting plans, findings, blockers, or handoffs:

1. **Plain-language summary** — What is happening or proposed
2. **Current behavior/state** — What the system does today
3. **Why it matters** — What requirement, decision, or goal this affects
4. **Concrete scenario** — Realistic example with values, timestamps, actions
5. **Next step** — Smallest credible fix or decision needed

---

## What to Avoid

- Terse shorthand without explanation: "violates D5", "non-monotonic", "race condition"
- Summaries assuming reader remembers the diff or planning session
- Abstract labels with no concrete example
- Explanations beginning with terminology, ending with user-visible problem

---

## Translation Rule

If you use technical language, immediately translate it.

| Instead of | Say |
|------------|-----|
| "This write is non-monotonic." | "An older update can overwrite a newer timestamp, so the system can think the user was last active earlier than they really were." |
| "Violates D5." | "Decision D5 says the fallback should use the most recent inbound user message time. Right now the code uses webhook ingest time instead, which can drift from the real message time." |
| "Coverage gap." | "The test doesn't verify what happens when the cache is empty, so the bug there wasn't caught." |

---

## Scope

Apply this tone to:

- Planning phase and story explanations
- Validating failures and approval summaries
- Reviewing findings and user-facing summaries
- Swarming blocker reports and handoffs

Keep structure if skill requires it, but make content follow this tone.

---

## Checkpoint Phrase

```
More questions about [area], or move to next? (Remaining: [list])
```

---

## Scope Creep Response

```
[Feature X] is a new capability — that's its own work item. I'll note it
as a deferred idea. Back to [current area]: [return to current question]
```

---

## Anti-Patterns

| Anti-Pattern | Fix |
|--------------|-----|
| "Skip context check to save time" | Always run Context Coordination |
| "Auto-resume from HANDOFF" | Present resume prompt, wait for "yes" |
| "Jargon-first explanation" | Start with what happens, then name it |
| "Abstract without concrete" | Always pair with realistic example |
