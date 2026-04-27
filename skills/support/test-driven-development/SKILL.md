---
name: test-driven-development
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
  version: "1.1.0"
  ecosystem: beer
  tags:
    - beer/support
    - beer/testing
  inputs: "Parent Beer phase or bounded direct TDD request + target behavior + runnable test command or harness repair path"
  outputs: "RED/GREEN/REFACTOR evidence packet, TDD state disposition, minimal implementation, and explicit return owner"
  upstream: "using-beer, executing, debugging, reviewing, validating, or direct bounded user request"
  downstream: "parent Beer skill, reviewing, validating, debugging, executing, or user handoff"
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

Run a nested RED -> GREEN -> REFACTOR proof loop inside the active Beer workflow
before a behavior-changing code change is treated as complete.

---

## At a Glance

| | |
|---|---|
| **Use when** | New behavior, bug fixes, or logic changes that should be proven with tests |
| **Needs** | Target behavior, runnable test command or harness repair path, clear scope for the change, and the parent phase or bounded direct request that opened the loop |
| **Produces** | RED/GREEN/REFACTOR evidence artifacts, TDD state disposition, minimal passing implementation, explicit TDD exit target, and a clean handoff |
| **Next** | Returns to the parent workflow through `beer:executing`, `beer:debugging`, `beer:reviewing`, `beer:validating`, or user handoff |

---

## 30-Second Version

1. **Enter**: Record which Beer phase opened the TDD loop and which behavior is being proven.
2. **Confirm TDD applies**: Use for behavior changes, bug fixes, and refactors that need proof; direct requests must stay bounded or return to the normal Beer route before production code changes.
3. **RED**: Write one focused test for one behavior and run it until it fails for the right reason.
4. **GREEN**: Write the smallest production change that makes that test pass.
5. **VERIFY GREEN**: Re-run the focused test and the nearest useful regression scope.
6. **REFACTOR**: Clean names, duplication, or helper structure only while the tests stay green.
7. **EXIT**: Return proof to the correct parent phase.
8. **REPORT**: State the failing test used, the passing proof, the phase artifacts, any waiver, and any remaining risk.

---

## Core Workflow

### Capability First

- Use the strongest practical test path available: focused failing test, regression test, characterization test, or harness repair when the existing setup blocks useful proof.
- When the user asks for TDD, drive the code change end to end through RED, GREEN, and REFACTOR instead of only advising.
- Capture concrete command evidence so workflow gates can reuse it without rerunning the same reasoning.
- Treat current source and executable test results as authoritative. Generated `Docs/` may suggest expected patterns, but TDD does not create or refresh generated `Docs/` and never treats them as proof.
- Keep evidence phase-local when possible:
  - `tdd_red_evidence_path`
  - `tdd_green_evidence_path`
  - `tdd_refactor_evidence_path`
  A single combined `tdd_evidence_path` is acceptable only if RED, GREEN, and REFACTOR remain clearly separated inside it.

### Beer Flow Integration

- `test-driven-development` is a nested proof loop, not a replacement top-level Beer route.
- If invoked from `debugging`, keep root-cause evidence visible and return the RED/GREEN proof to the debug or repair path.
- If invoked from `executing`, keep the current phase contract scope fixed. TDD does not authorize extra behavior beyond the validated slice.
- For Beer routes, set `tdd_required = true` and `tdd_status = required` when a behavior-changing slice enters a required TDD loop; set `tdd_status = complete` and `tdd_evidence_path` only after RED/GREEN/REFACTOR evidence exists.
- If invoked before `validating`, return test evidence as planning/validation input; do not bypass the validation gate for feature work.
- If invoked directly by the user for a bounded behavior slice, complete the smallest RED/GREEN/REFACTOR loop and route changed code to `reviewing`.
- If direct invocation reveals feature-sized scope, missing approval, or uncertain ownership, stop before production code changes and route to `context-intake`, `planning`, or `validating` with the proposed test target.

### Ownership Boundary

- `test-driven-development` owns the RED/GREEN/REFACTOR proof loop and test evidence.
- the orchestrator or parent phase owns the final gate decision and next global handoff.
- `planning` and `validating` own feature scope approval; TDD evidence can strengthen those gates but not replace them.
- `executing` owns implementation scope when TDD is invoked inside an approved slice.
- `reviewing` owns final quality judgment after code changes.
- `codebase-knowledge` and `compounding` own generated `Docs/` refresh decisions. TDD may report a docs mismatch as a limitation, but it does not refresh docs.

### Phase 1: Confirm Scope

- Record `tdd_entry_phase` before starting the loop.
- If there is no parent Beer phase, confirm the request is a bounded direct TDD task. Otherwise, hand the scope back to the normal Beer route before editing production code.
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
- RED is not complete until its artifact captures:
  - test path or scope
  - exact command
  - exit status
  - short failure excerpt
  - why the failure is the right one
- If new production code for the target behavior already exists without a prior failing test, do not call the work TDD-complete. Re-establish a real RED state before continuing.
- If RED is blocked by environment, harness, or baseline failures, report the blocker and stop; do not count the run as TDD-complete.

### Phase 3: GREEN

- Write the smallest production change that makes the RED test pass.
- Do not add extra features, speculative options, or unrelated cleanup in this step.
- Re-run the exact focused test first.
- Then run the smallest broader regression scope that proves the change did not break nearby behavior.
- At minimum, the broader regression scope should include the surrounding test file, nearest module/package test target, or exact bug-reproduction suite plus one nearby path. If none exists, state why and treat that as a limitation.
- If GREEN fails, fix the production code before broadening the test scope again.
- GREEN is not complete until its artifact captures:
  - focused test command
  - focused pass result
  - broader regression scope
  - broader regression result
  - any limitation in the chosen regression scope

### Phase 4: REFACTOR

- Refactor only after GREEN is stable.
- Allowed refactors:
  - remove duplication
  - improve names
  - extract helpers
  - simplify structure
- Do not change behavior during REFACTOR.
- Keep the focused test and the nearby regression scope green throughout cleanup.
- REFACTOR should leave either:
  - a short refactor artifact describing what was cleaned and what stayed intentionally rough
  - or an explicit `no refactor` note when GREEN was already minimal and no safe cleanup added value

### Phase 5: Handoff

- Report:
  - the test file or scope used for RED
  - the command used to prove RED
  - the RED exit status and short failure excerpt
  - the command used to prove GREEN
  - the GREEN exit status or short pass excerpt
  - blocked attempts, if any
  - the behavior covered
  - `tdd_status` and state updates made or required
  - the route artifact or direct-scope boundary that made the TDD loop legitimate
  - the RED/GREEN/REFACTOR artifact paths, if split
  - any TDD waiver or limitation
- State `generated_docs_refresh = not_performed`, even when generated `Docs/` were read only as a hint.
- If the code changed but no meaningful failing test was demonstrated first, do not claim TDD was completed.
- If TDD is blocked or waived, record `tdd_status = blocked` or `waived`; do not let automatic review handoff treat it as complete.
- If this TDD loop belongs to a Beer feature or debug repair, state the explicit `tdd_exit_target`: `validating`, `executing`, `debugging`, `reviewing`, or user handoff.

### Exit Rules

- Exit to `beer:executing` when the implementation remains inside the approved slice and the parent phase is still valid.
- Exit to `beer:debugging` when the RED/GREEN loop clarified a bug fix but more diagnosis or repair framing is still needed.
- Exit to `beer:validating` when the test evidence was gathered before approval and should strengthen plan/validation input.
- Exit to `beer:reviewing` when code changed and the work is ready for the post-execution quality gate.
- Exit to user handoff when the test harness, environment, or baseline prevents trustworthy TDD progress.

---

## Key References

- [Workflow detail](references/workflow.md) - Full RED -> GREEN -> REFACTOR workflow and decision rules
- [Quick reference](references/quick-ref.md) - Fast checklist, smell tests, and handoff minimums
- [Communication templates](references/communication.md) - TDD run reports, waivers, and blocker formats
- [Pressure scenarios](references/pressure-scenarios.md) - Edge cases for nested TDD behavior
