---
skill: executing
purpose: Reporting standards for implementation and completion
version: "1.0"
---

# executing Communication

## Direct Route Completion

Use a short completion note:

```text
Direct execution complete for <slice>. Files: <list>. Verified with: <commands>. Next owner: beer:<reviewing or planning>.
Evidence: <execution_evidence_path>.
```

## Swarm Worker Completion

Report to the coordinator:

```text
Assigned work complete: <task>. Files: <list>. Verified with: <commands>. No blocker remains.
Evidence: <worker evidence or aggregate evidence path>.
```

## Route Rejection

```text
Execution cannot start because the execution gate is not approved or the approved work item is unclear.
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
