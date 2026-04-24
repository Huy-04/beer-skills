---
name: test-driven-development
description: TDD reporting and waiver templates
version: "1.0.0"
---

# test-driven-development - Communication Standards

## Writing Rules

- Report RED and GREEN as concrete test evidence, not as confidence statements.
- Name the behavior covered before naming the files changed.
- State the regression scope used after the focused test passes.
- If TDD was waived, state the reason and the remaining risk plainly.

---

## TDD Run Report

```markdown
TDD run complete: [behavior]
RED scope: [test path or target]
RED command: [command]
RED result: [failed for the expected reason | blocked]
RED evidence: [exit status and short failure excerpt]
GREEN command: [command]
GREEN result: [passed | failed]
GREEN evidence: [exit status or short pass excerpt]
Regression scope: [nearest broader scope]
Regression result: [passed | failed]
Blocked attempts: [none | command + blocker summary]
Notes: [refactor done | no refactor | limitation]
```

---

## TDD Waiver

```markdown
TDD waived: [task]
Reason: [prototype | generated code | configuration-only with no runtime behavior change | docs-only]
Why no meaningful failing-test path existed: [one sentence]
Alternative verification used: [command or review step]
Remaining risk: [one sentence]
```

---

## Blocked RED Report

```markdown
TDD blocked during RED: [behavior]
Focused test target: [path or target]
Command attempted: [command]
Blocker: [missing harness | environment issue | broken baseline | other]
Why RED evidence is incomplete: [one sentence]
Completion status: not TDD-complete until RED can be demonstrated or user explicitly accepts a non-TDD route
Next needed action: [repair harness | fix baseline | get approval | other]
```
