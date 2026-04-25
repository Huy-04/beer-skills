---
skill: codebase-knowledge
purpose: Knowledge base reporting standards
version: "1.1"
---

# codebase-knowledge - Communication Standards

## Authority Standard

When communicating findings, state that current source code remains
authoritative. If a saved knowledge-base entry disagrees with current source,
report the conflict, trust the source for immediate analysis, mark the cached
entry stale, and ask whether the user wants to update knowledge/docs or change
code.

Also state that `.beer/knowledge-base/` is project-local and
`local-cache-by-default`. Do not imply it should be committed unless the
user/team explicitly wants shared repo knowledge.

If Git commit lookup is unavailable, say so explicitly. Use an `unknown-*`
marker in metadata and avoid presenting freshness as authoritative.

Always state why the scan was allowed: explicit user request,
compounding-approved refresh, or explicit partial scan.

## Reporting Shape

Report the refresh in terms of implementation value, not just file counts.

Preferred summary points:

- return owner: who should receive the refresh result next
- strategy used: `pattern-first`
- execution model: `one-pass real scan -> child-agent lane fan-out -> single-writer synthesis`
- evidence priority: `gitnexus-first` when graph evidence exists, otherwise `local-fallback`
- repo shape observed: backend/frontend/boundaries or other detected archetype
- backend patterns captured
- frontend patterns captured
- boundaries captured separately
- dominant patterns captured
- high-risk boundaries captured
- critical flows documented
- stale/conflicting entries, if any
- representative snippets come from current source, not imagined templates

## README Standard

`README.md` should read like an entrypoint.

It should help the next person answer:

- what patterns dominate this repo?
- where should I start for backend work?
- where should I start for frontend work?
- which boundaries are risky?
- which critical flows deserve extra care?

Do not describe README as a simple file list.

## Knowledge Base Structure

```text
.beer/knowledge-base/
  README.md
  00-metadata.json
  index.json
  architecture/
  backend/
  frontend/
  boundaries/
  critical-flows/
  conventions/
```

Optional docs should only appear when the repo supports them.

## Confidence Levels

| Level | Criteria | Action |
|---|---|---|
| **High** | repeated across the codebase and important for implementation decisions | promote into canonical docs |
| **Medium** | repeated but with notable variation or narrower scope | document with explicit caveats |
| **Low** | weak evidence or likely edge case | keep out of canonical docs unless the user asked for it |

## Handoff Shape

```markdown
Knowledge base updated at `.beer/knowledge-base/`.
- Return to: beer:<caller> | user
- Strategy: pattern-first
- Execution: one-pass real scan -> child-agent lane fan-out -> single-writer synthesis
- Repo shape: [backend/frontend/boundaries | backend-only | other]
- Backend patterns captured: [N]
- Frontend patterns captured: [N]
- Boundaries captured: [N]
- Dominant patterns captured: [N]
- Critical flows documented: [K]
- Source authority: current code wins over cached entries
- Commit policy: local-cache-by-default
- Invocation reason: user-request | compounding-approved-refresh | explicit-partial-scan
- Scan scope: full | partial
```

## Red Flags

| Issue | Action |
|---|---|
| Pattern conflict | document the contradiction and lower confidence |
| Cache contradicts source | trust source, mark stale, ask update knowledge/docs vs change code |
| Git metadata unavailable | use `unknown-*`, record reason, avoid strong freshness claims |
| README is just a file list | rewrite it as an implementation entrypoint |
| Too many shallow docs | consolidate into fewer stronger docs |
| Missing boundary guidance | add or strengthen boundary-focused docs before adding more notes |
