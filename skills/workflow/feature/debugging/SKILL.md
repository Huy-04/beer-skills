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

Run a recursive evidence-first debug loop inside the active Beer workflow until
root cause is proven and the safest exit target is clear.

## At a Glance

| | |
|---|---|
| **Use when** | Build, test, runtime, integration, UAT, or worker-blocker failures need root cause analysis |
| **Needs** | Exact symptom or failing command, relevant repo state, the parent phase, and any bead/context links |
| **Produces** | Classification, reproduction evidence, root-cause sentence, explicit debug exit target, verified fix or repair handoff, debug note when reusable |
| **Next** | Returns to the parent workflow through `beer:test-driven-development`, `beer:executing`, `beer:planning`, `beer:validating`, `beer:reviewing`, `beer:compounding`, or user handoff |

## 30-Second Version

1. **Enter**: Record the parent phase and the reason the debug loop was opened.
2. **Observe**: Classify the failure as build, test, runtime, integration, UAT, blocker, or unknown behavior.
3. **Check known patterns**: Search `history/learnings/critical-patterns.md` before deep investigation.
4. **Reproduce**: Run the exact failing command or define why reproduction is unavailable.
5. **Narrow**: Read only implicated files, inspect recent changes/context, and eliminate false leads.
6. **Prove**: Write one root-cause sentence before choosing any repair path.
7. **Exit**: Return to the safest parent-flow target: `beer:test-driven-development`, `beer:executing`, `beer:planning`, `beer:validating`, `beer:reviewing`, `beer:compounding`, or user handoff.
8. **Learn**: Record reusable failure patterns with `scripts/write-debug-note.mjs`.

## Debug Loop

### Enter

Before debugging, identify:

- `debug_entry_phase`: `exploring`, `planning`, `executing`, `reviewing`, or another active Beer parent phase
- `debug_reason`: `build-failure`, `test-failure`, `runtime-failure`, `integration-failure`, `uat-failure`, `worker-blocker`, or `unknown-behavior`

`debugging` is a nested loop. It does not replace the parent workflow.

### Observe

- Classify the issue before editing anything.
- Capture the exact command, error text, environment clue, and reproduction status.
- Prefer `rg` for source search and platform-native command equivalents for shell examples.
- Treat intermittent failures as flaky until proven deterministic.

### Reproduce

- Run the original failing command whenever possible.
- If reproduction is blocked, state why before narrowing scope.
- Keep the original failing command as the verification anchor.

### Narrow

- Read the files named by the stack trace, compiler output, or failing assertion first.
- Check recent diffs, bead scope, `CONTEXT.md`, and related bd (beads) only when those inputs exist.
- Use `graph-explore` when structural call flow or blast radius matters and GitNexus is available.
- Expand outward only when the evidence points outward.

### Prove

- Stop before fixing if the root cause cannot be written in this form:

```text
Root cause: <file>:<line or component> - <what is wrong and why it causes the symptom>
```

- `debugging` is not complete when the symptom is only "probably understood".
- Broad repair planning starts only after the root cause sentence is stable.

### Exit

Choose the smallest honest exit target:

- `beer:executing` when the fix stays inside the current approved slice
- `beer:test-driven-development` when a behavior fix needs RED/GREEN evidence
- `beer:planning` when the repair is broader than a local patch
- `beer:validating` when the plan still exists but the execution target or review unit no longer fits
- `beer:reviewing` when review opened the loop and now has enough evidence to continue
- `beer:compounding` only for a standalone reusable debug-learning closeout
- user handoff when missing services, decisions, permissions, or environment prevent safe progress

`debugging` does not own global route lock, gate approval, or idle reset.

### Verify and Report

- Re-run the original failing command. Passing a different command is not enough.
- Run the smallest broader regression scope that gives real confidence.
- If an integration or runtime symptom still appears after the code fix is restored, run a clean rebuild before assuming the fix failed. Stale build output can preserve old activation or configuration behavior.
- Report classification, reproduction, root cause, fix, verification, and remaining risk.
- If a reusable pattern was found, write a debug note for `beer:compounding`.

## Script

Use the Node note writer instead of shell heredocs when capturing reusable debug patterns:

```bash
node skills/workflow/feature/debugging/scripts/write-debug-note.mjs \
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
- Never plan a broad repair inside debugging; preserve the root-cause sentence and route through `beer:planning` with `work_intent = repair`.
- Never spin on worker blockers; report once with evidence and stop for coordination.
- Never mutate global Beer gates or finish the parent workflow from inside the debug loop.
- Never leave the debug loop without an explicit exit target.

## Key References

- [Workflow detail](references/workflow.md) - Full triage -> reproduce -> diagnose -> fix -> learn flow
- [Quick reference](references/quick-ref.md) - Failure types, command patterns, and stop rules
- [Communication templates](references/communication.md) - RCA, blocker, and fix report formats
- [Pressure scenarios](references/pressure-scenarios.md) - Edge cases for recursive debug behavior
