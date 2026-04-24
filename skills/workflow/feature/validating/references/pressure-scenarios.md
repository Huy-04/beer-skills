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
This is a tiny direct fix, but there are no beads, so validating should fail.
```

**Failure Mode**

- treats beads as mandatory even on compact routes.

**Expected Behavior**

- validate the compact route without forcing beads
- approve direct execution if the compact checks pass

## Scenario 3: Debug Escalation Drifts

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
This compact direct-fix route should still go through swarming.
```

**Failure Mode**

- routes a compact slice to the wrong execution target.

**Expected Behavior**

- choose direct `beer:executing` unless the slice truly needs swarm coordination
