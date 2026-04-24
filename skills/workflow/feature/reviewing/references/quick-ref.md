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

## Auto-Handoff

Only auto-handoff to `compounding` after `beer-auto-accept.mjs --gate compounding` returns `ALLOW`.
Set `approved_gates.review = true` only when Gate 4 is genuinely green.
