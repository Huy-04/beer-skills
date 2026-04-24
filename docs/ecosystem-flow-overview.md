# Beer Ecosystem Flow Overview

Beer currently ships **17 skills** across four categories:

| Category | Count | Purpose |
|---|---|---|
| Workflow - feature | 9 | End-to-end feature delivery |
| Workflow - debug | 1 | Root-cause and repair workflow |
| Support | 5 | Utilities and focused helper passes |
| Meta | 2 | Skills for evolving Beer itself |

The core idea is simple: Beer chooses the smallest workflow that can safely
handle the task, then records enough state for the next skill or session to
continue without guessing.

## End-to-End Feature Flow

```mermaid
flowchart TD
    UB[using-beer] --> CI[context-intake]
    CI -->|small direct fix| SP[planning]
    CI -->|locked context already sufficient| PL[planning]
    CI --> EX[exploring<br/>when context is not locked yet]
    SP --> SV[validating]
    SV --> SE[executing]
    EX --> PL
    PL --> VA[validating]
    VA -->|parallel slice| SW[swarming]
    VA -->|bounded slice| EW[executing]
    SW -. worker assignments .-> EW
    SW --> RV[reviewing]
    EW --> RV[reviewing]
    RV --> CO[compounding]
    CO --> IDLE[idle]

    GH[graph-explore] -. support .-> PL
    PH[prompt-leverage] -. support .-> UB
    KB[codebase-knowledge] -. support .-> CO
    SC[agent-docs-sync] -. support .-> CO
```

Debugging is a parallel workflow branch:

```mermaid
flowchart LR
    UB[using-beer] --> DB[debugging]
    DB --> DF[direct fix]
    DB --> TDD[test-driven-development]
    DB --> PL[planning]
```

## Human Gates

| Gate | After | Why it exists |
|---|---|---|
| Gate 1 | `exploring` | lock decisions before planning fans out |
| Gate 2 | `planning` | approve the current execution slice |
| Gate 3 | `validating` | confirm that execution should proceed directly or through a swarm |
| Gate 4 | `reviewing` | stop closeout when findings or UAT show the work is not ready |

## Workflow Categories

### Workflow - Feature

| Skill | Purpose |
|---|---|
| `using-beer` | entry point, routing, gates, and resume logic |
| `context-intake` | recover context, classify the task, and route to planning or exploring |
| `exploring` | lock product or implementation decisions into `CONTEXT.md` |
| `planning` | turn the active route into an execution plan |
| `validating` | decide whether the slice should execute directly or via swarm |
| `swarming` | coordinate parallel workers for a swarm-approved slice |
| `executing` | implement the active direct slice or swarm assignment |
| `reviewing` | run the quality gate before closeout |
| `compounding` | capture reusable learnings after review or debugging |

### Workflow - Debug

| Skill | Purpose |
|---|---|
| `debugging` | evidence-first triage, reproduction, root cause, repair path, and verification |

### Support

| Skill | Purpose |
|---|---|
| `prompt-leverage` | build a context-aware execution prompt from a raw request and apply Beer language policy |
| `graph-explore` | query GitNexus for structure, flow, and impact context |
| `test-driven-development` | supply RED -> GREEN -> REFACTOR evidence for behavior changes |
| `codebase-knowledge` | maintain `.beer/knowledge-base/` as a project-local cache |
| `agent-docs-sync` | synchronize agent-facing guidance into `CLAUDE.md` or `AGENTS.md` |

### Meta

| Skill | Purpose |
|---|---|
| `writing-beer-skills` | create or update Beer skills |
| `xia` | research external skill repos and propose Beer adoption candidates |

## Shared Artifacts

| Artifact | Meaning |
|---|---|
| `.beer/onboarding.json` | whether Beer is installed in the target repo |
| `.beer/state.json` | authoritative machine-readable workflow state |
| `.beer/STATE.md` | human-readable derived state |
| `.beer/HANDOFF.json` | resume handoff for context pressure or interruptions |
| `.beer/seed/` | inferred context that still needs `exploring` |
| `history/<feature>/CONTEXT.md` | locked context for a feature |
| `history/<feature>/discovery.md` | planning research notes |
| `history/<feature>/approach.md` | planning synthesis and risk map |
| `history/<feature>/phase-plan.md` | route-level phase breakdown |
| `history/learnings/critical-patterns.md` | promoted learnings reused by later work |

`.beer/state.json` is the authoritative state file. `.beer/STATE.md` is a
human-readable derivative and should not become the source of truth.

## Route and Dependency Profile

| Route | Minimum dependency set |
|---|---|
| Onboarding / status | `node` |
| Small guided path | `node` |
| Standard path | `node` + `bd` |
| Graph augmentation | configured GitNexus MCP server plus an indexed repo |

## Related Docs

- [README](../README.md)
- [Mode Selection](mode-selection.md)
- [Mode Comparison](mode-comparison.md)
- [Seed Context Contract](seed-context-contract.md)
