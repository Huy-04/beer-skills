# Beer Skills

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-43853d?logo=node.js&logoColor=white)](package.json)
[![Skills](https://img.shields.io/badge/skills-18-1f6feb)](docs/skill-inventory.json)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial-blue)](LICENSE.md)

Beer Skills is a reusable workflow bundle for agentic software delivery. It
packages the skills, route rules, and local scripts needed to guide an AI coding
agent through feature work, repair/investigation, validation, review, and learning capture.

## Start Here

- [Commands](COMMANDS.md)
- [Setup Guide](docs/setup.md)
- [Host Runtime Contract](docs/host-runtime-contract.md)
- [Skill Catalog](skill-catalog.md)
- [Flow Overview](docs/ecosystem-flow-overview.md)
- [Docs Index](docs/README.md)

## At a Glance

| Item | Value |
|---|---|
| Entry skill | `beer:using-beer` |
| Public CLI | bootstrap with `beer-skills`, then use project-local `.beer/bin/beer.mjs` |
| Skills shipped | `18` |
| Main feature flow | optional `strategy-shaping` -> `context-intake -> exploring -> planning -> validating -> executing/swarming -> reviewing -> compounding -> idle` |
| Investigation / repair lens | `using-beer -> context-intake/exploring/planning` with `debugging` as needed |
| Required runtime | `node >= 18` |
| Optional accelerators | `bd`, GitNexus MCP + local index |

Beer currently ships **18 skills** across feature workflow, investigation
support, and meta layers.

## Quick Start

### Fast Path

```bash
npx --yes --package github:Huy-04/beer-skills beer-skills init
node .beer/bin/beer.mjs status
```

`beer-skills init` creates project-local Beer assets only. It installs the
repo-local CLI under `.beer/bin/`, reinstalls Beer skills into
`./.claude/skills/` and `./.agents/skills/`, syncs the managed `AGENTS.md` /
`CLAUDE.md` guideline blocks, and configures repo-local hooks for Claude and
Codex.

On Windows, use `.\.beer\bin\beer.cmd status` if you want a direct project-local
command shim instead of `node .beer/bin/beer.mjs status`.

### Common Actions

| Goal | Command |
|---|---|
| Bootstrap Beer into the current repo | `npx --yes --package github:Huy-04/beer-skills beer-skills init` |
| Update project-local Beer files from the current package | `node .beer/bin/beer.mjs update` |
| Refresh Beer files in the current repo | `node .beer/bin/beer.mjs refresh` |
| Remove Beer from the current repo, including the local CLI | `node .beer/bin/beer.mjs uninstall --yes` |
| Check installed tools | `node .beer/bin/beer.mjs check-tools` |
| Install an external tool such as GitNexus | `node .beer/bin/beer.mjs install gitnexus` |
| Check repo status | `node .beer/bin/beer.mjs status` |
| Start routing inside an agent session | `beer:using-beer` |

`beer:using-beer` is the entry skill. It chooses the smallest viable route from
the task shape, current Beer state, and available local dependencies.

Beer also keeps repo-local model-role defaults in `.beer/config.json`, so an
orchestrator can resolve different profiles for orchestration, coding, and
search/synthesis-heavy work instead of treating every worker the same.
For swarm-approved slices, `node .beer/bin/beer.mjs orchestrate` can resolve and
materialize worker assignments from the current Beer state, while
`node .beer/bin/beer.mjs worker-bootstrap` emits the spawn-ready payloads a host
runtime can map into actual subagent launches.

Use `--repo-root /path/to/project` only when you want to target a different repo
than the current working directory. The default path is always project-local;
Beer does not need a global install for normal use.

Detailed setup: [docs/setup.md](docs/setup.md)  
Full command reference: [COMMANDS.md](COMMANDS.md)

## What Beer Provides

| Capability | What it means |
|---|---|
| Strategy shaping before workflow | unclear feature ideas can be compared, simplified, and bounded before they enter context intake |
| Route-aware execution | small fixes can use a compact route; larger work gets the full context, planning, validation, execution, and review flow |
| Explicit context contracts | `.beer/seed/` stores inferred context; `history/<feature>/CONTEXT.md` stores locked decisions |
| Validation before coding | feature work passes through a go/no-go step before implementation begins |
| Parallel execution support | validated slices can run directly or through a swarm when `bd` is available |
| Reusable learning capture | completed work can promote durable patterns into `history/learnings/` |
| Repo-local model roles | `.beer/config.json` can pin different model/reasoning defaults for orchestrator, coding, and research/synthesis work |

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
    U --> ST[strategy-shaping]
    ST --> C
    C --> X[exploring]
    X -->|small-fix exemption or locked context| P[planning]
    X -->|new context locked| P2[planning]
    P --> V[validating]
    V --> E[executing]
    P2 --> V2[validating]
    V2 -->|bounded slice| E2[executing]
    V2 -->|parallel slice| S[swarming]
    S --> E2
    E2 --> R[reviewing]
    R --> O[compounding]
    O --> I[idle]

    X -. root-cause lens .-> D[debugging]
    D --> T[test-driven-development]
    D -. proven repair input .-> P2
```

Beer keeps one main implementation workflow. `strategy-shaping` is the optional
pre-workflow consult layer for unclear feature direction. `context-intake` is
the entry gate once the task direction is chosen, while `debugging` is an
evidence-first lens used inside that flow when the task is a bug, a failing
build/test, or a repair that needs root-cause proof.

## Session Model

| Axis | Values | Meaning |
|---|---|---|
| `route` | `feature`, `small-fix` | workflow path and prerequisites |
| `work_intent` | `delivery`, `repair`, `investigation` | whether the current work is new delivery, a fix, or diagnosis |
| `risk` | `normal`, `high` | blast radius and reversibility |
| `orchestration_strategy` | `single-worker`, `multi-worker` | execution topology after validation |
| `run_style` | `guided`, `go` | how aggressively Beer crosses gates |

Use `node .beer/bin/beer.mjs auto-accept` or
`node .beer/scripts/commands/beer-auto-accept.mjs` before any automatic gate
crossing. It returns `ALLOW` only when `run_style = go` or `auto_accept` policy
permits the gate and no blocker, high-risk condition, missing evidence, or
missing coordination tool makes the move unsafe.

### Common Combinations

| Common combination | Typical route |
|---|---|
| `small-fix + normal + single-worker + guided` | intake, exploring sanity-check, compact planning, validation, and direct execution |
| `feature + normal + single-worker + guided` | full feature workflow with one bounded implementation stream |
| `feature + normal/high + multi-worker + guided` | full workflow plus coordinated worker slices and deeper validation |
| `feature + normal/high + single/multi-worker + go` | same workflow with configurable auto-advance where allowed |

`beer:using-beer` owns live request understanding and decides the smallest
viable route and orchestration strategy during the agent session itself.

## Where Next

- [Documentation Index](docs/README.md)
- [Commands Reference](COMMANDS.md)
- [Setup Guide](docs/setup.md)
- [Host Runtime Contract](docs/host-runtime-contract.md)
- [Skill Catalog](skill-catalog.md)
- [Ecosystem Flow Overview](docs/ecosystem-flow-overview.md)
- [Seed Context Contract](docs/seed-context-contract.md)
- [Skill Authoring Pattern](docs/skill-authoring/skill-pattern.md)
- [Contributing](CONTRIBUTING.md)

## License

[PolyForm Noncommercial License 1.0.0](LICENSE.md)
