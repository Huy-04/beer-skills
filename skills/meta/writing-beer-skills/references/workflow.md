---
name: writing-beer-skills
description: Detailed workflow for building a clean Beer skill package with SCENARIO RED -> INSTRUCTION GREEN -> PATTERN REFACTOR as an internal method
version: "1.0.0"
---

# writing-beer-skills - Workflow Details

## Overview

This workflow exists to turn a user request into a final Beer skill package that matches the Beer skill pattern.

`SCENARIO RED / INSTRUCTION GREEN / PATTERN REFACTOR` is the internal authoring method, not the final deliverable.

This method is for testing skill wording and anti-rationalization behavior. It does not replace `beer:test-driven-development` when production code itself needs fail-first verification.

The quality bar is:

- the final skill package is clean
- the final skill package matches `docs/skill-authoring/skill-pattern.md`
- the skill is hard to misread under pressure

## Phase 1: Map the Target

Define:

- the target skill name
- the target category
- the trigger conditions
- the behavior the skill must enforce
- the final files required by the Beer skill pattern

If the request is ambiguous, resolve the minimum decisions needed to build the final package cleanly.

## Phase 2: Use SCENARIO RED / INSTRUCTION GREEN / PATTERN REFACTOR Internally

### Step 2.1: SCENARIO RED

Pressure-test the draft idea before finalizing wording.

Run `SCENARIO RED` for every new skill and every edit that changes behavior, routing, required artifacts, validation rules, or pressure guidance.

Edits to patterns, templates, checklists, or examples that change authoring decisions count as behavior-affecting edits for this skill.

Treat an edit as mechanical-only only when it changes no meaning, no trigger conditions, no required artifacts, no validation expectations, no examples, no templates, and no normative wording.

If an edit changes emphasis, interpretation, examples, or template content, it is behavior-affecting for this skill and `SCENARIO RED` must run.

Only purely mechanical fixes such as spelling, formatting, or broken-link repairs may skip `SCENARIO RED`. If `SCENARIO RED` is skipped, record explicitly that behavior is unchanged and why the edit is mechanical.

Run pressure scenarios against the active agent instructions or an explicitly authorized evaluation harness. Do not spawn subagents or external evaluators unless the user explicitly asks for parallel agent work or a separate evaluator. If a real scenario run is blocked, record the blocker instead of inventing failure evidence.

If a behavior-affecting edit was already made before `SCENARIO RED` ran, that lapse is itself a real failure mode. Record it, run the missing scenario coverage against the actual change, and do not hand off the skill as validated until that retroactive coverage is complete.

Use `references/pressure-test-template.md` to run the baseline scenarios for required `SCENARIO RED` coverage.

For every required `SCENARIO RED`, add at least one scenario that targets the exact rule, template, checklist item, or behavior changed in the current edit. That change-specific scenario must combine at least two pressures and must produce an observable violation or verbatim rationalization. Baseline scenarios alone are not sufficient.

Run the scenarios against a real agent. `Prompt used`, `Observed violation`, and `Exact rationalization` must come from an actual run, not a hypothetical example. If execution is blocked by tooling, permissions, or environment limits, record the blocker explicitly and do not count that blocked scenario as successful `SCENARIO RED` coverage.

Capture:

- likely shortcuts
- rationalizations the agent may use
- places where the pattern could be followed structurally but violated behaviorally

These notes may live in scratch text, temporary files, or working memory.

### Step 2.2: INSTRUCTION GREEN

Write the minimum pattern-compliant skill files needed to satisfy the request:

- `SKILL.md`
- `references/workflow.md`
- `references/communication.md`
- `references/quick-ref.md`

Add optional files only when the skill explicitly needs them.

### Step 2.3: PATTERN REFACTOR

Tighten the skill after pressure-testing:

1. remove bloated wording
2. move detail into `references/` when appropriate
3. strengthen rules that still allow shortcuts
4. keep `description` limited to trigger conditions only

Repeat the internal SCENARIO RED / INSTRUCTION GREEN / PATTERN REFACTOR loop as needed.

## Phase 3: Build the Final Package

Before completion, ensure the skill package matches `docs/skill-authoring/skill-pattern.md`.

Required final state:

- directory name matches `name`
- `description` is routing-only
- required reference files exist
- all internal links resolve
- only files needed by the final skill remain

Temporary scenario/instruction/refactor artifacts are allowed during authoring, but they are not part of the final package.

## Phase 4: Validate

Run the repo-native validation stack:

```bash
node scripts/maintenance/check-markdown-links.mjs skills/<category>/<skill-name>
node scripts/maintenance/sync-skills.mjs --dry-run
```

Those commands verify links and skill-registry sync only. They do not prove semantic requirements from `docs/skill-authoring/skill-pattern.md`.

After the repo-native commands pass, manually review at least:

- `description` is routing-only, third person, and includes trigger phrases
- `metadata.tags` follows the `beer/<category>` convention
- `metadata.inputs`, `outputs`, `upstream`, and `downstream` match the actual route and owned artifacts when those fields are present
- `metadata.dependencies` matches the actual external tools the skill uses
- the body follows the required section order and avoids second person
- optional files that remain are actually needed by the final skill

Record concrete evidence for the manual review. For each reviewed checklist item, provide line references or quoted field values when possible. Use a file-specific observation only for checks that cannot naturally point to a line or field value, such as confirming that no extra optional files remain. Do not report manual review as `pass` without showing what was checked.

If the skill owns additional helper files, validate those references too.

## Phase 5: Clean and Handoff

Before marking the work complete:

1. remove temporary scenario/instruction/refactor files unless the user explicitly asked to keep them
2. remove unused helper files or stale drafts
3. confirm the remaining files form a clean Beer skill package
4. note whether `SCENARIO RED` was run or legitimately waived as a mechanical-only edit
5. include evidence for the manual semantic review in the validation report or handoff
6. include a minimal SCENARIO RED report in the handoff or validation package when `SCENARIO RED` was run

Optional:

- keep `references/creation-log-template.md` or a creation log only when the user explicitly asks to preserve process notes

## Done Criteria

This workflow is done when:

- the final skill package matches the Beer skill pattern
- temporary authoring artifacts are removed unless requested
- the repo-native validation commands pass
- the manual semantic checklist passes
- a minimal SCENARIO RED report exists when `SCENARIO RED` was required
- the remaining files are the intended final deliverable

### Minimal SCENARIO RED Report Requirements

When `SCENARIO RED` runs, the handoff or validation package must include at least:

- scenario count and whether each scenario was executed or blocked
- the exact rule, template, checklist item, or behavior targeted by the change-specific scenario
- the pressures used in the change-specific scenario
- one observable failure or one verbatim rationalization from a real run
- the strongest loophole found or a statement that no meaningful loophole survived

---

## Persuasion Principles

| Principle | Implementation | Use For |
|---|---|---|
| **Authority** | "YOU MUST", "Never", "No exceptions" | Discipline-enforcing rules |
| **Commitment** | Ordered checklists, announce skill usage | Multi-step processes |
| **Scarcity** | "Before proceeding", "IMMEDIATELY after X" | Verification requirements |
| **Social Proof** | "Teams report...", "X without Y = failure. Every time." | Common failure patterns |
| **Unity** | "our skills", collaborative framing | Techniques, guidance |

---

## Rationalization Table (Common Violations)

| Excuse | Reality |
|---|---|
| "I know this technique, testing is unnecessary" | Testing the skill, not the agent's knowledge. Agents differ. |
| "It's so simple it can't have bugs" | Every untested skill has issues. Test takes 30 minutes. |
| "Academic questions passed - that's sufficient" | Reading a skill != using it under pressure. Test application scenarios. |
| "My description summarizes the workflow so agents know what to do" | Workflow-summary descriptions cause agents to skip the body. Remove it. |
| "This edit is minor - testing isn't needed" | The Iron Law applies to edits. No exceptions. |
| "I'll test it after a few real uses" | Problems = agents misuse in production. Test BEFORE deploying. |
| "The baseline is obvious, I know what failures to expect" | You know YOUR failures. Agent failures differ. Run the baseline. |

---

## Meta-Testing Technique

After an agent chooses wrong, ask:

> "You read the skill and chose Option C anyway. How could the skill have been written differently to make Option A the only acceptable answer?"

Three diagnoses:

- "The skill WAS clear, I chose to ignore it" -> add "Violating the letter IS violating the spirit"
- "The skill should have said X" -> add their exact suggestion verbatim
- "I didn't see section Y" -> make the key point more prominent, move it earlier

---

## Bulletproof Checklist

**Signs the skill IS bulletproof:**

- Agent chooses correct option under maximum pressure
- Agent cites specific skill sections as justification
- Agent acknowledges temptation but follows rule
- Meta-test reveals: "skill was clear, I should follow it"

**Signs the skill is NOT bulletproof:**

- Agent finds rationalizations not addressed in the skill
- Agent argues the skill itself is wrong
- Agent creates "hybrid approaches" that satisfy letter but not spirit

---

## Description Trap

The most common mistake: putting workflow summary in `description`.

```yaml
# BAD - workflow summary
description: Use when creating skills - run baseline test, write minimal skill, run tests

# GOOD - triggering conditions only
description: Use when creating a new beer skill or editing an existing one
```

Workflow summary in description causes agents to skip the skill body. Every time.
