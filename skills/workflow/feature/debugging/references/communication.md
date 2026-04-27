---
skill: debugging
purpose: Reporting debugging findings and blockers
version: "1.1"
---

# debugging - Communication Standards

## Root Cause Report

```markdown
## Debugging Result: <classification>

### Symptom
<What failed and how it was observed.>

### Reproduction
- Command: `<exact command>`
- Result: <pass/fail/flaky/blocked>
- Evidence: <short output excerpt or observation>

### Root Cause
Root cause: <file>:<line or component> - <what is wrong and why it causes the symptom>

### Ranked Hypotheses
- H1: <hypothesis> | Evidence: <evidence> | Falsify by: <check>
- H2: <hypothesis or n/a> | Evidence: <evidence or n/a> | Falsify by: <check or n/a>

### Fix
<What changed, or why this is routing into planned repair work.>

### Verification
- Original command: <pass/fail/not run with reason>
- Regression scope: <command and result>
- TDD disposition: <complete | waived: reason | not-required>
- Execution evidence path: <path or n/a>
- Execution evidence fields: <route artifact, pattern, source facts, files, verification, TDD disposition, deviations | n/a>

### Recurrence Signal
<Error fingerprint, log pattern, metric, trace, or query that would detect this issue early next time, or n/a>

### Remaining Risk
<Limitations, blocked checks, or follow-up work.>
```

## Blocker Report

```markdown
[DEBUGGING BLOCKER]

Issue: <summary>
Classification: <type/component>
Impact: <what work, user flow, or reliability property is blocked>
Evidence:
- <command, bead dependency, file conflict, or bd (beads) signal>
Tried:
- <action>
Stuck at: <why progress is unsafe or impossible>
Next safe step: <smallest safe action if someone else takes over>
Owner needed: <user | coordinator | specific team/person if known>
Needed decision: <specific ask or escalation>
```

## Decision Violation Report

```markdown
[DECISION VIOLATION]

Decision: <D# and exact decision text>
Observed: <code or behavior that violates it>
Impact: <why this matters>
Conservative fix: <option that honors the decision>
Alternative: <option that changes scope/decision>
Needed decision: <approve fix, revisit context, or split bead>
```

## Completion Handoff

```text
Root cause: <one sentence>
Fix: <what changed or what repair plan was created>
Verification: <original command result>; <regression scope result>
TDD disposition: <complete | waived: reason | not-required>
Learned pattern: <debug note path or none>
Ready for: <executing/reviewing/compounding/user>
```

## Hypothesis Snapshot

```text
Top hypotheses before proof:
- H1: <hypothesis> | Evidence: <evidence> | Falsify by: <check>
- H2: <hypothesis> | Evidence: <evidence> | Falsify by: <check>
```

## Debug Repair Handoff

```text
Root cause is proven, but the repair is too broad for a direct patch.
Keep the current route explicit and set `work_intent = repair`.
Invoke beer:planning.
Root cause: <verbatim sentence>
Repair boundary: <files/modules/scope>
Verification anchor: <original failing command>
```

## Debug Review Handoff

```text
Debug repair is ready for review.
Route artifact used: <approved artifact | coordinator assignment | debug root-cause note>
Pattern followed: <implementation pattern>
Source facts re-checked: <facts>
Files changed: <files>
Verification: <original command>; <regression scope>
TDD disposition: <complete | waived: reason | not-required>
Deviations: <none | summary>
Execution evidence: <path>
```

## Debug Learning Handoff

```text
Standalone debug-learning ready for compounding.
Root cause: <verbatim sentence>
Debug note: <path or root-cause artifact>
GitNexus refresh status: <skipped | completed>
Generated Docs refresh status: <not-needed | refreshed | declined>
```

## Nested Debug Exit Template

```text
Debug entry phase: <exploring/planning/swarming/executing/reviewing>
Debug reason: <classification>
Root cause: <verbatim sentence>
Exit target: <beer:swarming | beer:executing | beer:test-driven-development | beer:planning | beer:validating | beer:reviewing | beer:compounding | user>
Why this exit: <one sentence>
```

## Writing Rules

- Start with the classification and symptom.
- Prove the root cause with evidence.
- Keep command output short unless the user asks for full logs.
- Separate fix evidence from verification evidence.
- Include execution evidence fields before review when code changed.
- State limitations plainly instead of implying complete verification.
