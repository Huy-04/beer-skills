---
skill: codebase-knowledge
purpose: Example conflict-resolution handoff when cache and source diverge
version: "1.0"
---

# Cache Conflict Resolution Example

## Situation

Existing knowledge-base entry:

```text
`backend/data-access-and-unit-of-work.md`
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
Conflict detected between current source and `.beer/knowledge-base/backend/data-access-and-unit-of-work.md`.

Current source remains authoritative for this analysis.

Observed source evidence:
- `src/auth/reset-session.service.ts`
- `src/auth/user-admin.service.ts`

Action taken:
- Mark the cached data-access entry stale.
- Do not silently rewrite code or rationalize the mismatch.

Decision needed:
1. Update knowledge/docs to reflect the current direct-Prisma pattern.
2. Change code to restore the documented repository and unit-of-work pattern.
```

## Why This Matters

- Prevents stale cache from overruling source.
- Forces explicit user intent when a documented convention and real implementation drift apart.
- Keeps the knowledge base useful without turning it into a false spec.
