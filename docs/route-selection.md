# Route And Orchestration Selection

Beer routes work by choosing:

1. `route`
2. `work_intent`
3. `risk`
4. `orchestration_strategy`
5. `run_style`

These axes now drive the workflow directly. Beer no longer uses a separate
workflow-size flag.

## Selection Order

Beer should decide in this order:

1. explicit user preference
2. current repo and Beer state
3. live request understanding inside `beer:using-beer`
4. if the user is still choosing direction, route through `beer:strategy-shaping`
5. if confidence is low, ask whether to keep the proposed route or increase rigor
6. dependency reality

`beer:strategy-shaping` is not a third route value. It is the optional
pre-workflow consult layer used before `context-intake` when the task direction,
approach, or scope boundary is still being decided.

Before any automatic gate crossing, use:

```bash
node .beer/scripts/commands/beer-auto-accept.mjs --gate validating --json
npx --yes --package github:Huy-04/beer-skills beer-skills auto-accept --repo-root /path/to/project --gate reviewing --json
```

## Choose `route`

| Signal | Choose `small-fix` when... | Choose `feature` when... |
|---|---|---|
| Scope | likely 1-3 local files | broader feature or multi-step change |
| Decisions | no new product decision | behavior or boundary decisions matter |
| Planning depth | compact plan is enough | full planning and review are justified |
| Typical trigger | typo, tiny bug, obvious wiring fix | feature, refactor, contract change, or broader repair |

## Choose `work_intent`

| Signal | `delivery` | `repair` | `investigation` |
|---|---|---|---|
| User goal | add/change behavior | fix proven failing behavior | find cause first |
| Planning shape | delivery slices | repair slices anchored to the failing path | diagnosis before planning |
| Key proof | feature completion | failing path no longer fails | root-cause sentence plus evidence |
| Typical trigger | feature request | bug fix, regression repair, build/test fix | "why is this failing?" |

## Choose `risk`

| Signal | `normal` | `high` |
|---|---|---|
| Reversibility | easy to undo | hard to roll back safely |
| Blast radius | localized change | cross-cutting or architectural change |
| Validation depth | normal checks are enough | spikes or stronger validation are likely |
| Failure cost | mostly contained | could break key behavior or contracts |

## Choose `orchestration_strategy`

| Signal | `single-worker` | `multi-worker` |
|---|---|---|
| Write scope | one bounded stream | several disjoint slices |
| Coordination | merge overhead would outweigh benefit | ownership can be split cleanly |
| Blocking dependencies | one slice depends immediately on another | slices can progress independently |
| Validator focus | one execution stream | slice boundaries and merge safety |

## Choose `run_style`

| Preference | `guided` | `go` |
|---|---|---|
| Human involvement | explicit pauses at gates | auto-advance where confidence allows |
| Best for | most collaborative sessions | trusted end-to-end runs |
| Guardrails | still uses all hard gates | still stops for blockers and protected gates |

## Route Reality

After choosing the session shape, confirm the route is actually runnable.

| Route or capability | Minimum dependency set |
|---|---|
| Onboarding / status | `node` |
| `single-worker` execution path | `node` |
| `multi-worker` execution path | `node` + `bd` |
| Graph-augmented discovery | configured GitNexus MCP server plus an indexed repo |

If dependencies are missing, Beer should degrade to the highest viable path
instead of claiming the full route is available.

`orchestration_strategy` must not be used as a proxy for automation. Automation
belongs to `run_style`.

## Quick Decision Guide

| If the request looks like... | Recommended classification |
|---|---|
| strategy, approach, tradeoff, or overkill discussion before the task is clear | invoke `beer:strategy-shaping`, then enter `beer:context-intake` after the direction is chosen |
| typo, tiny bug fix, bounded refactor | `small-fix + repair + normal + single-worker + guided` |
| normal feature work with clear scope | `feature + delivery + normal + single-worker + guided` |
| decomposable feature across multiple boundaries | `feature + delivery + normal/high + multi-worker + guided` |
| proven bug that now needs broader repair | `feature + repair + normal/high + single-worker + guided` |
| trusted pipeline run with fewer pauses | keep the same route/intent/risk/strategy, switch `run_style = go` |

## Examples

| Request | Classification |
|---|---|
| "Rename this prop and update the tests" | `small-fix + repair + normal + single-worker + guided` |
| "Add invoice PDF export to order history" | `feature + delivery + normal + single-worker or multi-worker + guided` |
| "Split auth checks across API and UI safely" | `feature + delivery + high + multi-worker + guided` |
| "We found the root cause, now plan the broader repair" | `feature + repair + normal/high + single-worker + guided` |

## Related Docs

- [README](../README.md)
- [Route And Strategy Comparison](route-strategy-comparison.md)
- [Ecosystem Flow Overview](ecosystem-flow-overview.md)
