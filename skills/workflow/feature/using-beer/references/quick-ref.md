---
skill: using-beer
purpose: Quick commands, file reference, and chaining contract
version: "1.0"
---

# using-beer - Quick Reference

## Commands

### Onboarding

From the Beer repo:

```bash
node scripts/commands/onboard-beer.mjs --repo-root <path>
node scripts/commands/onboard-beer.mjs --repo-root <path> --apply
```

From an onboarded repo:

```bash
node .beer/scripts/commands/onboard-beer.mjs
node .beer/scripts/commands/onboard-beer.mjs --apply
```

### Session Scout

```bash
node scripts/commands/beer-preflight.mjs --json
node scripts/commands/beer-auto-accept.mjs --gate validating --json
node .beer/scripts/commands/beer-preflight.mjs --json
node .beer/scripts/commands/beer-auto-accept.mjs --gate validating --json
node .beer/scripts/commands/beer-status.mjs --json
node .beer/scripts/commands/beer-dependencies.mjs
```

### Context and State

```bash
bd ready --json
bd show <id> --json
cat .beer/state.json
cat .beer/STATE.md
cat .beer/HANDOFF.json 2>/dev/null || echo "No handoff"
```

## File Quick Reference

### `.beer/`

| File | Purpose |
|---|---|
| `onboarding.json` | Managed Beer install metadata |
| `state.json` | Machine-readable routing snapshot |
| `STATE.md` | Human-readable current phase summary |
| `config.json` | Beer config and workflow settings |
| `HANDOFF.json` | Session resume data |
| `seed/` | Temporary inferred context for `beer:exploring` |
| `scripts/` | Managed Beer utility scripts |
| `skills/` | Managed Beer skill snapshot |

### `history/<feature>/`

| File | Purpose |
|---|---|
| `CONTEXT.md` | Locked decisions from exploring |
| `discovery.md` | Planning research findings |
| `approach.md` | Planning synthesis and risk map |
| `phase-plan.md` | Full phase breakdown |
| `phase-<n>-contract.md` | Current phase entry and exit contract |
| `phase-<n>-story-map.md` | Current phase story ordering |

### `history/learnings/`

| File | Purpose |
|---|---|
| `critical-patterns.md` | Promoted cross-feature lessons |
| `YYYYMMDD-<slug>.md` | One learnings file per completed feature |

## Chaining Contract

At the end of every skill, update `.beer/state.json` first, then regenerate `.beer/STATE.md` from `state.json`. `STATE.md` is derived and human-readable; `state.json` is the authoritative source of truth.

### Direct-Fix Signal

Keep `beer:context-intake` as intake. If the task is:

- local,
- low ambiguity,
- likely under 3 files,
- not a new feature or scope-shaping change.

Typical examples: wrong type, wrong format, tiny rename, obvious single-path fix.

| Skill | Reads | Writes |
|---|---|---|
| `context-intake` | User request, `.beer/state.json`, optional `HANDOFF.json`, optional `.beer/seed/` | Seed context, context-stage updates, next-phase routing decision |
| `exploring` | User conversation, prior context, optional `.beer/seed/` | `history/<feature>/CONTEXT.md` |
| `planning` | `CONTEXT.md`, `critical-patterns.md` | `discovery.md`, `approach.md`, `phase-plan.md`, beads |
| `validating` | Phase artifacts, `approach.md`, `CONTEXT.md` | Validation decision and optional `.spikes/` output |
| `swarming` | Validated beads, state files | Worker coordination, updated state, optional handoff |
| `executing` | Bead, context, reservations | Implementation, verification, closed bead |
| `test-driven-development` | Target behavior, focused test command, code scope | RED/GREEN/REFACTOR evidence and regression proof |
| `reviewing` | Diff, `CONTEXT.md`, `approach.md` | Review beads, UAT outcome, finish decision |
| `compounding` | Full feature history | Learnings file and critical-pattern updates |

## Handoff Phrase Pattern

```text
[Outcome]. Invoke `beer:[next-skill]`.
```

Examples:

- `Decisions locked. Invoke beer:planning.`
- `Phase validated for parallel execution. Invoke beer:swarming.`
- `Phase validated for direct execution. Invoke beer:executing.`
- `Behavior change needs fail-first proof. Invoke beer:test-driven-development.`
- `GATE 2 reached. Run auto-accept policy; invoke beer:validating only on ALLOW or approval.`

## State Defaults

### `.beer/state.json`

```json
{
  "schema_version": "1.0",
  "route": "",
  "risk": "normal",
  "run_style": "guided",
  "orchestration_strategy": "",
  "phase": "idle",
  "current_phase_name": "",
  "current_slice": "",
  "slice_count": 0,
  "planned_workers": 0,
  "prep_depth": "",
  "contract_verified": false,
  "execution_target": "",
  "validation_status": "",
  "validator_status": "",
  "spike_status": "",
  "swarm_status": "",
  "active_work_item": "",
  "execution_evidence_path": "",
  "verification_status": "",
  "review_route": "",
  "review_status": "",
  "open_findings_count": 0,
  "compounding_route": "",
  "learnings_file": "",
  "critical_promotions": 0,
  "closeout_ready": false,
  "next_handoff": "",
  "context_stage": "none",
  "seed_path": ".beer/seed/",
  "context_path": "",
  "context_confidence": 0,
  "approved_gates": {
    "context": false,
    "phase_plan": false,
    "execution": false,
    "review": false
  }
}
```

### `.beer/STATE.md`

```markdown
# Beer State

Current: idle
Feature: (none)
Route: (none)
Risk: normal
Run style: guided
Orchestration: (none)
Phase: idle
Slices: 0
Planned workers: 0
Contract verified: no
Execution target: (none)
Gate approvals: context=no, phase_plan=no, execution=no, review=no
Validation: (none)
Validator: (none)
Verification: (none)
Execution evidence: (none)
```
