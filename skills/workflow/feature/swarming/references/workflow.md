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
- `.beer/state.json` records `contract_verified = true`
- the current slice is approved by `beer:validating`
- the slice still has at least two independent work items from validated planning artifacts
- a current route artifact exists: `compact-plan.md`, current phase contract, or validated coordinator assignment
- each worker assignment can carry implementation pattern, evidence files, source facts to re-check, verification target, and TDD disposition expectation
- if beads are used, the ready set is coherent
- if beads are not used, Beer-owned runtime state still has a real worker assignment and result-ingestion path
- the coordination substrate is configured and live enough for worker assignments, worker status, and handoff messages

`beer-preflight` can confirm bd (beads) configuration when beads are the chosen
substrate. It cannot prove that the active agent runtime can exchange messages,
so the coordinator must still perform a runtime readiness check before
launching workers. A Beer-owned worker state surface is also acceptable if it
tracks assignments and worker results honestly.

PowerShell-style checks:

```powershell
Get-Content .beer/state.json | Select-String '"execution_target"\s*:\s*"swarming"'
Get-Content .beer/state.json | Select-String '"execution"\s*:\s*true'
Get-Content .beer/state.json | Select-String '"contract_verified"\s*:\s*true'
rg --files history | rg "(compact-plan|phase-.*contract)\.md$"
```

If the slice no longer justifies parallel execution, stop and hand back to
`beer:validating`. Do not continue out of momentum.

If the swarm launch would happen under `run_style = go` or auto-accept, run:

```powershell
node .beer/scripts/commands/beer-auto-accept.mjs --gate swarming --json
```

Only launch on `allow = true`; otherwise pause or route back to validating.

## Phase 1: Initialize Coordinator State

1. Read `AGENTS.md`, Beer state, the current route artifact, and any handoff notes.
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

Coordinator model-role rule:

- keep the coordinator on the `orchestrator` profile
- assign `coding` to implementation-heavy workers
- assign `research_synthesis` to search, read, or synthesis-heavy workers
- resolve the active profile from `.beer/config.json` instead of hardcoding model choices

Recommended runtime sequence:

```powershell
node .beer/scripts/commands/beer-orchestrate.mjs --apply --json
node .beer/scripts/commands/beer-worker-bootstrap.mjs --json
```

Use the generated worker payloads with the shared
[Host Runtime Contract](../../../../../docs/host-runtime-contract.md) when the
runtime must map Beer output into real worker launches.

Before launching workers, inspect the generated assignments. Each assignment
must include:

- route artifact path
- assigned work boundary from the validated artifact
- implementation pattern to follow
- evidence files the worker must open
- exact source facts the worker must re-check before coding
- verification target
- TDD disposition expectation: `complete`, `waived: <reason>`, or `not-required`

Generated `Docs/` may appear in a worker payload only as optional read-only
context. Pair any Docs-derived hint with evidence files and source facts to
re-check; do not refresh generated Docs inside a swarm.

If any assignment is missing these fields, stop and return to `beer:planning`
or `beer:validating`; do not let workers infer the contract from session
memory.

If the host runtime does not use beads directly, it still needs an equivalent
assignment/result loop:

- materialize worker assignments
- update worker states as results come back
- aggregate execution evidence before review

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
- route artifact path
- implementation pattern to follow
- evidence files to open before coding
- exact source facts to re-check before coding
- locked decisions from `CONTEXT.md`
- verification expectations
- TDD disposition expectation
- coordinator identity and reporting channel
- assigned model profile for the worker's task shape

Do not flood workers with unrelated session history.
Do not assign the same model profile blindly when task shapes differ.

Each worker result should report at least:

- worker name
- assigned work item
- status
- implementation pattern followed
- source facts re-checked
- files touched
- verification run
- TDD disposition
- deviations from the approved artifact, if any
- blocker summary, if any

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
- keep `active_workers[*].status` and `active_workers[*].notes` current enough
  for resume, review, and handoff
- keep worker result ingestion honest even when beads are absent

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
- every worker result records pattern/source-fact/TDD disposition evidence
- no unresolved blocker remains

Aggregate worker evidence into the stable evidence file:

- `history/<feature>/execution-evidence.md`

The evidence file must list each worker/task, route artifact used,
implementation pattern followed, source facts re-checked, files touched,
verification run, TDD disposition, deviations from the approved artifact, and
unresolved limitations.

Swarm lifecycle should be explicit:

- `initializing`
- `active`
- `blocked`
- `complete`

Minimum coordinator record per worker:

- worker name
- assigned work item
- status: `active`, `complete`, `blocked`, or `stalled`
- route artifact used
- implementation pattern followed
- source facts re-checked
- files touched
- verification run
- TDD disposition
- deviation summary, if any
- blocker summary, if any

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
- `contract_verified` is false or missing
- the orchestrator starts editing product code
- worker assignments omit implementation pattern, evidence files, or source facts to re-check
- workers are idle while ready work exists
- workers start inventing new work outside the validated slice
- coordination substrate disappears mid-run
- the coordinator cannot explain the next handoff target
- worker results omit pattern/source-fact/TDD disposition evidence
