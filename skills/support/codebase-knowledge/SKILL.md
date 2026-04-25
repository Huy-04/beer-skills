---
name: codebase-knowledge
description: >
  This skill should be used when the user asks to ["/scan codebase"], ["/analyze project"],
  ["build knowledge base"], ["scan project patterns"], ["refresh knowledge base"], or otherwise
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
  outputs: "`.beer/knowledge-base/` evidence-backed implementation map with generated docs, metadata, and index.json"
  upstream: "using-beer (user-initiated or compounding-approved refresh)"
  downstream: "context-intake, planning, validating, reviewing (read-only consumers)"
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

Create or refresh project-local `.beer/knowledge-base/` as a pattern-first,
source-linked implementation map. The repository source remains authoritative.
This skill exists to preserve stable knowledge that helps future work follow the
real shape of the repo instead of rediscovering it from scratch.

## At a Glance

| | |
|---|---|
| **Use when** | The user explicitly wants the knowledge base created/refreshed, or compounding already won approval because finished work revealed reusable patterns |
| **Do not use when** | A one-off repo question can be answered from current source, GitNexus, or locked context without generating cache artifacts |
| **Produces** | Project-local `.beer/knowledge-base/` with evidence-backed docs, `index.json`, and `00-metadata.json` |
| **Consumers** | Planning, validating, reviewing, debugging, and onboarding read it as optional context only |

## 30-Second Version

1. Confirm this is a legitimate knowledge-base refresh request.
2. Run one real repo scan pass to lock repo shape, entrypoints, and high-signal evidence.
3. Fan out child agents by lane to inspect architecture/conventions, backend, frontend, boundaries, and critical flows in parallel.
4. Add optional lanes only when the codebase actually shows those patterns.
5. Synthesize a small set of canonical docs with one writer and evidence-backed confidence.
6. Update `README.md`, `index.json`, `00-metadata.json`, generated docs, and report the refresh outcome.

## Scope and Authority

- Treat `.beer/knowledge-base/` as a cache, not a source of truth.
- Store it inside the current project/repo, not in a global folder.
- Default commit policy is `local-cache-by-default`: do not commit it unless the user/team explicitly wants shared repo knowledge.
- A missing knowledge base permits a full scan-and-write pass; do not stop at a bootstrap skeleton.
- If a knowledge-base entry conflicts with current source code, trust source code for immediate analysis, mark the entry stale, and ask whether the user wants to update knowledge/docs or change code to match the documented pattern.
- Use GitNexus first for structure, flow, route, and boundary evidence when available. Use local source scanning to confirm snippets, fill gaps, and degrade cleanly when graph support is unavailable.
- This skill owns a one-pass real scan. Discovery lanes fan out through child agents by default and collapse back into one writer for synthesis.
- This skill is a knowledge compiler, not a generic repo Q&A helper.

## Output Philosophy

The output should help future work answer:

- What dominant patterns shape this repo?
- How does backend work usually flow?
- How does frontend work usually flow?
- Where are the risky cross-boundary seams?
- Which files should a developer read first before changing a critical area?

Do not optimize for producing many notes. Optimize for a small set of durable,
implementation-oriented docs that help someone code correctly.

## Stable Skeleton, Adaptive Content

Always write the baseline artifacts:

- `README.md`
- `00-metadata.json`
- `index.json`
- `architecture/system-overview.md` when evidence exists
- `conventions/implementation-rules.md` when evidence exists

Generate additional docs only when the repository actually supports them.
Examples:

- `backend/request-lifecycle.md`
- `backend/module-template.md`
- `backend/cqrs-and-handler-shape.md`
- `backend/data-access-and-unit-of-work.md`
- `backend/domain-events-and-outbox.md`
- `frontend/app-structure-and-api-access.md`
- `frontend/session-and-refresh-patterns.md`
- `boundaries/frontend-backend-proxy.md`
- `boundaries/contracts-and-error-shape.md`
- `critical-flows/*.md`

Do not force event, queue, workflow-engine, or plugin docs into a repo that
does not have those patterns.

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
| Architecture + conventions | Consolidate repo shape, major folders, entrypoints, and repeated implementation rules | `README.md`, `architecture/system-overview.md`, `conventions/implementation-rules.md` |
| Backend | Detect request lifecycle, module template, data access, domain rules, async patterns | `backend/*.md` |
| Frontend | Detect app structure, API access, state/session patterns, UI conventions | `frontend/*.md` |
| Boundaries | Detect FE/BE seams, command/state seams, contract coupling, auth/session boundary, error shapes | `boundaries/*.md` |
| Critical flows | Capture high-blast-radius command, routing, auth, or orchestration flows | `critical-flows/*.md` |

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
- critical flows
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

Not every repo will support every section equally, but the writer should prefer
this schema over ad hoc summaries.

## Metadata and Index Expectations

- `00-metadata.json` must record `generated_from_commit`, `source_authority`, `commit_policy`, and whether discovery was `manual` or `gitnexus-assisted`.
- `00-metadata.json` should record the one-pass topology using `pre_scan`, `execution`, `synthesis`, and the discovery lanes used.
- `00-metadata.json` should also record `evidence_priority = gitnexus-first | local-fallback`.
- `index.json` should support both keyword lookup and task-oriented lookup.
- Prefer task buckets such as:
  - `add backend endpoint`
  - `add command`
  - `change auth`
  - `change session`
  - `change proxy`
  - `touch middleware`
  - `touch outbox`
  - `add frontend api call`

## Update Triggers

Update the knowledge base after:

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
Knowledge base updated at `.beer/knowledge-base/`.
[N] docs generated, [M] dominant patterns captured, [K] critical flows documented.
Current source remains authoritative; stale/conflicting entries are marked.
Strategy: pattern-first. Execution: one-pass real scan -> child-agent lane fan-out -> single-writer synthesis.
Invocation reason: <user-request | compounding-approved-refresh | explicit-partial-scan>.
```

If invoked inside another Beer workflow, return this note plus the updated cache path. If invoked directly by the user, this note is the final result summary.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication templates](references/communication.md)
- [Index schema](references/index-schema.md)
- [Pressure scenarios](references/pressure-scenarios.md)
- [Init script](scripts/init-knowledge-base.mjs)
- [Example output](examples/example-output.md)
- [Cache conflict example](examples/cache-conflict-resolution.md)
