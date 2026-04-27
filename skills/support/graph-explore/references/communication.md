---
skill: graph-explore
purpose: Reporting findings from graph exploration
version: "1.2"
---

# graph-explore - Communication Standards

---

## Findings Report

### Structure

```markdown
## Graph Exploration Summary

- Return to: beer:<calling skill>
- Source: GitNexus
- Status: ok
- Tooling: query + impact
- Question: <exact caller question>
- Docs relation: <not_used | confirmed | mismatch | stale_possible>
- Query Time: <duration>

### Findings

#### Processes
| Name | Relevance | Notes |
|------|-----------|-------|
| Checkout | 0.94 | Main execution flow |

#### Relevant Symbols
| Symbol | File | Reason |
|--------|------|--------|
| OrderAggregate | BE/.../Order.cs | Core domain entity |
| ReserveInventory | BE/.../ReserveInventory.cs | Cross-module dependency |

#### Key Patterns
- Query-handler pattern in BE/Application/.../Queries/
- Domain event usage around shipment transitions

### Recommendations
1. Start from `OrderAggregate` to confirm state transitions.
2. Use `context` on `ReserveInventory` to inspect direct callers.
3. Use `impact` before changing cross-module contracts.

### Source Checks
- Open `BE/.../Order.cs` before coding and confirm the lifecycle method signature.
- Confirm event payload shape in current source; do not rely on graph or Docs alone.

### Confidence
High because the repo is indexed and `query` and `impact` point to the same area.
```

---

## Writing Guidelines

### Do
- Quantify findings: "12 files in Authorization communities"
- Name the GitNexus tool used: `query`, `context`, `impact`, `cypher`, `route_map`, or `api_impact`
- Rank by relevance when available
- Suggest a concrete next step
- Link to specific files or symbols when available
- State which Beer skill should receive the result next
- Include source checks the caller or worker must verify before code changes
- Mark generated `Docs/` assumptions as confirmed, mismatched, stale_possible, or not_used

### Don't
- Be vague: "auth stuff found"
- Mix `query` and `cypher` results without saying which produced which
- Hide degraded status
- List symbols or communities without context

---

## Confidence Levels

| Level | Indicator | Action |
|-------|-----------|--------|
| **High** | Target repo indexed, results agree across tools | Use findings directly |
| **Medium** | Useful but partial results, one weak signal | Verify with local inspection |
| **Low** | Repo not indexed, stale index, or sparse results | Return `status: degraded` |

---

## Handoff to Planning

```markdown
Graph exploration complete.

Return to: beer:planning
Status: ok
Found:
- 3 relevant processes
- 6 symbols close to the requested change
- 2 cross-module dependencies worth checking
Docs relation: not_used

Recommended starting point: `OrderAggregate`
Source checks: confirm lifecycle method signature and event payload in current source.
Confidence: High

Proceed to planning with the graph findings above.
```

---

## Example Output

```markdown
## Exploration: Checkout Flow

### Metadata
- Source: GitNexus
- Status: ok
- Tooling: query + context + impact

### Processes
- Checkout (relevance 0.94)
- ShipmentAllocation (relevance 0.81)

### Symbols
- `OrderAggregate` in `BE/.../Order.cs`
- `ReserveInventory` in `BE/.../ReserveInventory.cs`
- `MarkInTransit` in `BE/.../Order.Lifecycle.cs`

### Dependencies
- `OrderAggregate` is upstream of inventory reservation and shipment allocation.

### Recommendations
Start with `OrderAggregate`, then inspect `ReserveInventory` callers before changing lifecycle rules.

### Confidence
High because indexed process discovery and blast-radius analysis agree.
```

---

## Red Flags

| Issue | Report |
|-------|--------|
| Repo not indexed | "Status: degraded. Target repo is not indexed in GitNexus." |
| Index outdated | "Warning: index may be stale relative to the current workspace." |
| Partial results | "Confidence: Medium. Results are useful but incomplete." |
| Query failed | "Status: degraded. Continue with Grep/Glob/Read." |

---

## Comparison with Local Inspection

| | Graph Output | Local Inspection |
|---|---|---|
| **Structure** | Processes, symbols, relationships | Files, text matches |
| **Depth** | Cross-file dependencies | Surface analysis |
| **Speed** | Fast when indexed | Slower but always available |
| **Use for** | Architecture and blast radius | Verification and fallback |

---

## Template

```markdown
## Graph Exploration: [Topic]

### Metadata
- Return to: [beer:exploring / beer:planning / beer:debugging / ...]
- Source: GitNexus
- Status: [ok/degraded]
- Tooling: [query/context/impact/cypher/...]
- Question: [concrete graph question]
- Docs relation: [not_used/confirmed/mismatch/stale_possible]
- Duration: [time]

### Results
[Processes/communities/symbols/patterns/dependencies]

### Source Checks
[Current source facts the caller must verify before coding]

### Risks
[Blast-radius, stale index, route/API, or boundary risks]

### Confidence
[High/Medium/Low] because [reason]

### Recommendations
1. [Specific action]
2. [Specific action]

### Fallback
If degraded, continue with Grep/Glob/Read in the calling skill.
```
