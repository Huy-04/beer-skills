---
skill: codebase-knowledge
purpose: Canonical schema for `.beer/knowledge-base/index.json`
version: "1.0"
---

# index.json Schema

Use this file as the source of truth for the generated knowledge-base index.

`.beer/knowledge-base/` is project-local and local-cache-by-default. Current source code remains authoritative when generated entries drift.

## Required Top-Level Fields

```json
{
  "version": "1.0",
  "generated_at": "2026-04-22T10:00:00Z",
  "stats": {
    "total_files": 0,
    "code_patterns": 0,
    "business_rules": 0,
    "critical_sections": 0
  },
  "entries": [],
  "conventions": {},
  "critical_files": [],
  "search_index": {}
}
```

## `00-metadata.json`

The metadata file should include source authority and commit policy:

```json
{
  "version": "1.0",
  "generated_at": "2026-04-22T10:00:00Z",
  "generated_from_commit": "abc123",
  "source_authority": "current repository source",
  "commit_policy": "local-cache-by-default",
  "invocation_reason": "user-request|compounding-approved-refresh|explicit-partial-scan",
  "scan_scope": "full|partial",
  "mode": "manual|gitnexus-assisted",
  "gitnexus_status": "available|missing|repo-not-indexed|not-used",
  "stats": {
    "files_scanned": 0,
    "patterns_detected": 0,
    "analysis_lanes": 7
  },
  "notes": [
    "Record why generated_from_commit is unknown-* when git lookup is blocked or unavailable."
  ]
}
```

Use `generated_from_commit` for freshness checks. It may be a commit sha or an explicit `unknown-*` fallback when Git lookup is blocked or unavailable. `commit_policy` means generated files should not be committed unless the user/team explicitly wants shared repo knowledge. `scan_scope = partial` means downstream skills must not treat architecture or convention claims as repo-wide unless separately supported by source evidence.

## `entries[]`

Each entry should contain:

```json
{
  "title": "Repository Pattern",
  "area": "code-patterns",
  "file": "code-patterns/repository-pattern.md",
  "confidence": "high",
  "tags": ["database", "data-access"],
  "summary": "Repository abstraction for persistence operations."
}
```

## Rules

- `file` must be relative to `.beer/knowledge-base/`
- `confidence` must be one of `high`, `medium`, `low`
- `area` should match a real knowledge-base subfolder
- `search_index` values must point to files already declared in `entries[]`
- `conventions` is optional but recommended for cross-feature consistency
- `critical_files` is optional but should list security-sensitive paths when known
- JSON files should be valid UTF-8 and parse cleanly in Node without BOM-sensitive assumptions
