---
name: test-driven-development
description: Nested TDD pressure scenarios for Beer
version: "1.0.0"
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
