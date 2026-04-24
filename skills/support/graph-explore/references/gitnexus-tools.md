---
skill: graph-explore
purpose: Detailed documentation for all GitNexus MCP tools used by Beer
version: "1.0"
---

# GitNexus Tools

GitNexus exposes tools via MCP. Beer uses these as the primary graph query interface.

---

## 1. `query` — Natural Language Code Search

Find execution flows, symbols, and processes by describing what you need in plain language.

**Input:**
- `query`: natural language description (e.g., "existing auth validation logic")
- `goal`: what you want to find
- `task_context`: optional — what you're working on (improves ranking)
- `include_content`: include full symbol source (default: false)
- `limit`: max processes to return (default: 5)
- `max_symbols`: max symbols per process (default: 10)

**Example:**
```
query: "how does Order checkout flow work"
goal: "find the checkout execution flow"
task_context: "implementing checkout feature"
```

**Output:** Ranked execution flows with relevance, symbols, and file locations.

---

## 2. `context` — 360-Degree Symbol View

Deep-dive into a single symbol: callers, callees, imports, properties, overrides.

**Input:**
- `name`: symbol name (e.g., "validateUser", "AuthService")
- `uid`: direct symbol UID from prior `query` results (zero-ambiguity)
- `file_path`: disambiguate common names
- `include_content`: include full source (default: false)

**Example:**
```
name: "OrderService"
include_content: true
```

**Output:** Categorized incoming/outgoing references, process participation, file location.

---

## 3. `impact` — Blast Radius Analysis

Analyze what would break if you change a symbol. Returns affected symbols grouped by depth.

**Input:**
- `target`: symbol name or file path to analyze
- `direction`: `"upstream"` (what depends on this) or `"downstream"` (what this depends on)
- `maxDepth`: max relationship depth (default: 3)
- `minConfidence`: minimum confidence 0-1 (default: 0.7)
- `relationTypes`: filter edge types (CALLS, IMPORTS, EXTENDS, IMPLEMENTS, HAS_METHOD, HAS_PROPERTY, METHOD_OVERRIDES, METHOD_IMPLEMENTS, ACCESSES)
- `includeTests`: include test files (default: false)

**Example:**
```
target: "OrderService"
direction: "upstream"
maxDepth: 2
relationTypes: ["CALLS", "IMPORTS"]
```

**Output:** Risk level (LOW/MEDIUM/HIGH/CRITICAL), summary, affected processes, modules, symbols by depth.

**Depth groups:**
- `d=1`: WILL BREAK (direct callers/importers)
- `d=2`: LIKELY AFFECTED (indirect)
- `d=3`: MAY NEED TESTING (transitive)

---

## 4. `cypher` — Raw Graph Query

Execute Cypher queries directly against the code knowledge graph.

**Input:**
- `query`: Cypher query string

**Schema:**
- Nodes: File, Folder, Function, Class, Interface, Method, CodeElement, Community, Process, Route, Tool
- Edges: CONTAINS, DEFINES, CALLS, IMPORTS, EXTENDS, IMPLEMENTS, HAS_METHOD, HAS_PROPERTY, ACCESSES, METHOD_OVERRIDES, METHOD_IMPLEMENTS, MEMBER_OF, STEP_IN_PROCESS, HANDLES_ROUTE, FETCHES, HANDLES_TOOL, ENTRY_POINT_OF

**Example:**
```
MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b:Function {name: "validateUser"})
RETURN a.name, a.filePath
```

**Output:** Query results as structured data.

---

## 5. `detect_changes` — Pre-commit Impact Analysis

Maps git diff hunks to indexed symbols and traces affected execution flows.

**Input:**
- `scope`: `"unstaged"`, `"staged"`, `"all"`, or `"compare"`
- `base_ref`: branch/commit for compare (e.g., "main")

**Example:**
```
scope: "unstaged"
```

**Output:** Changed symbols, affected processes, risk summary.

---

## 6. `route_map` — API Route Discovery

Shows which components/hooks fetch which API endpoints, and which handler files serve them.

**Input:**
- `route`: filter by route path (e.g., "/api/grants"), omit for all

**Example:**
```
route: "/api/orders"
```

**Output:** Route nodes with handlers, middleware, consumers.

---

## 7. `api_impact` — API Pre-change Impact

Shows what consumers depend on an API route before modifying it.

**Input:**
- `route`: API route path (e.g., "/api/grants")
- `file`: handler file path (alternative to route)

**Example:**
```
route: "/api/orders"
```

**Output:** Consumer count, response fields accessed, middleware, risk level.

---

## 8. `shape_check` — Response Shape Mismatch Detection

Checks if consumers access keys not present in a route's response.

**Input:**
- `route`: specific route, omit for all

**Example:**
```
route: "/api/orders"
```

**Output:** Routes with response keys vs consumer access keys, MISMATCH status.

---

## 9. `tool_map` — MCP/RPC Tool Discovery

Lists tools, handlers, and descriptions.

**Input:**
- `tool`: filter by tool name, omit for all

**Example:**
```
tool: "send_message"
```

**Output:** Tool nodes with handler files and descriptions.

---

## 10. `rename` — Safe Cross-repo Rename

Multi-file coordinated rename using graph + text search. Preview by default.

**Input:**
- `symbol_name`: current name
- `new_name`: new name
- `file_path`: disambiguate common names
- `symbol_uid`: zero-ambiguity UID from prior query
- `dry_run`: preview edits without modifying files (default: true)
- `repo`: repository name/path

**Example:**
```
symbol_name: "OrderService"
new_name: "OrderApplicationService"
dry_run: true
```

**Output:** Tagged edits (graph = high confidence, text_search = lower confidence).

---

## 11. `list_repos` — Discover Indexed Repos

Lists all indexed repositories with stats.

**Output:** Repo names, paths, indexed date, last commit, stats.

---

## 12-16. Group Commands (Multi-repo)

- `group_list` — list repository groups
- `group_status` — check group sync health
- `group_sync` — rebuild contract registry
- `group_contracts` — inspect cross-repo contracts
- `group_query` — semantic search across group
