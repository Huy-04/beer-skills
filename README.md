# Beer Skills

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-43853d?logo=node.js&logoColor=white)](package.json)
[![Skills](https://img.shields.io/badge/skills-17-1f6feb)](docs/skill-inventory.json)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue)](LICENSE.md)

Beer Skills is a reusable workflow bundle for agentic software delivery. It
packages the skills, route rules, and local scripts needed to guide an AI coding
agent through feature work, debugging, validation, review, and learning capture.

## Start Here

- [Commands](COMMANDS.md)
- [Setup Guide](docs/setup.md)
- [Skill Catalog](skill-catalog.md)
- [Flow Overview](docs/ecosystem-flow-overview.md)
- [Docs Index](docs/README.md)

## At a Glance

| Item | Value |
|---|---|
| Entry skill | `beer:using-beer` |
| Public CLI | `beer` / `beer-skills` |
| Skills shipped | `17` |
| Main feature flow | `context-intake -> exploring/planning -> validating -> executing/swarming -> reviewing -> compounding -> idle` |
| Debug flow | `using-beer -> debugging` |
| Required runtime | `node >= 18` |
| Optional accelerators | `bd`, GitNexus MCP + local index |

Beer currently ships **17 skills** across feature workflow, debug workflow,
support, and meta layers.

## Quick Start

### Fast Path

```bash
npm install -g github:Huy-04/beer-skills
beer init
beer status
```

`beer init` automatically installs Beer skills into `./.claude/skills/`.

### Common Actions

| Goal | Command |
|---|---|
| Install Beer globally from GitHub | `npm install -g github:Huy-04/beer-skills` |
| Update the global Beer package | `beer update` |
| Onboard the current repo | `beer init` |
| Refresh Beer files in the current repo | `beer refresh` |
| Remove Beer from the current repo | `beer uninstall --yes` |
| Check installed tools | `beer check-tools` |
| Install a tool such as GitNexus | `beer install gitnexus` |
| Check repo status | `beer status` |
| Start routing inside an agent session | `beer:using-beer` |

`beer:using-beer` is the entry skill. It chooses the smallest viable route from
the task shape, current Beer state, and available local dependencies.

Use `--repo-root /path/to/project` only when you want to target a different repo
than the current working directory.

Detailed setup: [docs/setup.md](docs/setup.md)  
Full command reference: [COMMANDS.md](COMMANDS.md)

## What Beer Provides

| Capability | What it means |
|---|---|
| Route-aware execution | small fixes can use a compact route; larger work gets the full context, planning, validation, execution, and review flow |
| Explicit context contracts | `.beer/seed/` stores inferred context; `history/<feature>/CONTEXT.md` stores locked decisions |
| Validation before coding | feature work passes through a go/no-go step before implementation begins |
| Parallel execution support | validated slices can run directly or through a swarm when `bd` is available |
| Reusable learning capture | completed work can promote durable patterns into `history/learnings/` |

## Runtime Profile

| Topic | Summary |
|---|---|
| Required runtime | `node >= 18` |
| Standard path | `node` + `bd` |
| Graph-augmented path | GitNexus MCP plus a local index |
| Full setup details | [docs/setup.md](docs/setup.md) |
| Full command list | [COMMANDS.md](COMMANDS.md) |

## Commands

Beer command reference lives in [COMMANDS.md](COMMANDS.md).

## Workflow Snapshot

```mermaid
flowchart TD
    U[beer:using-beer] --> C[context-intake]
    C -->|small direct fix| P[planning]
    C -->|locked context already sufficient| P
    C -->|decisions still unlocked| X[exploring]
    X --> P2[planning]
    P --> V[validating]
    V --> E[executing]
    P2 --> V2[validating]
    V2 -->|bounded slice| E2[executing]
    V2 -->|parallel slice| S[swarming]
    S --> E2
    E2 --> R[reviewing]
    R --> O[compounding]
    O --> I[idle]

    U -->|debug or failure investigation| D[debugging]
    D --> T[test-driven-development]
    D --> P3[planning when repair scope expands]
```

Beer keeps feature delivery and debugging separate. `context-intake` is the
entry gate for normal repo work; `debugging` is the entry gate for evidence-first
repair.

## Session Model

| Axis | Values | Meaning |
|---|---|---|
| `mode` | `small`, `standard` | workflow size and artifact depth |
| `risk` | `normal`, `high` | blast radius and reversibility |
| `run_style` | `guided`, `go` | how aggressively Beer crosses gates |

Use `beer-skills auto-accept` from an installed package, or
`node .beer/scripts/commands/beer-auto-accept.mjs` before any automatic gate
crossing. It returns `ALLOW` only when `run_style = go` or `auto_accept` policy
permits the gate and no blocker, high-risk condition, missing evidence, or
missing coordination tool makes the move unsafe.

### Common Combinations

| Common combination | Typical route |
|---|---|
| `small + normal + guided` | compact planning, validation, and direct execution |
| `standard + normal + guided` | full feature workflow |
| `standard + high + guided` | full workflow plus deeper research and stricter validation |
| `standard + normal/high + go` | full workflow with configurable auto-advance where allowed |

`beer:using-beer` owns live request understanding and decides the smallest
viable mode and route during the agent session itself.

## Where Next

- [Documentation Index](docs/README.md)
- [Commands Reference](COMMANDS.md)
- [Setup Guide](docs/setup.md)
- [Skill Catalog](skill-catalog.md)
- [Ecosystem Flow Overview](docs/ecosystem-flow-overview.md)
- [Mode Selection](docs/mode-selection.md)
- [Mode Comparison](docs/mode-comparison.md)
- [Seed Context Contract](docs/seed-context-contract.md)
- [Skill Authoring Pattern](docs/skill-authoring/skill-pattern.md)
- [Contributing](CONTRIBUTING.md)

## License

[PolyForm Noncommercial License 1.0.0](LICENSE.md)
