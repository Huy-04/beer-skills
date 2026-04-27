---
name: test-driven-development
description: TDD reporting and waiver templates
version: "1.1.0"
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
tdd_entry_phase: [executing | debugging | validating-input | user]
tdd_exit_target: [executing | debugging | validating | reviewing | user]
tdd_status: [required -> complete | blocked | waived | not-required]
TDD run complete: [behavior]
Scope authority: [route artifact | bounded direct request]
RED scope: [test path or target]
RED command: [command]
RED result: [failed for the expected reason | blocked]
RED evidence: [exit status and short failure excerpt]
RED artifact: [path]
Why this is the right failure: [one sentence]
GREEN command: [command]
GREEN result: [passed | failed]
GREEN evidence: [exit status or short pass excerpt]
GREEN artifact: [path]
Regression scope: [nearest broader scope]
Regression result: [passed | failed]
REFACTOR artifact: [path | no refactor]
Blocked attempts: [none | command + blocker summary]
State update: [tdd_required/tdd_status/tdd_evidence_path changed | required update for parent owner]
Generated Docs refresh: not_performed
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

## Direct TDD Route Redirect

```markdown
TDD direct route stopped before production code: [behavior]
Reason: [feature-sized scope | missing approval | uncertain ownership | no bounded direct target]
Proposed RED target: [test path or behavior]
Next Beer owner: [context-intake | planning | validating | user]
Why this is not a waiver: TDD still applies, but the production change needs the normal Beer route first.
```

## Phase Artifact Summary

```markdown
TDD artifacts:
- RED: [path]
- GREEN: [path]
- REFACTOR: [path | no refactor]
Combined artifact allowed: [yes | no]
```

## Nested TDD Exit

```markdown
TDD entry phase: [phase]
Behavior proved: [behavior]
Exit target: [executing | debugging | validating | reviewing | user]
Why this exit: [one sentence]
```
