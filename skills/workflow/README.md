# Workflow Skills

`skills/workflow/` contains the explicit Beer workflow families.

## Families

| Family | Path | Purpose |
|---|---|---|
| `feature` | `skills/workflow/feature/` | feature routing, context recovery, planning, validation, execution, review, and learnings |
| `debug` | `skills/workflow/debug/` | root-cause, repair, and verification workflow |

## Feature Flow

```mermaid
flowchart TD
    UB[using-beer] --> CC[context-intake]
    CC -->|small direct fix| PL[planning]
    CC -->|locked context already sufficient| PL
    CC -->|decisions still unlocked| EX[exploring]
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

## Debug Flow

```mermaid
flowchart LR
    UB[using-beer] --> DB[debugging]
    DB --> DF[direct fix]
    DB --> TDD[test-driven-development]
    DB --> PL[planning<br/>debug-escalation]
```

## Related Docs

- [README](../../README.md)
- [Ecosystem Flow Overview](../../docs/ecosystem-flow-overview.md)
- [Support Skills](../support/README.md)
- [Meta Skills](../meta/README.md)
