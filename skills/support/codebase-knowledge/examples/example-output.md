---
skill: codebase-knowledge
purpose: Example `.beer/knowledge-base/` output shape
version: "1.1"
---

# Example Output

This is an illustrative output shape. Real entries must be generated from current source evidence.

## Directory Shape

```text
.beer/knowledge-base/
  00-metadata.json
  index.json
  README.md
  architecture/
    system-overview.md
  backend/
    request-lifecycle.md
    module-template.md
  frontend/
    app-structure-and-api-access.md
  boundaries/
    frontend-backend-proxy.md
  critical-flows/
    auth-session.md
  conventions/
    implementation-rules.md
```

## 00-metadata.json

```json
{
  "version": "1.0",
  "generated_at": "2026-04-25T10:30:00Z",
  "generated_from_commit": "abc123",
  "source_authority": "current repository source",
  "commit_policy": "local-cache-by-default",
  "invocation_reason": "user-request",
  "scan_scope": "full",
  "mode": "gitnexus-assisted",
  "strategy": "pattern-first",
  "gitnexus_status": "available",
  "source_path": ".",
  "discovery": {
    "model": "single-writer synthesis",
    "lanes": ["repo-scout", "backend", "frontend", "boundaries"],
    "optional_lanes": ["critical-flows", "async-patterns", "integration-patterns"]
  },
  "stats": {
    "files_scanned": 128,
    "patterns_detected": 6,
    "docs_generated": 6,
    "discovery_lanes": 4
  },
  "confidence_summary": {
    "high": 4,
    "medium": 2,
    "low": 0
  }
}
```

## index.json

```json
{
  "version": "1.0",
  "generated_at": "2026-04-25T10:30:00Z",
  "strategy": "pattern-first",
  "stats": {
    "total_files": 128,
    "generated_docs": 6,
    "backend_docs": 2,
    "frontend_docs": 1,
    "boundary_docs": 1,
    "critical_flows": 1
  },
  "entries": [
    {
      "title": "Request Lifecycle",
      "area": "backend",
      "kind": "pattern",
      "file": "backend/request-lifecycle.md",
      "confidence": "high",
      "tags": ["backend", "request", "lifecycle"],
      "summary": "Shows the standard backend path from request entrypoint to persistence and side effects."
    }
  ],
  "dominant_patterns": [
    {
      "name": "Layered backend with handler-mediated request flow",
      "confidence": "high",
      "areas": ["architecture", "backend"],
      "summary": "Controllers stay thin while handlers, domain rules, and unit-of-work boundaries coordinate the real work."
    }
  ],
  "task_index": {
    "add backend endpoint": [
      "backend/request-lifecycle.md",
      "backend/module-template.md",
      "conventions/implementation-rules.md"
    ]
  },
  "critical_files": [
    "src/auth/session.ts"
  ],
  "conventions": {
    "files": "kebab-case markdown docs",
    "source_authority": "current repository source"
  },
  "search_index": {
    "auth": ["critical-flows/auth-session.md"],
    "request lifecycle": ["backend/request-lifecycle.md"]
  }
}
```

## backend/request-lifecycle.md

```markdown
---
area: backend
kind: pattern
pattern: request lifecycle
detected_at: 2026-04-25T10:30:00Z
confidence: high
file_count: 8
source_authority: current repository source
status: current
---

# Request Lifecycle

## What This Is
The standard backend path from entrypoint to persistence and side effects.

## Why It Exists Here
This codebase keeps entrypoints thin and pushes coordination into deeper layers.

## How To Follow It
- Start from the request entrypoint.
- Route into the application handler.
- Preserve domain-rule enforcement and transaction boundaries.
- Leave async side effects at the documented boundary.

## Common Variants In This Repo
- Read-heavy paths may skip mutation concerns.
- Auth paths may add session or token handling.

## Do Not Do
- Bypass the normal transaction boundary with ad hoc side effects.
- Add controller-heavy business logic when the repo expects handler coordination.

## Key Files
- `src/api/users.controller.ts`
- `src/application/create-user.handler.ts`
- `src/infrastructure/user-repository.ts`

## Risk When Changing
Medium to high. Request flow changes can affect auth, persistence, and async side effects.

## Confidence
High: repeated across multiple backend features.
```
