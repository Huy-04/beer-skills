---
skill: compounding
purpose: Quick reference for route-aware learning capture
version: "1.0"
---

# compounding Quick Reference

## Route Guide

| Route | Typical trigger |
|---|---|
| `feature-closeout` | `review_route = feature-final` and Gate 4 passed |
| `direct-completion` | `review_route = direct-completion` and Gate 4 passed |
| `debug-learning` | reusable debugging lesson emerged |

## Minimum Inputs

- `.beer/state.json`
- relevant execution or review evidence
- `CONTEXT.md` or root-cause note when needed
- `review_status = pass`
- `approved_gates.review = true` for review-derived closeout
- `open_findings_count = 0` unless remaining findings were explicitly deferred

## Route Guard

- `manual-review` is not a compounding route
- `debug-learning` may run without Gate 4 only when the debugging evidence is already strong enough to teach something reusable

## Good Learning Test

A learning is worth keeping when someone who was not in the session can answer:

1. what happened
2. why it mattered
3. when to apply this lesson again
4. what to do differently

## Promotion Test

Promote only if all are true:

- reusable beyond the current slice
- likely to save meaningful future effort
- short enough to scan quickly in `critical-patterns.md`

## One-Line Reminder

`compounding` records genuine reuse value, not a ceremonial summary.
