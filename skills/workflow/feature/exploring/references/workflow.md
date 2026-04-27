---
skill: exploring
purpose: Full workflow for locking feature decisions before planning
version: "1.0"
---

# exploring - Workflow Details

## Boundary

`exploring` locks user decisions for feature work after intake. It does not write code, choose libraries, decompose execution work, or create delivery beads.

- `context-intake` prepares inferred or reopened context and hands normal task work to `exploring`.
- `exploring` converts clarified user decisions into locked context.
- `planning` researches implementation and owns delivery structure.

## Phase 0: Misroute Check

Check this before any deeper workflow. In normal flow, `context-intake` should have done this already.

If the request is:

- local,
- low ambiguity,
- likely under 3 files,
- and not a new feature or behavior-shaping change,

exit `exploring` and route to `beer:planning` with:

- `route = small-fix`
- `orchestration_strategy = single-worker`
- `next_handoff = beer:planning`
- no `CONTEXT.md`
- no Gate 1

The `single-worker` value is the exemption constraint. If a quick scout shows
the work needs multiple workers, dependency coordination, or separate
verification owners, stay in the normal feature path.

Do not take this exit when the task is still missing a proven failure path, root-cause statement, or behavior boundary.

## Phase 1: Context Gate

Before locking decisions, verify context state.

1. Read `.beer/state.json`.
2. If `context_stage = none`, route through `beer:context-intake` first.
3. If `context_stage = seeded`, read `.beer/seed/` as inferred input only.
4. If `context_stage = locked`, reopen the existing `history/<feature>/CONTEXT.md` and determine whether the user is refining the same feature or starting a new one.

Seed handling rules:

- read seed metadata, task interpretation, relevant files, and gaps,
- use seed only to reduce blind questioning,
- never convert seed statements into locked decisions without user confirmation,
- if seed conflicts with direct repo evidence, trust current repo evidence and clarify with the user.

## Phase 2: Scope Assessment

Classify the session:

| Type | When | Action |
|---|---|---|
| `quick` | Small feature with a couple of decisions | Short exploring pass, still lock decisions |
| `standard` | Normal feature work | Full exploring flow |
| `deep` | Cross-cutting or highly ambiguous feature | Full exploring flow with more depth |

If the request spans multiple independent subsystems, narrow to one foundational slice before continuing.

## Phase 3: Gray Area Identification

Find 2-4 gray areas that would force planning to guess.

A valid gray area:

- affects behavior or scope,
- was not explicitly decided by the user,
- would change implementation direction if assumed incorrectly.

Recommended scout pattern:

```powershell
rg -n "<feature-keyword>" .
rg --files | Select-Object -First 50
```

Then read:

1. `README.md` or `AGENTS.md` if present
2. 2-3 relevant source files
3. any seeded relevant-files entries that look close to the request

Do not turn this into deep codebase research. The scout is only there to ground the questions.

## Phase 4: Socratic Dialogue

Ask one question at a time. Wait for the answer before asking the next one.

Rules:

1. Prefer single-select options when they make the tradeoff clearer.
2. Start broad, then narrow.
3. After each gray area, summarize the chosen direction before moving on.
4. Push scope-creep ideas into deferred notes instead of folding them into the current feature.

Decision-locking format:

```text
Locking decision D{N}: [concrete summary]. Confirmed?
```

Delegation format:

```text
Delegated area: [area]. Agent may choose within these constraints: [constraints].
```

Delegated areas belong in `Agent Discretion`, not in locked decision IDs unless the user later confirms a specific choice.

## Phase 5: Write CONTEXT.md

Write `history/<feature>/CONTEXT.md` using the template.

Requirements:

- every locked decision is concrete,
- every locked decision has a stable ID,
- code context cites actual file paths,
- observed patterns are recorded as candidates until planning confirms the implementation pattern,
- seed inputs are recorded as inputs only,
- delegated areas are separated from locked decisions,
- unresolved blockers go under `Resolve Before Planning`,
- technical follow-up questions go under `Deferred to Planning`.

`exploring` is the only skill allowed to write `history/<feature>/CONTEXT.md`.

## Phase 6: Self-Review

Review the document locally before handoff.

Check for:

- placeholders or empty sections,
- contradictory decisions,
- vague language that would force planning to guess,
- seed statements accidentally copied into locked decisions,
- delegated areas incorrectly presented as user-confirmed decisions.

Fix issues locally. Do not spawn a review agent by default.

## Phase 7: Handoff Path

Choose exactly one path.

### Path A: Locked Context Path

After `CONTEXT.md` is ready:

1. Update `.beer/state.json` with:
   - `context_stage = locked`
   - `context_path = history/<feature>/CONTEXT.md`
   - `context_confidence = 1.0`
   - `approved_gates.context = false`
2. Present Gate 1 approval on the finished `CONTEXT.md`.
3. Only when Gate 1 passes, update:
   - `approved_gates.context = true`
   - `next_handoff = beer:planning`
4. Regenerate `.beer/STATE.md` from `state.json`.
5. Deliver the handoff phrase and stop.

Handoff phrase:

```text
Decisions captured. CONTEXT.md written to `history/<feature>/CONTEXT.md`.
CONTEXT.md is now the single source of truth for downstream planning.
Invoke `beer:planning`.
```

### Path B: Small-Fix Exemption

If the exemption applies:

1. Do not write `history/<feature>/CONTEXT.md`.
2. Update `.beer/state.json` with:
   - `route = small-fix`
   - `orchestration_strategy = single-worker` as the exemption constraint
   - preserve the current `context_stage`
   - `next_handoff = beer:planning`
3. Do not request Gate 1 approval.
4. Regenerate `.beer/STATE.md`.
5. Deliver the compact-planning handoff and stop.

Small-fix handoff phrase:

```text
This is a small, local, low-ambiguity fix.
Skipping locked-context capture.
Invoke `beer:planning` with the compact small-fix route.
```

Do not take this path if the quick scout already shows multiple worker-sized tasks, dependency edges that need explicit coordination, or any reason `multi-worker` would be the honest execution strategy.

## Hard Rules

- Never skip exploring for feature work once intake has decided that decision locking is required.
- Never ask two questions in one message.
- Never write code or pseudocode here.
- Never recommend a library as if that were the product decision.
- Never create beads or execution tasks.
- Never treat `.beer/seed/` as if it were locked context.

## Troubleshooting

| Problem | Action |
|---|---|
| Seed exists but is incomplete | Use it as input, record gaps, continue the dialogue |
| Seed conflicts with repo evidence | Trust repo evidence and clarify with the user |
| User wants to move fast | Keep the dialogue short, but still lock the decisions that matter |
| Request is actually small-fix work | Exit exploring into the compact small-fix planning path |
| Too many gray areas appear | Narrow scope before continuing |
