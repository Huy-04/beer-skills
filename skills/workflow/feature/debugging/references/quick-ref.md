---
skill: debugging
purpose: Fast debugging checklist and command patterns
version: "1.1"
---

# debugging - Quick Reference

## Nested Loop Reminder

- record `debug_entry_phase` before deep investigation
- keep `debug_reason` explicit
- exit back to the parent workflow with a named target
- do not treat debugging as a replacement top-level route
- if the parent path is worker/coordinator-owned, prefer `beer:swarming` over self-advancing the global workflow
- if debugging changed code, do not enter `reviewing` until execution evidence has the review-required fields

## Failure Types

| Type | First move |
|---|---|
| Build | Capture first compiler/bundler error and file/line |
| Test | Run exact failing test command; classify deterministic vs flaky |
| Runtime | Read stack trace to first app-owned frame |
| Integration | Capture status, response body, env/config names, route/controller, and service registration |
| UAT | Record steps, expected, actual, evidence |
| Blocker | Inspect bead deps, file ownership, and bd (beads) |

## Required Gates

| Gate | Must have |
|---|---|
| Enter | parent phase and debug reason |
| Triage | `[TYPE] in [component]: [symptom]` |
| Reproduce | exact command, output excerpt, reproducibility status |
| Diagnose | `Root cause: <file/component> - <why>` |
| Exit | smallest safe return target or explicit escalation |
| Verify | original failing command rerun, nearby regression scope |
| Learn | debug note for reusable patterns |

## Command Patterns

```bash
rg -i "<symptom|symbol>" history/learnings/critical-patterns.md
rg -i "<symptom|symbol>" Docs
rg -n "<symbol|error text|test name>" .
git status --short
git log --oneline -20
git diff -- <file>
git blame <file> -L <start>,<end>
dotnet clean <solution-or-project>
dotnet build <solution-or-project> -v minimal
```

## TDD Trigger

Use `beer:test-driven-development` after root cause is known when:

- behavior changes
- a regression should never recur
- test evidence can prove RED then GREEN

Do not claim TDD if the test did not fail first for the right reason.

## Stop Rules

- Root cause sentence is vague.
- Original failing command cannot be run and no limitation is stated.
- `CONTEXT.md` decision would be violated.
- Fix crosses multiple components without bead/scope approval.
- Repair is broad enough that the current route should move into planned repair work.
- Worker blocker needs coordination rather than code changes.
- Code changed but execution evidence lacks route artifact, pattern, source facts, files, verification, TDD disposition, or deviations.
- Generated `Docs/` is being treated as root-cause proof or refreshed inside debugging.

## Escalation Route

Use `beer:planning` with `work_intent = repair` when root cause is proven but
the repair is too broad for a direct patch.

```bash
node .beer/scripts/commands/beer-planning-gate.mjs --route feature --json
```

Preserve the root-cause sentence in `compact-plan.md` for bounded repair, or in
`discovery.md` and `approach.md` when the repair needs the full planning path.

## Exit Targets

- `beer:swarming` for worker/coordinator debug outcomes that still need coordination
- `beer:executing` for local in-slice fixes when execution remains approved and contract-verified
- `beer:test-driven-development` for behavior repairs needing RED/GREEN
- `beer:planning` for broad repair
- `beer:validating` when the slice or execution target no longer fits
- `beer:reviewing` when review opened the loop and now has enough evidence
- `beer:compounding` only for standalone debug-learning closeout with debug note/root-cause artifact and closeout status plan

## Execution Evidence Fields

Before review after a debug repair, record:

- route artifact used
- implementation pattern followed
- source facts re-checked
- files changed
- verification run, including the original failing command
- TDD disposition: `complete`, `waived: <reason>`, or `not-required`
- deviations from the approved artifact, or `none`

## Integration Reminder

- For request-time DI failures, verify by hitting the failing route again after the fix.
- If the route still shows the old failure after the code is restored, run a clean rebuild before reopening diagnosis.

## Debug Note

```bash
node skills/workflow/feature/debugging/scripts/write-debug-note.mjs \
  --classification "<classification>" \
  --root-cause "<root cause>" \
  --trigger "<trigger>" \
  --fix "<fix>" \
  --signal "<future signal>"
```
