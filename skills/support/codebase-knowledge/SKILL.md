---
name: codebase-knowledge
description: >
  This skill should be used when the user asks to ["/scan codebase"], ["/analyze project"],
  ["build project Docs"], ["scan project patterns"], ["refresh generated Docs"], or otherwise
  needs a refreshed project-local implementation map. It is strongest when used to
  consolidate stable repository patterns, boundaries, and critical flows after work
  has already clarified how the codebase really operates.
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.1.0"
  ecosystem: beer
  tags:
    - beer/support
    - knowledge
    - patterns
  inputs: "Repo root + optional GitNexus evidence handoff + optional approved refresh handoff"
  outputs: "`Docs/` evidence-backed implementation map with generated docs, metadata, and index.json"
  upstream: "using-beer (user-initiated or compounding-approved refresh)"
  downstream: "context-intake, exploring, planning, validating, reviewing, debugging (read-only consumers)"
  dependencies:
    - id: gitnexus
      kind: mcp_server
      server_names: [gitnexus]
      missing_effect: degraded
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Agent
user-invocable: true
disable-model-invocation: false
---

# codebase-knowledge

Create or refresh project-local `Docs/` as a pattern-first, source-linked
implementation map. `Docs/` sits beside `.beer/` in the target repo. The
repository source remains authoritative.
This skill exists to preserve stable knowledge that helps future work follow the
real shape of the repo instead of rediscovering it from scratch.

## At a Glance

| | |
|---|---|
| **Use when** | The user explicitly wants generated project Docs created/refreshed, or compounding already won approval because finished work revealed reusable patterns |
| **Do not use when** | A one-off repo question can be answered from current source, GitNexus, or locked context without generating Docs artifacts |
| **Produces** | Project-local `Docs/` with evidence-backed docs, `index.json`, `00-metadata.json`, verification targets, and a return-to-caller refresh summary |
| **Consumers** | Planning, validating, reviewing, debugging, and onboarding read it as optional context only |

## 30-Second Version

1. Confirm this is a legitimate knowledge-docs refresh request.
2. Run one real repo scan pass to lock repo shape, entrypoints, and high-signal evidence.
3. Fan out child agents by lane to inspect architecture/conventions, backend, frontend, boundaries, and critical flows in parallel.
4. Add optional lanes only when the codebase actually shows those patterns.
5. Synthesize a small set of canonical docs with one writer and evidence-backed confidence.
6. Update `README.md`, `index.json`, `00-metadata.json`, generated docs, and return the refresh outcome to the invoking owner.

## Scope and Authority

- Treat generated `Docs/` entries as derived docs, not a source of truth.
- Store `Docs/` inside the current project/repo beside `.beer/`, not inside `.beer/` and not in a global folder.
- Default commit policy is `local-cache-by-default`: do not commit it unless the user/team explicitly wants shared repo knowledge.
- Missing Docs output permits a full scan-and-write pass; do not stop at a bootstrap skeleton.
- If a generated Docs entry conflicts with current source code, trust source code for immediate analysis, mark the entry stale, and ask whether the user wants to update knowledge/docs or change code to match the documented pattern.
- Use GitNexus first for structure, flow, route, and boundary evidence when available. Use local source scanning to confirm snippets, fill gaps, and degrade cleanly when graph support is unavailable.
- This skill owns a one-pass real scan. Discovery lanes fan out through child agents by default and collapse back into one writer for synthesis.
- This skill is a knowledge compiler, not a generic repo Q&A helper.
- The invoking owner still owns workflow state and approval context. `codebase-knowledge` refreshes generated docs and returns a result; it does not take over Beer closeout or route control.
- If the refresh came from `compounding` approval, do not ask for a second approval prompt inside this skill.

## Output Philosophy

The output should help future work answer:

- What dominant patterns shape backend work here?
- What dominant patterns shape frontend work here?
- Which boundaries connect BE and FE and carry the highest risk?
- Which files should a developer read first before changing a critical area?
- Which GitNexus targets should review use to verify that a task still follows the repo's real pattern?

Do not optimize for producing many notes. Optimize for a small set of durable,
implementation-oriented docs plus a machine-usable index that helps review and
planning verify real BE/FE/boundary patterns quickly.

## Minimal Skeleton, Adaptive Content

Always write the baseline artifacts:

- `README.md`
- `00-metadata.json`
- `index.json`

Generate directories and docs only when the repository evidence supports them.
`Architecture/` and `Conventions/` are common, but even those should be backed
by a real scan. `patterns/` is not a default folder; it is a promotion target
for repositories that actually repeat reusable patterns strongly enough.
`Flows/repo-flow.md` is required when the scan finds source code or command
entrypoints. Do not create a flow doc for repos with no code yet.

Four-layer backend is one detected architecture style, not the generation
baseline. Pick output paths from the repo shape:

- layered backend: `Backend/patterns/request-lifecycle.md`
- vertical-slice backend: `Backend/feature-slices/request-lifecycle.md`
- route/service backend: `Backend/request-lifecycle.md`
- CLI/tooling repo: `CLI/commands-and-state.md` or `CriticalFlows/cli-entrypoints-and-onboarding.md`
- frontend surface: `Frontend/app-structure-and-api-access.md`
- feature-structured frontend: `Frontend/patterns/app-structure-and-api-access.md`
- default repo flow map when code exists: `Flows/repo-flow.md`
- `Boundaries/frontend-backend-proxy.md`
- `CriticalFlows/*.md`

Do not force event, queue, workflow-engine, or plugin docs into a repo that
does not have those patterns. Do not create empty `patterns/` folders.

## Discovery Model

### Required Pre-Scan

Before lane fan-out, run one real repo scan pass to:

- classify repo archetype
- identify entrypoints and high-signal folders
- collect evidence for lane assignment
- decide which optional docs are justified

This pre-scan is part of the same run. It is not a separate bootstrap phase.

### Required Lanes

| Lane | Purpose | Typical outputs |
|---|---|---|
| Flow map | Capture the default source-linked path for tracing code work in the repo | `Flows/repo-flow.md`, `index.json.flows.*` when code exists |
| Architecture + conventions | Consolidate repo shape, major folders, entrypoints, and repeated implementation rules | `README.md`, `Architecture/system-overview.md`, `Conventions/implementation-rules.md` |
| Backend | Detect backend architecture style, request/handler/data-access patterns, and backend verification targets | `Backend/*.md`, `Backend/patterns/*.md`, or `Backend/feature-slices/*.md` depending on evidence |
| Frontend | Detect frontend app shape, page/API/state/session patterns, and frontend verification targets | `Frontend/*.md` or `Frontend/patterns/*.md` depending on evidence |
| Boundaries | Detect FE/BE seams, command/state seams, contract coupling, auth/session boundaries, and boundary verification targets | `Boundaries/*.md`, `index.json.boundaries.*` |
| Critical flows | Capture only high-blast-radius flows that are strong enough to deserve their own docs | `CriticalFlows/*.md` |

### Optional Lanes

Only run or promote additional docs for:

- critical flows
- domain events / outbox / messaging
- schedulers and jobs
- plugin/extension models
- workflow engines
- external integration seams

## Execution Model

- The run is one-pass: pre-scan -> lane child agents -> single-writer synthesis.
- Discovery fans out by lane through child agents by default.
- If child-agent tooling is unavailable, degrade to a local single-agent pass without changing the output contract.
- Final documentation must be synthesized by one writer.
- Discovery workers collect evidence, confidence, and candidate doc proposals.
- The final writer decides which patterns are dominant enough to become docs.

This avoids duplicated, contradictory, or uneven output.

## Canonical README Requirements

`README.md` should be the entrypoint, not a file list. It should contain:

- dominant patterns
- start here by task
- high-risk boundaries
- backend and frontend entry guidance
- critical flows when they are truly high value
- source-of-truth and freshness reminder
- generated docs available for this repo

## Doc Schema

Each generated markdown doc should aim to include:

- `What this is`
- `Why it exists here`
- `How to follow it`
- `Common variants in this repo`
- `Do not do`
- `Key files`
- `Source evidence`
- `Representative snippet`
- `Risk when changing`
- `Confidence`
- `Verification targets`

Not every repo will support every section equally, but the writer should prefer
this schema over ad hoc summaries.

## Metadata and Index Expectations

- `00-metadata.json` must record `generated_from_commit`, `source_authority`, `commit_policy`, and whether discovery was `manual` or `gitnexus-assisted`.
- `00-metadata.json` should record the one-pass topology using `pre_scan`, `execution`, `synthesis`, and the discovery lanes used.
- `00-metadata.json` should also record `evidence_priority = gitnexus-first | local-fallback`.
- `index.json` should support both keyword lookup and task-oriented lookup.
- `index.json` should separate backend, frontend, and boundary patterns instead of pretending one end-to-end document can verify both sides equally well.
- Prefer task buckets such as:
  - `add backend endpoint`
  - `change backend handler flow`
  - `change domain lifecycle`
  - `change infrastructure mapping`
  - `add command`
  - `change auth`
  - `change session`
  - `change proxy`
  - `touch middleware`
  - `touch outbox`
  - `add frontend api call`
  - `change frontend state/session flow`
  - `change frontend page/composable flow`

## Update Triggers

Refresh generated Docs after:

- architecture or boundary changes
- request lifecycle changes
- naming or implementation rules drift
- auth/session boundary changes
- critical flow changes
- compounding identifies a reusable pattern shift worth preserving

Usually skip updates for:

- a new endpoint/component/service that follows existing conventions
- a bug fix that does not alter a stable pattern
- a small localized refactor with no convention or architecture change

## Completion Note

```text
Knowledge docs updated at `Docs/`.
[N] docs generated, [M] dominant patterns captured, [K] critical flows documented.
Current source remains authoritative; stale/conflicting entries are marked.
Strategy: pattern-first. Execution: one-pass real scan -> child-agent lane fan-out -> single-writer synthesis.
Invocation reason: <user-request | compounding-approved-refresh | explicit-partial-scan>.
```

If invoked inside another Beer workflow, return this note plus the updated Docs path. If invoked directly by the user, this note is the final result summary.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication templates](references/communication.md)
- [Index schema](references/index-schema.md)
- [Pressure scenarios](references/pressure-scenarios.md)
- [Init script](scripts/init-knowledge-base.mjs)
- [Example output](examples/example-output.md)
- [Docs conflict example](examples/cache-conflict-resolution.md)
