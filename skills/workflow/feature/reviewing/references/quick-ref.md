---
skill: reviewing
purpose: Compact reminders for review routes and severity
version: "1.0"
---

# reviewing Quick Reference

## Route Guide

| Route | Typical use | Closeout? |
|---|---|---|
| `feature-final` | Final feature slice completed | Yes |
| `direct-completion` | Bounded direct execution completed | Yes, proportional |
| `manual-review` | User asks for findings on current changes | No, unless explicitly requested |

## Ownership Reminder

- the orchestrator records the final Gate 4 decision
- `beer-review-guard.mjs` informs the judgment; it does not approve review by itself
- `manual-review` should not mutate `approved_gates.review` unless the user explicitly asks for full finish

## Findings Checklist

Each finding should answer:

1. what is wrong now
2. why it matters
3. one failure scenario
4. smallest fix direction

## Evidence Gate

- read `execution_evidence_path` when present
- require equivalent completion notes if the path is missing
- do not pass review without credible verification evidence
- run `beer-review-guard.mjs` and treat `BLOCK` as a repair or reslice signal
- use knowledge-base entries only after task purpose and affected scope are already known
- check backend, frontend, and boundary patterns separately when the task crosses those surfaces

## Severity Guide

| Severity | Meaning |
|---|---|
| `P1` | blocks ship |
| `P2` | serious but not immediate ship-stop |
| `P3` | follow-up or cleanup |

## UAT Guide

| Change type | UAT expectation |
|---|---|
| user-visible behavior | required |
| API behavior the user can verify | usually required |
| internal-only refactor | optional |
| manual review-only request | only if requested |

## Review Lenses

- `layout lens`
- `handler-flow lens`
- `layer-pattern lens`
- `boundary lens`

## Auto-Handoff

Only auto-handoff to `compounding` after `beer-auto-accept.mjs --gate compounding` returns `ALLOW`.
Set `approved_gates.review = true` only when Gate 4 is genuinely green.
