---
name: beer-execution-guardrails
description: >
  This skill should be used when the user asks to "use Karpathy guidelines",
  "be more surgical", "avoid overengineering", "think before coding",
  "keep the diff minimal", "push back on a bloated plan", or otherwise wants
  explicit execution guardrails applied before planning, implementing,
  refactoring, or reviewing code.
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  tags:
    - beer/support
    - guardrails
    - execution
  dependencies: []
allowed-tools:
  - Read
  - Bash
user-invocable: true
disable-model-invocation: false
---

# execution-guardrails

Apply Karpathy-style execution guardrails so the next code step is explicit, minimal, and verifiable.

---

## At a Glance

| | |
|---|---|
| **Use when** | The task needs stronger discipline around assumptions, simplicity, diff scope, or verification |
| **Needs** | The current request plus enough local context to judge ambiguity, scope, and proof |
| **Produces** | A guardrail frame: assumptions, simpler path, edit boundary, and verification target |
| **Next** | Continue with the active Beer workflow or user-requested coding task under those constraints |

---

## 30-Second Version

1. **Restate the target** in concrete terms.
2. **Surface ambiguity** instead of silently picking an interpretation.
3. **Prefer the smallest viable change** and push back on speculative complexity.
4. **Bound the edit surface** so every changed line traces back to the request.
5. **Convert the request into proof**: what check, test, or inspection will show success.

---

## When to Invoke

| Scenario | Action |
|---|---|
| Request is ambiguous and implementation pressure is high | Surface assumptions or ask a bounded clarification |
| Proposed solution looks bloated for the stated goal | Offer the simpler path first |
| Diff is drifting beyond the requested scope | Reassert the allowed edit surface |
| Implementation is moving without clear proof of success | Define the verification target before proceeding |
| Review finds drive-by cleanup or speculative abstraction | Flag it and reduce the scope |

---

## Capability First

- Strengthen execution quality without turning the workflow into ceremony.
- Push the work toward clearer assumptions, smaller diffs, and stronger proof.
- Challenge bloated or weak plans directly when a simpler path exists.
- Stay proportional: trivial work should not be slowed down by unnecessary ritual.

---

## Guardrail Loop

### 1. Think Before Coding

- State the active interpretation of the request.
- If multiple readings are plausible, name them instead of guessing.
- Ask only when ambiguity blocks safe progress; otherwise state the assumption explicitly.
- If local evidence resolves the ambiguity, use it and say so.

### 2. Simplicity First

- Prefer the minimum code that satisfies the request.
- Reject single-use abstractions, speculative options, and defensive branches that do not solve the current problem.
- If the proposed plan feels larger than the request, present the smaller path first.

### 3. Surgical Changes

- Limit the edit surface to files and lines that trace directly to the task.
- Remove only the debris created by the current change.
- Do not turn adjacent cleanup, comment rewrites, or opportunistic refactors into hidden scope.

### 4. Goal-Driven Execution

- Define what success looks like before code changes begin.
- Prefer fail-first proof when the task changes behavior.
- If tests are not appropriate, define the exact command, artifact, or inspection that will prove the result.

---

## Ownership Boundary

- `execution-guardrails` owns assumption surfacing, simplicity pressure, scope discipline, and verification framing.
- The active workflow skill or user task owns routing, code edits, artifact creation, and final go/no-go decisions.
- This skill may tighten the execution frame aggressively, but it should not replace `planning`, `executing`, `reviewing`, or `test-driven-development`.

---

## Output Contract

Return a compact execution frame with:

- task restatement
- explicit assumptions or ambiguity notes
- the simplest viable path
- in-scope and out-of-scope edit boundaries
- the verification target
- stop or ask criteria if the frame becomes invalid

---

## Integration

- Use before `planning` when the task framing is loose or overloaded.
- Use before `executing` when the next step is clear but the implementation risks overreach.
- Use during `reviewing` as a smell test for assumption drift, overengineering, or unnecessary diff surface.
- Pull in `test-driven-development` when the proof requirement should be a true RED -> GREEN loop.

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|---|---|
| Silent assumption picking | Hides the real decision and produces wrong work faster |
| "Flexible" abstraction for a one-off task | Adds complexity the request did not earn |
| Cleaning up unrelated code while touching the file | Expands scope and muddies review |
| Calling work "done" without a defined check | Leaves success subjective and fragile |
| Using the guardrails as an excuse to stall trivial work | Turns caution into drag instead of quality |

---

## Key References

- `references/workflow.md` - full guardrail application flow
- `references/communication.md` - concise templates for pushback, assumption surfacing, and verification framing
- `references/quick-ref.md` - one-page checklist for live use

---

## Handoff

> Guardrail frame prepared. Continue the active task with the stated assumptions, scope boundary, and proof target.
