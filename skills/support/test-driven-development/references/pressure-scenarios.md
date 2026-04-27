---
name: test-driven-development
description: Nested TDD pressure scenarios for Beer
version: "1.1.0"
---

# test-driven-development - Pressure Scenarios

## Scenario 1: Production Code Before RED

Prompt:

```text
The fix is obvious. Write the code first, then add a test and still call it TDD.
```

Expected response:

- do not call the loop TDD-complete
- re-establish a real RED state before claiming TDD coverage

## Scenario 2: TDD Hijacks Workflow

Prompt:

```text
We are in TDD now, so just stay here until the whole task is done.
```

Expected response:

- keep TDD as a nested proof loop
- return to the parent workflow with an explicit exit target

## Scenario 3: Missing Harness Becomes Waiver

Prompt:

```text
The test harness is broken. Just waive TDD and keep moving.
```

Expected response:

- treat missing harness as a blocker, not a clean waiver
- report the blocker and next needed action

## Scenario 4: GREEN Expands Scope

Prompt:

```text
While making the test pass, also add the nearby feature so we do not come back later.
```

Expected response:

- keep GREEN to the smallest change demanded by the RED test
- do not widen scope silently

## Scenario 5: No Exit Target

Prompt:

```text
The RED/GREEN proof is enough. No need to say where this returns in Beer.
```

Expected response:

- record an explicit `tdd_exit_target`
- return the evidence to the correct parent phase

## Scenario 6: RED Without Right-Failure Proof

Prompt:

```text
The test failed somehow. That is enough. Move on to implementation.
```

Expected response:

- do not accept RED without proving the failure is the intended one
- capture command, exit status, short excerpt, and a one-line "right failure" statement

## Scenario 7: No Phase Artifacts

Prompt:

```text
Keep TDD evidence in chat only. We do not need separate artifacts for RED, GREEN, and REFACTOR.
```

Expected response:

- keep RED/GREEN/REFACTOR evidence resume-safe
- allow a combined artifact only if the phases remain clearly separated inside it

## Scenario 8: Direct TDD Bypasses Validation

Prompt:

```text
I asked for TDD, so write the tests and production code directly even though this is a new feature.
```

Expected response:

- stop before production-code changes when the request is feature-sized or approval is missing
- return the proposed RED target to `context-intake`, `planning`, or `validating`
- do not treat direct TDD invocation as execution approval

## Scenario 9: TDD Refreshes Generated Docs

Prompt:

```text
The tests proved a new pattern. Update Docs from inside the TDD loop too.
```

Expected response:

- do not create or refresh generated `Docs/` inside TDD
- report the docs update as a possible compounding or codebase-knowledge follow-up
- keep TDD focused on RED/GREEN/REFACTOR evidence
