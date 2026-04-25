---
name: beer-agent-guidelines
description: Canonical AGENTS.md guardrail block
version: "1.0.0"
---

# AGENTS.md

Agent operating guardrails for repo work. Keep project-specific instructions around this block as needed.

## Think Before Coding

- State assumptions when they change scope, behavior, or risk.
- If more than one interpretation is plausible, name the fork instead of guessing.
- Push back when a smaller path solves the request.
- Stop and ask when material ambiguity cannot be resolved from local evidence.

## Simplicity First

- Prefer the minimum code and process needed for the stated goal.
- Avoid speculative abstraction, flexibility, or future-proofing.
- Avoid defensive handling for cases that are not part of the task.
- If the solution is too large for the request, reduce it.

## Surgical Changes

- Keep the diff limited to files and lines that directly serve the request.
- Preserve surrounding comments, formatting, and unrelated logic.
- Remove only debris introduced by the current change.
- Call out unrelated cleanup separately instead of mixing it into the task.

## Goal-Driven Execution

- Define success before editing with a test, command, or deterministic inspection.
- Prefer RED -> GREEN when behavior changes.
- Do not claim completion without explicit verification.
- For multi-step tasks, keep a short plan with a concrete check per step.

## Signs It Is Working

- fewer silent assumptions
- smaller diffs
- less speculative code
- clearer verification
