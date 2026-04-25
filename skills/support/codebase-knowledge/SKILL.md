---
name: codebase-knowledge
description: >
  This skill should be used when the user asks to ["/scan codebase"], ["/analyze project"],
  ["build knowledge base"], ["scan project patterns"], ["refresh knowledge base"], or otherwise
  needs a refreshed project-local knowledge cache. It is strongest when used to
  consolidate stable knowledge after work has been completed or a reusable
  pattern has clearly emerged.
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  tags:
    - beer/support
    - knowledge
  inputs: "Repo root + optional GitNexus readiness"
  outputs: "`.beer/knowledge-base/` folder with indexed patterns, plus metadata and index.json"
  upstream: "using-beer (user-initiated or scheduled)"
  downstream: "context-intake, planning, validating (read-only consumers)"
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
user-invocable: true
disable-model-invocation: false
---

# codebase-knowledge

Create or refresh project-local `.beer/knowledge-base/` as a workflow-backed, source-linked cache of stable codebase knowledge. The current repository source is always authoritative; this knowledge base is a durable accelerator built from work that has already been understood, implemented, or reviewed.

## At a Glance

| | |
|---|---|
| **Use when** | The user wants the project knowledge cache created/refreshed, or end-of-cycle work produced reusable patterns worth consolidating |
| **Do not use when** | A one-off repo question can be answered from current source, GitNexus, or locked context without generating cache artifacts |
| **Produces** | Project-local `.beer/knowledge-base/` with markdown summaries, `index.json`, and `00-metadata.json` |
| **Consumers** | Planning, validating, reviewing, debugging, and onboarding read it as optional context |

## 30-Second Version

1. Confirm the cache should be created or refreshed now.
2. Check existing `.beer/knowledge-base/` metadata, commit, and staleness.
3. Choose full scan, partial scan, incremental update, or manual degraded mode.
4. Run only the analysis lanes needed for the approved scan scope.
5. Synthesize stable findings with confidence levels, source references, contradictions, and gaps.
6. Write/update markdown files, `index.json`, `00-metadata.json`, and return a cache refresh summary.

## Scope and Authority

- Treat `.beer/knowledge-base/` as a cache, not a source of truth.
- Store it inside the current project/repo, not in a global user-level folder.
- Default commit policy is local-cache-by-default: do not commit it unless the user/team explicitly wants shared repo knowledge.
- A missing knowledge base permits baseline creation; it does not, by itself, force a scan unless the current invocation actually wants cache generation.
- If a knowledge-base entry conflicts with current source code, trust source code for immediate analysis, mark the entry stale, and ask the user whether to update knowledge/docs or change code to match the documented pattern.
- Build or refresh a source-linked knowledge cache when the project lacks one, when the user explicitly asks for one, or when completed work has created reusable knowledge worth consolidating.
- Routine feature delivery should read existing cache/source/GitNexus instead of triggering a new scan just because it needs context.
- Use GitNexus when available for graph evidence, but fall back to local source scanning.
- Analysis lanes are conceptual units; use available local evidence thoroughly, and use parallel agents only when the user explicitly asks for parallel agent work.
- This skill is a knowledge compiler, not a general-purpose repo Q&A helper. If the task is a single decision, flow, or blast-radius question, prefer direct source/GitNexus work over generating cache files.
- The cache is most valuable when it is written after stable work has already clarified the real patterns, conventions, and critical flows.

## Capability First

- When invoked legitimately, scan deeply enough to produce reusable knowledge, not a shallow inventory.
- Use GitNexus, local source, tests, docs, and package metadata together when available.
- Prefer source-linked claims with confidence and gaps so workflow skills can use the cache without treating it as authority.
- Capture reusable architecture, convention, and critical-flow knowledge that would otherwise be rediscovered repeatedly.
- Compile what the project has actually taught the workflow, rather than trying to answer every possible codebase question.

## Ownership Boundary

- `codebase-knowledge` owns `.beer/knowledge-base/` cache generation and refresh.
- Workflow skills own immediate task decisions and must prefer current source/GitNexus/locked context over stale cache entries.
- `compounding` owns deciding when completed work created reusable knowledge worth refreshing and asking the user whether that refresh should happen now.
- When this skill is invoked from compounding's knowledge-base refresh handoff, treat that approval as already satisfied and do not ask a second refresh question.
- `codebase-knowledge` does not own route decisions, implementation planning, or ad hoc repo Q&A outside the cache-refresh task.

## Analysis Lanes

| Lane | Purpose | Output |
|---|---|---|
| Code patterns | Detect recurring implementation patterns and variations | `code-patterns/*.md` |
| Folder structure | Map module boundaries and directory conventions | `folder-structure/*.md` |
| Business rules | Extract validation, constraints, and domain invariants from code | `business-rules/*.md` |
| Architecture | Document entry points, layers, data flow, and component relationships | `architecture/*.md` |
| Dependencies | Identify import style, cross-module coupling, and external packages | `dependencies/*.md` |
| Conventions | Capture naming, organization, error handling, and async style | `conventions/*.md` |
| Critical sections | Flag auth, payment, security, data integrity, and external integration flows | `critical-sections/*.md` |

Run only the lanes that match the approved scan scope. A partial refresh does not need to regenerate every lane.

## Output Contract

Every generated entry should include:

- Source file paths or graph evidence.
- Confidence level: high, medium, or low.
- Applicability: when downstream skills should use the pattern.
- Gaps or contradictions instead of invented certainty.
- Staleness metadata through `00-metadata.json`, including `source_authority`, `generated_from_commit`, and `commit_policy`.
- If commit lookup is blocked or unavailable, use an explicit fallback such as `unknown-safe-directory-blocked` or `unknown-git-unavailable` and record the reason in metadata notes.
- JSON outputs must remain machine-readable; write valid UTF-8 JSON without relying on a BOM-sensitive parser path.
- Discoverability through `index.json`.

## Update Triggers

Update the knowledge base after:

- Architecture or layer boundaries change.
- Naming, file organization, testing, or error-handling conventions change.
- Business-rule or validation frameworks change.
- Critical auth/payment/security/data-integrity flows change.
- Compounding identifies a reusable pattern shift worth preserving.

Only `user request` and `compounding-approved refresh` are valid automatic
invocation reasons. In the `compounding-approved refresh` case, approval comes
from compounding's knowledge-base refresh ask, not from a second question
inside this skill. Planning, validating, reviewing, and debugging may read the
cache, but they must not trigger a scan just because they need context.

On first use, create a baseline cache only when the current request actually wants a knowledge-base scan or refresh.

Usually skip updates for:

- New endpoint/component/service that follows existing conventions.
- Bug fix that does not alter a stable pattern.
- Small localized refactor with no convention or architecture change.

## Completion Note

```text
Knowledge base updated at `.beer/knowledge-base/`.
[N] patterns documented, [M] rules extracted, [K] critical sections flagged.
Current source remains authoritative; stale/conflicting entries are marked.
Invocation reason: <user-request | compounding-approved-refresh>.
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
