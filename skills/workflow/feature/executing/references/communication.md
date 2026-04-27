---
skill: executing
purpose: Reporting standards for implementation and completion
version: "1.0"
---

# executing Communication

## Direct Route Completion

Use a short completion note:

```text
Direct execution complete for <slice>. Files: <list>. Pattern: <pattern>. Source facts re-checked: <summary>. TDD: <complete | waived: reason | not-required>. Verified with: <commands>. Next owner: beer:<reviewing or planning>.
Evidence: <execution_evidence_path>.
```

## Swarm Worker Completion

Report to the coordinator:

```text
Assigned work complete: <task>. Status: completed. Files: <list>. Pattern: <pattern>. Source facts re-checked: <summary>. TDD: <complete | waived: reason | not-required>. Verified with: <commands>. No blocker remains.
Evidence: <worker evidence or aggregate evidence path>. Next owner action: <coordinator review, merge, or follow-on assignment>.
```

Do not claim `beer:reviewing` from a worker-completion note unless the coordinator explicitly assigned that handoff.
Do not claim completion until the worker-result record or bead state has been updated.

## Route Rejection

```text
Execution cannot start because the execution gate is not approved or the approved work item is unclear.
Return to beer:validating before implementation continues.
```

## Contract Rejection

```text
Execution cannot start because `contract_verified` is not true or the implementation pattern is missing.
Return to beer:validating before implementation continues.
```

## Blocker Report

Blocker messages must say:

1. what is blocked
2. what evidence you already checked
3. why you cannot safely continue

Template:

```text
Blocked on <task>. Checked: <evidence>. Need: <decision, reroute, or additional context>.
```
