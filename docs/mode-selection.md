# Mode Selection

Beer routes work by choosing:

1. `mode`
2. `risk`
3. `run_style`

These axes do not encode the workflow path. After the axes are chosen, Beer
derives route fields such as `planning_route` and `execution_target`.

## Selection Order

Beer should decide mode in this order:

1. explicit user preference
2. current repo and Beer state
3. live request understanding inside `beer:using-beer`
4. if mode confidence is low, ask the user whether to keep the proposed mode or raise it
5. dependency reality

Before any automatic gate crossing, use:

```bash
node .beer/scripts/commands/beer-auto-accept.mjs --gate validating --json
npx --yes --package github:Huy-04/beer-skills beer-skills auto-accept --repo-root /path/to/project --gate reviewing --json
```

## Choose `mode`

Beer no longer treats keyword heuristics as source-of-truth for request
classification. `beer:using-beer` owns live request understanding and should
ask for confirmation when mode confidence is low.

| Signal | Choose `small` when... | Choose `standard` when... |
|---|---|---|
| File scope | likely 1-3 files | likely 4+ files or wider surface area |
| Pattern familiarity | existing pattern | new pattern or uncertain implementation shape |
| Coordination | one worker can finish it safely | phased planning or multiple workers are likely |
| Behavior proof | docs/config-only or no observable behavior change | explicit behavior change, TDD, fail-first, or regression-proof request |
| Artifact depth | compact plan and compact validation are enough | deeper planning and validation are justified |

## Choose `risk`

| Signal | `normal` | `high` |
|---|---|---|
| Reversibility | easy to undo | hard to roll back safely |
| Blast radius | localized change | cross-cutting or architectural change |
| Validation depth | normal checks are enough | spikes or stronger validation are likely |
| Failure cost | mostly contained | could break key behavior or contracts |

## Choose `run_style`

| Preference | `guided` | `go` |
|---|---|---|
| Human involvement | explicit pauses at gates | auto-advance where confidence allows |
| Best for | most collaborative sessions | trusted end-to-end runs |
| Guardrails | still uses all hard gates | still stops for blockers and protected gates |

## Route Reality

After choosing the session shape, confirm the route is actually runnable.

| Route | Minimum dependency set |
|---|---|
| Onboarding / status | `node` |
| Small guided path | `node` |
| Standard path | `node` + `bd` |
| Swarm execution path | `node` + `bd` |
| Graph-augmented discovery | configured GitNexus MCP server plus an indexed repo |

If dependencies are missing, Beer should degrade to the highest viable route
instead of claiming the full route is available.

`mode` must not be used as a proxy for automation. Automation belongs to
`run_style`. It must not be used as a proxy for execution topology either;
parallel or direct execution belongs to `execution_target`.

## Quick Decision Guide

| If the request looks like... | Recommended classification |
|---|---|
| typo, tiny bug fix, bounded refactor | `small + normal + guided` |
| normal feature work with clear scope | `standard + normal + guided` |
| migration, auth change, contract change, major refactor | `standard + high + guided` |
| behavior change that asks for TDD, fail-first, or regression proof | choose route normally, but set `tdd_required = true` |
| trusted pipeline run with fewer pauses | keep the same `mode` and `risk`, switch `run_style = go` |

## Examples

| Request | Classification |
|---|---|
| "Rename this prop and update the tests" | `small + normal + guided` |
| "Add a reporting page using the existing data layer" | `standard + normal + guided` |
| "Split this monolith service into safer boundaries" | `standard + high + guided` |
| "Run the full delivery flow with auto-accept where possible" | `standard + normal/high + go` |

## Related Docs

- [README](../README.md)
- [Mode Comparison](mode-comparison.md)
- [Ecosystem Flow Overview](ecosystem-flow-overview.md)
