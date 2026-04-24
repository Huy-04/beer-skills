---
skill: codebase-knowledge
purpose: Example `.beer/knowledge-base/` output shape
version: "1.0"
---

# Example Output

This is an illustrative output shape. Real entries must be generated from current source evidence.

## Directory Shape

```text
.beer/knowledge-base/
  00-metadata.json
  index.json
  README.md
  code-patterns/
    service-layer.md
  architecture/
    layer-structure.md
  conventions/
    naming.md
  critical-sections/
    auth-flows.md
```

## 00-metadata.json

```json
{
  "version": "1.0",
  "generated_at": "2026-04-23T10:30:00Z",
  "generated_from_commit": "abc123",
  "source_authority": "current repository source",
  "commit_policy": "local-cache-by-default",
  "mode": "gitnexus-assisted",
  "stats": {
    "files_scanned": 128,
    "patterns_detected": 6,
    "analysis_lanes": 7
  },
  "confidence_summary": {
    "high": 4,
    "medium": 2,
    "low": 1
  }
}
```

## index.json

```json
{
  "version": "1.0",
  "generated_at": "2026-04-23T10:30:00Z",
  "stats": {
    "total_files": 128,
    "code_patterns": 2,
    "business_rules": 1,
    "critical_sections": 1
  },
  "entries": [
    {
      "title": "Service Layer",
      "area": "code-patterns",
      "file": "code-patterns/service-layer.md",
      "confidence": "high",
      "tags": ["services", "business-logic"],
      "summary": "Application services coordinate validation and repository calls."
    }
  ],
  "conventions": {
    "files": "kebab-case",
    "classes": "PascalCase",
    "functions": "camelCase"
  },
  "critical_files": [
    "src/auth/auth.service.ts"
  ],
  "search_index": {
    "auth": ["critical-sections/auth-flows.md"],
    "services": ["code-patterns/service-layer.md"]
  }
}
```

## code-patterns/service-layer.md

```markdown
---
area: code-patterns
pattern: Service Layer
detected_at: 2026-04-23T10:30:00Z
confidence: high
file_count: 8
source_authority: current repository source
status: current
---

# Service Layer

## Summary
Application services coordinate validation and repository calls. Controllers do not usually access persistence directly.

## Source Evidence
- `src/users/user.service.ts`
- `src/orders/order.service.ts`
- `src/products/product.service.ts`

## Applicability
Use this pattern when adding business logic that coordinates more than one repository or domain rule.

## Variations
- Some read-only services call query helpers directly.
- Auth service has extra token/session handling.

## Confidence
High: seen consistently across eight service files.

## Staleness
Current as of commit `abc123`. If current code diverges, trust source and ask whether to update knowledge/docs or change code.
```
