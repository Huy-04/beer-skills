---
skill: executing
purpose: Route-aware execution workflow
version: "1.0"
---

# executing Workflow

## Phase 0: Determine the Execution Path

Read `.beer/state.json` first.

Expected values:

- direct route -> `execution_target = executing`
- swarm worker route -> `execution_target = swarming`
- execution approval -> `approved_gates.execution = true`
- contract readiness -> `contract_verified = true`

Then identify the active work item:

- direct route -> approved current slice from planning/validating, compact contract, explicit task note, or named bead
- swarm route -> worker assignment from the coordinator

If the route or scope is unclear, stop and ask for clarification or hand back to
the coordinator. Do not guess. `executing` does not invent a new route locally.

If `approved_gates.execution` is false, stop and return to `beer:validating`.
If `contract_verified` is not true, stop and return to `beer:validating` before
editing. Execution should not recover missing contract or pattern detail by
guessing locally.

## Phase 1: Load the Slice

Read only what the slice needs:

- `AGENTS.md`
- `.beer/state.json`
- `history/<feature>/CONTEXT.md` when decisions matter
- `history/<feature>/compact-plan.md` for compact routes
- the current phase contract for feature slices
- the coordinator assignment or bead for swarm workers
- any `HANDOFF.json`

For repair work, also re-read the proven root-cause sentence before
changing code.

Swarm workers may read global artifacts only to understand their assigned scope.
They must not use the global plan to self-select different work.

## Phase 1.5: Pattern Re-Check

Before editing code, read the implementation pattern from `compact-plan.md`,
the current phase contract, or the worker assignment.

Then open the listed evidence files and verify the exact source facts the plan
said to re-check:

- constructors and factories
- event payloads and DTOs
- commands, handlers, and value-object APIs
- enum/string/value-object shape boundaries
- namespace/module targets

If the source facts contradict the plan, stop and return to `beer:planning` or
`beer:validating` with the mismatch. Do not patch around a stale pattern.

If a pattern or verification target came from generated `Docs/`, treat it as a
hint that must survive the same source re-check. `executing` does not refresh
generated Docs; drift is reported to review or compounding after the slice.

## Phase 2: Claim Scope

### Swarm Worker Route

- confirm the assigned work item
- confirm file ownership or reservation
- tell the coordinator if the scope is not actually executable

### Direct Route

- record the active work item in `.beer/state.json`
- make the file scope explicit before editing
- if the work item unexpectedly branches into multiple independent tasks, stop and return to `planning` and `validating`
- only the orchestrator may convert this into a multi-worker path

## Phase 3: Implement

Implementation rules:

- stay inside the approved slice
- match local repo patterns
- follow only the implementation pattern that survived the source re-check
- do real work, not placeholders
- keep changes small enough to explain and verify
- route through `beer:test-driven-development` when the slice should start from a failing test
- for behavior changes, record `tdd_status = required` before required TDD starts, then complete, waived with reason, or not-required; do not silently skip the disposition

## Phase 4: Verify

Verification must be credible for the slice:

- rerun the focused failing path for bug repair
- run the direct acceptance command named in the contract
- run the smallest nearby regression scope that gives confidence

If verification fails twice, stop and escalate. Do not brute-force through the
gate.

## Phase 5: Complete or Escalate

Record completion only after verification passes.

Completion note should include:

- what changed
- files touched
- route artifact read
- implementation pattern followed
- source facts re-checked
- verification run
- TDD disposition
- deviations from the approved plan, or `none`
- next owner

For swarm-worker execution, the completion report back to the coordinator
should also make blocker state explicit:

- `blocker: none` when the assigned work item is complete
- `blocker: <reason>` when the worker cannot continue safely
- update the worker-result record before announcing completion in chat
- keep the worker status explicit: `active`, `blocked`, `stalled`, or `completed`

Write the completion note to a stable evidence file:

- all approved Beer routes: `history/<feature>/execution-evidence.md`

Update `.beer/state.json` with `execution_evidence_path` and `verification_status`.
For swarm-worker execution, also update the assignment substrate in use:

- `bd` / bead record when that is the active coordinator substrate
- Beer-owned worker assignment/result state when Beer is coordinating directly

If the workflow would auto-advance into review, run:

```powershell
node .beer/scripts/commands/beer-auto-accept.mjs --gate reviewing --json
```

Only hand off automatically when the policy returns `allow = true`; otherwise
pause with the evidence file path and verification status.

Next owner guide:

- more approved direct work remains -> continue the direct route
- swarm worker finished assigned work -> report to the coordinator
- final approved slice finished -> `beer:reviewing`
- scope expanded or route no longer fits -> `beer:planning` then `beer:validating`

Only the orchestrator or direct-route owner should advance the global workflow to `beer:reviewing`.
Swarm-worker completion never promotes the global workflow by itself, even when
the local assignment looks final.

## Phase 6: Context Safety

If context usage becomes unsafe:

1. write `HANDOFF.json`
2. record the active work item and verification state
3. stop cleanly

After compaction or resume:

1. re-read `AGENTS.md`
2. re-read `state.json`
3. re-read the active work item
4. only then continue
