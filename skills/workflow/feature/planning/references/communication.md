---
skill: planning
purpose: Plain-language planning communication by route
version: "1.0"
---

# planning - Communication Standards

## Whiteboard Rule

Explain the plan like a teammate drawing the next few steps on a whiteboard.

- say what becomes true after the work
- say why this slice is first
- say what risk still matters
- avoid architecture jargon unless it changes the plan

## Standard Messages

### Feature Route

```text
Planning route: feature.
Locked context is present, so I am writing the full feature plan before current-phase prep.
```

### Small Direct-Fix Route

```text
Planning route: small direct fix.
This does not need full feature planning, so I am keeping the plan compact and single-phase.
```

### Debug-Escalation Route

```text
Planning route: debug escalation.
The root cause is proven, but the repair is too large or risky for a direct patch.
I am planning the repair without expanding into unrelated feature work.
```

### Approval Ask

```text
Phase plan written.
Current route: [feature | small direct fix | debug escalation]
Current slice: [name]
Risk notes: [summary]

Approve before current-phase preparation? (yes / revise / no)
```

### Route Rejection

```text
Planning stopped because the incoming route does not match the actual prerequisites.
Bounce back to [beer:context-intake | beer:exploring | beer:debugging] before planning continues.
```

### Handoff

```text
Planning complete. Current slice prepared at the right depth for this route.
Invoke `beer:validating`.
```

## Red Flags

Stop immediately if:

1. planning starts from seed instead of locked context on the feature route
2. a tiny fix is being stretched into a multi-phase roadmap
3. a debug repair loses its root-cause anchor
4. beads are being created before approval
5. planning is drifting into execution details
6. planning quietly changes the incoming route instead of bouncing back upstream

## Anti-Patterns

### Anti-Pattern 1: "Every task needs the full planning stack"

Wrong:
- force a tiny direct fix through a large phase structure

Correct:
- scale the plan to the route

### Anti-Pattern 2: "Seed is good enough"

Wrong:
- plan a feature from `.beer/seed/`

Correct:
- require locked context for the feature route

### Anti-Pattern 3: "Debug escalation means redesign everything"

Wrong:
- turn a proven bug repair into unrelated feature planning

Correct:
- keep the repair bounded to the proven root cause and repair scope

### Anti-Pattern 4: "Approval can happen after bead creation"

Wrong:
- create current-phase work first, then ask

Correct:
- ask first, then prepare the current slice
