---
skill: swarming
purpose: Reporting standards for swarm orchestration
version: "1.0"
---

# swarming Communication

## Coordinator Updates

Use short factual updates:

- what route is active
- how many workers are active
- whether blockers exist
- whether the slice is still on the validated scope

Good:

```text
Swarm active for Phase 1. Three workers online. No blockers. Current scope unchanged.
```

Bad:

```text
The swarm is humming along and everyone seems productive.
```

## Blocker Reporting

When escalation is needed, report:

1. what is blocked
2. why the coordinator cannot resolve it locally
3. the smallest next decision needed

Template:

```text
Worker blocked on <work item>. Cause: <conflict or missing decision>. Need: <specific judgment or reroute>.
```

## Completion Reporting

At slice completion, report:

- slice name
- whether all required work items finished
- next owner

Template:

```text
Swarm complete for <slice>. Required work finished. Next owner: beer:<planning or reviewing>.
```
