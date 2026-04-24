---
name: reviewing
description: >
  This skill should be used when execution finishes and the work needs a
  quality gate before closeout, when a completed feature needs final review,
  when a bounded direct execution needs proportional review, or when the user
  explicitly asks for findings on the current diff.
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  tags:
    - beer/workflow
    - workflow
  dependencies:
    - id: beads-cli
      kind: command
      command: bd
      missing_effect: degraded
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
user-invocable: true
disable-model-invocation: false
---

# reviewing

Run the post-execution quality gate. `reviewing` is where the workflow checks
whether the work is actually safe and complete, not just whether implementation
stopped.

## At a Glance

| | |
|---|---|
| **Use when** | A slice or feature is complete and needs review before closeout |
| **Needs** | Execution evidence, current diff, locked decisions or repair goal, and the active route |
| **Produces** | Findings, review disposition, optional UAT result, and closeout or reroute decision |
| **Next** | `beer:compounding` after successful closeout, or back to repair work when review fails |

## Review Routes

### Feature-Final Route

Use when the final validated feature slice is complete. This is the full review
path: findings, artifact verification, UAT when needed, and closeout.

### Direct-Completion Route

Use when bounded direct execution finished. This is a compact review path:
focused findings, focused verification, and proportional finish/no-finish
decision.

### Manual Review Route

Use when the user explicitly asks for a review of the current changes. This
route can stop at findings without running full Beer closeout.

## Scope and Ownership

- `executing` and `swarming` own implementation and execution evidence.
- `reviewing` owns the quality gate and finish/no-finish judgment.
- `reviewing` does not silently reopen planning scope; it either records findings or routes the work back clearly.
- `reviewing` does not need subagents by default. Multi-perspective review can still be done locally with explicit lenses.

## 30-Second Version

1. Detect the review route from Beer state and the user request.
2. Read the diff, the execution evidence, and the relevant contract or `CONTEXT.md`.
3. Produce findings first, ordered by severity.
4. Verify the work is real, wired, and consistent with the approved goal.
5. Run UAT only when the route or deliverable actually needs it.
6. Mark Gate 4 as approved only when findings, evidence, and required UAT are green.
7. Run `beer-auto-accept.mjs --gate compounding` if closeout would auto-advance.
8. Only close out when the review gate is truly green.

## Findings Standard

Findings must come first. Each finding should state:

1. what the code does today
2. why that is risky or wrong
3. one concrete failure scenario
4. the smallest credible fix direction

Severity guide:

- `P1`: blocks ship or risks security, data integrity, or core behavior
- `P2`: serious but not immediate ship-stop
- `P3`: worthwhile cleanup or follow-up

If `bd` and a live epic exist, findings can become repair beads. If they do not,
record the findings plainly and hand the work back without inventing bead state.

## Hard Rules

- Never summarize before listing findings.
- Never pass review without credible verification evidence.
- Never skip UAT for user-visible behavior just because code review looked clean.
- Never require full feature closeout for a manual review-only request.
- Never force bead creation when the active route does not have live bead state.
- Never treat `STATE.md` as authoritative; update `state.json` first.
- Never hide a `P1` behind auto-accept or optimistic wording.
- Never auto-handoff to compounding unless `beer-auto-accept.mjs --gate compounding` returns `ALLOW`.

## State Contract

- `state.json` is authoritative.
- Record the review route, review status, open findings count, and next handoff in `.beer/state.json`.
- Read `execution_evidence_path` from `.beer/state.json` when present. If it is missing, require equivalent execution evidence before passing review.
- Set `review_status = pass` only after findings, evidence, and required UAT are green.
- Set `approved_gates.review = true` only after the closeout decision is genuinely approved.
- Regenerate `.beer/STATE.md` after `state.json` changes.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
- [TDD support](../../../support/test-driven-development/SKILL.md)
