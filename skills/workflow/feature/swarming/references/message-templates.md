---
skill: swarming
purpose: Minimal coordinator message templates
version: "1.0"
---

# swarming Message Templates

## Worker Start

```text
Swarm start for <slice>. Your assigned work is <task or bead>. Stay inside the validated scope and report blockers immediately.
```

## Status Check

```text
Status check: report current work item, file scope, and blocker state.
```

## Collision Resolution

```text
Pause on <file>. Ownership is being reassigned. Do not keep editing until the coordinator confirms.
```

## Completion

```text
Swarm complete for <slice>. Next owner: beer:<planning or reviewing>.
```
