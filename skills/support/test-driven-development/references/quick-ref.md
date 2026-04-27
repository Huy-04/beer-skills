---
name: test-driven-development
description: Fast checklist for Beer TDD runs
version: "1.1.0"
---

# test-driven-development - Quick Reference

## Nested Loop Reminder

- record `tdd_entry_phase`
- keep one target behavior explicit
- set `tdd_status = required` when Beer requires the loop
- return to the parent workflow with a named `tdd_exit_target`
- do not treat TDD as a replacement top-level route
- do not create or refresh generated `Docs/`

## Use By Default

- new feature behavior
- bug fix
- logic change
- behavior-preserving refactor with risk

## Legitimate Waivers

- throwaway prototype
- generated code
- configuration-only change with no runtime behavior change
- docs-only change

## Blockers, Not Waivers

- missing test harness
- broken baseline
- environment failure
- dependency install failure

## RED Checklist

- [ ] One behavior only
- [ ] Clear test name
- [ ] Focused test command chosen
- [ ] Test fails
- [ ] Failure matches the intended missing or broken behavior
- [ ] Exit status or short failure excerpt captured
- [ ] RED evidence artifact written
- [ ] "Right failure" sentence captured
- [ ] No production-code claim before RED

## GREEN Checklist

- [ ] Smallest production change made
- [ ] Focused RED test now passes
- [ ] Smallest meaningful regression scope passes
- [ ] Exit status or short pass excerpt captured
- [ ] GREEN evidence artifact written
- [ ] No unrelated cleanup added

## REFACTOR Checklist

- [ ] Only cleanup after GREEN
- [ ] No behavior expansion
- [ ] Focused test stayed green
- [ ] Regression scope stayed green
- [ ] REFACTOR artifact written or `no refactor` recorded

## Beer Gate Checklist

- [ ] Debug work keeps root-cause evidence attached to RED/GREEN proof
- [ ] Execution work stays inside the approved phase contract
- [ ] Feature work does not bypass `validating`
- [ ] Direct TDD requests are bounded before production code changes
- [ ] Changed code routes to `reviewing` after the TDD loop
- [ ] Exit target is explicit before handoff

## Minimum Handoff

- [ ] Target behavior named
- [ ] RED test path or scope listed
- [ ] RED command listed
- [ ] RED exit status or short failure excerpt listed
- [ ] GREEN command listed
- [ ] GREEN exit status or short pass excerpt listed
- [ ] Regression scope listed
- [ ] `tdd_status` and required state updates listed
- [ ] Route artifact or bounded direct-scope boundary listed
- [ ] RED/GREEN/REFACTOR artifact paths listed if split
- [ ] Blocked attempts listed if any command could not produce valid evidence
- [ ] Waiver or limitation listed if present

## Fast Smell Test

- passing test appeared before behavior changed
- production code existed before a real RED run
- GREEN added extra features not demanded by the test
- regression scope was skipped
- "manual testing was enough"
- waiver reason was urgency or confidence
- missing harness was treated as a clean waiver
- config change waived despite runtime behavior change
- direct TDD request became a feature route but skipped planning or validating
- TDD tried to refresh generated `Docs/`

## Exit Targets

- `beer:executing`
- `beer:debugging`
- `beer:validating`
- `beer:reviewing`
- user handoff
