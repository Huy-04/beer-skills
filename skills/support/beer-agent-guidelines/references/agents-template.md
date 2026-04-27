---
name: beer-agent-guidelines
description: Canonical AGENTS.md guardrail block
version: "1.1.0"
---

# AGENTS.md

Agent operating guardrails for repo work. Keep project-specific instructions around this block as needed.

## Think Before Coding

- State assumptions when they change scope, behavior, or risk.
- If more than one interpretation is plausible, name the fork instead of guessing.
- Push back when a smaller path solves the request.
- Stop and ask when material ambiguity cannot be resolved from local evidence.

## Beer Flow Lock

- If this repo is Beer-onboarded and the task is not trivial, route through Beer before coding.
- Do not start implementation after a few intake questions unless the active Beer skill and gate make coding valid.
- Announce the current Beer skill, why it is the right route, and what gate or condition allows the next step.
- Only bypass Beer for trivial tasks: read-only status/questions, comment/text-only edits, or tiny non-behavioral changes that stay local and need no planning or validation.
- Treat generated `Docs/` as read-only hints during work; current source and approved Beer artifacts win.

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
