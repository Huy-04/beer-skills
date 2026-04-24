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

### Fix
<What changed, or why this is routing to planning_route = debug-escalation.>

### Verification
- Original command: <pass/fail/not run with reason>
- Regression scope: <command and result>
- TDD evidence: <RED/GREEN summary or waiver>
- Execution evidence path: <path or n/a>

### Remaining Risk
<Limitations, blocked checks, or follow-up work.>
```

## Blocker Report

```markdown
[DEBUGGING BLOCKER]

Issue: <summary>
Classification: <type/component>
Evidence:
- <command, bead dependency, file conflict, or bd (beads) signal>
Tried:
- <action>
Stuck at: <why progress is unsafe or impossible>
Needed decision: <specific ask>
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
Fix: <what changed or debug-escalation route created>
Verification: <original command result>; <regression scope result>
Learned pattern: <debug note path or none>
Ready for: <executing/reviewing/compounding/user>
```

## Debug-Escalation Handoff

```text
Root cause is proven, but the repair is too broad for a direct patch.
Set planning_route = debug-escalation.
Invoke beer:planning with --route debug-escalation.
Root cause: <verbatim sentence>
Repair boundary: <files/modules/scope>
Verification anchor: <original failing command>
```

## Writing Rules

- Start with the classification and symptom.
- Prove the root cause with evidence.
- Keep command output short unless the user asks for full logs.
- Separate fix evidence from verification evidence.
- State limitations plainly instead of implying complete verification.
