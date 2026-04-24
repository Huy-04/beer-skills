---
skill: swarming
purpose: Route-aware coordinator workflow for parallel execution
version: "1.0"
---

# swarming Workflow

## Phase 0: Readiness Gate

Before starting the swarm, confirm:

- `.beer/state.json` names `execution_target = swarming`
- `.beer/state.json` records `approved_gates.execution = true`
- the current slice is approved by `beer:validating`
- the slice still has at least two independent work items
- a current phase contract exists
- if beads are used, the ready set is coherent
- the coordination substrate is configured and live enough for worker status and handoff messages

`beer-preflight` can confirm bd (beads) configuration. It cannot prove that the
active agent runtime can exchange messages, so the coordinator must perform a
runtime readiness check before launching workers.

PowerShell-style checks:

```powershell
Get-Content .beer/state.json | Select-String '"execution_target"\s*:\s*"swarming"'
Get-Content .beer/state.json | Select-String '"execution"\s*:\s*true'
rg --files history | rg "phase-.*contract\.md$"
```

If the slice no longer justifies parallel execution, stop and hand back to
`beer:validating`. Do not continue out of momentum.

If the swarm launch would happen under `run_style = go` or auto-accept, run:

```powershell
node .beer/scripts/commands/beer-auto-accept.mjs --gate swarming --json
```

Only launch on `allow = true`; otherwise pause or route back to validating.

## Phase 1: Initialize Coordinator State

1. Read `AGENTS.md`, Beer state, current phase contract, and any handoff notes.
2. Confirm the coordinator identity and worker budget.
3. Update `.beer/state.json`:

```json
{
  "phase": "executing",
  "execution_target": "swarming",
  "swarm_status": "initializing"
}
```

4. Regenerate `.beer/STATE.md`.

Worker budget guide:

| Slice shape | Suggested workers |
|---|---|
| 2-3 independent work items | 2 workers |
| 4-6 independent work items | 3 workers |
| 7+ independent work items | 4-5 workers |

If you cannot justify at least two workers, route back to direct `executing`.

## Phase 2: Launch Workers

Each worker receives only what it needs:

- current feature slug and active slice
- current contract or bead/task assignment
- locked decisions from `CONTEXT.md`
- verification expectations
- coordinator identity and reporting channel

Do not flood workers with unrelated session history.

If the runtime cannot launch workers or cannot coordinate them safely, stop and
route back to `beer:validating`. The correct action is to change the execution
route, not to pretend the swarm exists.

## Phase 3: Tend the Swarm

While the swarm is active:

1. Check worker status regularly.
2. Confirm ready work still exists.
3. Resolve file collisions or dependency surprises.
4. Surface blockers that need human judgment.
5. Keep `.beer/state.json` current enough for a safe resume.

Coordinator responsibilities:

- rebalance work when one worker finishes early
- stop workers from touching overlapping files without a resolution
- preserve the validated scope
- pause cleanly when context pressure becomes unsafe

Silence ladder:

| Quiet time | Action |
|---|---|
| 5 minutes | ask for status |
| 10 minutes | send a direct check-in and require a response |
| 15 minutes | mark the worker stalled and escalate |

## Phase 4: Confirm Slice Completion

Only mark the slice complete when:

- all required work items are complete
- remaining ready work is empty for this slice
- verification evidence exists for the finished work
- no unresolved blocker remains

Aggregate worker evidence into the stable evidence file:

- `history/<feature>/execution-evidence.md`

The evidence file must list each worker/task, files touched, verification run,
and unresolved limitations.

Then update `.beer/state.json`:

```json
{
  "phase": "executing",
  "execution_target": "swarming",
  "swarm_status": "complete",
  "execution_evidence_path": "history/<feature>/execution-evidence.md"
}
```

## Phase 5: Handoff

Decide the next owner from the plan:

- more phases remain -> `beer:planning`
- final slice complete -> `beer:reviewing`

Record the handoff target in `state.json` before regenerating `STATE.md`.

Handoff line:

```text
Swarm complete for the current slice. Next owner: beer:<planning or reviewing>.
```

## Red Flags

- direct route work is being forced through `swarming`
- the orchestrator starts editing product code
- workers are idle while ready work exists
- workers start inventing new work outside the validated slice
- coordination substrate disappears mid-run
- the coordinator cannot explain the next handoff target
