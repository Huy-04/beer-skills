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
