---
name: planning
description: >
  This skill should be used when implementation work needs a bounded plan,
  including feature work after exploring, small-fix work that passes through
  exploring into compact planning, or repair work that needs a planned
  path inside the main Beer workflow.
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
    - id: gitnexus
      kind: mcp_server
      server_names: [gitnexus]
      missing_effect: degraded
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
user-invocable: true
disable-model-invocation: false
---

# planning

Turn a clarified request into a bounded implementation plan. Scale the planning depth to the route and work intent instead of forcing every task through the same full feature shape.

## At a Glance

| | |
|---|---|
| **Use when** | `CONTEXT.md` is locked, `exploring` routes a `small-fix` into compact planning, or repair work needs a planned path |
| **Needs** | One of: locked `CONTEXT.md`; a compact `small-fix` handoff from `exploring`; or a proven root cause from `debugging` |
| **Produces** | `discovery.md`, `approach.md`, `phase-plan.md`, and proportional current-phase prep |
| **Next** | `beer:validating` after approval |

## 30-Second Version

1. Confirm the incoming route and work intent.
2. Reject the route and bounce to the right upstream phase if prerequisites do not match.
3. Read `history/learnings/critical-patterns.md` first.
4. Research only enough repo reality to support the confirmed route.
5. Write `discovery.md`, `approach.md`, and a phase plan sized to the work.
6. Lock `orchestration_strategy` as `single-worker` or `multi-worker`.
7. Make slice ownership, proof target, and validator focus explicit.
8. Ask for approval unless `beer-auto-accept.mjs --gate planning` returns `ALLOW`.
9. Prepare only the current execution slice, proportional to the route.
10. Hand off to `beer:validating`.

## Planning Routes

### Feature Route

Use when:

- `route = feature`
- `context_stage = locked`
- `approved_gates.context = true`
- `history/<feature>/CONTEXT.md` exists
- the work is feature-sized, ambiguous, or cross-cutting

This is the full planning path: research, synthesis, multi-phase plan, and current-phase preparation.

### Small Direct-Fix Route

Use when:

- `route = small-fix`
- the task is local and low ambiguity,
- it likely touches fewer than 3 files,
- `exploring` already applied the small-fix exemption,
- `next_handoff = beer:planning`,
- the fix still benefits from a short explicit plan.

This route stays compact: short discovery, short approach, single-phase plan, and no forced bead graph.

### Repair Intent On Feature Route

Use when:

- `route = feature`
- `work_intent = repair`
- `debugging` already proved the root cause,
- the repair is no longer a tiny local edit,
- the next safe step is a planned repair rather than an immediate patch.

This keeps repair work inside the main feature flow. It must preserve the root-cause statement and avoid drifting into unrelated feature expansion.

## Scope and Ownership

- `exploring` owns locked product decisions and `CONTEXT.md`.
- `debugging` owns reproduction evidence and the root-cause sentence.
- `planning` owns implementation planning, orchestration choice, risk mapping, and current-slice preparation.
- `planning` does not lock new product decisions, silently reinterpret seed context, or start execution.

## Output Contract

### All Routes

Always write:

- `history/<feature>/discovery.md`
- `history/<feature>/approach.md`
- `history/<feature>/phase-plan.md`

`<feature>` must already be present in `.beer/state.json` before planning starts. `planning` does not invent or rename the feature slug.

### Feature Route

After approval, prepare:

- `history/<feature>/phase-<n>-contract.md`
- `history/<feature>/phase-<n>-story-map.md`
- beads only for the current phase when decomposition is actually needed

### Small Direct-Fix And Repair-Intent Routes

After approval, prepare only what is proportional:

- a compact current-phase contract when execution needs it
- no story map or beads unless the work is large enough that direct execution would force guessing

## Hard Rules

- Never start feature planning from `.beer/seed/`; feature route requires locked context.
- Never invent a new planning route inside `planning`.
- Never silently downgrade or upgrade the incoming route; bounce back to the upstream skill instead.
- Never skip learnings retrieval.
- Never create beads before approval.
- Never force multi-phase planning onto tiny small-fix work.
- Never lose the debug root cause when planning repair work.
- Never auto-prepare current-slice work without an `ALLOW` result from `beer-auto-accept.mjs --gate planning`.
- Never hand off directly to `swarming`; `planning` always hands off to `beer:validating`.

## State Contract

- `state.json` is authoritative.
- Update `.beer/state.json` first, then regenerate `.beer/STATE.md`.
- Treat `route` as an incoming contract from upstream. Validate it; do not invent a replacement route locally.
- Record enough state for `validating` to know the active route, `orchestration_strategy`, slice count, planned worker count, and whether current-phase prep is compact or full.
- Set `approved_gates.phase_plan = false` before the planning approval gate, then `true` only after that gate passes.
- Log the auto-accept policy result when it is used to cross the planning gate.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
