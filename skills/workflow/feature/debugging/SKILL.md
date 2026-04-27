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
| **Produces** | Classification, reproduction evidence, root-cause sentence, explicit debug exit target, verified fix or repair handoff, execution evidence when code changed, and debug note when reusable |
| **Next** | Returns to the parent workflow through `beer:swarming`, `beer:test-driven-development`, `beer:executing`, `beer:planning`, `beer:validating`, `beer:reviewing`, `beer:compounding`, or user handoff |

## 30-Second Version

1. **Enter**: Record the parent phase and the reason the debug loop was opened.
2. **Observe**: Classify the failure as build, test, runtime, integration, UAT, blocker, or unknown behavior.
3. **Check known patterns**: Search `history/learnings/critical-patterns.md` and read generated `Docs/` only as optional flow/pattern hints before deep investigation.
4. **Reproduce**: Run the exact failing command or define why reproduction is unavailable.
5. **Narrow**: Read only implicated files, inspect recent changes/context, and eliminate false leads.
6. **Hypothesize**: If root cause is not yet proven, keep at most 3 ranked hypotheses with evidence and falsification criteria.
7. **Prove**: Write one root-cause sentence before choosing any repair path.
8. **Exit**: Return to the safest parent-flow target: `beer:swarming`, `beer:test-driven-development`, `beer:executing`, `beer:planning`, `beer:validating`, `beer:reviewing`, `beer:compounding`, or user handoff.
9. **Evidence**: If debugging changed code and will hand off to `beer:reviewing`, record the execution evidence fields review requires.
10. **Learn**: Record reusable failure patterns with `scripts/write-debug-note.mjs`, and add a recurrence signal/query when the issue was production-facing, intermittent, or distributed.

## Debug Loop

### Enter

Before debugging, identify:

- `debug_entry_phase`: `exploring`, `planning`, `swarming`, `executing`, `reviewing`, or another active Beer parent phase
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
- Check recent diffs, bead scope, `CONTEXT.md`, generated `Docs/`, and related bd (beads) only when those inputs exist.
- Use `graph-explore` when structural call flow or blast radius matters and GitNexus is available.
- Expand outward only when the evidence points outward.

### Hypothesize

- If root cause is not yet proven after narrowing, keep at most 3 ranked hypotheses.
- For each hypothesis, record:
  - probability or rank
  - supporting evidence already seen
  - falsification criteria
  - next command, read, or check that would disprove it
- Do not keep generic placeholders such as "maybe config" or "maybe race condition" without evidence.
- Drop losing hypotheses aggressively as evidence improves.

### Prove

- Stop before fixing if the root cause cannot be written in this form:

```text
Root cause: <file>:<line or component> - <what is wrong and why it causes the symptom>
```

- `debugging` is not complete when the symptom is only "probably understood".
- Broad repair planning starts only after the root cause sentence is stable.

### Exit

Choose the smallest honest exit target:

- `beer:swarming` when the loop was opened from worker/coordinator execution and the next safe step is coordination, reassignment, or blocker resolution rather than direct self-advancement
- `beer:executing` when the fix stays inside the current approved slice and the execution contract is still valid
- `beer:test-driven-development` when a behavior fix needs RED/GREEN evidence
- `beer:planning` when the repair is broader than a local patch
- `beer:validating` when the plan still exists but the execution target or review unit no longer fits
- `beer:reviewing` when review opened the loop and now has enough evidence to continue, or when a local debug repair changed code and execution evidence is complete
- `beer:compounding` only for a standalone reusable debug-learning closeout with the compounding handoff fields prepared
- user handoff when missing services, decisions, permissions, or environment prevent safe progress

`debugging` does not own global route lock, gate approval, idle reset, or
generated Docs refresh.

### Verify and Report

- Re-run the original failing command. Passing a different command is not enough.
- Run the smallest broader regression scope that gives real confidence.
- If an integration or runtime symptom still appears after the code fix is restored, run a clean rebuild before assuming the fix failed. Stale build output can preserve old activation or configuration behavior.
- Report classification, reproduction, root cause, fix, verification, recurrence signal/query when relevant, and remaining risk.
- If debugging changed code and hands off to review, include route artifact used, implementation pattern followed, source facts re-checked, files changed, verification run, TDD disposition, and deviations.
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
- Never call a behavior fix complete without TDD disposition: `complete`, `waived: <reason>`, or `not-required`.
- Never hand off code changed inside debugging to `beer:reviewing` without the execution evidence fields that reviewing requires.
- Never use "small debug fix" to bypass `approved_gates.execution` or `contract_verified`; route through `planning`, `validating`, or `executing` when the fix is not already authorized.
- Never silently override locked `CONTEXT.md` decisions to make a test pass.
- Never plan a broad repair inside debugging; preserve the root-cause sentence and route through `beer:planning` with `work_intent = repair`.
- Never treat generated `Docs/` as root-cause proof or refresh it inside the debug loop.
- Never spin on worker blockers; report once with evidence and stop for coordination.
- Never mutate global Beer gates or finish the parent workflow from inside the debug loop.
- Never leave the debug loop without an explicit exit target.
- Never treat a worker/coordinator debug loop as permission to bypass `beer:swarming` and self-promote the global workflow.
- Never exit directly to `beer:compounding` for debug-learning without a debug note or root-cause artifact and the closeout status plan.

## Key References

- [Workflow detail](references/workflow.md) - Full triage -> reproduce -> diagnose -> fix -> learn flow
- [Quick reference](references/quick-ref.md) - Failure types, command patterns, and stop rules
- [Communication templates](references/communication.md) - RCA, blocker, and fix report formats
- [Pressure scenarios](references/pressure-scenarios.md) - Edge cases for recursive debug behavior
