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
- which worker profiles are active when it matters
- whether blockers exist
- whether the slice is still on the validated scope
- whether worker payloads include pattern/source-fact/TDD expectations
- whether worker results are fully recorded yet

Good:

```text
Swarm active for Phase 1. Three workers online. Profiles: 2 coding, 1 research_synthesis. Payload contracts include pattern/source-fact/TDD expectations. No blockers. Current scope unchanged. Worker results current.
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

Source-fact mismatch template:

```text
Worker blocked on <work item>. Cause: source facts contradicted the validated artifact at <file or symbol>. Need: route back to beer:<planning or validating>.
```

## Completion Reporting

At slice completion, report:

- slice name
- whether all required work items finished
- whether worker results and evidence are fully recorded
- whether pattern/source-fact/TDD disposition evidence is recorded
- next owner

Template:

```text
Swarm complete for <slice>. Required work finished. Worker results, pattern/source-fact checks, TDD disposition, and evidence recorded. Next owner: beer:<planning or reviewing>.
```
