---
skill: debugging
purpose: Detailed workflow for recursive root-cause analysis
version: "1.2"
---

# debugging - Workflow Details

## Overview

**Role:** Nested debug loop inside a parent Beer phase  
**Job:** Enter from a parent phase, observe, reproduce, narrow, prove, exit, and capture reusable learning  
**Output:** Explicit root cause plus a safe exit target for the parent workflow  
**TDD integration:** After root cause is known, route behavior-changing fixes through `beer:test-driven-development`

## Core Sequence

Run in order unless a known pattern fully explains the failure.

```text
1. Enter - record the parent phase and reason
2. Observe - classify the issue
3. Known-pattern check - search critical learnings and optional generated Docs hints
4. Reproduce - prove the failure
5. Narrow - isolate the fault area
6. Hypothesize - keep ranked evidence-backed candidates if cause is not yet proven
7. Prove - identify the root cause
8. Exit - choose the safest parent-flow return
9. Verify - rerun original command plus nearby scope
10. Evidence - record review-ready execution evidence when code changed
11. Learn - capture reusable patterns
```

## Step 1: Enter

Record the nested-loop context before deep investigation:

- `debug_entry_phase`
- `debug_reason`

Typical parent phases:

- `exploring`
- `planning`
- `swarming`
- `executing`
- `reviewing`

Typical reasons:

- `build-failure`
- `test-failure`
- `runtime-failure`
- `integration-failure`
- `uat-failure`
- `worker-blocker`
- `unknown-behavior`

`debugging` does not become the new top-level workflow. It temporarily serves
the parent phase until root cause and exit target are clear.

## Step 2: Observe

Classify before investigating.

| Type | Signals | First evidence to capture |
|---|---|---|
| Build failure | Compiler, bundler, type, missing module | command, first error, file/line |
| Test failure | Assertion, snapshot, timeout | test command, failing test name, assertion |
| Runtime error | Crash, exception, stack trace | stack trace, first app-owned frame |
| Integration failure | HTTP error, auth, env, schema mismatch | status/body, env names, contract |
| UAT failure | User flow mismatch | steps, expected vs actual, screenshot/log if available |
| Blocker | Stuck worker, dependency cycle, file conflict | bead id, dependency, owner/conflict |

Write:

```text
[TYPE] in [component]: [symptom]
```

## Step 3: Check Known Patterns

Search before deep debugging:

```bash
rg -i "<error symbol|component|symptom>" history/learnings/critical-patterns.md
```

If the pattern matches exactly, use the documented resolution but still verify
with the original failing command. If the documented resolution is stale,
record that in the debug note.

Generated `Docs/` may help identify repo flows or expected patterns when present,
especially `Docs/Flows/repo-flow.md` and `Docs/index.json`. Treat those entries
as hints only; root-cause proof still comes from reproduction, source, and
current execution evidence. Do not refresh generated Docs inside debugging.

## Step 4: Reproduce

Run the exact command that failed whenever possible. Capture enough output to
preserve the first meaningful error, not the entire log unless the user asks
for it.

```bash
npm run build
npm test -- --runInBand path/to/failing.test.ts
dotnet test path/to/Project.Tests.csproj --filter FullyQualifiedName~TargetTest
```

If the exact command cannot be run:

- state the missing dependency, permission, data, service, or environment
- run the closest safe local substitute
- mark verification as limited

For flaky failures:

- repeat the focused command several times
- record pass/fail count
- investigate shared state, timing, random data, test order, and external services before changing product code

## Step 5: Narrow

Use the smallest evidence path that can isolate cause.

### 5a. Read Implicated Files

Start with the file/line from the error output. Use `rg` for symbols:

```bash
rg -n "<symbol|error text|route|test name>" .
```

Read only the implicated files first. Expand scope only when evidence points
outward.

### 5b. Inspect Recent Changes

Use non-destructive git commands:

```bash
git status --short
git log --oneline -20
git diff -- <file>
git blame <file> -L <start>,<end>
```

Do not revert user changes unless explicitly instructed.

### 5c. Check Beer Context

When present, inspect:

- `bd show <bead-id>` for intended scope
- `history/<feature>/CONTEXT.md` for locked decisions
- generated `Docs/` for optional flow or pattern hints
- `history/learnings/critical-patterns.md` for prior patterns
- bd (beads) for related swarm blockers
- `graph-explore` for call flow or blast-radius context when available

Decision violations are not normal bugs. Report them before changing behavior
unless the conservative fix clearly honors the locked decision.

## Step 6: Hypothesize

When narrowing is incomplete, keep a short ranked hypothesis list instead of
jumping to a vague repair.

Limit the list to at most 3 entries. For each hypothesis, record:

- rank or probability
- supporting evidence already observed
- falsification criteria
- next check that would disprove it fastest

Good:

```text
H1 (highest): auth token is refreshed twice in concurrent requests.
Evidence: two refresh calls in logs; failure only under parallel request flow.
Falsify by: instrumenting token refresh count per request and reproducing with one request.
```

Bad:

```text
Maybe config, maybe cache, maybe race condition.
```

Drop losing hypotheses aggressively as soon as evidence rules them out.

## Step 7: Prove

Once the fault area is isolated, state root cause explicitly.

Do not proceed until this is specific:

```text
Root cause: <file>:<line or component> - <what is wrong and why it causes the symptom>
```

Bad:

```text
Root cause: auth is broken.
```

Good:

```text
Root cause: src/auth/session.ts:88 - refreshToken is consumed twice during concurrent requests, so the second request throws and clears the session.
```

## Step 8: Exit

Choose the safest parent-flow return.

### Exit to `beer:executing`

Use when the fix remains inside the current approved slice and the execution
contract is still valid. If `approved_gates.execution` is false or
`contract_verified` is not true, debugging should preserve the root cause and
route to `beer:planning` or `beer:validating` instead of editing directly.

### Exit to `beer:swarming`

Use when the loop was opened from a worker or coordinator path and the next
safe step is coordination rather than direct self-advancement.

Typical cases:

- a worker blocker is now proven and needs reassignment or dependency resolution
- a worker-local fix is complete, but the swarm still owns the global workflow
- the coordinator needs an evidence-backed debug result before re-dispatching

### Exit to `beer:test-driven-development`

Use when behavior must be proven RED -> GREEN before the fix is trusted.
The TDD result must later be recorded in execution evidence as one of:
`complete`, `waived: <reason>`, or `not-required`.

### Exit to `beer:planning`

Use when the repair is larger than a local patch, changes architecture, or cuts
across worker boundaries.

Before the handoff, update `.beer/state.json` with:

- keep the current route explicit
- `work_intent = repair`
- `phase = planning`
- `approved_gates.phase_plan = false`
- `next_handoff = beer:planning`

### Exit to `beer:validating`

Use when the plan still exists, but the current execution target, review unit,
or slice shape is no longer honest.

### Exit to `beer:reviewing`

Use when review opened the debug loop and now has enough evidence to continue
with a repair judgment, or when a local debug repair changed code and has
review-ready execution evidence.

### Exit to `beer:compounding`

Use only when no more implementation work is needed and the session produced a
standalone reusable debug lesson.

Before this handoff, prepare:

- `compounding_route = debug-learning`
- debug note path or root-cause artifact
- `gitnexus_refresh_status = skipped` when no graph-relevant code changed
- `knowledge_base_refresh_status = not-needed` unless the lesson should become curated generated Docs

### Exit to User Handoff

Use when missing dependencies, environment, permissions, or product decisions
block safe progress.

### Small Fix

Use when the fix is obvious, local, and low risk.

- proceed locally only when the current execution route already authorizes the edit, or when the task is an explicit one-off debug repair outside Beer closeout
- make the smallest edit
- preserve unrelated user changes
- verify immediately
- record review-ready execution evidence before `beer:reviewing` when the fix belongs to Beer closeout

If the fix is local but not authorized by the current Beer state, preserve the
root-cause sentence and exit to `beer:planning`, `beer:validating`, or
`beer:executing` as appropriate.

### Behavior Bug

Use `beer:test-driven-development` after root cause is known when the fix
changes observable behavior or should prevent regression.

Minimum evidence:

- RED command and failure excerpt
- GREEN command and pass result
- nearby regression scope

### Substantial or Cross-Cutting Fix

If `bd` is available and a live epic exists, create or request a fix bead
linked to the original work. If `bd` is unavailable, report the proposed fix
scope and missing bead tooling without blocking the repair route.

### Decision Violation

If code violates `CONTEXT.md`, report:

```text
Decision violation found: <D#>
Observed: <what code does>
Locked decision: <what CONTEXT.md requires>
Proposed safe fix: <approach>
Needed decision: proceed, revise scope, or update context
```

### Integration and DI Failure Note

When the failure is request-time activation, configuration binding, or startup
wiring:

- inspect service registration, configuration keys, and environment-specific settings before editing feature code
- verify the failing route or startup command after the fix, not only `dotnet build`
- if the same runtime symptom persists after restoring the correct code, run `dotnet clean` and `dotnet build` before assuming the root cause is elsewhere

This is especially important for DI failures such as:

```text
Unable to resolve service for type '<service>' while attempting to activate '<controller or service>'
```

## Step 9: Verify

Verification must include:

- original failing command
- focused test or build target
- nearest meaningful broader regression scope
- limitations if any command could not run
- a clean rebuild when runtime or integration symptoms may be reading stale build output

For small-fix work completed inside debugging, record execution evidence before
review:

- set `verification_status = passed | failed | limited`
- write or reference an execution evidence note
- set `execution_evidence_path` before handing off to `beer:reviewing`

## Step 10: Debug Repair Evidence Contract

When debugging changes code and the Beer workflow will continue to review, the
execution evidence must include:

- route artifact used: approved route artifact, coordinator assignment, or debug root-cause note for a direct debug repair
- implementation pattern followed
- source facts re-checked before or during the fix
- files changed
- verification run, including the original failing command
- TDD disposition: `complete`, `waived: <reason>`, or `not-required`
- deviations from the approved artifact, or `none`

If any field is missing, do not hand off to `beer:reviewing`; return to
`beer:executing` or `beer:validating` to make the contract honest.

Do not claim success if:

- the original failure still reproduces
- only an unrelated command passed
- the environment blocked verification and no limitation is reported
- a baseline failure hides the result

## Step 11: Learn

Capture reusable patterns with:

```bash
node skills/workflow/feature/debugging/scripts/write-debug-note.mjs \
  --classification "<classification>" \
  --root-cause "<root cause sentence>" \
  --trigger "<what causes it>" \
  --fix "<what resolves it>" \
  --signal "<how to recognize it next time>"
```

The script appends to `.beer/tmp/debug-notes.md` by default. `beer:compounding`
can promote useful notes into `history/learnings/`.

When the issue was production-facing, intermittent, or distributed, also record
the smallest useful recurrence detector:

- error fingerprint or log pattern
- metric, alert, or trace signal
- query/filter that would detect the issue early next time

Do not add vague observability advice such as "monitor this better". Capture
the concrete signal or query that would have helped.

## Blocker-Specific Protocol

When the issue is a stuck worker, do not debug product code first.

1. Inspect bead dependencies with `bd` if available.
2. Check file reservations or bd (beads) if available.
3. Determine whether this is waiting, conflict, cycle, missing decision, or impossible constraint.
4. Send one evidence-backed report.
5. Stop instead of retrying indefinitely.

Report format:

```text
Blocker: <summary>
Affected bead/worker: <id/name>
Evidence: <dependency, reservation, mail, or command output>
Needed action: <wait, unblock dependency, choose option A/B, or revise scope>
```

## Done Criteria

Debugging is complete when:

- the parent phase and debug reason are explicit
- classification is explicit
- reproduction or known-pattern match is documented
- root cause is specific and evidence-backed
- exit target is appropriate for risk and behavior impact
- worker/coordinator debug loops return through `beer:swarming` when coordination still owns the next step
- original failing command is rerun or limitation is stated
- reusable pattern is captured when applicable
- broad repairs are routed through planned repair work instead of being implemented ad hoc
