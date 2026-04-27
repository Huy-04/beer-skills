---
name: compounding
description: >
  This skill should be used when completed feature work or debugging work
  should be turned into reusable Beer learnings.
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

# compounding

Capture reusable learnings from finished work so later planning, exploring, and
debugging start from stronger evidence.

## At a Glance

| | |
|---|---|
| **Use when** | Review passed with Gate 4 approved, direct work finished cleanly, or debugging exposed a reusable lesson |
| **Needs** | `.beer/state.json`, the finished route source (`review_route` or debug evidence), the route/evidence artifacts that explain what happened, and closeout refresh statuses |
| **Produces** | A learnings file when reusable learning exists, optional critical-pattern promotion, optional generated Docs refresh ask, or a no-learning closeout trail |
| **Next** | Idle Beer state, or the next feature with stronger starting knowledge |

## Compounding Routes

### Feature-Closeout Route

Use when a feature completed review and is ready for final learning capture.

### Direct-Completion Route

Use when bounded direct execution and proportional review finished, but the work
still produced something reusable.

### Debug-Learning Route

Use when debugging exposed a reusable failure pattern even if the work was not a
full feature.

## Scope and Ownership

- `reviewing` owns the quality gate and closeout decision.
- `debugging` owns reproduction evidence and root-cause proof.
- `compounding` owns the learning synthesis, promotion decision, and deciding whether a generated Docs refresh is worth asking the user for.
- the orchestrator owns the final closeout-state mutation and idle reset after compounding obligations are satisfied.
- `compounding` does not require subagents by default. Local synthesis is the default path.

## 30-Second Version

1. Detect the compounding route from authoritative Beer state or proven debug evidence.
2. Read only the artifacts needed to explain what happened, including the route artifact or execution evidence named by state.
3. Capture three buckets locally: patterns, decisions, failures.
4. If no candidate is reusable, record a no-learning closeout decision and skip the learnings file.
5. Write one learnings file only when at least one reusable learning exists.
6. Promote only the small subset that is truly reusable across future work.
7. Resolve GitNexus refresh status to `completed` or `skipped` before closeout.
8. Ask the user about refreshing generated `Docs/` only when the finished work produced reusable project patterns worth preserving.
9. Run `beer closeout-guard` before claiming compounding is complete or resetting Beer to idle.
10. Update Beer state and clear temporary compounding artifacts.

## Output Contract

Produce when reusable learning exists:

- `history/learnings/YYYYMMDD-<slug>.md`

If no reusable learning exists:

- do not create a ceremonial learnings file
- record `learnings_file = ""` and `critical_promotions = 0`
- record `knowledge_base_refresh_status = not-needed`
- still satisfy GitNexus refresh status and closeout guard before idle reset

Promote only when warranted:

- `history/learnings/critical-patterns.md`

Optional supporting artifacts:

- `.beer/findings/learnings-candidates.md`
- debug notes or review notes that feed the final synthesis

## Hard Rules

- Never skip closeout solely because the work felt small; when nothing reusable emerged, record the no-learning path and finish the closeout obligations without a learnings file.
- Never fabricate learnings to make the file look substantial.
- Never promote a feature-specific quirk to `critical-patterns.md`.
- Never require merged branch history to capture a valid learning.
- Never treat `manual-review` as a valid compounding source route.
- Never treat `STATE.md` as authoritative; update `state.json` first.
- Never leave a learning without an `applicable_when` condition.
- Never treat post-task GitNexus refresh as a tool update; it means re-indexing the current repo, typically via `npx gitnexus analyze`.
- Never reset to idle while `gitnexus_refresh_status` is `manual-required`, `failed`, or empty.
- Never ask for generated Docs refresh unless the finished work created reusable patterns, conventions, architecture notes, or critical-flow guidance worth keeping.
- Never treat `knowledge_base_refresh_status = approved` as final closeout; it is an intermediate state until the refresh is recorded as `refreshed`, `declined`, or `not-needed`.
- Never finish compounding while GitNexus refresh status or the final generated Docs refresh decision is still missing from `.beer/state.json`.
- Never reset Beer to idle before `beer closeout-guard` says closeout obligations are complete.

## State Contract

- `state.json` is authoritative.
- For review-derived closeout, use `review_route` in `.beer/state.json` as the route source instead of inventing a closeout route after the fact.
- Record the compounding route, learnings file path, promotion count, and idle reset trail in `.beer/state.json`.
- Treat `beer closeout-guard` as the last gate before the orchestrator resets Beer to idle.
- Return Beer to idle after compounding while preserving the closeout trail fields (`compounding_route`, `learnings_file`, `critical_promotions`) for the just-finished work.
- Regenerate `.beer/STATE.md` after `state.json` changes.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
- [Learnings template](references/learnings-template.md)
