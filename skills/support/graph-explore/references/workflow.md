---
skill: graph-explore
purpose: Step-by-step workflow for graph-based codebase exploration
version: "1.2"
---

# graph-explore - Workflow Details

---

## Overview

**Role:** Codebase discovery via knowledge graph  
**Job:** Find patterns, communities, relationships, processes, and blast radius for a calling Beer phase  
**When:** GitNexus is available and the target repo is indexed

This helper is a support lens. It gathers graph evidence and returns it to the
calling Beer skill. It does not take over Beer state or workflow ownership.
Generated `Docs/` may supply a hypothesis to check, but this helper never
creates or refreshes Docs.

---

## Step 1: Check Readiness

Record the calling owner before graph work:

- `calling_phase`
- the concrete question to answer
- the expected return owner such as `beer:exploring`, `beer:planning`, `beer:validating`, `beer:debugging`, or `beer:reviewing`
- optional generated `Docs/` assumption the caller wants verified

```yaml
list_repos: {}
```

Confirm the target repo appears in the list above. If not, return:

```yaml
status: degraded
reason: target repo not indexed in GitNexus
```

Use every relevant GitNexus view needed to answer the caller: `query`, `context`, `impact`, `cypher`, route/API tools, and change detection. Prefer concrete graph evidence over shallow guesses.
Return evidence to the caller instead of taking over `exploring`. The calling skill decides whether to continue with local inspection.
When a symbol name is ambiguous, prefer an exact `file_path`, file path target, or symbol UID from a previous result.
The caller owns Beer state, `CONTEXT.md`, plans, and code. If the index is stale or missing, return degraded/stale status plus the precise indexing recommendation.
If graph evidence contradicts generated `Docs/`, return `docs_relation:
mismatch` or `stale_possible`; do not refresh Docs here.

---

## Step 2: Query Architecture

```yaml
query:
  query: "checkout flow architecture and related modules"
  goal: "find the most relevant execution flows and symbols"
  repo: "<repo-name>"
  limit: 5
  max_symbols: 10
```

**Output:** Ranked processes, symbols, and definitions relevant to the topic.

---

## Step 3: Explore Communities

```cypher
MATCH (f:File)-[:CodeRelation {type: 'MEMBER_OF'}]->(c:Community)
RETURN c.heuristicLabel, c.symbolCount, c.cohesion, count(f) AS fileCount
ORDER BY fileCount DESC
LIMIT 20
```

**Focus:** Large or cohesive communities that explain the query result set.

---

## Step 4: Find Patterns

```cypher
MATCH (f:Function)
WHERE f.name CONTAINS $keyword
RETURN f.name, f.filePath, f.signature
LIMIT 10
```

**Use for:** Finding nearby reference implementations after `query` identifies the right area.

---

## Step 5: Trace Dependencies

Prefer `impact` when the goal is blast radius:

```yaml
impact:
  target: "OrderAggregate"
  direction: "upstream"
  repo: "<repo-name>"
  maxDepth: 3
```

Use `cypher` only when you need a custom edge traversal:

```cypher
MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b)
WHERE b.name = $symbol
RETURN a.name, a.filePath
LIMIT 20
```

**Use for:** Understanding impact of changes without inventing unsupported edge names. Prefer exact targets over broad names like aggregate folder names.

---

## Step 6: Return Findings

Return structured findings to the calling skill. Do not write directly to CONTEXT artifacts. The caller owns context mutation. Include:

- `return_to`: the calling Beer owner
- `source`: `gitnexus`
- `status`: `ok` or `degraded`
- `question`: the caller's concrete graph question
- `tools_used`: the GitNexus tools used
- `processes`: relevant execution flows when `query` is used
- `communities`: relevant communities when `cypher` is used
- `patterns`: recurring code patterns
- `dependencies`: caller/importer or blast-radius findings
- `starting_points`: files or symbols the caller should inspect next
- `source_checks`: exact facts the caller or worker must verify in current source before coding
- `docs_relation`: `not_used`, `confirmed`, `mismatch`, or `stale_possible`
- `risks`: blast-radius, stale-index, API, route, or boundary risks
- `confidence`: High / Medium / Low with reason

If Route or Tool nodes are absent in the index, report that explicitly rather than treating route/tool outputs as failures in the skill.

---

## Integration with Flow

```
context-intake
    |
    |-- GitNexus ready? --> graph-explore (this helper)
    |                       -> fast structural context
    |                       -> returns findings to caller
    |
    `-- GitNexus not ready? --> degraded result to caller
                                -> caller chooses Grep/Glob/Read fallback
```

---

## Key Queries

| Purpose | Query |
|---------|-------|
| Repo readiness | `list_repos` |
| Execution flow discovery | `query` |
| Symbol deep-dive | `context` |
| Blast radius | `impact` |
| Advanced graph drill-down | `MATCH (...) -[:CodeRelation {type: 'CALLS'}]-> (...)` |

---

## When to Use vs Exploring

| | graph-explore | exploring |
|---|---|---|
| **Requires** | GitNexus | Nothing |
| **Speed** | Fast (indexed) | Slower |
| **Depth** | Cross-file relationships | Surface patterns |
| **Best for** | Architecture understanding | Quick discovery |
| **Fallback** | Return degraded to caller | Always available |

---

## Output Format

```json
{
  "source": "gitnexus",
  "status": "ok",
  "return_to": "beer:planning",
  "question": "Which checkout flow symbols and dependencies matter for this slice?",
  "tools_used": ["query", "impact"],
  "processes": [
    { "name": "Checkout", "relevance": 0.94 }
  ],
  "relevantSymbols": [
    { "name": "OrderAggregate", "filePath": "BE/.../Order.cs", "module": "Order" }
  ],
  "patterns": [
    { "type": "query-handler", "filePath": "BE/.../GetOrderQueryHandler.cs" }
  ],
  "starting_points": [
    "BE/.../Order.cs",
    "BE/.../ReserveInventory.cs"
  ],
  "source_checks": [
    "Confirm Order lifecycle method signature and event payload before coding."
  ],
  "docs_relation": "not_used",
  "risks": [
    "Order lifecycle changes have upstream shipment and inventory callers."
  ],
  "confidence": {
    "level": "High",
    "reason": "target repo indexed and results agree across query and impact"
  }
}
```

---

## Red Flags

| Issue | Action |
|-------|--------|
| GitNexus not indexed | Return degraded to caller |
| Query too slow | Add LIMIT, narrow scope |
| No communities found | Fall back to `query`, then narrow with `context` or `impact` |
| No Route or Tool nodes | Report index limitation and continue with non-route graph tools |
| Results outdated | Return degraded or stale status; do not re-index from this helper |
