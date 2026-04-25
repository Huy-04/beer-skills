---
skill: context-intake
purpose: Full workflow for recovering context, running context scouts, and writing `.beer/seed/`
version: "1.0"
---

# context-intake - Workflow Details

## Authority and Boundaries

`context-intake` loads or seeds context, then decides whether normal workflow should continue to `planning` or `exploring`. It does not lock decisions, create delivery plans, or decompose execution work.

- Locked context lives in `history/<feature>/CONTEXT.md` and is owned by `beer:exploring`.
- Seeded context lives in `.beer/seed/` and is inferred only.
- Delivery beads belong to `beer:planning`.
- Scout beads belong to `context-intake` only when they are research-only and exist solely to gather enough signal to write `.beer/seed/`.

## Phase 0: Read Recovery Inputs

### Step 0.0: Check Preflight

```bash
node scripts/commands/beer-preflight.mjs --json
```

Use preflight to decide which path is realistic:

| Preflight signal | Action |
|---|---|
| GitNexus ready and repo indexed | Try Path 1 first |
| GitNexus degraded, `bd` ready | Try Path 2 |
| GitNexus degraded, `bd` unavailable | Go to Path 3 |
| Node unavailable | Stop with actionable error |

### Step 0.1: Read State Files

```powershell
if (Test-Path .beer/state.json) { Get-Content .beer/state.json } else { "No state.json" }
if (Test-Path .beer/HANDOFF.json) { Get-Content .beer/HANDOFF.json } else { "No HANDOFF.json" }
```

Read in this order:

1. `.beer/state.json`
2. `.beer/HANDOFF.json` if present
3. `.beer/knowledge-base/` summaries only after state recovery and only as an accelerator

### Step 0.2: Respect Existing Context Stage

If `state.context_stage` is already set:

- `locked` -> read `history/<feature>/CONTEXT.md`, then route to `beer:planning` unless the user is explicitly reopening decisions.
- `seeded` -> read `.beer/seed/` and route to `beer:exploring`. Do not promote it here.
- `none` or missing -> continue path selection.

If seeded files conflict with direct repo evidence:

- trust direct repo evidence for this run,
- mark the seeded context as stale or mismatched in your notes,
- refresh `.beer/seed/` if needed,
- route through `beer:exploring` before any planning.

## Path 1: GitNexus Path

Use when GitNexus is ready and the repo is already indexed.

### Step 1.1: Check Readiness

Use the GitNexus repo listing to confirm the repo is available and indexed.

If the repo is not indexed or the language is unsupported:

- Record GitNexus as degraded for this run.
- Do not auto-index the repo here.
- Continue to Path 2 or Path 3.

### Step 1.2: Query for Context

Query only what is needed for the current request:

- architecture / entry points
- relevant communities or modules
- similar patterns
- relevant symbols or files

Graph-backed context is enough when it gives:

- the relevant files,
- the feature or module boundary,
- the main technical constraints.

If that context is sufficient, classify the next phase:

- route to `beer:planning` when the task is bounded and decision locking is not needed,
- route to `beer:exploring` when user-facing decisions still need to be locked.

If not, continue to Path 2 for saved-state or scout recovery.

## Path 2: Resume and Context Scouts

Use when GitNexus is degraded, incomplete, or absent, but `bd` or saved state is still available.

### Step 2.1: Check Active Beads for Resume Signals

```bash
bd ready --json
```

Interpret active beads only as context and resume signals:

- read bead descriptions,
- extract goal, scope, and current stage,
- do not auto-resume,
- do not treat them as permission to continue execution.

### Step 2.2: Present Resume Prompt

If active work or handoff exists, ask the user whether to resume.

- If user says `yes`, recover the saved context and continue.
- If user says `no`, do not blindly delete artifacts. Treat this as a zero-context start and continue to Step 2.4.

### Step 2.3: Recover Locked or Seeded Context

After reading state:

- If `context_stage = locked`, read the locked `CONTEXT.md` and route to `beer:planning` unless the user is reopening decisions.
- If `context_stage = seeded`, read `.beer/seed/` and route to `beer:exploring`.

### Step 2.4: Zero Context -> Context Scouts

If there is no usable locked or seeded context and `bd` is available, create research-only context scouts.

Recommended scout set:

1. Map structure and likely module boundaries.
2. Read conventions, AGENTS, README, and critical patterns.
3. Find relevant files for the user request.
4. Decide whether the task can route straight to `beer:planning` or needs seeded input for `beer:exploring`.
5. Synthesize findings into `.beer/seed/` only when `exploring` still needs inferred context.

Rules for context scouts:

- they gather signal only,
- they must not create delivery decomposition,
- they must not assign locked decisions,
- they must not replace `planning`.

If `bd` is available, use scout beads for this orchestration.

If `bd` is unavailable, run the same scout passes directly with `rg`, file reads, and synthesis inside the same agent.

## Path 3: Degraded Manual Discovery

Use when GitNexus and `bd` are both unavailable, or when their output is not enough to avoid blind work.

### Step 3.1: Inspect the Repo Surface

Read only enough to infer the current request's likely context:

```powershell
Get-ChildItem -Force
rg --files -g "README.md" -g "AGENTS.md" -g "package.json" -g "pyproject.toml" -g "go.mod"
```

### Step 3.2: Find Relevant Files

```powershell
rg -n "<user keyword>" .
rg --files | Select-Object -First 50
```

Then read:

1. README / AGENTS if present
2. one package or project manifest
3. 3-5 representative source files
4. any file that looks close to the user request

### Step 3.3: Infer With Explicit Confidence

Infer only:

- structure,
- conventions,
- likely relevant files,
- obvious gaps.

Do not pretend degraded discovery is complete.

### Step 3.4: Write Seeded Context

Write `.beer/seed/` only when `exploring` still needs inferred context. Include:

- `00-metadata.json`
- `01-task.md`
- `02-structure.md`
- `03-conventions.md`
- `04-relevant-files.md`
- `05-gaps.md`

### Step 3.5: Update State

Set:

- `context_stage = seeded`
- `seed_path = .beer/seed/`
- `context_path = ""`
- `context_confidence` based on the actual scan quality

If auto-accept is enabled and the context is degraded, disable it for downstream phases.

## Seed File Contract

### 00-metadata.json

Must include:

- `version`
- `source`
- `path`
- `confidence`
- `created_at`
- `feature` or task identifier when known

### 01-task.md

Summarize:

- original request,
- interpreted goal,
- success criteria,
- obvious out-of-scope assumptions.

### 02-structure.md

Summarize:

- module or folder structure,
- likely entry points,
- architectural hints with confidence notes.

### 03-conventions.md

Summarize:

- naming conventions,
- architecture or layering signals,
- code-style patterns,
- confidence by category.

### 04-relevant-files.md

List:

- file path,
- why it matters,
- confidence,
- which path found it.

### 05-gaps.md

Required whenever context is degraded or uncertain.

Document:

- unknowns,
- low-confidence areas,
- questions worth asking the user.

## Resume Logic

If `.beer/HANDOFF.json` exists:

1. Read `HANDOFF.json` and state.
2. Extract phase, feature, last action, and suggested next action.
3. Present a resume prompt.
4. Never auto-resume.

If the user declines resume:

- do not destroy existing files blindly,
- treat the new request as a fresh context-gathering start,
- seed new context if needed.

## Hard Rules

- Never run blind.
- Never auto-resume.
- Never write locked `CONTEXT.md`.
- Never treat `.beer/seed/` as locked context.
- Never let stale or conflicting seed context outrank direct repo evidence.
- Never let context scouts become delivery beads.
- Never use `.beer/knowledge-base/` as a substitute for direct evidence.
- Never claim repo-wide certainty from a degraded scan.

## Troubleshooting

| Problem | Action |
|---|---|
| GitNexus unavailable | Record degraded workflow status and continue to Path 2 or 3 |
| Repo not indexed | Continue without indexing here |
| `bd` unavailable | Skip context scouts and use Path 3 |
| Saved context missing details | Write seeded context with gaps and route to `exploring` |
| Seeded context conflicts with current source | Trust source, treat seed as stale, refresh seed or route through `exploring` with mismatch note |
| Planning starts from seed as if it were locked | Stop and route back through `exploring` |

## Handoff Outcomes

| Outcome | Next owner |
|---|---|
| Locked context loaded | `using-beer` session scout |
| Seeded context written | `beer:exploring` |
| Degraded context with large gaps | user clarification or `beer:exploring` |
