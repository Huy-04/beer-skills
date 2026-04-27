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
| **Needs** | Execution evidence with required contract fields, current diff, the route artifact execution used, locked decisions or repair goal, and any relevant generated Docs pattern/boundary hints |
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
- the orchestrator owns the final Gate 4 decision and next-handoff mutation in `.beer/state.json`.
- review guards and explicit review lenses inform the decision; they do not silently self-approve the gate.
- `reviewing` does not silently reopen planning scope; it either records findings or routes the work back clearly.
- `reviewing` does not need subagents by default. Multi-perspective review can still be done locally with explicit lenses.

## 30-Second Version

1. Detect the review route from Beer state and the user request.
2. Read the diff, execution evidence, and the route artifact execution says it used: `compact-plan.md`, current phase contract, or coordinator assignment.
3. Check execution evidence has the required fields: route artifact used, implementation pattern followed, source facts re-checked, files changed, verification run, TDD disposition, and deviations.
4. Determine the already-known task purpose, affected layer(s), and affected BE/FE/boundary scope from the approved workflow context.
5. Use generated `Docs/` only to load the expected pattern and verification targets for that known scope.
6. Produce findings first, ordered by severity.
7. Verify the work is real, wired, and consistent with the approved goal, the recorded execution pattern, and the repo's layer/boundary pattern.
8. Run UAT only when the route or deliverable actually needs it.
9. Mark Gate 4 as approved only when findings, evidence contract, required local review reports, and required UAT are green.
10. Run `beer-auto-accept.mjs --gate compounding` if closeout would auto-advance.
11. Only close out when the review gate is truly green.

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

Severity contract:

- every finding must be tagged `P1`, `P2`, or `P3`
- `P1` requires a blocking review outcome
- `P2` blocks automatic closeout, but can be accepted as tracked follow-up when it does not threaten core behavior, data integrity, security, or the approved route's exit state
- `P3` may remain as follow-up when the rest of the gate is green

If `bd` and a live epic exist, findings can become repair beads. If they do not,
record the findings plainly and hand the work back without inventing bead state.

## Review Lenses

Apply the smallest set of lenses that fit the approved task:

- `layout lens`: folder/file placement and responsibility fit
- `handler-flow lens`: orchestration flow, especially inside backend handlers
- `layer-pattern lens`: expected mission and dominant pattern for the touched backend/frontend/boundary layer
- `boundary lens`: FE/BE seam, auth/session, proxy, contract, or error-shape risk when the task touches a cross-side seam

Use the locked task purpose first. Generated `Docs/` entries help load the expected
pattern; they do not define the task retroactively.

## Specialist Report Contract

Specialist lanes are local review reports by default, not separate skill or
subagent dependencies. Use an actual subagent only when the host runtime has one
and the scope justifies it. Some reports become required when scope or risk says
they must run.

Required report mapping:

- `user-visible` or `risk = high` -> `beer-test-reviewer`
- `boundary` or `security-sensitive` -> `beer-security-reviewer`
- `performance-sensitive` or `hot-path` -> `beer-performance-reviewer`
- `deployment-sensitive` or `migration` -> `beer-deployment-reviewer`

Security report contract:

- `beer-security-reviewer` should identify the trust boundary or attack surface it is evaluating.
- It should report:
  - the entry point or boundary under review
  - the missing or weakened control
  - the exploit or failure scenario
  - why the issue is material for this slice
- If the lane is warning about general hardening rather than an actual defect in the changed slice, mark it as bounded risk or follow-up work instead of overstating it as a blocking vulnerability.

Deployment report contract:

- `beer-deployment-reviewer` should identify the rollout-sensitive surface under review.
- It should report:
  - rollout or migration obligation
  - rollback sensitivity
  - rollback trigger or abort condition
  - post-change verification signal
- A post-change verification signal should name the metric, trace, log, health check, or SLO signal that would prove the change stayed healthy after rollout.
- If the change includes a schema migration, backfill, or data-shape transition, the lane should also name the data-integrity or backfill-completion signal that proves the migration finished safely.
- If no such signal exists yet, say so explicitly and treat that as an operational gap instead of implying the rollout is fully verifiable.

Performance report contract:

- `beer-performance-reviewer` should not stop at "looks slower" or "might regress".
- When a performance lane runs, it should report:
  - the measurement scope or hotspot inspected
  - the baseline used, if any
  - the observed regression or risk
  - the threshold or reason that makes the issue material
- If no trustworthy baseline exists, say so explicitly and downgrade the claim to a bounded risk statement instead of pretending a measured regression exists.

Approval contract:

- never approve if a required specialist report is missing
- never approve if any specialist report returns `FAIL`
- never approve if a required specialist report is not `PASS`
- specialist reports with `WARNINGS` may inform `repair-needed`, but they do not silently degrade into approval
- never block solely because no separate subagent exists; produce the required report locally when needed

## Hard Rules

- Never summarize before listing findings.
- Never pass review without credible verification evidence.
- Never pass a Beer-continuing review when execution evidence lacks route artifact used, implementation pattern followed, source facts re-checked, files changed, verification run, TDD disposition, or deviations.
- Never pass review if the current diff exceeds the route's code-quantity or pattern-spread guard.
- Never pass review with `P1` findings.
- Never pass review with `P2` findings unless each one has an explicit disposition: fixed now, accepted by the user as follow-up, or recorded as tracked non-blocking work.
- Never skip UAT for user-visible behavior just because code review looked clean.
- Never skip required specialist reports when the scope or risk activates them.
- Never block only because a named specialist subagent is unavailable; run the required lens locally and record the result.
- Never require full feature closeout for a manual review-only request.
- Never force bead creation when the active route does not have live bead state.
- Never treat `STATE.md` as authoritative; update `state.json` first.
- Never hide a `P1` behind auto-accept or optimistic wording.
- Never auto-handoff to compounding unless `beer-auto-accept.mjs --gate compounding` returns `ALLOW`.
- Never set `approved_gates.review = true` for a `manual-review` route unless the user explicitly converts it into real Beer closeout.

## State Contract

- `state.json` is authoritative.
- Record the review route, review status, finding summary, specialist report outcomes, and next handoff in `.beer/state.json`.
- Read `execution_evidence_path` from `.beer/state.json` when present. If it is missing, require equivalent execution evidence before passing review.
- For Beer-continuing routes, execution evidence must include route artifact used, implementation pattern followed, source facts re-checked, files changed, verification run, TDD disposition, and deviations before review can pass.
- Read the route artifact named by execution evidence. If evidence points to `compact-plan.md`, current phase contract, or coordinator assignment, review against that artifact rather than assuming `approach.md` exists.
- Run `beer-review-guard.mjs` before claiming the review gate is green. Treat a `BLOCK` result as a repair or reslice signal, not as optional advice.
- Set `review_status = pass` only after findings, evidence contract, required UAT, required specialist reports, and any accepted `P2` follow-up dispositions are green.
- Set `approved_gates.review = true` only after the closeout decision is genuinely approved for a Beer-continuing route.
- Keep `approved_gates.review = false` for `manual-review` unless the user explicitly requests full Beer finish/closeout.
- Regenerate `.beer/STATE.md` after `state.json` changes.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
- [TDD support](../../../support/test-driven-development/SKILL.md)
