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
- `history/<feature>/CONTEXT.md` when product decisions matter
- `history/<feature>/approach.md` when the intended implementation shape matters
- relevant `.beer/knowledge-base/` entries only after the task purpose, affected layers, and affected boundary scope are already known from workflow context

For debug-derived repairs, keep the root-cause sentence visible during review.

Do not use the knowledge base to guess what the task is. Use it to load the
expected BE/FE/boundary pattern and verification targets for the task that is
already known.

## Phase 2: Produce Findings

Review locally through explicit lenses:

1. correctness and behavior
2. safety and edge cases
3. regression coverage and verification quality
4. maintainability and scope discipline
5. layer-pattern fit for the touched backend/frontend/boundary scope
6. handler-flow fit when backend orchestration is the task's main surface

List findings first and order them by severity.

If the route has live bead state and a repair will need tracked follow-up:

- `P1` can become blocking repair work
- `P2` and `P3` can become non-blocking follow-up work

If the route has no live bead state, keep findings as plain review output.

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

When GitNexus-backed verification targets exist in the knowledge-base cache, use
them to guide structural validation. If KB hints conflict with GitNexus or
current source, trust GitNexus/current source and treat the KB entry as stale.

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

Feature-final closeout checklist:

- no blocking findings remain
- verification evidence is complete
- user-facing deliverables passed UAT when required
- state is updated for the next owner

Direct-completion closeout checklist:

- no blocking findings remain
- compact verification is credible
- user-visible behavior passed focused UAT when required

If closeout would auto-advance to compounding, run:

```powershell
node .beer/scripts/commands/beer-auto-accept.mjs --gate compounding --json
```

Only auto-handoff on `allow = true`. Any P1, open finding, missing evidence, or
failed UAT blocks the handoff.

## Phase 6: Handoff

Update `.beer/state.json` first, then regenerate `STATE.md`.

Before handing off to `beer:compounding`, record:

- `review_status = pass`
- `approved_gates.review = true`

Next owner:

- review passed and workflow should continue -> `beer:compounding`
- repair required -> route back to `beer:executing`, `beer:planning`, or `beer:validating` as the findings require
- manual review-only -> no automatic Beer handoff required and no Gate 4 mutation
