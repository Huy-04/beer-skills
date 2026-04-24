---
name: graph-explore
description: >
  This skill should be used when another Beer skill needs deeper code structure,
  blast-radius, dependency, process, or API-safety answers than local inspection
  can provide through GitNexus-backed graph queries.
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.1.0"
  ecosystem: beer
  tags:
    - beer/support
    - graph
  dependencies:
    - id: gitnexus
      kind: mcp_server
      server_names: [gitnexus]
      config_sources: [repo_codex_config, global_codex_config, plugin_mcp_manifest]
      missing_effect: degraded
      reason: Graph queries depend on GitNexus-backed architecture intelligence. If unavailable, return degraded status to the calling skill; the calling skill continues with local inspection (Grep/Glob/Read). Do not invoke exploring.
allowed-tools:
  - Read
  - Bash
user-invocable: false
disable-model-invocation: false
---

# Graph Explore

Use this skill when another Beer skill needs graph-backed structure, caller/callee, process, route, or blast-radius answers that local grep/file inspection cannot answer efficiently.

---

## At a Glance

| | |
|---|---|
| **Use when** | Another Beer skill needs GitNexus-backed structure or impact context |
| **Needs** | Indexed repo access or a degraded fallback path |
| **Produces** | Graph-backed answers, confidence level, and a clear degraded signal when unavailable |
| **Next** | Return to the calling Beer skill |

## 30-Second Version

1. Confirm the target repo is indexed.
2. Choose the smallest GitNexus query that answers the caller's question.
3. Report findings with confidence and source tool.
4. Return `status: degraded` when GitNexus or indexing is unavailable.

---

## Capability First

- Use the full GitNexus toolset needed to answer the caller: `query`, `context`, `impact`, `cypher`, `detect_changes`, `route_map`, `api_impact`, `shape_check`, `tool_map`, and `rename` preview when relevant.
- Prefer rich graph evidence over shallow file guesses when GitNexus is available.
- Cross-check important conclusions with more than one graph view when risk is high.
- Return concrete starting points, affected symbols, route consumers, or process traces that let the workflow skill act with more confidence.

## Ownership Boundary

- This helper maximizes evidence; the calling workflow skill owns decisions, state mutation, planning artifacts, and code changes.
- If GitNexus is unavailable, stale, or not indexed, report the limitation with enough detail for the caller to continue locally or ask the user to index.

---

## When to Invoke

| Scenario | Preferred Tool |
|---|---|
| Need to find the execution flow or likely symbols for a feature | `query` |
| Need to estimate blast radius before approving execution | `impact` |
| Need to inspect one symbol's callers, callees, or process participation | `context` |
| Need advanced structure beyond natural-language search | `cypher` |
| Need API consumption or route safety context | `route_map` or `api_impact` |
| Reviewing uncommitted changes and affected flows | `detect_changes` + `impact` |

---

## Query by Beer Phase

### Context Coordination

```yaml
list_repos: {}
```

Confirm the target repo is indexed. If the repo is missing, return:

```yaml
status: degraded
reason: target repo not indexed in GitNexus
```

### Planning

```yaml
query:
  query: "how checkout flow integrates with inventory and shipment"
  goal: "map cross-module dependencies for checkout feature"
  repo: "<repo-name>"
  limit: 10
```

```yaml
impact:
  target: "OrderAggregate"
  direction: "upstream"
  repo: "<repo-name>"
  maxDepth: 2
```

### Validating

```yaml
impact:
  target: "BE/Lumora.Domain/Modules/Order/Aggregates/OrderAggregate/Order.cs"
  direction: "upstream"
  repo: "<repo-name>"
  maxDepth: 3
  includeTests: true
```

If risk = HIGH or CRITICAL, flag for spike.

### Executing

```yaml
context:
  name: "MarkInTransit"
  file_path: "BE/Lumora.Domain/Modules/Order/Aggregates/OrderAggregate/Order.Lifecycle.cs"
  include_content: true
  repo: "<repo-name>"
```

Verify all callers in the output.

### Reviewing

```yaml
detect_changes:
  scope: "staged"
  repo: "<repo-name>"
```

Cross-check changed symbols against the plan.

---

## Readiness Rules

1. Call `list_repos` first when repo identity or indexing status is uncertain.
2. If multiple repos are indexed, pass `repo` on every GitNexus call.
3. If GitNexus is unavailable or the target repo is not indexed, return `status: degraded` to the caller.
4. Prefer exact file paths or symbol UIDs for `impact` and `context` when names are ambiguous.
5. Treat `route_map`, `api_impact`, `shape_check`, and `tool_map` as optional graph branches. Some indexed repos contain no Route or Tool nodes.
6. Return evidence to the caller instead of taking over `exploring`, Beer state, `CONTEXT.md`, plans, or code.
7. If indexing is stale or missing, report degraded/stale status and recommend the precise next indexing action; let the caller or user decide whether to run `gitnexus-cli`.

---

## Output Contract

Report findings using the template in `references/communication.md`. Key rules:

- Quantify: "12 files in auth community"
- Rank by relevance score when available
- Suggest starting points
- State confidence: High / Medium / Low
- Distinguish clearly whether the answer came from `query`, `context`, `impact`, `cypher`, or route analysis
- If confidence is Low, GitNexus is unavailable, or the target repo is not indexed, return `status: degraded` to the caller

---

## Quick Reference

| Tool | Beer Phase | Purpose |
|---|---|---|
| `query` | All phases | Find code by description |
| `context` | Executing, Debugging | Deep-dive into one symbol |
| `impact` | Planning, Validating, Reviewing | Blast radius |
| `cypher` | Advanced | Raw graph queries |
| `detect_changes` | Reviewing | Pre-commit impact check |
| `route_map` | Planning | API dependency map |
| `api_impact` | Planning, Validating | API change safety |
| `shape_check` | Reviewing | Response mismatch |
| `rename` | Refactoring | Safe rename |
| `list_repos` | Bootstrap | Discover indexed repos |

Full tool signatures and Cypher examples: `references/quick-ref.md`
Detailed tool documentation: `references/gitnexus-tools.md`

---

## References

- `references/communication.md` - Findings report template and confidence rules
- `references/quick-ref.md` - Common queries, troubleshooting, integration notes
- `references/workflow.md` - Step-by-step graph exploration workflow
- `references/gitnexus-tools.md` - Full GitNexus MCP tool documentation

---

## Handoff

> Graph context gathered. Return to the calling Beer skill.
