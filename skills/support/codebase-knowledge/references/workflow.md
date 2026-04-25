---
skill: codebase-knowledge
purpose: Detailed workflow for pattern-first knowledge base creation
version: "1.1"
---

# codebase-knowledge - Workflow Details

## Authority Rule

`.beer/knowledge-base/` is a project-local cache of source-linked observations.
If it conflicts with the current repository source, source wins for immediate
analysis. Mark the affected entry stale, then ask the user whether to update the
knowledge base/docs or change code to match the documented pattern.

Default commit policy is `local-cache-by-default`: do not commit generated
knowledge-base files unless the user or team explicitly wants shared repo
knowledge.

If Git commit lookup is unavailable or blocked, degrade cleanly: set
`generated_from_commit` to an explicit fallback such as
`unknown-safe-directory-blocked` or `unknown-git-unavailable`, record the reason
in metadata notes, and avoid pretending freshness checks are authoritative.

## Invocation Gate

Run `codebase-knowledge` only when at least one is true:

- the user explicitly asks to scan, analyze, build, or refresh the knowledge base
- `beer:compounding` identified a reusable pattern/convention/architecture shift and the user approved the refresh
- the user explicitly requests a subfolder or partial scan

Do not run this skill during normal feature work just because planning or
validation needs more context. Those skills should read source, GitNexus, locked
context, or existing knowledge-base entries instead of generating a new cache.

Think of this skill as a knowledge compiler: it consolidates stable project
knowledge into `.beer/knowledge-base/` after the workflow has already learned
something worth preserving.

## Phase 0: One-Pass Scan Setup

### Step 0.0: Check Optional Tooling

```bash
node scripts/commands/beer-preflight.mjs --json
```

If preflight is unavailable or degraded:

- continue with local source scanning
- use GitNexus only when available
- mark metadata with `"mode": "manual"` when graph/tooling support is unavailable

### Step 0.1: Check Existing Knowledge Base

```powershell
if (Test-Path .beer/knowledge-base) { Get-ChildItem .beer/knowledge-base } else { "No existing knowledge base" }
if (Test-Path .beer/knowledge-base/00-metadata.json) { Get-Content .beer/knowledge-base/00-metadata.json } else { "No metadata" }
```

If the knowledge base exists:

- read version, timestamp, generation strategy, and scan scope
- decide whether this run is full refresh or partial update
- avoid overwriting a full-repo map with subfolder-only conclusions unless the user explicitly wants that scope change

If it is missing:

- create `.beer/knowledge-base/` as the output root
- record `source_authority = current repository source`
- record `commit_policy = local-cache-by-default`
- record `strategy = pattern-first`

Then continue into the real scan immediately. Do not stop after scaffolding.

If GitNexus is available, gather graph evidence first through `graph-explore` or direct GitNexus tools, then hand that evidence to the writer.

Run the one-pass helper with:

```bash
node skills/support/codebase-knowledge/scripts/init-knowledge-base.mjs \
  --output-root .beer/knowledge-base \
  --source-path <repo-or-subpath> \
  --gitnexus-evidence <tmp-or-project-json> \
  --generated-from-commit unknown-git-unavailable \
  --mode gitnexus-assisted \
  --invocation-reason user-request
```

If GitNexus is unavailable, omit `--gitnexus-evidence` and run the same helper in local fallback mode.

### Step 0.2: Run The Real Repo Pre-Scan

Before lane fan-out, answer:

- does the repo have backend, frontend, shared packages, infra, jobs, workers, or plugins?
- how many apps exist?
- where are the entrypoints?
- which boundaries matter enough to deserve their own docs?

This pre-scan is mandatory and belongs to the same run. It is not a separate bootstrap layer. Its job is to collect the repo shape and evidence needed to assign lane work cleanly. Prefer GitNexus for this pass when available; local scan fills file-level gaps and snippet extraction.

## Phase 1: Parallel Discovery Lanes

After the pre-scan, fan out lane work through child agents by default. Each lane
gets the pre-scan evidence plus its own focused file set. Prefer GitNexus-backed
queries first inside each lane, then read local files to confirm the promoted
pattern and capture representative snippets. Synthesis must still
happen in one writer.

If child-agent tooling is unavailable:

- continue with a local single-agent pass
- keep the same output contract
- record the degraded execution mode in metadata or notes

### Lane A: Repo Scout

Purpose:

- classify repo archetype
- identify major top-level surfaces
- identify candidate dominant patterns

Typical outputs:

- README dominant patterns
- architecture/system-overview.md
- initial task routing buckets

Typical searches:

```bash
rg --files -g "package.json" -g "*.sln" -g "Program.cs" -g "app.*" -g "main.*"
rg --files .
```

This lane is fed by the pre-scan and usually collapses into the final writer's
architecture/conventions synthesis.

### Lane B: Backend Discovery

Purpose:

- document request lifecycle
- document module template
- document data access and write/read boundaries
- detect domain rules, events, outbox, jobs, or workflow machinery if present

Focus questions:

- what is the usual path from request to persistence?
- what files appear every time a backend feature is added?
- where are domain rules enforced?
- where do async side effects leave the transaction boundary?

Typical outputs:

- `backend/request-lifecycle.md`
- `backend/module-template.md`
- `backend/data-access-and-unit-of-work.md`
- `backend/domain-rules-and-lifecycle.md`
- optional async docs only if supported by evidence

### Lane C: Frontend Discovery

Purpose:

- document app structure
- document API access pattern
- document state/session/auth patterns
- document UI or composable conventions when they are stable enough to reuse

Focus questions:

- how do pages/features reach APIs?
- where is session continuity handled?
- how are shared frontend concerns organized?

Typical outputs:

- `frontend/app-structure-and-api-access.md`
- `frontend/session-and-refresh-patterns.md`
- optional `frontend/ui-and-state-conventions.md`

### Lane D: Boundary Discovery

Purpose:

- identify seams between backend and frontend
- identify DTO/contract coupling
- identify proxy, auth, middleware, caching, and error-shape boundaries

Focus questions:

- what happens at the frontend/backend seam?
- what makes this seam fragile?
- what must a developer preserve when changing it?

Typical outputs:

- `boundaries/frontend-backend-proxy.md`
- `boundaries/contracts-and-error-shape.md`
- boundary-heavy critical flows

### Optional Lanes

Only create docs for patterns supported by real evidence:

- `domain-events-and-outbox`
- `messaging-and-consumers`
- `scheduler-and-jobs`
- `plugin-extension-model`
- `workflow-engine`
- `critical-flows/*`

Do not create placeholder docs for absent patterns.

## Phase 2: Pattern Selection

Each lane should return evidence, not polished final prose.

For every candidate pattern or doc:

- summary
- why it matters
- key files
- confidence
- whether it deserves a canonical doc or only a note

Promote only patterns that are:

- stable
- repeated
- important for implementation decisions
- likely to be rediscovered expensively if left undocumented

## Phase 3: Single-Writer Synthesis

One writer merges all lane findings and produces the final docs.

Writer responsibilities:

- define dominant patterns
- decide which docs should exist
- normalize language and schema across docs
- prefer implementation guidance over inventory
- remove weak, speculative, or duplicative findings

The writer should favor a small number of strong docs over a broad but shallow
folder dump.

## Phase 4: Write Files

Update:

- `.beer/knowledge-base/README.md`
- `.beer/knowledge-base/index.json`
- `.beer/knowledge-base/00-metadata.json`
- only the markdown docs justified by the evidence

Rules:

- README is an entrypoint, not a directory listing
- docs should be pattern-first and task-useful
- docs should favor `how to follow this here` over generic theory
- record gaps or contradictions instead of inventing certainty

Suggested doc schema:

- What this is
- Why it exists here
- How to follow it
- Common variants in this repo
- Do not do
- Key files
- Source evidence
- Representative snippet
- Risk when changing
- Confidence

## Phase 5: Finalize Metadata and Index

Metadata requirements:

- `generated_from_commit` or explicit `unknown-*`
- `source_authority`
- `commit_policy`
- `strategy = pattern-first`
- `pre_scan`
- `execution = parallel-child-agents | single-agent-degraded`
- `synthesis = single-writer`
- `evidence_priority = gitnexus-first | local-fallback`
- discovery lanes used
- `mode = manual | gitnexus-assisted`
- `scan_scope = full | partial`

Index requirements:

- keyword lookup
- task-oriented lookup
- dominant pattern summary
- critical files
- entries pointing only to files that actually exist

## Phase 6: Report Back

Use the communication shape from `references/communication.md` and include:

- output path
- invocation reason
- scan scope
- mode
- strategy
- execution model
- docs generated
- dominant patterns captured
- critical flows documented
- stale/conflicting entries, if any
- reminder that source remains authoritative

## Guardrails

- Do not generate repo-wide conclusions from one subfolder without marking the scope.
- Do not dump every lane into its own markdown file by default.
- Do not force backend/frontend/boundary docs if the repo shape does not justify them.
- Do not let discovery workers write final docs independently.
- Do not treat a missing knowledge base as a reason to scan unrelated requests.
