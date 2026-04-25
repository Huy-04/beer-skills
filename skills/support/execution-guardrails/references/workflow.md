---
name: execution-guardrails
description: Detailed workflow for applying Karpathy-style coding guardrails inside Beer
version: "1.0.0"
---

# execution-guardrails - Workflow Detail

## Purpose

Use this support skill to sharpen an active task before implementation or review. The skill does not own the code change. It owns the discipline applied to the change.

## Phase 1: Lock the Real Task

Start from the exact request, current slice, or diff under review.

Capture:

- the requested outcome
- the likely failure if the request is interpreted too broadly
- any ambiguity that changes scope, behavior, or verification

Decision rule:

- If repo evidence resolves the ambiguity safely, proceed with that interpretation and state it.
- If multiple interpretations remain materially different, name them.
- Ask only when the ambiguity blocks safe progress.

## Phase 2: Pressure the Plan for Simplicity

Take the current plan or first idea and try to collapse it.

Check for:

- abstraction created for one use
- configurability or optionality not requested
- broad error handling for scenarios not in scope
- large refactors hiding inside a small request

If a smaller path exists, present it first. Do not present the large plan as the default when the simple plan is adequate.

For trivial work:

- do not force a full ceremony
- state the assumption
- make the bounded change
- verify proportionally

## Phase 3: Draw the Edit Boundary

Before code changes, define:

- which files are in scope
- which adjacent areas are explicitly out of scope
- what cleanup is allowed because the current change created it

Examples:

- unused import caused by the current edit: in scope
- pre-existing dead helper in the same file: out of scope unless requested
- formatting unrelated sections while already editing the file: out of scope

If the work crosses the original boundary during execution, stop and reframe instead of silently widening the diff.

## Phase 4: Define Proof Before Editing

Translate the request into a concrete completion check.

Prefer, in order:

1. focused failing test, then passing test
2. targeted existing test scope
3. deterministic command or inspection
4. exact file or artifact state that can be checked directly

Weak proof smells:

- "should work now"
- "looks right"
- "manual check later"
- "no test needed" without a concrete inspection substitute

If the proof needs a real RED -> GREEN loop, hand off to `beer:test-driven-development`.

## Phase 5: Reapply During Review

When reviewing a diff, run the same four checks:

1. Was the interpretation explicit?
2. Is the solution smaller than the request needed?
3. Did the diff stay inside scope?
4. Is success actually proven?

Common review findings this skill should surface:

- hidden assumption in the implementation
- abstraction added without a second use case
- unrelated file edits
- verification too broad, too weak, or missing

## Pressure Scenarios

Use these as quick mental tests while applying the skill:

### Scenario A: Ambiguous request under time pressure

Bad behavior:

- silently choose the most obvious interpretation
- implement immediately

Correct behavior:

- state the likely interpretation
- name the fork if another interpretation changes scope
- ask only if the difference is material and unresolved

### Scenario B: Simple request, elaborate plan

Bad behavior:

- introduce a framework, strategy object, or reusable layer for one change

Correct behavior:

- start with the one-function or one-file solution
- justify any abstraction with current evidence, not future imagination

### Scenario C: File already contains mess

Bad behavior:

- clean unrelated code because the file is open anyway

Correct behavior:

- change only what the task needs
- mention unrelated problems separately if they matter

### Scenario D: Verification is hand-wavy

Bad behavior:

- claim success without a named proof step

Correct behavior:

- define the test, command, or artifact check first
- treat missing proof as incomplete work, not as a narrative issue

## Minimum Handoff Shape

Return:

- `Task`
- `Assumptions`
- `Simplest path`
- `Scope boundary`
- `Verification`
- `Stop/ask trigger`

Keep the handoff short enough that the downstream workflow can act on it immediately.
