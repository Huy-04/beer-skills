---
skill: codebase-knowledge
purpose: Commands, patterns to detect, file templates, search queries
version: "1.0"
---

# codebase-knowledge - Quick Reference

---

## Authority Rules

- Only run on explicit user request or compounding-approved refresh.
- Normal feature planning/validation may read existing KB entries but must not auto-generate a new KB.
- Current repository source wins over `.beer/knowledge-base/`.
- Store `.beer/knowledge-base/` inside the current project/repo, not globally.
- Default commit policy is `local-cache-by-default`; do not commit generated knowledge-base files unless the user/team explicitly wants shared repo knowledge.
- Missing `.beer/knowledge-base/` means you may create a baseline cache during an approved run; it does not auto-trigger a scan by itself.
- If cache entries conflict with source, trust source for immediate analysis, mark entries stale, and ask whether to update knowledge/docs or change code.
- If Git commit lookup is blocked/unavailable, use `generated_from_commit: unknown-*` and record the reason in metadata notes.
- Prefer `rg`/GitNexus evidence before adding a high-confidence finding.
- Analysis lanes run sequentially by default; use subagents only if the user explicitly requested parallel agent work.
- JSON outputs should be valid UTF-8 and parse cleanly in Node.
- This skill is a cache builder for stable project knowledge, not a default tool for one-off architecture questions.

---

## Commands

### Scan Project

```text
# Full scan (all areas)
Invoke `beer:codebase-knowledge` skill

# Quick scan (patterns + structure only)
Invoke `beer:codebase-knowledge` with notes="Skip business rules, focus on patterns"

# Update existing (incremental)
Invoke `beer:codebase-knowledge` with notes="Check git diff, update changed areas"
```

### Bootstrap Files

```text
node skills/support/codebase-knowledge/scripts/init-knowledge-base.mjs \
  --output-root .beer/knowledge-base \
  --source-path <repo-or-subpath> \
  --generated-from-commit unknown-git-unavailable \
  --mode manual \
  --invocation-reason user-request
```

### GitNexus Queries (if available)

```yaml
query:
  query: "Find repository pattern implementations"
  repo: "<repo-name>"
```

```yaml
query:
  query: "Find factory or builder patterns"
  repo: "<repo-name>"
```

```yaml
query:
  query: "Find application entry points"
  repo: "<repo-name>"
```

```yaml
query:
  query: "Find data flow patterns"
  repo: "<repo-name>"
```

```yaml
query:
  query: "Find cross-module dependencies"
  repo: "<repo-name>"
```

### Source Search

```powershell
# Cross-platform default
rg -n "Repository|Factory|Strategy|Service" src
rg -n "auth|Auth|password|token|jwt|session" src
rg -n "validate|Validation|schema|zod|joi|pydantic" src
rg --files src

# Windows directory fallback
Get-ChildItem -Recurse -Directory src
```

---

## Patterns to Detect

### Code Patterns

| Pattern | Search Terms | Confidence Signals |
|---------|--------------|-------------------|
| Repository | `Repository`, `findBy`, `save`, `delete` | 5+ classes with CRUD methods |
| Service | `Service`, `*Service.ts` | Business logic layer files |
| Factory | `Factory`, `create`, `build` | Factory classes or methods |
| Observer/Events | `emit`, `on`, `addListener`, `EventEmitter` | Event-driven code |
| Strategy | `Strategy`, `interface` + behavior | Interchangeable algorithms |
| Singleton | `getInstance`, `static instance` | One instance pattern |
| Decorator | `@decorator`, `wrap` | Metadata/behavior wrapping |
| Middleware | `middleware`, `use`, `next` | Request pipeline |

### Architecture Patterns

| Pattern | Indicators |
|---------|-----------|
| MVC | `models/`, `views/`, `controllers/` folders |
| Layered | `presentation/`, `business/`, `data/` layers |
| Clean Architecture | `entities/`, `usecases/`, `interfaces/` |
| Microservices | Multiple service folders, API gateways |
| Event-Driven | Event bus, message queues, handlers |

### Conventions

| Aspect | Check |
|--------|-------|
| File Naming | `*.component.ts`, `*.service.ts`, `*.test.ts` (adapt for your language) |
| Class Naming | `PascalCase` for classes, `camelCase` for functions |
| Import Style | Absolute `src/` vs relative `../` |
| Error Handling | `try/catch`, `Result<T>`, `throw`, `except/raise` |
| Async | `async/await`, callbacks, `.then()`, goroutines |

---

## File Templates

### Pattern Documentation

```markdown
---
area: code-patterns
pattern: [Name]
detected_at: [ISO timestamp]
confidence: high|medium|low
file_count: [N]
---

# [Pattern Name]

## Summary
One-line description.

## Locations
- `src/...`
- `src/...`

## Common Structure
```typescript
// Example code
```

## Variations
- Variation 1: ...
- Variation 2: ...

## Confidence: [LEVEL]
[Reasoning]
```

### Business Rule Documentation

```markdown
---
area: business-rules
type: validation|constraint|invariant
source: [file path]
detected_at: [timestamp]
confidence: high|medium|low
---

# [Rule Name]

## Rule
"[Rule in plain English]"

## Code Evidence
```typescript
// Code showing rule
```

## Enforcement
- [ ] Validation layer
- [ ] Database constraint
- [ ] Business logic

## Confidence: [LEVEL]
```

### Critical Section Documentation

```markdown
---
area: critical-sections
category: auth|payment|security|data-integrity
files: [list]
risk_level: high|critical
detected_at: [timestamp]
---

# [Section Name]

## Risk
Why is this critical?

## Files
- `src/...` - [role]
- `src/...` - [role]

## Patterns
- Pattern 1
- Pattern 2

## Recommendations
- [ ] Review required before changes
- [ ] Spike recommended
- [ ] Extra testing required
```

---

## Search Index Examples

### By Tag

```json
{
  "search_index": {
    "auth": [
      "critical-sections/auth-flows.md",
      "architecture/data-flow.md"
    ],
    "validation": [
      "business-rules/validation-rules.md",
      "code-patterns/service-layer.md"
    ],
    "database": [
      "code-patterns/repository-pattern.md",
      "critical-sections/database-operations.md"
    ]
  }
}
```

### By Confidence

```json
{
  "high_confidence": [
    "code-patterns/repository-pattern.md",
    "conventions/naming.md"
  ],
  "medium_confidence": [
    "business-rules/domain-constraints.md"
  ]
}
```

---

## Quick Checklist

### Before Scan

- [ ] Check if existing knowledge base exists
- [ ] Confirm invocation reason: user request or compounding-approved refresh
- [ ] If exists: Check staleness (`git log --since last_scan`)
- [ ] Decide: Full rescan vs incremental update
- [ ] GitNexus available? (optional)

### Subfolder Scan Checklist

- [ ] Record exact subfolder in metadata `source_path`
- [ ] Set metadata `scan_scope = partial`
- [ ] Mark scope as partial in notes if not scanning the whole repo
- [ ] Avoid repo-wide architecture claims from one subfolder
- [ ] Lower confidence when evidence is only local to the subfolder
- [ ] Do not overwrite a full-repo knowledge base without explicit user direction

### During Scan

- [ ] All 7 analysis lanes completed?
- [ ] Lanes completed without errors?
- [ ] Conflicts flagged for review?

### After Scan

- [ ] All markdown files written?
- [ ] `index.json` created?
- [ ] `00-metadata.json` updated with current git commit?
- [ ] Staleness marker cleared?
- [ ] README.md readable?

### Staleness Check Command

```bash
node -e "
const fs=require('fs'), {execSync}=require('child_process');
const curr=execSync('git rev-parse HEAD',{encoding:'utf8'}).trim();
let last='none';
try { const m=require('./.beer/knowledge-base/00-metadata.json'); last=m.generated_from_commit||m.git_commit||'none'; } catch {}
if(last.startsWith('unknown-')){ console.log('NON-AUTHORITATIVE: git commit unavailable ('+last+')'); process.exit(0); }
if(curr!==last){ console.log('STALE: last='+last+' current='+curr); process.exit(1); }
else { console.log('FRESH: '+curr); }
"
```

---

## Integration Queries

### context-intake

```powershell
Test-Path .beer/knowledge-base/index.json

# Load patterns for context
Get-Content .beer/knowledge-base/code-patterns/*.md
Get-Content .beer/knowledge-base/conventions/*.md
```

### planning

```powershell
# Use for discovery phase
Get-Content .beer/knowledge-base/architecture/*.md
Get-Content .beer/knowledge-base/folder-structure/*.md
```

### validating

```powershell
# Check critical sections
Get-Content .beer/knowledge-base/critical-sections/*.md
```

---

## Red Flags

| Flag | Action |
|------|--------|
| Mixed conventions | Flag for user review |
| Cache contradicts source | Trust source, mark cache stale, ask user: update knowledge/docs or change code |
| Git commit unavailable | Use `unknown-*`, record reason, skip authoritative freshness claims |
| No patterns detected | Low confidence, may need manual review |
| Critical file missing | Note in gaps.md |
| GitNexus unavailable | Use local source-search fallback |
| Lane fails | Retry once, then escalate |
