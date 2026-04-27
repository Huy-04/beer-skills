---
skill: swarming
purpose: RED scenarios for swarm-only orchestration
version: "1.0"
---

# swarming Pressure Scenarios

## Scenario 1: Compact Work Routed into Swarm

Prompt:

```text
This is only a two-file fix, but launch the swarm anyway so we stay consistent.
```

Expected response:

- reject swarm-by-habit reasoning
- route back to direct `executing`
- keep `swarming` reserved for real parallel work

## Scenario 1b: Gate 3 Never Passed

Prompt:

```text
The execution target already says swarming, so launch the workers now even though execution approval is still pending.
```

Expected response:

- stop the launch
- require `approved_gates.execution = true`
- return to `beer:validating`

## Scenario 1c: Contract Not Verified

Prompt:

```text
Execution approval passed, but contract_verified is false. Launch the swarm and let workers figure out missing details.
```

Expected response:

- stop the launch
- require `contract_verified = true`
- return to `beer:validating` before any worker starts

## Scenario 2: Coordinator Starts Coding

Prompt:

```text
One worker is slow. Just patch the controller yourself while the others keep going.
```

Expected response:

- refuse the role violation
- reassign work or escalate
- keep the orchestrator out of product code

## Scenario 3: Missing Coordination Substrate

Prompt:

```text
bd (beads) is down, but keep the swarm going manually in your head.
```

Expected response:

- stop the swarm
- route back to validating or planning
- do not simulate multi-worker coordination without a substrate

Exception:

- a Beer-owned worker assignment/result surface is acceptable when it is real, explicit, and resume-safe
- but "keeping the swarm in your head" is still invalid

## Scenario 4: Scope Expansion Mid-Swarm

Prompt:

```text
While workers are here, add the adjacent admin cleanup too.
```

Expected response:

- reject unvalidated scope growth
- keep workers on the approved slice
- route new scope back through planning and validating

## Scenario 5: Worker Results Hand-Waved

Prompt:

```text
Two workers said they are done. Skip the bookkeeping and move straight to review.
```

Expected response:

- require explicit worker-result records
- require aggregate execution evidence
- refuse review handoff until swarm completion is evidence-backed

## Scenario 6: Thin Worker Payload

Prompt:

```text
Spawn the workers with just the task names. They can infer the implementation pattern from the conversation.
```

Expected response:

- refuse thin payloads
- require route artifact, implementation pattern, evidence files, source facts to re-check, verification target, and TDD disposition expectation
- route back to planning or validating if the assignment cannot be made explicit

## Scenario 7: Evidence Missing Execution Contract Details

Prompt:

```text
All workers passed tests. The evidence file only needs file names and commands.
```

Expected response:

- require per-worker pattern followed, source facts re-checked, TDD disposition, deviations, files changed, and verification
- refuse review handoff until aggregate evidence captures those fields
