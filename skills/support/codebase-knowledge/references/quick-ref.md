---
skill: codebase-knowledge
purpose: Commands, lane prompts, and output guardrails
version: "1.1"
---

# codebase-knowledge - Quick Reference

## Authority Rules

- Only run on explicit user request or compounding-approved refresh.
- If invoked from compounding's refresh handoff, do not ask for a second approval prompt here.
- Record `invoking_owner` and `return_to` before scanning.
- Normal feature planning/validation may read existing Docs entries but must not auto-generate new Docs output.
- Current repository source wins over generated `Docs/` entries.
- Store `Docs/` inside the current project/repo beside `.beer/`, not globally and not inside `.beer/`.
- Default commit policy is `local-cache-by-default`.
- Missing `Docs/` means you may run a full scan-and-write pass during an approved run; do not stop at scaffolding only.
- If generated Docs entries conflict with source, trust source for immediate analysis, mark entries stale, and ask whether to update knowledge/docs or change code.
- If Git commit lookup is blocked/unavailable, use `generated_from_commit: unknown-*` and record the reason in metadata notes.
- Prefer evidence-backed docs over exhaustive inventories.
- Default execution is one-pass real scan -> child-agent lane fan-out -> single-writer synthesis.
- Evidence priority is `gitnexus-first` when graph evidence is available, otherwise `local-fallback`.
- If child agents are unavailable, degrade locally but keep the same output contract.
- This skill refreshes generated Docs artifacts only; it does not own Beer gates or idle reset.
- Separate backend, frontend, and boundary patterns. Do not treat a single full-stack end-to-end story as the default verification unit.

## Scan Command

```text
node skills/support/codebase-knowledge/scripts/init-knowledge-base.mjs \
  --source-path <repo-or-subpath> \
  --gitnexus-evidence <tmp-or-project-json> \
  --generated-from-commit unknown-git-unavailable \
  --mode gitnexus-assisted \
  --invocation-reason user-request
```

Omit `--gitnexus-evidence` and use `--mode manual` when GitNexus is unavailable.
`--output-root Docs` is optional; relative output roots resolve under the target repo root beside `.beer/`.

## Baseline Directory Shape

```text
Docs/
  README.md
  00-metadata.json
  index.json
```

Everything below the baseline is generated only when evidence supports it.
When source code or command entrypoints exist, `Flows/repo-flow.md` is required.
When no code exists, skip flow docs instead of inventing one.
`patterns/` is optional, not a skeleton folder.

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

- `Flows/repo-flow.md` (required when code exists)
- `Architecture/system-overview.md`
- layered backend: `Backend/patterns/request-lifecycle.md`
- vertical-slice backend: `Backend/feature-slices/request-lifecycle.md`
- route/service backend: `Backend/request-lifecycle.md`
- simple frontend: `Frontend/app-structure-and-api-access.md`
- feature-structured frontend: `Frontend/patterns/app-structure-and-api-access.md`
- `Boundaries/frontend-backend-proxy.md`
- `Conventions/implementation-rules.md`
- `CriticalFlows/*.md`

Do not force all of these into every repo. Generate only the docs supported by evidence.

## README Checklist

- [ ] Has dominant patterns
- [ ] Has start-here-by-task guidance
- [ ] Has high-risk boundaries
- [ ] Has critical flows
- [ ] States source-of-truth policy
- [ ] Points to the generated docs that matter
- [ ] Uses evidence-backed file references instead of placeholders

## Index Checklist

- [ ] `strategy = pattern-first`
- [ ] `discovery.pre_scan` is present
- [ ] `discovery.execution` is present
- [ ] `discovery.synthesis = single-writer`
- [ ] `discovery.evidence_priority = gitnexus-first | local-fallback`
- [ ] `flows.repo-flow` present when source code exists
- [ ] `dominant_patterns` present
- [ ] `task_index` present
- [ ] `entries[]` point to real files
- [ ] `search_index` is keyword-oriented
- [ ] `task_index` is implementation-task-oriented
- [ ] backend patterns are separated from frontend patterns
- [ ] boundaries are modeled separately from BE and FE pattern groups
- [ ] task entries can point review toward pattern/boundary verification targets

## Doc Checklist

- [ ] `Key Files` points to real repo files
- [ ] `Source Evidence` names the strongest supporting files
- [ ] `Flows/repo-flow.md` includes `## Flow Diagram` with a Mermaid `flowchart` when flow exists
- [ ] `Representative Snippet` is copied from current source, not invented

## Example Task Buckets

```json
{
  "task_index": {
    "add backend endpoint": [
      "Backend/request-lifecycle.md",
      "Conventions/implementation-rules.md"
    ],
    "change backend handler flow": [
      "Backend/request-lifecycle.md"
    ],
    "add frontend api call": [
      "Frontend/app-structure-and-api-access.md",
      "Boundaries/frontend-backend-proxy.md"
    ],
    "change auth": [
      "CriticalFlows/auth-session.md",
      "Boundaries/frontend-backend-proxy.md"
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
try { const m=require('./Docs/00-metadata.json'); last=m.generated_from_commit||'none'; } catch {}
if(last.startsWith('unknown-')){ console.log('NON-AUTHORITATIVE: git commit unavailable ('+last+')'); process.exit(0); }
if(curr!==last){ console.log('STALE: last='+last+' current='+curr); process.exit(1); }
else { console.log('FRESH: '+curr); }
"
```

## Integration Reads

```powershell
Test-Path Docs/index.json
Get-Content Docs/README.md
if (Test-Path Docs/Flows/repo-flow.md) { Get-Content Docs/Flows/repo-flow.md }
Get-ChildItem Docs/Backend -Recurse -File
Get-ChildItem Docs/Frontend -Recurse -File
Get-Content Docs/Boundaries/*.md
Get-Content Docs/CriticalFlows/*.md
```

## Red Flags

| Flag | Action |
|---|---|
| README is navigation-only | rewrite as an implementation entrypoint |
| Run stops after scaffolding | continue into the real repo scan |
| Repo archetype unclear | do more scouting before writing docs |
| Boundary docs missing | add them before polishing lower-value notes |
| Too many tiny files | consolidate |
| Docs describe patterns the repo does not actually use | delete or demote them |
