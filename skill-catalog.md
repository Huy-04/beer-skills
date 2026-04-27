# Beer Skill Catalog

Public reference for the **18 skills** in the Beer ecosystem.

## Workflow

### Feature Workflow (10)

| Skill | When to invoke | Key output |
|---|---|---|
| `beer:using-beer` | Start of session, resume, route selection | Routing decision and state bootstrap |
| `beer:strategy-shaping` | Strategy, approach, tradeoff, optimization, or overkill discussion before the task is clear | Strategy brief and handoff seed for context intake |
| `beer:context-intake` | Feature work without usable context, resume, or zero-context startup | Recovered context or seeded inferred context |
| `beer:exploring` | Decisions are still ambiguous and must be locked | `history/<feature>/CONTEXT.md` |
| `beer:planning` | Context is locked and the next execution slice must be planned | `discovery.md`, `approach.md`, `phase-plan.md` |
| `beer:validating` | Planned slice needs a go/no-go decision | Validation outcome and execution route |
| `beer:swarming` | A validated slice is approved for parallel execution | Coordinated worker execution state |
| `beer:executing` | Direct execution path or swarm worker implementation | Implemented slice plus verification |
| `beer:reviewing` | Execution is complete and quality/closeout must be checked | Findings, UAT outcome, closeout decision |
| `beer:compounding` | Feature work or debug work finished with reusable lessons | Learnings file and promoted critical patterns |

### Nested Workflow Lens (1)

| Skill | When to invoke | Key output |
|---|---|---|
| `beer:debugging` | Build failures, runtime errors, blocked work, failing tests, or integration issues inside the active workflow | Root cause plus explicit exit target back into the parent flow |

## Support (5)

| Skill | When to invoke | Key output |
|---|---|---|
| `beer:prompt-leverage` | A raw prompt needs context, structure, or normalization | Execution-ready prompt with preserved intent and language policy |
| `beer:graph-explore` | GitNexus-backed structure, flow, or impact lookup | Graph-derived findings or degraded status |
| `beer:test-driven-development` | Behavior work needs fail-first proof | RED -> GREEN -> REFACTOR loop |
| `beer:codebase-knowledge` | Project-local pattern-first implementation map should be created or refreshed | `.beer/knowledge-base/` implementation map |
| `beer:beer-agent-guidelines` | Install or refresh Karpathy-style guardrails in `CLAUDE.md` and `AGENTS.md` | Updated repo instruction files |

## Meta (2)

| Skill | When to invoke | Key output |
|---|---|---|
| `beer:writing-beer-skills` | Create or refactor Beer skills | Updated skill package and validation notes |
| `beer:xia` | Research external skill repos or upstream patterns before Beer adoption work | Research brief and adoption recommendation |

## Route Summary

```mermaid
flowchart TD
    U[using-beer] --> ST[strategy-shaping]
    ST --> C[context-intake]
    U --> C
    C --> X[exploring]
    X --> P[planning]
    P --> V[validating]
    V -->|single-worker| E[executing]
    V -->|multi-worker| S[swarming]
    S --> E2[executing workers]
    E --> R[reviewing]
    E2 --> R
    R --> O[compounding]
    O --> I[idle]

    X -. nested debug loop .-> D[debugging]
    P -. nested debug loop .-> D
    E -. nested debug loop .-> D
    R -. nested debug loop .-> D
    D -. exit target .-> P
    D -. exit target .-> V
    D -. exit target .-> E
    D -. exit target .-> R
```

## Human Gates

| Gate | After skill | Required action |
|---|---|---|
| Gate 1 | `beer:exploring` | Approve `CONTEXT.md` before planning |
| Gate 2 | `beer:planning` | Approve `phase-plan.md` before current-slice prep |
| Gate 3 | `beer:validating` | Approve execution |
| Gate 4 | `beer:reviewing` | Approve merge or follow-up fixes |

## Session Model

| Axis | Values | Notes |
|---|---|---|
| `route` | `feature`, `small-fix` | Workflow path and prerequisite depth |
| `work_intent` | `delivery`, `repair`, `investigation` | Whether the work is new delivery, a fix, or diagnosis |
| `risk` | `normal`, `high` | Blast radius and reversibility |
| `orchestration_strategy` | `single-worker`, `multi-worker` | Execution topology after validation |
| `run_style` | `guided`, `go` | Gate automation preference |

| Common combination | Typical route |
|---|---|
| strategy-first feature discussion | `using-beer -> strategy-shaping -> context-intake` after the direction is chosen |
| `small-fix + repair + normal + single-worker + guided` | `using-beer -> context-intake -> exploring -> planning -> validating -> executing` with compact scope |
| `feature + delivery + normal + single-worker + guided` | full feature workflow with one bounded execution stream |
| `feature + delivery + normal/high + multi-worker + guided` | full workflow with validated worker slices and coordinated execution |
| `feature + repair + normal/high + any strategy + go` | same workflow with fewer pauses where Beer auto-accept allows |

## Utility Commands

Install and onboarding live in [README](README.md). This catalog only keeps the
day-to-day inspection commands that are useful once Beer is already available.

From an onboarded target repo:

```bash
node .beer/scripts/commands/beer-status.mjs --json
node .beer/scripts/commands/beer-dependencies.mjs
```

From the Beer repo itself:

```bash
node scripts/commands/beer-status.mjs --json
node scripts/commands/beer-dependencies.mjs
```

## Related Docs

- [README](README.md)
- [Documentation Index](docs/README.md)
- [Ecosystem Flow Overview](docs/ecosystem-flow-overview.md)
- [Route Selection](docs/route-selection.md)
- [Route And Strategy Comparison](docs/route-strategy-comparison.md)
