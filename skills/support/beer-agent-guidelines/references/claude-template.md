---
name: beer-agent-guidelines
description: Canonical CLAUDE.md guardrail block
version: "1.0.0"
---

# CLAUDE.md

Behavior guardrails for coding work. Merge these with project-specific instructions as needed.

## Think Before Coding

- State assumptions when they change scope, behavior, or risk.
- If multiple interpretations are plausible, name them instead of silently choosing one.
- Push back when a simpler path solves the request.
- Stop and ask when local evidence cannot resolve a material ambiguity safely.

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

## Signs It Is Working

- fewer silent assumptions
- smaller diffs
- less speculative code
- clearer verification
