---
skill: codebase-knowledge
purpose: Example conflict-resolution handoff when cache and source diverge
version: "1.0"
---

# Cache Conflict Resolution Example

## Situation

Existing knowledge-base entry:

```text
`code-patterns/service-layer.md`
Summary: Services use repositories only. No direct persistence access.
```

Current source evidence:

```text
`src/auth/reset-session.service.ts`
`src/auth/user-admin.service.ts`
Both call Prisma directly.
```

## Correct Response Shape

```markdown
Conflict detected between current source and `.beer/knowledge-base/code-patterns/service-layer.md`.

Current source remains authoritative for this analysis.

Observed source evidence:
- `src/auth/reset-session.service.ts`
- `src/auth/user-admin.service.ts`

Action taken:
- Mark the cached service-layer entry stale.
- Do not silently rewrite code or rationalize the mismatch.

Decision needed:
1. Update knowledge/docs to reflect the current direct-Prisma pattern.
2. Change code to restore the documented repository-only pattern.
```

## Why This Matters

- Prevents stale cache from overruling source.
- Forces explicit user intent when a documented convention and real implementation drift apart.
- Keeps the knowledge base useful without turning it into a false spec.
