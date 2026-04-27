# Locked Context

## Feature
- `active_feature`: swarm-explore
- `route`: feature
- `work_intent`: delivery
- `risk`: high

## Task Purpose
- What this task is trying to achieve: Run swarm smoke path
- Why this matters now: High-risk change needs locked context

## Affected Flow
- Primary flow: Boundary validation flow
- Entry point:
- Exit point:
- Boundary touched: backend/frontend boundary

## Affected Layers
- Backend:
- Frontend:
- Boundary/API:
- Other:

## Locked Decisions
- D1: Security checks stay on current boundary contract
- D2: Split work into implementation and validation slices

## Constraints
- Do not change auth semantics

## Open Questions
- none recorded

## Source References
- src/swarm-one.ts
