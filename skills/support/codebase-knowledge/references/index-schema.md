---
skill: codebase-knowledge
purpose: Canonical schema for `.beer/knowledge-base/index.json`
version: "1.1"
---

# index.json Schema

Use this file as the source of truth for the generated knowledge-base index.

`.beer/knowledge-base/` is project-local and local-cache-by-default. Current
source code remains authoritative when generated entries drift.

## Required Top-Level Fields

```json
{
  "version": "1.0",
  "generated_at": "2026-04-25T10:00:00Z",
  "strategy": "pattern-first",
  "stats": {
    "total_files": 0,
    "generated_docs": 0,
    "backend_docs": 0,
    "frontend_docs": 0,
    "boundary_docs": 0,
    "critical_flows": 0
  },
  "entries": [],
  "dominant_patterns": [],
  "task_index": {},
  "critical_files": [],
  "conventions": {},
  "search_index": {}
}
```

## `00-metadata.json`

The metadata file should include source authority, commit policy, and the
generation strategy:

```json
{
  "version": "1.0",
  "generated_at": "2026-04-25T10:00:00Z",
  "generated_from_commit": "abc123",
  "source_authority": "current repository source",
  "commit_policy": "local-cache-by-default",
  "invocation_reason": "user-request|compounding-approved-refresh|explicit-partial-scan",
  "scan_scope": "full|partial",
  "mode": "manual|gitnexus-assisted",
  "strategy": "pattern-first",
  "gitnexus_status": "available|missing|repo-not-indexed|not-used",
  "source_path": ".",
  "discovery": {
    "model": "single-writer synthesis",
    "lanes": ["repo-scout", "backend", "frontend", "boundaries"],
    "optional_lanes": ["critical-flows", "async-patterns", "integration-patterns"]
  },
  "stats": {
    "files_scanned": 0,
    "patterns_detected": 0,
    "docs_generated": 0,
    "discovery_lanes": 4
  },
  "confidence_summary": {
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "notes": []
}
```

Use `generated_from_commit` for freshness checks. It may be a commit sha or an
explicit `unknown-*` fallback when Git lookup is blocked or unavailable.

## `entries[]`

Each entry should contain:

```json
{
  "title": "Request Lifecycle",
  "area": "backend",
  "kind": "pattern",
  "file": "backend/request-lifecycle.md",
  "confidence": "high",
  "tags": ["backend", "request", "lifecycle"],
  "summary": "Shows the usual path from entrypoint to persistence and side effects."
}
```

## `dominant_patterns[]`

Use this for short, high-signal summaries that README can mirror:

```json
[
  {
    "name": "Layered backend with MediatR request flow",
    "confidence": "high",
    "areas": ["architecture", "backend"],
    "summary": "Controllers stay thin and push work through handlers, domain rules, and unit-of-work boundaries."
  }
]
```

## `task_index`

Use task buckets to route common implementation intents to the right docs:

```json
{
  "add backend endpoint": [
    "backend/request-lifecycle.md",
    "backend/module-template.md",
    "conventions/implementation-rules.md"
  ],
  "change auth": [
    "critical-flows/auth-session.md",
    "boundaries/frontend-backend-proxy.md"
  ]
}
```

## Rules

- `file` must be relative to `.beer/knowledge-base/`
- `confidence` must be one of `high`, `medium`, `low`
- `area` should match a real knowledge-base subfolder
- `kind` should reflect what the doc is about: `architecture`, `pattern`, `boundary`, `critical-flow`, or `convention`
- `search_index` values must point to files already declared in `entries[]`
- `task_index` values must point to files already declared in `entries[]`
- `dominant_patterns` should only contain stable repo-shaping patterns, not one-off details
- `critical_files` should list sensitive or high-blast-radius paths when known
- JSON files should be valid UTF-8 and parse cleanly in Node without BOM-sensitive assumptions
