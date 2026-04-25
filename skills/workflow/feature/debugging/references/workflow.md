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
3. Known-pattern check - search critical learnings
4. Reproduce - prove the failure
5. Narrow - isolate the fault area
6. Prove - identify the root cause
7. Exit - choose the safest parent-flow return
8. Verify - rerun original command plus nearby scope
9. Learn - capture reusable patterns
```

## Step 1: Enter

Record the nested-loop context before deep investigation:

- `debug_entry_phase`
- `debug_reason`

Typical parent phases:

- `exploring`
- `planning`
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
- `history/learnings/critical-patterns.md` for prior patterns
- bd (beads) for related swarm blockers
- `graph-explore` for call flow or blast-radius context when available

Decision violations are not normal bugs. Report them before changing behavior
unless the conservative fix clearly honors the locked decision.

## Step 6: Prove

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

## Step 7: Exit

Choose the safest parent-flow return.

### Exit to `beer:executing`

Use when the fix remains inside the current approved slice.

### Exit to `beer:test-driven-development`

Use when behavior must be proven RED -> GREEN before the fix is trusted.

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
with a repair judgment.

### Exit to `beer:compounding`

Use only when no more implementation work is needed and the session produced a
standalone reusable debug lesson.

### Exit to User Handoff

Use when missing dependencies, environment, permissions, or product decisions
block safe progress.

### Small Fix

Use when the fix is obvious, local, and low risk.

- make the smallest edit
- preserve unrelated user changes
- verify immediately
- report evidence

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

## Step 8: Verify

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

Do not claim success if:

- the original failure still reproduces
- only an unrelated command passed
- the environment blocked verification and no limitation is reported
- a baseline failure hides the result

## Step 9: Learn

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
- original failing command is rerun or limitation is stated
- reusable pattern is captured when applicable
- broad repairs are routed through planned repair work instead of being implemented ad hoc
