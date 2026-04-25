# Workflow Skills

`skills/workflow/` contains the explicit Beer workflow families.

## Family

| Family | Path | Purpose |
|---|---|---|
| `feature` | `skills/workflow/feature/` | feature routing, context recovery, planning, validation, execution, review, learnings, and repair/investigation support |

## Feature Flow

```mermaid
flowchart TD
    UB[using-beer] --> CC[context-intake]
    CC --> EX[exploring]
    EX --> PL[planning]
    PL --> VA[validating]
    VA -->|parallel slice| SW[swarming]
    VA -->|bounded slice| EW[executing]
    SW -. worker assignments .-> EW
    SW --> RV[reviewing]
    EW --> RV[reviewing]
    RV --> CO[compounding]
    CO --> IDLE[idle]
```

## Investigation / Repair Lens

```mermaid
flowchart LR
    CC[context-intake] --> EX[exploring]
    EX -. debugging lens .-> DB[debugging]
    DB --> TDD[test-driven-development]
    DB -. repair handoff .-> PL[planning]
```

## Related Docs

- [README](../../README.md)
- [Ecosystem Flow Overview](../../docs/ecosystem-flow-overview.md)
- [Support Skills](../support/README.md)
- [Meta Skills](../meta/README.md)
