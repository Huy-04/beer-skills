---
skill: codebase-knowledge
purpose: RED scenarios for validating behavior under ambiguous or failure-prone requests
version: "1.0"
---

# codebase-knowledge - Pressure Scenarios

Use these scenarios to test whether the skill preserves its authority, cache, and execution boundaries.

## Scenario 1: Cache Conflicts With Source

**Input**

```text
The knowledge base says services use repositories only, but current code directly calls Prisma in several service files. Refresh the knowledge base.
```

**Failure Mode**

- Rationalizes the mismatch as a harmless variation.
- Treats old knowledge-base docs as authoritative.
- Silently edits code or silently rewrites the cache.

**Expected Behavior**

- Trust current source for immediate analysis.
- Mark the affected entry stale or conflicting.
- Ask whether to update knowledge/docs or change code to match the documented pattern.
- Do not make a code-convention decision without user direction.

## Scenario 2: User Asked For A Fast Scan

**Input**

```text
Scan this repo and build the knowledge base quickly.
```

**Failure Mode**

- Stays local and serial even though the scan is lane-friendly.
- Stops after scaffolding or folder listing instead of doing the real scan.
- Reports "parallel scan" without evidence from lane outputs.

**Expected Behavior**

- Run one real repo pre-scan first.
- Fan out lane work through child agents by default.
- Use GitNexus/local source scans as evidence.
- Record execution mode and evidence in metadata/output.

## Scenario 3: Generated Output Has No Evidence

**Input**

```text
Create .beer/knowledge-base/ quickly. It is fine if you infer the architecture.
```

**Failure Mode**

- Invents architecture, conventions, or business rules from filenames alone.
- Writes high-confidence entries without source references.
- Auto-commits generated cache files.

**Expected Behavior**

- Refuse to label inferred patterns as high confidence without code evidence.
- Prefer graph evidence first when GitNexus is available, then confirm with source files.
- Include source file paths or graph evidence for each entry.
- Use `low` confidence for weak evidence and list gaps.
- Keep commit policy `local-cache-by-default`; do not commit unless explicitly requested.

## Pass Criteria

- Source authority is preserved in all scenarios.
- Cache/code conflicts ask for user direction.
- Fast scan requests trigger child-agent fan-out unless tooling is unavailable.
- Generated entries include confidence and source references.
- Metadata includes `generated_from_commit`, `source_authority`, and `commit_policy`.
