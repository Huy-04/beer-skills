---
skill: codebase-knowledge
purpose: Example conflict-resolution handoff when generated Docs and source diverge
version: "1.0"
---

# Docs Conflict Resolution Example

## Situation

Existing generated Docs entry:

```text
`Backend/patterns/data-access-and-unit-of-work.md`
Summary: Backend write paths go through repositories and unit-of-work boundaries. No direct ORM access from application services.
```

Current source evidence:

```text
`src/auth/reset-session.service.ts`
`src/auth/user-admin.service.ts`
Both call Prisma directly.
```

## Correct Response Shape

```markdown
Conflict detected between current source and `Docs/Backend/patterns/data-access-and-unit-of-work.md`.

Current source remains authoritative for this analysis.

Observed source evidence:
- `src/auth/reset-session.service.ts`
- `src/auth/user-admin.service.ts`

Action taken:
- Mark the generated data-access entry stale.
- Do not silently rewrite code or rationalize the mismatch.

Decision needed:
1. Update generated Docs to reflect the current direct-Prisma pattern.
2. Change code to restore the documented repository and unit-of-work pattern.
```

## Why This Matters

- Prevents stale generated docs from overruling source.
- Forces explicit user intent when a documented convention and real implementation drift apart.
- Keeps generated knowledge docs useful without turning them into a false spec.
