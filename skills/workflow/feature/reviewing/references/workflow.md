---
skill: reviewing
purpose: Route-aware workflow for post-execution review
version: "1.0"
---

# reviewing Workflow

## Phase 0: Detect the Review Route

Choose one route:

- `feature-final`
- `direct-completion`
- `manual-review`

Detection guide:

| Signal | Route |
|---|---|
| final validated feature slice completed | `feature-final` |
| bounded direct execution completed | `direct-completion` |
| user explicitly asks for a review only | `manual-review` |

If the route is unclear, default to the smallest honest route and say so.

Route guard:

- `manual-review` reports findings and may stop there
- only Beer-continuing routes may approve Gate 4 and hand off to `compounding`

## Phase 1: Load Review Inputs

Read:

- current diff or changed files
- `.beer/state.json`
- execution evidence from `state.execution_evidence_path` when present, or equivalent completion notes from the just-finished slice
- the route artifact named by execution evidence: `compact-plan.md`, current phase contract, or coordinator assignment
- `history/<feature>/CONTEXT.md` when product decisions matter
- `history/<feature>/approach.md` only when that was the artifact execution actually followed or when feature-final context needs broader intent
- relevant generated `Docs/` entries only after the task purpose, affected layers, and affected boundary scope are already known from workflow context

For debug-derived repairs, keep the root-cause sentence visible during review.

Do not use generated `Docs/` to guess what the task is. Use it to load the
expected BE/FE/boundary pattern and verification targets for the task that is
already known.

## Phase 1.5: Check Execution Evidence Contract

For Beer-continuing routes, execution evidence must include:

- route artifact used
- implementation pattern followed
- source facts re-checked
- files changed
- verification run
- TDD disposition: `complete`, `waived: <reason>`, or `not-required`
- deviations from the approved artifact, or `none`

For swarmed execution, verify the aggregate evidence lists those fields per
worker. For direct execution, verify the single execution evidence note lists
those fields for the completed slice.

If the evidence is missing required fields:

- do not pass Gate 4
- return to `beer:executing` when the implementation can still supply missing execution evidence
- return to `beer:swarming` when aggregate worker evidence is incomplete
- return to `beer:validating` when the missing fields reveal that the contract was never actually verified

For `manual-review`, report that execution evidence is missing or incomplete,
but do not mutate Gate 4 unless the user explicitly converts the request into a
Beer closeout route.

## Phase 2: Produce Findings

Review locally through explicit lenses:

1. correctness and behavior
2. safety and edge cases
3. regression coverage and verification quality
4. maintainability and scope discipline
5. layer-pattern fit for the touched backend/frontend/boundary scope
6. handler-flow fit when backend orchestration is the task's main surface

List findings first and order them by severity.

Every finding should be tagged `P1`, `P2`, or `P3`.

Severity outcome rules:

- `P1` -> the review outcome must be blocking
- `P2` -> blocks automatic closeout; fix it now unless the user explicitly accepts it as tracked follow-up and it does not threaten core behavior, data integrity, security, or the approved route's exit state
- `P3` -> may remain as follow-up when the rest of the gate is green

If the route has live bead state and a repair will need tracked follow-up:

- `P1` can become blocking repair work
- `P2` and `P3` can become non-blocking follow-up work

If the route has no live bead state, keep findings as plain review output.

## Phase 2.5: Decide Specialist Reports

Before deciding the final outcome, determine whether specialist reports are
required for the already-known task scope. These reports are local review lenses
by default, not separate subagent dependencies. Use a subagent only when the
host runtime actually provides one and the scope benefits from it.

Required report mapping:

- `user-visible` or `risk = high` -> `beer-test-reviewer`
- `boundary` or `security-sensitive` -> `beer-security-reviewer`
- `performance-sensitive` or `hot-path` -> `beer-performance-reviewer`
- `deployment-sensitive` or `migration` -> `beer-deployment-reviewer`

Security report standard:

- identify the entry point, trust boundary, or attack surface under review
- name the missing or weakened control
- state the exploit or failure scenario
- state why the issue is material for this slice

Do not turn generic hardening advice into a blocking vulnerability when the changed slice did not actually create or worsen the risk.

Deployment report standard:

- identify the rollout-sensitive surface
- name the rollout or migration obligation
- state rollback sensitivity
- state the rollback trigger or abort condition
- name the post-change verification signal

The post-change verification signal should be concrete: a metric, trace, log, health check, or SLO signal that can confirm the change stayed healthy after rollout.

If that signal does not exist yet, record the gap explicitly instead of pretending the rollout is fully covered.

When the rollout includes a schema migration, backfill, or data-shape transition,
also name the data-integrity or backfill-completion signal that proves the
transition finished safely.

Performance report standard:

- identify the measured scope or suspected hotspot
- name the baseline if one exists
- state the observed regression, or say the lane only found risk without a trustworthy baseline
- state the threshold or reason that makes the performance concern material

Do not escalate a performance finding to blocking language on intuition alone when no baseline or bounded hotspot evidence exists.

Approval rules:

- do not approve if a required report is missing
- do not approve if any report returns `FAIL`
- do not approve if a required report is not `PASS`
- treat `WARNINGS` as a repair/no-repair judgment input, not as silent approval
- do not block solely because a named subagent is unavailable; produce the required report locally

## Phase 3: Verify Substance

For each claimed deliverable, ask three questions:

1. does it exist?
2. is it substantive, not a stub?
3. is it wired into the real flow?

Compact routes can apply this only to the touched deliverables.
Feature-final routes should apply it to every deliverable promised by the
current phase or feature.

Pattern-fit checks:

- if the task is backend-focused, verify backend handler/lifecycle/infra responsibilities against backend layer patterns
- if the task is frontend-focused, verify frontend page/api/state/session responsibilities against frontend layer patterns
- if the task touches a seam, verify the boundary pattern separately instead of pretending BE and FE share one verification unit

When GitNexus-backed verification targets exist in generated `Docs/`, use them
to guide structural validation. If generated Docs hints conflict with GitNexus
or current source, trust GitNexus/current source and treat the Docs entry as
stale.

Before passing the review gate, run:

```powershell
node .beer/scripts/commands/beer-review-guard.mjs --json
```

Treat `allow = false` as a repair or reslice signal. The guard exists to catch
diffs that are too large for the current orchestration strategy or that spread
across too many implementation areas for one review pass.

When the guard points to route mismatch rather than a local defect:

- return to `beer:planning` when the slice needs to be reshaped
- return to `beer:validating` when the plan remains viable but execution needs a different target or smaller review unit
- return to `beer:executing` only when the fix is still inside the current approved slice

## Phase 4: UAT Decision

Run UAT only when it is warranted:

- required for user-visible or user-verifiable behavior
- optional for purely internal changes unless the user explicitly wants it
- skipped for manual review-only unless the user requests a gate

If UAT fails:

- route to repair work
- keep the failed item explicit
- do not continue to closeout

## Phase 5: Closeout Decision

Possible outcomes:

- `pass` -> ready for closeout or compounding handoff
- `repair-needed` -> route back to implementation work
- `review-only` -> findings delivered, no closeout performed

Outcome defaults:

- specialist report failure or missing required report -> usually route to `beer:validating`
- `P1` implementation defect with otherwise valid slice -> usually route to `beer:executing`
- `P2` that threatens the route's exit state, data integrity, security, or core behavior -> usually route to `beer:executing`
- missing execution evidence fields -> usually route to the owner that produced the incomplete evidence: `beer:executing` or `beer:swarming`
- accepted `P2` follow-up with no route mismatch -> record it and allow closeout only with explicit user acceptance
- review-only requests never mutate Gate 4 unless explicitly converted into a Beer closeout route

Feature-final closeout checklist:

- no blocking findings remain
- accepted `P2` findings have traceable follow-up or a clear user-approved deferral
- execution evidence contract and verification evidence are complete
- user-facing deliverables passed UAT when required
- state is updated for the next owner

Direct-completion closeout checklist:

- no blocking findings remain
- accepted `P2` findings have traceable follow-up or a clear user-approved deferral
- compact execution evidence contract and verification are credible
- user-visible behavior passed focused UAT when required

If closeout would auto-advance to compounding, run:

```powershell
node .beer/scripts/commands/beer-auto-accept.mjs --gate compounding --json
```

Only auto-handoff on `allow = true`. Any P1, unresolved blocking P2, missing
evidence, or failed UAT blocks the handoff.

## Phase 6: Handoff

Update `.beer/state.json` first, then regenerate `STATE.md`.

Before handing off to `beer:compounding`, record:

- `review_status = pass`
- `approved_gates.review = true`

Next owner:

- review passed and workflow should continue -> `beer:compounding`
- repair required -> route back to `beer:executing`, `beer:planning`, or `beer:validating` as the findings require
- manual review-only -> no automatic Beer handoff required and no Gate 4 mutation
