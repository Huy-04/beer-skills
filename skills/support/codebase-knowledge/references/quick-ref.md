---
skill: codebase-knowledge
purpose: Commands, lane prompts, and output guardrails
version: "1.1"
---

# codebase-knowledge - Quick Reference

## Authority Rules

- Only run on explicit user request or compounding-approved refresh.
- If invoked from compounding's refresh handoff, do not ask for a second approval prompt here.
- Normal feature planning/validation may read existing KB entries but must not auto-generate a new KB.
- Current repository source wins over `.beer/knowledge-base/`.
- Store `.beer/knowledge-base/` inside the current project/repo, not globally.
- Default commit policy is `local-cache-by-default`.
- Missing `.beer/knowledge-base/` means you may create a baseline cache during an approved run; it does not auto-trigger a scan by itself.
- If cache entries conflict with source, trust source for immediate analysis, mark entries stale, and ask whether to update knowledge/docs or change code.
- If Git commit lookup is blocked/unavailable, use `generated_from_commit: unknown-*` and record the reason in metadata notes.
- Prefer evidence-backed docs over exhaustive inventories.
- Discovery may fan out, but synthesis must have one writer.

## Bootstrap Command

```text
node skills/support/codebase-knowledge/scripts/init-knowledge-base.mjs \
  --output-root .beer/knowledge-base \
  --source-path <repo-or-subpath> \
  --generated-from-commit unknown-git-unavailable \
  --mode manual \
  --invocation-reason user-request
```

## Baseline Directory Shape

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

## Discovery Lanes

### Repo Scout

Questions:

- What kind of repo is this?
- Where are the entrypoints?
- Is there backend, frontend, both, or something else?

### Backend

Questions:

- What is the standard request lifecycle?
- What file/template repeats when adding a backend feature?
- Where do data access, domain rules, and side effects split?

### Frontend

Questions:

- How does frontend code talk to APIs?
- Where is session/auth continuity handled?
- What stable composable/state conventions exist?

### Boundaries

Questions:

- What sits between FE and BE?
- Which boundaries are easy to break?
- What contracts or middleware orders must be preserved?

### Optional

Add only when the repo supports them:

- domain events and outbox
- messaging/consumers
- jobs/schedulers
- plugins/extensions
- workflow engines
- critical flows with high blast radius

## Canonical Docs To Prefer

- `architecture/system-overview.md`
- `backend/request-lifecycle.md`
- `backend/module-template.md`
- `frontend/app-structure-and-api-access.md`
- `boundaries/frontend-backend-proxy.md`
- `conventions/implementation-rules.md`
- `critical-flows/*.md`

Do not force all of these into every repo. Generate only the docs supported by evidence.

## README Checklist

- [ ] Has dominant patterns
- [ ] Has start-here-by-task guidance
- [ ] Has high-risk boundaries
- [ ] Has critical flows
- [ ] States source-of-truth policy
- [ ] Points to the generated docs that matter

## Index Checklist

- [ ] `strategy = pattern-first`
- [ ] `dominant_patterns` present
- [ ] `task_index` present
- [ ] `entries[]` point to real files
- [ ] `search_index` is keyword-oriented
- [ ] `task_index` is implementation-task-oriented

## Example Task Buckets

```json
{
  "task_index": {
    "add backend endpoint": [
      "backend/request-lifecycle.md",
      "backend/module-template.md",
      "conventions/implementation-rules.md"
    ],
    "add frontend api call": [
      "frontend/app-structure-and-api-access.md",
      "boundaries/frontend-backend-proxy.md"
    ],
    "change auth": [
      "critical-flows/auth-session.md",
      "boundaries/frontend-backend-proxy.md"
    ]
  }
}
```

## Staleness Check Command

```bash
node -e "
const fs=require('fs'), {execSync}=require('child_process');
const curr=execSync('git rev-parse HEAD',{encoding:'utf8'}).trim();
let last='none';
try { const m=require('./.beer/knowledge-base/00-metadata.json'); last=m.generated_from_commit||'none'; } catch {}
if(last.startsWith('unknown-')){ console.log('NON-AUTHORITATIVE: git commit unavailable ('+last+')'); process.exit(0); }
if(curr!==last){ console.log('STALE: last='+last+' current='+curr); process.exit(1); }
else { console.log('FRESH: '+curr); }
"
```

## Integration Reads

```powershell
Test-Path .beer/knowledge-base/index.json
Get-Content .beer/knowledge-base/README.md
Get-Content .beer/knowledge-base/backend/*.md
Get-Content .beer/knowledge-base/frontend/*.md
Get-Content .beer/knowledge-base/boundaries/*.md
Get-Content .beer/knowledge-base/critical-flows/*.md
```

## Red Flags

| Flag | Action |
|---|---|
| README is navigation-only | rewrite as an implementation entrypoint |
| Repo archetype unclear | do more scouting before writing docs |
| Boundary docs missing | add them before polishing lower-value notes |
| Too many tiny files | consolidate |
| Docs describe patterns the repo does not actually use | delete or demote them |
