---
skill: using-beer
purpose: Quick commands, file reference, and chaining contract
version: "1.1"
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

State-owning workflow skills update `.beer/state.json` first, then regenerate
`.beer/STATE.md` from `state.json`. `STATE.md` is derived and human-readable;
`state.json` is the authoritative source of truth.

Support helpers such as `prompt-leverage` and `graph-explore` return packets to
their caller and do not mutate state. TDD state is recorded only when the active
Beer route requires fail-first proof.

### Support / Helper Handoff Minimum

Return a compact packet with:

- `status`
- `evidence`
- `decision_or_guardrail`
- `state_changes_or_none`
- `return_to`
- `next_owner`

If the result creates implementation work, stale Docs cleanup, or wider repair,
route back to the current workflow owner instead of continuing inside the
support/helper skill.

### Prompt Normalization

Use `prompt-leverage` only when the request needs normalization before routing:

- mixed-language request
- referenced files, commands, Beer artifacts, or skill names need local context
- user asks to improve, structure, normalize, or leverage a prompt
- request is vague but likely resolvable from repo/session context

Return raw request plus contextual prompt. Then `using-beer` routes using both.
Normal task work still enters through `context-intake`.

### Strategy Shaping

Use `strategy-shaping` when the user is still choosing:

- feature direction;
- implementation approach;
- optimization strategy;
- whether the idea is overkill;
- what to build now versus later.

`strategy-shaping` returns a strategy brief. It does not mutate state or approve
workflow gates. After the user chooses the direction, pass the strategy brief to
`context-intake` as seed context.

### Small-Fix Signal

Keep `beer:context-intake` as intake. If the task is:

- local,
- low ambiguity,
- likely under 3 files,
- not a new feature or scope-shaping change.

Typical examples: wrong type, wrong format, tiny rename, obvious single-path fix.

| Skill | Reads | Writes |
|---|---|---|
| `prompt-leverage` | Raw request, repo docs, mentioned files/skills, optional `.beer/state.json` | No state or code writes; returns contextual prompt packet |
| `strategy-shaping` | User goal, repo evidence, optional existing docs or configured MCP sources | No state or code writes; returns strategy brief and handoff seed |
| `context-intake` | User request, `.beer/state.json`, optional `HANDOFF.json`, optional `.beer/seed/` | Seed context, context-stage updates, next-phase routing decision |
| `exploring` | User conversation, prior context, optional `.beer/seed/` | `history/<feature>/CONTEXT.md` |
| `planning` | `CONTEXT.md`, `critical-patterns.md` | `discovery.md`, `approach.md`, `phase-plan.md`, beads |
| `validating` | Phase artifacts, `approach.md`, `CONTEXT.md` | Validation decision and optional `.spikes/` output |
| `swarming` | Validated beads, state files | Worker coordination, updated state, optional handoff |
| `executing` | Bead, context, reservations | Implementation, verification, closed bead |
| `test-driven-development` | Target behavior, focused test command, code scope | RED/GREEN/REFACTOR evidence and regression proof |
| `codebase-knowledge` | Explicit scan/build/refresh request or compounding-approved refresh | Generated `Docs/` beside `.beer/` |
| `graph-explore` | Calling skill question, GitNexus/index status, optional Docs-derived assumption | No state writes; returns read-only graph evidence packet |
| `beer-agent-guidelines` | Existing `AGENTS.md`/`CLAUDE.md`, canonical templates | Instruction files only unless user asked for full managed refresh |
| `reviewing` | Diff, `CONTEXT.md`, `approach.md` | Review beads, UAT outcome, finish decision |
| `compounding` | Full feature history | Learnings file and critical-pattern updates |

## Handoff Phrase Pattern

```text
[Outcome]. Invoke `beer:[next-skill]`.
```

Examples:

- `Decisions locked. Invoke beer:planning.`
- `Strategy shaped. Invoke beer:context-intake with the strategy brief as seed context.`
- `Phase validated for parallel execution. Invoke beer:swarming.`
- `Phase validated for direct execution. Invoke beer:executing.`
- `Behavior change needs fail-first proof. Invoke beer:test-driven-development.`
- `GATE 2 reached. Run auto-accept policy; invoke beer:validating only on ALLOW or approval.`

## State Defaults

### `.beer/state.json`

```json
{
  "schema_version": "1.0",
  "feature_slug": "",
  "route": "",
  "work_intent": "delivery",
  "risk": "normal",
  "run_style": "guided",
  "orchestration_strategy": "",
  "active_skill": "using-beer",
  "context_stage": "none",
  "seed_path": ".beer/seed/",
  "context_path": "",
  "context_confidence": 0,
  "phase": "idle",
  "phase_number": 0,
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
  "tdd_required": false,
  "tdd_status": "not-required",
  "tdd_evidence_path": "",
  "execution_evidence_path": "",
  "verification_status": "not-run",
  "gitnexus_refresh_status": "",
  "code_quantity_status": "",
  "pattern_status": "",
  "review_quality_status": "",
  "review_route": "",
  "review_status": "",
  "open_findings_count": 0,
  "compounding_route": "",
  "learnings_file": "",
  "critical_promotions": 0,
  "knowledge_base_refresh_status": "",
  "closeout_ready": false,
  "next_handoff": "",
  "epic_id": "",
  "approved_gates": {
    "context": false,
    "phase_plan": false,
    "execution": false,
    "review": false
  },
  "active_beads": [],
  "active_workers": [],
  "auto_accept": {
    "enabled": false,
    "planning": false,
    "validating": false,
    "swarming": false,
    "reviewing": false,
    "compounding": false
  },
  "blockers": []
}
```

### `.beer/STATE.md`

```markdown
# Beer State

Current: idle
Feature: (none)
Route: (none)
Work intent: delivery
Risk: normal
Run style: guided
Orchestration: (none)
Skill: using-beer
Context: none
Context path: (none)
Current phase: (none)
Current slice: (none)
Slices: 0
Planned workers: 0
Gate approvals: context=no, phase_plan=no, execution=no, review=no
Contract verified: no
Validation: (none)
Validator: (none)
Execution target: (none)
TDD required: no
TDD status: not-required
TDD evidence: (none)
Execution evidence: (none)
Verification: (none)
GitNexus refresh: (none)
Code quantity: (none)
Pattern: (none)
Review quality: (none)
Review: (none)
Generated Docs refresh: (none)
Closeout ready: no
Next handoff: (none)
```
