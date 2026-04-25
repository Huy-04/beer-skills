---
name: beer-test-driven-development
description: >
  This skill should be used when the user asks to "use TDD", "write the test first",
  "add a regression test before fixing", "implement with red green refactor", or
  "prove the behavior change with tests", or when a behavior change should be
  demonstrated by a failing test before production code is written.
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  tags:
    - beer/support
    - beer/testing
  dependencies: []
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
user-invocable: true
disable-model-invocation: false
---

# test-driven-development

Drive a behavior change through a failing test first, then the smallest passing code, then cleanup that preserves green tests.

---

## At a Glance

| | |
|---|---|
| **Use when** | New behavior, bug fixes, or logic changes that should be proven with tests |
| **Needs** | Target behavior, runnable test command, and clear scope for the change |
| **Produces** | Failing-first test evidence, minimal passing implementation, and a clean TDD handoff |
| **Next** | `beer:executing`, `beer:debugging`, `beer:reviewing`, or user handoff |

---

## 30-Second Version

1. **Confirm TDD applies**: Use for behavior changes, bug fixes, and refactors that need proof.
2. **RED**: Write one focused test for one behavior and run it until it fails for the right reason.
3. **GREEN**: Write the smallest production change that makes that test pass.
4. **VERIFY GREEN**: Re-run the focused test and the nearest useful regression scope.
5. **REFACTOR**: Clean names, duplication, or helper structure only while the tests stay green.
6. **REPORT**: State the failing test used, the passing proof, any waiver, and any remaining risk.

---

## Core Workflow

### Capability First

- Use the strongest practical test path available: focused failing test, regression test, characterization test, or harness repair when the existing setup blocks useful proof.
- When the user asks for TDD, drive the code change end to end through RED, GREEN, and REFACTOR instead of only advising.
- Capture concrete command evidence so workflow gates can reuse it without rerunning the same reasoning.

### Beer Flow Integration

- If invoked from `debugging`, keep root-cause evidence visible and return the RED/GREEN proof to the debug or repair path.
- If invoked from `executing`, keep the current phase contract scope fixed. TDD does not authorize extra behavior beyond the validated slice.
- For Beer routes, set `tdd_required = true` when a behavior-changing slice needs fail-first proof; set `tdd_status = complete` and `tdd_evidence_path` only after RED/GREEN/REFACTOR evidence exists.
- If invoked before `validating`, return test evidence as planning/validation input; do not bypass the validation gate for feature work.
- If invoked directly by the user, complete the smallest RED/GREEN/REFACTOR loop and route completed work to `reviewing` when code changed.

### Ownership Boundary

- `test-driven-development` owns the RED/GREEN/REFACTOR proof loop and test evidence.
- `planning` and `validating` own feature scope approval; TDD evidence can strengthen those gates but not replace them.
- `executing` owns implementation scope when TDD is invoked inside an approved slice.
- `reviewing` owns final quality judgment after code changes.

### Phase 1: Confirm Scope

- Use this skill for:
  - new behavior
  - bug fixes
  - refactors that must preserve behavior
  - logic changes that need regression proof
- Do not skip TDD just because the change looks small.
- Only waive TDD when the task is truly outside behavior-testing value, such as:
  - throwaway prototype work
  - generated code
  - configuration-only changes with no runtime behavior change
  - docs-only changes
- If TDD is waived, say so explicitly in the handoff and state why the task had no meaningful failing-test path.
- A missing or broken test harness is a blocker, not a clean waiver.

### Phase 2: RED

- Write one minimal test for one behavior.
- Prefer behavior-focused tests over implementation-detail tests.
- Use clear test names that describe the expected outcome.
- Run the exact test command for that scope and verify:
  - the test fails
  - the failure is expected
  - the failure is caused by missing or wrong behavior, not test setup mistakes
- If the test passes immediately, the test does not prove the change yet. Fix the test before writing or trusting new production code.
- If new production code for the target behavior already exists without a prior failing test, do not call the work TDD-complete. Re-establish a real RED state before continuing.
- If RED is blocked by environment, harness, or baseline failures, report the blocker and stop; do not count the run as TDD-complete.

### Phase 3: GREEN

- Write the smallest production change that makes the RED test pass.
- Do not add extra features, speculative options, or unrelated cleanup in this step.
- Re-run the exact focused test first.
- Then run the smallest broader regression scope that proves the change did not break nearby behavior.
- At minimum, the broader regression scope should include the surrounding test file, nearest module/package test target, or exact bug-reproduction suite plus one nearby path. If none exists, state why and treat that as a limitation.
- If GREEN fails, fix the production code before broadening the test scope again.

### Phase 4: REFACTOR

- Refactor only after GREEN is stable.
- Allowed refactors:
  - remove duplication
  - improve names
  - extract helpers
  - simplify structure
- Do not change behavior during REFACTOR.
- Keep the focused test and the nearby regression scope green throughout cleanup.

### Phase 5: Handoff

- Report:
  - the test file or scope used for RED
  - the command used to prove RED
  - the RED exit status and short failure excerpt
  - the command used to prove GREEN
  - the GREEN exit status or short pass excerpt
  - blocked attempts, if any
  - the behavior covered
  - any TDD waiver or limitation
- If the code changed but no meaningful failing test was demonstrated first, do not claim TDD was completed.
- If TDD is blocked or waived, record `tdd_status = blocked` or `waived`; do not let automatic review handoff treat it as complete.
- If this TDD loop belongs to a Beer feature or debug repair, state which gate should receive the evidence next: `validating`, `executing`, `debugging`, or `reviewing`.

---

## Key References

- [Workflow detail](references/workflow.md) - Full RED -> GREEN -> REFACTOR workflow and decision rules
- [Quick reference](references/quick-ref.md) - Fast checklist, smell tests, and handoff minimums
- [Communication templates](references/communication.md) - TDD run reports, waivers, and blocker formats
