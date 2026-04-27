---
skill: graph-explore
purpose: GitNexus tool choice guide for Beer support usage
version: "1.2"
---

# GitNexus Tool Choice Guide

This file is a usage guide, not the source of truth for MCP tool schemas.

Always prefer the active GitNexus MCP tool schema exposed in the current
session. If this guide and the active schema disagree, follow the active schema
and report the mismatch as stale documentation.

---

## Tool Selection

| Question | Primary tool | Notes |
|---|---|---|
| Is this repo indexed? | `list_repos` | Use before graph work when repo identity or index status is uncertain. |
| What flow or symbols match this task? | `query` | Natural-language search over processes and symbols. |
| What calls or uses this symbol? | `context` | Prefer `uid` or `file_path` when names are ambiguous. |
| What breaks if this changes? | `impact` | Use `upstream` for dependents and `downstream` for dependencies. |
| What custom graph pattern should be checked? | `cypher` | Use only when standard tools do not answer the question. |
| What changed in the worktree? | `detect_changes` | Useful for review and pre-commit risk checks. |
| Which clients call this API route? | `route_map` or `api_impact` | Route nodes may be absent in some indexes. |
| Do response shapes match consumers? | `shape_check` | Treat empty route data as an index limitation until verified. |
| Which MCP/RPC tools exist in code? | `tool_map` | Tool nodes may be absent in some indexes. |
| Is a rename likely safe? | `rename` with `dry_run: true` | Preview only from this helper; implementation belongs elsewhere. |
| Are repo groups configured? | `group_list` or `group_sync` | Use only when group mode is explicitly relevant. |

---

## Readiness Pattern

1. Capture the caller and question:
   - `return_to`
   - concrete graph question
   - target repo/path
   - optional generated `Docs/` assumption to verify
2. Check index status with `list_repos` when uncertain.
3. Choose the smallest tool set that answers the question.
4. Include `repo` on every GitNexus call when multiple repos are indexed.
5. Return `status: degraded` when GitNexus is unavailable, missing the repo,
   stale, or too sparse to support the conclusion.

Do not auto-index from `graph-explore`. Return the precise indexing suggestion
to the caller or user.
Do not create or refresh generated `Docs/`; when graph evidence confirms or
contradicts a Docs-derived assumption, return that relationship in the evidence
packet.

---

## Common Patterns

### Architecture Lookup

Use `query` first.

```yaml
query:
  query: "checkout flow and shipment integration"
  goal: "find relevant execution flows and symbols"
  repo: "<repo-name>"
  limit: 5
  max_symbols: 10
```

Then use `context` on the highest-signal symbol if the caller needs detail.

### Blast Radius

Use `impact` before approving or reviewing changes to shared behavior.

```yaml
impact:
  target: "OrderAggregate"
  direction: "upstream"
  repo: "<repo-name>"
  maxDepth: 3
  includeTests: true
```

Prefer exact file paths or symbol UIDs for common names.

### API Safety

Use `api_impact` before changing a route handler.

```yaml
api_impact:
  route: "/api/orders"
  repo: "<repo-name>"
```

If route tools return no data, check whether the repo index contains Route
nodes before treating the empty result as proof of no consumers.

### Raw Cypher

Use `cypher` only for graph questions not covered by higher-level tools.

```cypher
MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b:Function {name: "validateUser"})
RETURN a.name, a.filePath
LIMIT 20
```

Keep Cypher bounded with `LIMIT` and avoid inventing edge names.

---

## Output Rules

Return evidence to the calling Beer skill. Include:

- `return_to`
- `source: gitnexus`
- `status: ok | degraded`
- tools used
- key symbols, files, processes, or routes
- starting points and source checks
- `docs_relation` when generated Docs was part of the caller's question
- confidence level and reason
- next local check the caller should run, if any

The caller owns workflow decisions, Beer state, planning artifacts, and code
edits.

---

## Stale Documentation Guard

If a tool listed in old docs is missing from the active MCP schema, do not call
it. Use the closest current tool, or return a degraded note if no replacement
exists.
