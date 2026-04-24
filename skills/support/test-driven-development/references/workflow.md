---
name: test-driven-development
description: Detailed RED -> GREEN -> REFACTOR workflow for Beer
version: "1.0.0"
---

# test-driven-development - Workflow Details

## Overview

**Role:** Test-first behavior gate  
**Job:** Prove the target behavior with a failing test before writing production code, then pass it with the smallest change  
**Output:** Focused test evidence, minimal implementation, and a trustworthy TDD handoff

## Beer Flow Integration

- From `debugging`: preserve root-cause evidence and return RED/GREEN proof to the debug or planned repair path.
- From `executing`: stay inside the current phase contract. TDD does not expand scope.
- Before `validating`: provide test evidence as validation input; do not bypass Beer gates.
- Direct user invocation: finish the smallest useful RED/GREEN/REFACTOR loop, then route changed code to `reviewing`.

## Core Sequence

Run in order unless TDD is legitimately waived.

```text
1. Confirm the change should use TDD
2. Write one focused failing test
3. Verify RED fails for the right reason
4. Write minimal production code
5. Verify GREEN on focused and nearby regression scope
6. Refactor without changing behavior
7. Report evidence or waiver
```

## Step 1: Confirm TDD Applies

Use TDD by default for:

- new features
- bug fixes
- behavior changes
- refactors with behavior risk

Legitimate waivers are narrow:

- throwaway prototype work
- generated code
- configuration-only changes with no runtime behavior change
- docs-only changes

Do not treat urgency, confidence, or "small change" as a waiver.
Do not treat missing test harness, broken baseline, or environment failure as a clean waiver. Those are blockers or technical debt.

If a waiver is used, record:

- why no meaningful failing-test path existed
- what alternative verification was used
- what risk remains because TDD was skipped

## Step 2: Write the RED Test

Write one focused test for one behavior.

Good RED characteristics:

- clear behavior name
- one observable outcome
- realistic inputs
- minimal mocking

Avoid:

- vague names such as `test1` or `works`
- tests that assert only mocks or call counts when real behavior can be observed
- broad multi-behavior tests that hide the actual failure

## Step 3: Verify RED

Run the exact focused test command.

RED is valid only when:

- the test fails, not errors for unrelated setup reasons
- the failure matches the intended missing or broken behavior
- the failure would disappear only if the target behavior were implemented correctly

If RED passes immediately:

- the behavior already exists, or
- the test does not prove the intended change

Fix the test before any production-code work continues.

If production code for the targeted behavior was already written before RED:

- do not call the workflow TDD-complete
- re-establish a true failing test before claiming TDD coverage

If RED is blocked:

- stop before production-code changes
- report the blocker with the attempted command
- do not count the blocked run as TDD-complete
- decide whether to repair the test harness, fix the broken baseline, or request user approval for a non-TDD route

## Step 4: Write GREEN Code

Write the smallest production change that makes RED pass.

Rules:

- no speculative abstraction
- no unrelated cleanup
- no extra behavior beyond the test
- no widening scope silently

The goal of GREEN is passing behavior, not elegance.

## Step 5: Verify GREEN

Run:

1. the exact focused test from RED
2. the smallest broader regression scope that gives meaningful confidence

Examples of broader regression scope:

- the surrounding test file
- the nearest module or package test target
- the exact bug-reproduction suite plus one nearby path

The broader scope must be at least one of those unless no such target exists. If none exists, record the missing scope as a limitation.

Do not jump straight from one focused test to the entire repo unless that is the smallest meaningful regression scope available.

GREEN is complete only when:

- the focused test passes
- nearby regression scope passes
- no new warning or error indicates a hidden break

## Step 6: REFACTOR

Refactor only after GREEN.

Allowed refactor goals:

- remove duplication
- improve names
- extract helpers
- simplify control flow

Forbidden during REFACTOR:

- adding new behavior
- broad cleanup unrelated to the tested slice
- moving into architecture work not required by the test

After every meaningful refactor, re-run the focused test and the chosen regression scope.

## Step 7: Report

The handoff should make TDD audit-friendly.

Minimum report content:

- target behavior
- RED test path or scope
- RED command
- RED result in one line
- RED exit status and short failure excerpt
- GREEN command
- GREEN result in one line
- GREEN exit status or short pass excerpt
- regression scope used
- blocked attempts, if any
- waiver or limitation, if any

## Integration

```text
executing implements a validated change
    |
    v
test-driven-development
    |
    +--> proving new behavior before writing code
    |
    v
executing closes bead with stronger verification evidence

debugging finds root cause
    |
    v
test-driven-development
    |
    +--> regression test first
    |
    v
debugging reports fix with proof it no longer regresses
```

## Done Criteria

This workflow is done when:

- the behavior under change was represented by a focused test
- RED failed for the right reason
- GREEN passed with minimal production code
- nearby regression scope was run
- RED and GREEN evidence included exit status or short output excerpts
- blocked attempts were reported if any command could not produce valid TDD evidence
- any refactor preserved green tests
- the handoff records concrete TDD evidence or a legitimate waiver

## Guardrails

- Do not write production code first and retroactively call it TDD.
- Do not accept a passing-first test as proof.
- Do not use mock-only tests when real behavior can be exercised.
- Do not broaden the implementation beyond the failing test during GREEN.
- Do not skip the nearby regression scope after focused GREEN passes.
