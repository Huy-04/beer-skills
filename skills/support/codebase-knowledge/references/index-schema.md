---
skill: codebase-knowledge
purpose: Canonical schema for `Docs/index.json`
version: "1.1"
---

# index.json Schema

Use this file as the source of truth for the generated Docs index.

`Docs/` is project-local, sits beside `.beer/`, and is
local-cache-by-default. Current source code remains authoritative when generated
entries drift.

## Required Top-Level Fields

```json
{
  "version": "1.0",
  "generated_at": "2026-04-25T10:00:00Z",
  "strategy": "pattern-first",
  "stats": {
    "total_files": 0,
    "generated_docs": 0,
    "flow_docs": 1,
    "backend_docs": 0,
    "frontend_docs": 0,
    "boundary_docs": 0,
    "critical_flows": 0
  },
  "entries": [],
  "dominant_patterns": [],
  "backend": {
    "pattern_groups": {},
    "layer_patterns": {},
    "flow_patterns": {}
  },
  "frontend": {
    "pattern_groups": {},
    "layer_patterns": {},
    "flow_patterns": {}
  },
  "flows": {},
  "boundaries": {},
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
  "repo_shape": "Node-based skill and workflow repository",
  "discovery": {
    "pre_scan": "real-repo-scan",
    "execution": "parallel-child-agents",
    "synthesis": "single-writer",
    "evidence_priority": "gitnexus-first",
    "lanes": ["architecture-and-conventions", "backend", "frontend", "boundaries", "critical-flows"],
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

When GitNexus evidence is available, the writer should prefer graph-derived repo
shape, dominant patterns, and doc proposals, then use local source to confirm
key files and representative snippets.

## `entries[]`

Each entry should contain:

```json
{
    "title": "Request Lifecycle",
  "area": "backend",
  "kind": "pattern",
  "role": "backend-request-lifecycle",
  "architecture_style": "route-service-backend",
  "file": "Backend/request-lifecycle.md",
  "confidence": "high",
  "tags": ["backend", "request", "lifecycle"],
  "summary": "Shows the usual path from entrypoint to persistence and side effects."
}
```

`Flows/repo-flow.md` is required when source code or command entrypoints exist.
Repos with no code yet should not get a synthetic flow doc. When present, it
must include a `## Flow Diagram` section with a Mermaid `flowchart` so the
default repo flow is readable as text and renderable in docs tools.

The markdown file referenced by each entry should include:

- `Key Files`
- `Source Evidence`
- `Representative Snippet`

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

## `backend.pattern_groups`, `frontend.pattern_groups`, and `boundaries`

Use these sections for machine-usable pattern expectations and verification
targets. `layer_patterns` may exist as a compatibility alias, but writers
should not imply every repo uses four layers.

Example:

```json
{
  "backend": {
    "pattern_groups": {
      "request-lifecycle": {
        "architecture_style": "route-service-backend",
        "mission": "orchestrate request flow while preserving the architecture style actually detected in this repo",
        "dominant_patterns": [
          "thin handler orchestration",
          "delegation into lifecycle/domain methods",
          "mapping at boundary edges only"
        ],
        "do_not_do": [
          "embed infrastructure mapping directly in handlers",
          "move domain lifecycle rules into entrypoints"
        ],
        "verification_targets": {
          "symbols": ["CreateOrderHandler", "OrderLifecycle"],
          "processes": ["CreateOrder"],
          "queries": [
            { "tool": "query", "query": "create order handler flow" }
          ]
        }
      }
    }
  },
  "frontend": {
    "pattern_groups": {
      "api-access": {
        "architecture_style": "frontend-surface",
        "mission": "route page/composable work through the established client/proxy shape",
        "dominant_patterns": [
          "API access through shared client/proxy",
          "session handling outside leaf components"
        ],
        "verification_targets": {
          "symbols": ["ApiClient", "SessionStore"]
        }
      }
    }
  },
  "boundaries": {
    "auth-session": {
      "summary": "Auth/session contract between FE and BE",
      "verification_targets": {
        "processes": ["AuthSession"],
        "symbols": ["RefreshTokenHandler", "FrontendAuthProxy"]
      }
    }
  }
}
```

## `task_index`

Use task buckets to route common implementation intents to the right docs:

```json
{
  "add backend endpoint": {
    "docs": [
      "Backend/request-lifecycle.md",
      "Conventions/implementation-rules.md"
    ],
    "pattern_targets": ["backend.pattern_groups.request-lifecycle"],
    "verification_targets": {
      "processes": ["CreateOrder"],
      "queries": [
        { "tool": "query", "query": "backend request lifecycle" }
      ]
    }
  },
  "change auth": {
    "docs": [
      "CriticalFlows/auth-session.md",
      "Boundaries/frontend-backend-proxy.md"
    ],
    "boundary_targets": ["boundaries.auth-session"],
    "verification_targets": {
      "processes": ["AuthSession"]
    }
  }
}
```

## Rules

- `file` must be relative to `Docs/`
- `Flows/repo-flow.md` must exist and `index.json.flows.repo-flow` must point to it when source code exists
- `role` should identify the reusable meaning, such as `backend-request-lifecycle`, independent of the generated file path
- `architecture_style` should be recorded when a doc path depends on detected shape, for example `layered-backend`, `vertical-slice-backend`, or `route-service-backend`
- `confidence` must be one of `high`, `medium`, `low`
- `area` should match a real generated Docs area such as `flows`, `backend`, `frontend`, `boundaries`, `critical-flows`, `architecture`, or `conventions`
- `kind` should reflect what the doc is about: `flow-map`, `architecture`, `pattern`, `boundary`, `critical-flow`, or `convention`
- `search_index` values must point to files already declared in `entries[]`
- `task_index.docs` values must point to files already declared in `entries[]`
- backend and frontend patterns should stay separate unless the pattern is truly boundary-scoped
- boundary entries should capture FE/BE seams instead of duplicating full backend or frontend flow docs
- `dominant_patterns` should only contain stable repo-shaping patterns, not one-off details
- `critical_files` should list sensitive or high-blast-radius paths when known
- JSON files should be valid UTF-8 and parse cleanly in Node without BOM-sensitive assumptions
