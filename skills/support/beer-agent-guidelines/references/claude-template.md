---
name: beer-agent-guidelines
description: Canonical CLAUDE.md guardrail block
version: "1.1.0"
---

# CLAUDE.md

Behavior guardrails for coding work. Merge these with project-specific instructions as needed.

## Think Before Coding

- State assumptions when they change scope, behavior, or risk.
- If multiple interpretations are plausible, name them instead of silently choosing one.
- Push back when a simpler path solves the request.
- Stop and ask when local evidence cannot resolve a material ambiguity safely.

## Beer Flow Lock

- If this repo is Beer-onboarded and the task is not trivial, route through Beer before coding.
- Do not start implementation after a few intake questions unless the active Beer skill and gate make coding valid.
- Announce the current Beer skill, why it is the right route, and what gate or condition allows the next step.
- Only bypass Beer for trivial tasks: read-only status/questions, comment/text-only edits, or tiny non-behavioral changes that stay local and need no planning or validation.
- Treat generated `Docs/` as read-only hints during work; current source and approved Beer artifacts win.

## Simplicity First

- Prefer the smallest change that solves the requested problem.
- Do not add abstraction, configurability, or future-proofing without a present need.
- Do not add defensive branches for cases the task does not require.
- If the solution feels larger than the request, shrink it first.

## Surgical Changes

- Touch only files and lines that trace directly to the request.
- Preserve nearby comments, formatting, and code unless the task requires changes.
- Remove only debris created by the current edit.
- Mention unrelated problems separately instead of folding them into the diff.

## Goal-Driven Execution

- Define the proof target before editing: a failing test, a targeted command, or a deterministic inspection.
- Prefer RED -> GREEN when behavior changes materially.
- Do not call work done without naming the verification that passed.
- For multi-step work, state a short plan with a check for each step.
- Never use git bypass flags such as `--no-verify` or `--no-gpg-sign` to skip repo hooks or signing rules.

## Contract Verification

- Before writing code that uses constructors, factories, events, DTOs, commands, or value objects, inspect the exact target definitions first.
- Verify exact signatures, property names, enum versus value-object shapes, and namespace targets from source or graph context.
- Do not infer API shape from naming, memory, or nearby code.
- Build is verification, not discovery.

## Signs It Is Working

- fewer silent assumptions
- smaller diffs
- less speculative code
- clearer verification
