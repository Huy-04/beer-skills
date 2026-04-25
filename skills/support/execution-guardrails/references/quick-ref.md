---
name: execution-guardrails
description: Fast checklist for Karpathy-style execution guardrails
version: "1.0.0"
---

# execution-guardrails - Quick Reference

## Invoke When

- request is ambiguous
- plan is getting bloated
- diff scope is drifting
- verification is weak
- review needs a simplicity or surgicality check

## Four Checks

| Principle | Fast question |
|---|---|
| Think Before Coding | What assumption am I making right now? |
| Simplicity First | What is the smallest change that solves this? |
| Surgical Changes | Which edits are truly in scope? |
| Goal-Driven Execution | What exact proof will show success? |

## Good Default Output

- task restatement
- assumptions or ambiguity
- simplest viable path
- in-scope / out-of-scope boundary
- verification target
- stop/ask trigger

## Smell Test

- silently picked one interpretation
- introduced abstraction for one use
- touched nearby code "while here"
- rewrote comments or formatting without need
- called it done without a named check
- used caution as an excuse to stall an obvious one-liner

## Escalate to Other Skills

| Need | Route |
|---|---|
| true fail-first proof | `beer:test-driven-development` |
| execution slice or route decision | `beer:planning` / `beer:validating` |
| implementation work | `beer:executing` |
| final findings on the diff | `beer:reviewing` |

## Hard Rules

- do not guess when the ambiguity changes scope materially
- do not carry speculative flexibility into the code
- do not widen the diff without saying so
- do not claim completion without proof

## Lightweight Mode

For trivial work:

- state the assumption
- make the smallest edit
- run the narrowest proof
- move on
