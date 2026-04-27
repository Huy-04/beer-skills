---
skill: compounding
purpose: Route-aware workflow for capturing Beer learnings
version: "1.0"
---

# compounding Workflow

## Phase 0: Detect the Route

Pick one route:

- `feature-closeout`
- `direct-completion`
- `debug-learning`

Prefer authoritative route signals over inference:

| Signal | Route |
|---|---|
| `review_route = feature-final` with review gate passed | `feature-closeout` |
| `review_route = direct-completion` with review gate passed | `direct-completion` |
| debugging exposed a reusable root-cause pattern | `debug-learning` |

For review-derived routes, require:

- `review_status = pass`
- `approved_gates.review = true`

Do not convert `review_route = manual-review` into compounding. That route stops
at findings delivery unless the user explicitly chooses a new Beer workflow.

## Phase 1: Gather Only the Needed Evidence

Read the smallest honest set:

- `.beer/state.json`
- `history/<feature>/CONTEXT.md` when decisions matter
- the route artifact named by execution or review evidence: `compact-plan.md`, current phase contract, coordinator assignment, or full planning artifact
- execution evidence and review summary
- `history/<feature>/discovery.md` or `history/<feature>/approach.md` only when those artifacts were actually part of the route or broader feature context is needed
- debug note or root-cause sentence for `debug-learning`
- any reusable findings candidates already written

If bead history exists, use it as supporting evidence, not as a hard requirement.

## Phase 2: Capture Three Buckets

Build three local lists:

1. patterns that worked and should be reused
2. decisions that mattered and how they played out
3. failures or wasted effort that future work should avoid

This can be done locally. Do not require subagents unless the user explicitly
asks for parallel analysis.

## Phase 3: Triage

For each candidate learning, assign:

- `category`: `pattern`, `decision`, or `failure`
- `domain`: short technical or process domain
- `severity`: `critical` or `standard`
- `applicable_when`: a concrete condition for future use

Promotion guide:

- `critical` only when the learning would likely save meaningful future effort across more than one feature
- otherwise `standard`
- if no candidate has a concrete `applicable_when`, choose the no-learning closeout path instead of writing a placeholder file

## Phase 4: Write the Learnings Entry

Write one file only when at least one reusable learning passes triage:

```text
history/learnings/YYYYMMDD-<slug>.md
```

One file per completed unit of work. Group related lessons inside it instead of
splitting one file per finding.

If no reusable learning exists:

- do not create a learnings file
- set `learnings_file = ""`
- set `critical_promotions = 0`
- record `knowledge_base_refresh_status = not-needed`
- continue to GitNexus refresh and closeout guard

## Phase 5: Promote Critical Items

For each critical item:

1. confirm it is reusable beyond the just-finished slice
2. append a short entry to `history/learnings/critical-patterns.md`
3. link back to the full learnings file

If nothing qualifies, skip promotion cleanly.

## Phase 6: Post-Task Refresh Follow-Up

Handle the two post-task follow-ups differently:

### GitNexus Repo Re-Index

If the finished work materially changed code or graph-relevant structure, let
Beer auto-refresh the current repo's GitNexus index. This is a repo refresh such
as:

```text
npx gitnexus analyze
```

Do not ask a separate human approval question just for this re-index path.

Review approval normally records `gitnexus_refresh_status` automatically. Before
closeout, require one final status:

- `completed`: proceed
- `skipped`: proceed when no graph-relevant code changed
- `manual-required`: run `beer index` when available because it records state, or run `npx gitnexus analyze` and record a completed or skipped status before closeout
- `failed`: fix or rerun the repo index before closeout

For `debug-learning` or no-code closeout, set `gitnexus_refresh_status = skipped`
when no graph-relevant source changed.

### Generated Docs Refresh

Ask about refreshing generated `Docs/` only when the finished work changed reusable
patterns, conventions, architecture, business rules, or critical flows worth
preserving as curated docs.

Preferred prompt shape:

```text
Compounding is complete. This task produced reusable project patterns. Refresh generated `Docs/` now?
```

If the user approves:

1. invoke `beer:codebase-knowledge`
2. treat that approval as covering the generated Docs refresh; do not ask again inside the downstream skill
3. after the refresh finishes, record `knowledge_base_refresh_status = refreshed`

If the user declines:

- skip the generated Docs refresh cleanly
- keep the learnings and closeout trail
- finish compounding normally

If no generated Docs update is warranted, record
`knowledge_base_refresh_status = not-needed`.

`knowledge_base_refresh_status = approved` is intermediate. It records that the
user approved a refresh, but it is not a valid final closeout status. Do not
reset to idle until the status is `refreshed`, `declined`, or `not-needed`.

## Phase 7: Closeout Guard

Before resetting Beer to idle, run:

```powershell
node .beer/scripts/commands/beer-closeout-guard.mjs --knowledge-base <declined | not-needed | refreshed> --json
```

Only continue when the result is an allow/pass outcome for closeout. Treat any
block as a missing closeout obligation, not as optional advice.

## Phase 8: Update Beer State and Cleanup

Update `.beer/state.json` first with:

- `phase = compounding`
- `compounding_route`
- `learnings_file`
- `critical_promotions`
- `gitnexus_refresh_status`
- `knowledge_base_refresh_status`
- the closeout trail needed before idle reset

Then return Beer to idle while preserving the closeout trail:

- set `phase = idle`
- set `context_stage = none`
- clear `feature_slug`, `context_path`, `route`, `orchestration_strategy`, `current_phase_name`, `current_slice`, and `prep_depth`
- clear `execution_target`, `review_route`, `execution_evidence_path`, and `next_handoff`
- clear cycle-specific evidence such as `tdd_required`, `tdd_status`, and `tdd_evidence_path`
- clear transient result fields such as `validation_status`, `spike_status`, `swarm_status`, `verification_status`, `review_status`, and `open_findings_count`
- reset `approved_gates.context`, `approved_gates.phase_plan`, `approved_gates.execution`, and `approved_gates.review` to `false`
- preserve `compounding_route`, `learnings_file`, and `critical_promotions` so the finished work still leaves a readable trail

Then regenerate `.beer/STATE.md`.

Cleanup:

- clear only temporary compounding artifacts
- do not delete useful history
- do not wipe `.beer/seed/` blindly unless the workflow explicitly wants an idle reset
