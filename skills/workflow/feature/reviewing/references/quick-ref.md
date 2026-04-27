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
- read the route artifact execution says it used: `compact-plan.md`, phase contract, or coordinator assignment
- require route artifact used, implementation pattern followed, source facts re-checked, files changed, verification run, TDD disposition, and deviations
- for swarms, require those fields per worker in aggregate evidence
- do not pass review without credible verification evidence
- run `beer-review-guard.mjs` and treat `BLOCK` as a repair or reslice signal
- use generated `Docs/` entries only after task purpose and affected scope are already known
- check backend, frontend, and boundary patterns separately when the task crosses those surfaces

## Severity Guide

| Severity | Meaning |
|---|---|
| `P1` | blocks ship |
| `P2` | serious but not immediate ship-stop |
| `P3` | follow-up or cleanup |

## Severity Outcome Rules

- `P1` -> `blocked`
- `P2` -> blocks automatic closeout; may pass only with explicit fix, user-accepted follow-up, or tracked non-blocking disposition
- `P3` -> may still pass if the rest of the gate is green

## Specialist Report Triggers

These are local review reports by default. Use a real subagent only when the
runtime provides one and it materially helps.

| Scope or risk | Required report |
|---|---|
| `user-visible` or `risk = high` | `beer-test-reviewer` |
| `boundary` or `security-sensitive` | `beer-security-reviewer` |
| `performance-sensitive` or `hot-path` | `beer-performance-reviewer` |
| `deployment-sensitive` or `migration` | `beer-deployment-reviewer` |

Approval reminder:

- no missing required reports
- no report returns `FAIL`
- required reports must be `PASS`
- no blocking solely because no specialist subagent exists

Security report must include:

- entry point or trust boundary under review
- missing or weakened control
- exploit or failure scenario
- why the issue is material for this slice

Deployment report must include:

- rollout-sensitive surface
- rollout or migration obligation
- rollback sensitivity
- rollback trigger or abort condition
- post-change verification signal
- data-integrity or backfill-completion signal when a migration changes schema or data shape

Performance report reminder:

- report measured scope or hotspot
- name the baseline, if any
- state regression or bounded risk clearly
- say why the issue is material instead of implying a regression without evidence

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
