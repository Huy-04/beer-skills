---
skill: codebase-knowledge
purpose: Knowledge base reporting standards
version: "1.0"
---

# codebase-knowledge - Communication Standards

---

## Authority Standard

When communicating findings, state that current source code remains authoritative. If a saved knowledge-base entry disagrees with current source, report the conflict, trust the source for immediate analysis, mark the cached entry stale, and ask whether the user wants to update knowledge/docs or change code.

Also state that `.beer/knowledge-base/` is project-local and local-cache-by-default. Do not imply it should be committed unless the user/team explicitly wants shared repo knowledge.

If Git commit lookup is unavailable, say so explicitly. Use an `unknown-*` marker in metadata and avoid presenting freshness as authoritative.

Always state why the scan was allowed: explicit user request,
compounding-approved refresh, or explicit partial scan. If the request came from
normal feature work, report that a new scan is not part of the standard path and
offer to read existing cache/source instead.

---

## Knowledge Capture

### Pattern Report

```markdown
## Pattern Discovered: [Name]

### Category
- Code / Architecture / Process

### Summary
[1-2 sentences]

### Location
- File: [path]
- Lines: [X-Y]

### Applicability
[When to use]

### Example
```code
[snippet]
```
```

---

## Knowledge Base Structure

```text
.beer/knowledge-base/
  code-patterns/
  folder-structure/
  business-rules/
  architecture/
```

---

## Confidence Levels

| Level | Criteria | Action |
|-------|----------|--------|
| **High** | Seen 5+ times, consistent across codebase | Store immediately |
| **Medium** | Seen 3-4 times, mostly consistent | Store with note |
| **Low** | Seen 1-2 times, might be edge case | Observe more |

---

## Example Entry

```markdown
## Pattern: Repository Pattern

Category: code-patterns
Confidence: High (seen 8 times)

### Description
Data access abstracted in repository classes.
All DB queries via Repository, not direct ORM.

### Location
- src/repos/UserRepo.ts
- src/repos/OrderRepo.ts

### Applicability
Use for all database access.

### Example
```typescript
class UserRepo {
  async findById(id: string) {
    return db.users.findOne({ id });
  }
}
```
```

---

## Handoff to Planning

```markdown
Knowledge base updated.
- N new patterns
- M updated patterns
- Source authority: current code wins over cached entries
- Commit policy: local-cache-by-default
- Commit lookup: use `unknown-*` plus a reason if Git metadata is unavailable
- Invocation reason: user-request | compounding-approved-refresh | explicit-partial-scan
- Scan scope: full | partial

Available for planning phase.
```

---

## Red Flags

| Issue | Action |
|-------|--------|
| Pattern conflict | Document both, note conflict |
| Cache contradicts source | Trust source, mark stale, ask update knowledge/docs vs change code |
| Git metadata unavailable | Use `unknown-*`, record reason, avoid strong freshness claims |
| Low confidence | Wait for more examples |
| Outdated | Update or archive |
