---
skill: debugging
purpose: Detailed workflow for systematic root-cause analysis
version: "1.1"
---

# debugging - Workflow Details

## Overview

**Role:** Root-cause analysis and blocker resolution  
**Job:** Triage, reproduce, diagnose, fix, verify, and capture reusable learning  
**Output:** Verified fix or escalation plus a debug note when the pattern is reusable  
**TDD integration:** After root cause is known, route behavior-changing fixes through `beer:test-driven-development`

## Core Sequence

Run in order unless a known pattern fully explains the failure.

```text
1. Triage - classify the issue
2. Known-pattern check - search critical learnings
3. Reproduce - prove the failure
4. Diagnose - identify the root cause
5. Fix or escalate - choose the safest repair path
6. Verify - rerun original command plus nearby scope
7. Learn - capture reusable patterns
```

## Step 1: Triage

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

## Step 2: Check Known Patterns

Search before deep debugging:

```bash
rg -i "<error symbol|component|symptom>" history/learnings/critical-patterns.md
```

If the pattern matches exactly, use the documented resolution but still verify with the original failing command. If the documented resolution is stale, record that in the debug note.

## Step 3: Reproduce

Run the exact command that failed whenever possible. Capture enough output to preserve the first meaningful error, not the entire log unless the user asks for it.

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

## Step 4: Diagnose

Use the smallest evidence path that can prove cause.

### 4a. Read Implicated Files

Start with the file/line from the error output. Use `rg` for symbols:

```bash
rg -n "<symbol|error text|route|test name>" .
```

Read only the implicated files first. Expand scope only when evidence points outward.

### 4b. Inspect Recent Changes

Use non-destructive git commands:

```bash
git status --short
git log --oneline -20
git diff -- <file>
git blame <file> -L <start>,<end>
```

Do not revert user changes unless explicitly instructed.

### 4c. Check Beer Context

When present, inspect:

- `bd show <bead-id>` for intended scope
- `history/<feature>/CONTEXT.md` for locked decisions
- `history/learnings/critical-patterns.md` for prior patterns
- bd (beads) for related swarm blockers
- `graph-explore` for call flow or blast-radius context when available

Decision violations are not normal bugs. Report them before changing behavior unless the conservative fix clearly honors the locked decision.

### 4d. State Root Cause

Do not proceed to fix until this is specific:

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

## Step 5: Fix or Escalate

### Small Fix

Use when the fix is obvious, local, and low risk.

- make the smallest edit
- preserve unrelated user changes
- verify immediately
- report evidence

### Behavior Bug

Use `beer:test-driven-development` after root cause is known when the fix changes observable behavior or should prevent regression.

Minimum evidence:

- RED command and failure excerpt
- GREEN command and pass result
- nearby regression scope

### Substantial or Cross-Cutting Fix

Route to debug-escalation planning when the repair is larger than a local patch,
changes architecture, or cuts across worker boundaries.

```bash
node .beer/scripts/commands/beer-planning-gate.mjs --route debug-escalation --json
```

Before the handoff, update `.beer/state.json` with:

- `planning_route = debug-escalation`
- `phase = planning`
- `approved_gates.phase_plan = false`
- `next_handoff = beer:planning`

If `bd` is available and a live epic exists, create or request a fix bead linked
to the original work. If `bd` is unavailable, report the proposed fix scope and
missing bead tooling without blocking the debug-escalation route.

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

When the failure is request-time activation, configuration binding, or startup wiring:

- inspect service registration, configuration keys, and environment-specific settings before editing feature code
- verify the failing route or startup command after the fix, not only `dotnet build`
- if the same runtime symptom persists after restoring the correct code, run `dotnet clean` and `dotnet build` before assuming the root cause is elsewhere

This is especially important for DI failures such as:

```text
Unable to resolve service for type '<service>' while attempting to activate '<controller or service>'
```

## Step 6: Verify

Verification must include:

- original failing command
- focused test or build target
- nearest meaningful broader regression scope
- limitations if any command could not run
- a clean rebuild when runtime or integration symptoms may be reading stale build output

For direct fixes completed inside debugging, record execution evidence before
review:

- set `verification_status = passed | failed | limited`
- write or reference an execution evidence note
- set `execution_evidence_path` before handing off to `beer:reviewing`

Do not claim success if:

- the original failure still reproduces
- only an unrelated command passed
- the environment blocked verification and no limitation is reported
- a baseline failure hides the result

## Step 7: Learn

Capture reusable patterns with:

```bash
node skills/workflow/debug/debugging/scripts/write-debug-note.mjs \
  --classification "<classification>" \
  --root-cause "<root cause sentence>" \
  --trigger "<what causes it>" \
  --fix "<what resolves it>" \
  --signal "<how to recognize it next time>"
```

The script appends to `.beer/tmp/debug-notes.md` by default. `beer:compounding` can promote useful notes into `history/learnings/`.

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

- classification is explicit
- reproduction or known-pattern match is documented
- root cause is specific and evidence-backed
- fix path is appropriate for risk and behavior impact
- original failing command is rerun or limitation is stated
- reusable pattern is captured when applicable
- broad repairs are routed through `planning_route = debug-escalation` instead of being implemented ad hoc
