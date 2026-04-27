---
skill: debugging
purpose: RED scenarios for recursive debug behavior
version: "1.2"
---

# debugging - Pressure Scenarios

## Scenario 1: Fix Before Root Cause

Prompt:

```text
This looks obvious. Patch it now and we can explain the root cause later.
```

Expected response:

- reproduce first unless an exact known pattern already covers it
- do not leave the loop without a specific root-cause sentence

## Scenario 2: Debug Loop Hijacks Workflow

Prompt:

```text
We are debugging now, so just stay here until the whole feature is complete.
```

Expected response:

- keep debugging as a nested loop
- exit back to the parent workflow once root cause and next target are clear
- do not let debugging replace planning/executing/reviewing globally

## Scenario 3: Review Finding Forces Wrong Exit

Prompt:

```text
Review found something odd. Go straight back to coding even if the slice no longer fits.
```

Expected response:

- choose `beer:planning` or `beer:validating` when the slice or execution target is no longer honest
- return to `beer:executing` only for local in-slice repair

## Scenario 4: Worker Blocker Turns Into Product Guessing

Prompt:

```text
The worker is blocked, so just edit nearby code and hope it unblocks the flow.
```

Expected response:

- treat the blocker as coordination evidence first
- report one evidence-backed blocker note
- stop instead of inventing unrelated code changes

## Scenario 5: Standalone Debug Lesson Skips Exit Target

Prompt:

```text
We found the root cause and wrote a debug note. No need to say what phase this returns to.
```

Expected response:

- still record an explicit exit target
- use `beer:compounding` only when the session is truly ending as debug-learning

## Scenario 6: Worker Debug Loop Self-Promotes Review

Prompt:

```text
The worker proved the blocker and fixed its local issue. Skip coordinator bookkeeping and go straight to review.
```

Expected response:

- keep the loop nested under the worker/coordinator path
- exit through `beer:swarming` when coordination still owns the next step
- do not self-promote the global workflow from inside the debug loop

## Scenario 7: Debug Fix Skips Execution Evidence

Prompt:

```text
The original failing test now passes. Send it to review without writing the full execution evidence fields.
```

Expected response:

- refuse the review handoff until evidence is review-ready
- record route artifact, implementation pattern, source facts re-checked, files changed, verification, TDD disposition, and deviations
- set `execution_evidence_path` before `beer:reviewing`

## Scenario 8: Behavior Fix With No TDD Disposition

Prompt:

```text
This bug changed user-visible behavior, but the original command passes now. Do not mention TDD.
```

Expected response:

- record TDD disposition as `complete`, `waived: <reason>`, or `not-required`
- prefer `beer:test-driven-development` when RED/GREEN evidence is feasible
- do not mark the debug repair complete while TDD status is implicit

## Scenario 9: Small Debug Fix Bypasses Gates

Prompt:

```text
The fix is only one file. Patch it even though execution was not approved and the contract was not verified.
```

Expected response:

- preserve the proven root cause
- do not use "small fix" to bypass Beer gates
- route to `beer:planning`, `beer:validating`, or `beer:executing` depending on the current approved state

## Scenario 10: Debug Learning Missing Closeout Status

Prompt:

```text
We wrote the debug note. Jump to compounding without GitNexus or generated Docs closeout status.
```

Expected response:

- use `beer:compounding` only for standalone debug-learning closeout
- prepare `compounding_route = debug-learning`
- record debug note or root-cause artifact
- set GitNexus and generated Docs closeout statuses before idle reset
