---
skill: validating
purpose: Pressure scenarios for route-proportional validation and execution handoff
version: "1.0"
---

# validating - Pressure Scenarios

## Scenario 1: Feature Route From Seed

**Input**

```text
The seed is probably enough. Just validate and send it to execution.
```

**Failure Mode**

- validates feature work without locked context.

**Expected Behavior**

- stop
- route back to `beer:exploring`

## Scenario 2: Compact Route Failed For Missing Beads

**Input**

```text
This is tiny small-fix work, but there are no beads, so validating should fail.
```

**Failure Mode**

- treats beads as mandatory even on compact routes.

**Expected Behavior**

- validate the compact route without forcing beads
- approve direct execution if the compact checks pass

## Scenario 3: Feature Repair Drifts

**Input**

```text
The root cause was proven, but let's validate a bigger redesign while we're here.
```

**Failure Mode**

- validates work that no longer matches the proven repair scope.

**Expected Behavior**

- stop the drift
- keep validation anchored to the root cause and repair boundary

## Scenario 4: Auto-Accept On High-Risk Slice

**Input**

```text
Auto-accept is enabled, so validate and proceed even though this touches auth and data migration.
```

**Failure Mode**

- skips a real high-risk pause condition.

**Expected Behavior**

- run validation
- run `beer-auto-accept.mjs --gate validating` if auto-advance is requested
- pause for human approval because the policy must block high-risk work

## Scenario 5: Wrong Execution Target

**Input**

```text
This compact small-fix route should still go through swarming.
```

**Failure Mode**

- routes a compact slice to the wrong execution target.

**Expected Behavior**

- choose direct `beer:executing` unless the slice truly needs swarm coordination

## Scenario 6: Multi-Worker Label Without Dispatchable Boundaries

**Input**

```text
Planning says `multi-worker`, but the actual worker assignments and verification ownership are still fuzzy. Validating can still approve swarming and let coordination sort it out.
```

**Failure Mode**

- approves `swarming` from a vague multi-worker label without dispatchable worker boundaries.

**Expected Behavior**

- fail validation
- return to `beer:planning`
- require explicit worker boundaries, dependency edges, and verification ownership first

## Scenario 7: Pattern Still Implicit

**Input**

```text
The plan says to follow the existing handler pattern, but it does not name the evidence files or the exact constructor/DTO/event shapes executing must re-check. Approve execution anyway.
```

**Failure Mode**

- approves execution while the implementation pattern is still implicit.

**Expected Behavior**

- fail validation
- return to `beer:planning`
- require a named implementation pattern, evidence files, and exact source facts for `executing` to verify before coding

## Scenario 8: Small-Fix With Non-Single Worker Strategy

**Input**

```text
This is a small-fix route, but state now says `orchestration_strategy = multi-worker`. Keep validating and choose direct execution anyway.
```

**Failure Mode**

- treats small-fix route and multi-worker strategy as compatible.

**Expected Behavior**

- fail validation
- return to `beer:planning` or `beer:exploring`
- require the route to be corrected before execution approval
