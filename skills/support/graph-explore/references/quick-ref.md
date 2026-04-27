---
skill: graph-explore
purpose: Commands and queries for graph exploration
version: "1.2"
---

# graph-explore - Quick Reference

## Support Lens Reminder

- record the calling Beer phase before deep graph work
- answer one concrete structural question at a time
- return evidence to the caller
- do not mutate Beer state, `CONTEXT.md`, plans, or code from this helper
- do not create or refresh generated `Docs/`
- when asked to check a Docs-derived assumption, return `docs_relation`

---

## MCP Commands

### Check Status

```yaml
list_repos: {}
```

Confirm the target repo is present in the result.

### Index Project

If the repo is not indexed, return `status: degraded` to the calling skill or ask the user to run GitNexus indexing outside the Beer flow. Do not block the caller.
If a symbol name is ambiguous, prefer exact `file_path`, file path targets, or symbol UIDs from prior results.
If `route_map`, `api_impact`, `shape_check`, or `tool_map` return empty results, confirm whether the repo index contains any Route or Tool nodes before treating it as a skill problem.
Do not auto-index, write Beer artifacts, or mutate code from this helper.
Do not refresh generated `Docs/`; graph/Docs mismatches are returned to the caller for review or compounding.

---

## Common Queries

### Get Communities

```cypher
MATCH (c:Community)
RETURN c.heuristicLabel, c.description, c.symbolCount, c.cohesion
LIMIT 20
```

### Get Entry Points

```cypher
MATCH (s)-[:CodeRelation {type: 'ENTRY_POINT_OF'}]->(p:Process)
RETURN s.name, s.filePath, p.heuristicLabel
LIMIT 10
```

### Find Functions

```cypher
MATCH (f:Function)
WHERE f.name CONTAINS "validate"
RETURN f.name, f.filePath
LIMIT 20
```

### Find Callers

```cypher
MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b:Function {name: "validateUser"})
RETURN a.name, a.filePath
LIMIT 20
```

### Find Similar

```cypher
MATCH (f:Function)
WHERE f.signature CONTAINS "User"
RETURN f.name, f.filePath, f.signature
LIMIT 10
```

---

## Query Patterns

| Need | Pattern |
|------|---------|
| Repo readiness | `list_repos` |
| Architecture | `query`, then `cypher` if needed |
| Entry points | `MATCH (s)-[:CodeRelation {type: 'ENTRY_POINT_OF'}]->(p)` |
| Similar code | `MATCH (f:Function) WHERE f.name CONTAINS $x` |
| Dependencies | `impact` or `MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b)` |
| Call chain | `MATCH (a)-[:CodeRelation {type: 'CALLS'}*1..3]->(b)` |

---

## Filter Techniques

```cypher
# By file type
WHERE f.filePath ENDS WITH ".ts"

# By community label
WHERE c.heuristicLabel = "Authorization"

# By confidence
WHERE r.confidence >= 0.8
```

---

## Integration

### With Context Intake

Pass graph findings back to the calling skill as structured data. Do not write directly to Beer state artifacts.

### With Planning

Pass similar implementations, communities, and cross-module dependencies to `planning` as structured findings. Reference files in the plan only when they materially inform scope.
If planning uses a generated Docs hint, graph-explore may confirm or challenge it, but planning still verifies source before execution.

### With Debugging

Return caller/callee, process, or blast-radius evidence to `debugging` when local inspection is too shallow to prove the fault area confidently.

### With Codebase Knowledge

`codebase-knowledge` can use graph evidence as an input to generated `Docs/`.
`graph-explore` itself only returns the evidence packet; the Docs writer owns
whether that evidence becomes durable documentation.

## Evidence Packet Minimum

Return:

- `return_to`
- `question`
- `source: gitnexus`
- `status: ok | degraded`
- `tools_used`
- `findings` or typed sections such as `processes`, `symbols`, `dependencies`
- `starting_points`
- `source_checks`
- `docs_relation` when relevant
- `risks`
- `confidence`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Slow query | Add LIMIT, narrow WHERE |
| No results | Check indexing, broaden query, or switch from `cypher` to `query` |
| Old data | Return stale/degraded status and let the caller or user choose re-indexing |
| Too many | Add filters, pagination |
| Empty route/tool results | Check whether the index has any Route or Tool nodes at all |

---

## Quick Decision

```
Need architecture overview?
  YES --> graph-explore
  NO  --> local inspection or another helper chosen by caller

GitNexus indexed?
  YES --> graph-explore (fast)
  NO  --> return degraded to caller
```
