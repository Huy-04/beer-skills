---
name: debugging
description: >
  This skill should be used when the user asks to debug, fix a build failure,
  fix a failing test, root-cause an error, diagnose a runtime crash, unblock a
  stuck worker, investigate an integration failure, or perform systematic
  debugging before changing code.
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.1.0"
  ecosystem: beer
  tags:
    - beer/workflow
    - debugging
  dependencies:
    - id: beads-cli
      kind: command
      command: bd
      missing_effect: degraded
      reason: Debugging can inspect bead context and create fix beads when available.
    - id: bd
      kind: mcp_server
      server_names: [bd]
      config_sources: [repo_codex_config, global_codex_config]
      missing_effect: degraded
      reason: Swarm blocker coordination can use bd (beads) when available.
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

# Debugging

Find and fix the root cause of a failure through evidence-first triage, reproduction, diagnosis, verification, and reusable learning capture.

## At a Glance

| | |
|---|---|
| **Use when** | Build, test, runtime, integration, UAT, or worker-blocker failures need root cause analysis |
| **Needs** | Exact symptom or failing command, relevant repo state, and any bead/context links |
| **Produces** | Classification, reproduction evidence, root-cause sentence, verified fix or `debug-escalation` handoff, debug note when reusable |
| **Next** | `beer:test-driven-development`, `beer:executing`, `beer:planning --route debug-escalation`, `beer:reviewing`, `beer:compounding`, or user handoff |

## 30-Second Version

1. **Preflight**: If `.beer/onboarding.json` is missing or stale, invoke `beer:using-beer` first.
2. **Triage**: Classify the failure as build, test, runtime, integration, UAT, or blocker.
3. **Check known patterns**: Search `history/learnings/critical-patterns.md` before deep investigation.
4. **Reproduce**: Run the exact failing command or define why reproduction is unavailable.
5. **Diagnose**: Read only implicated files, inspect recent changes/context, and write one root-cause sentence.
6. **Fix path**: Use `beer:test-driven-development` when behavior should be regression-tested; use `beer:planning --route debug-escalation` when the repair is too broad for a direct patch; otherwise make the smallest safe fix.
7. **Verify**: Re-run the original failing command plus the nearest meaningful regression scope.
8. **Learn**: Record reusable failure patterns with `scripts/write-debug-note.mjs`.

## Core Workflow

### Phase 1: Triage and Reproduce

- Classify the issue before editing anything.
- Capture the exact command, error text, environment clue, and reproduction status.
- Prefer `rg` for source search and platform-native command equivalents for shell examples.
- Treat intermittent failures as flaky until proven deterministic.

### Phase 2: Diagnose Root Cause

- Read the files named by the stack trace, compiler output, or failing assertion first.
- Check recent diffs, bead scope, `CONTEXT.md`, and related bd (beads) only when those inputs exist.
- Use `graph-explore` when structural call flow or blast radius matters and GitNexus is available.
- Stop before fixing if the root cause cannot be written in this form:

```text
Root cause: <file>:<line or component> - <what is wrong and why it causes the symptom>
```

### Phase 3: Fix Safely

- Small, obvious fixes can be implemented directly after root cause is proven.
- Behavior bugs should go through `beer:test-driven-development` so RED proves the regression before GREEN fixes it.
- Cross-cutting fixes should route to `beer:planning` with `planning_route = debug-escalation` instead of being hidden inside debugging.
- Decision violations against `CONTEXT.md` must be reported before silently changing behavior.

### Phase 4: Verify and Report

- Re-run the original failing command. Passing a different command is not enough.
- Run the smallest broader regression scope that gives real confidence.
- If an integration or runtime symptom still appears after the code fix is restored, run a clean rebuild before assuming the fix failed. Stale build output can preserve old activation or configuration behavior.
- Report classification, reproduction, root cause, fix, verification, and remaining risk.
- If a reusable pattern was found, write a debug note for `beer:compounding`.

## Script

Use the Node note writer instead of shell heredocs when capturing reusable debug patterns:

```bash
node skills/workflow/debug/debugging/scripts/write-debug-note.mjs \
  --classification "Build failure in api" \
  --root-cause "src/api.ts:42 - null config was passed into createClient" \
  --trigger "npm run build after config refactor" \
  --fix "Guard config before createClient" \
  --signal "TS2345 or null config near createClient"
```

## Hard Rules

- Never edit before reproducing unless the failure is already a documented known pattern.
- Never report success without re-running the original failing command or explaining why it cannot be run.
- Never fix a symptom when the root cause sentence is still vague.
- Never call a behavior fix complete without TDD evidence or an explicit, narrow waiver.
- Never silently override locked `CONTEXT.md` decisions to make a test pass.
- Never plan a broad repair inside debugging; preserve the root-cause sentence and route through `beer:planning --route debug-escalation`.
- Never spin on worker blockers; report once with evidence and stop for coordination.

## Key References

- [Workflow detail](references/workflow.md) - Full triage -> reproduce -> diagnose -> fix -> learn flow
- [Quick reference](references/quick-ref.md) - Failure types, command patterns, and stop rules
- [Communication templates](references/communication.md) - RCA, blocker, and fix report formats
