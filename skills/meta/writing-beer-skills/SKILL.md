---
name: writing-beer-skills
description: >
  This skill should be used when the user asks to "create a new skill", "edit an existing skill",
  "verify a skill under pressure", or "test a skill before handoff".
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  tags:
    - beer/meta
    - beer/workflow
  dependencies: []
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
user-invocable: true
disable-model-invocation: false
---

# writing-beer-skills

Author or edit a Beer skill so the final result is a clean skill package that matches the Beer skill pattern.

---

## At a Glance

| | |
|---|---|
| **Use when** | Creating or editing Beer skills; verifying skill behavior under pressure |
| **Needs** | Target behavior, target category, and the Beer skill pattern |
| **Produces** | Clean skill package matching `docs/skill-authoring/skill-pattern.md` |
| **Next** | `beer:using-beer` or user handoff |

---

## 30-Second Version

1. **Map the target**: Confirm the skill name, category, trigger conditions, and final pattern-compliant output.
2. **Use SCENARIO RED / INSTRUCTION GREEN / PATTERN REFACTOR internally**: Run minimum scenario coverage for every new skill and every behavior-changing edit; include at least one pressure-tested scenario that targets the exact rule or behavior you changed and produces a concrete failure or rationalization from a real run, even if the edit was already drafted before the missing scenario was noticed.
3. **Build the final package**: Produce `SKILL.md` plus the required `references/` files defined by the Beer skill pattern.
4. **Clean before handoff**: Remove temporary scenario/instruction/refactor notes unless the user explicitly asks to keep them.
5. **VALIDATE**: Run `check-markdown-links.mjs`, run `sync-skills.mjs --dry-run`, and manually review the Beer pattern checklist items those commands cannot prove.

---

## Core Workflow

### Capability First

- Author or edit the skill package fully when asked; do not stop at recommendations.
- Use pressure scenarios to strengthen the skill, not to make the authoring loop timid.
- Tighten rules only where they block a concrete failure mode; keep capability text expansive and ownership boundaries precise.

### Phase 1: Internal Authoring Loop

Use `SCENARIO RED / INSTRUCTION GREEN / PATTERN REFACTOR` as the working method while authoring or editing the skill.

This is skill-authoring pressure testing, not a replacement for code-level TDD. When a skill being written depends on fail-first production-code proof, reference `beer:test-driven-development` instead of stretching skill-authoring scenarios to cover code verification.

- Run `SCENARIO RED` for every new skill and every edit that changes behavior, routing, required artifacts, validation rules, or pressure guidance.
- Edits to patterns, templates, checklists, or examples that change authoring decisions count as behavior-changing edits for this skill.
- Treat an edit as mechanical-only only when it changes no meaning, no trigger conditions, no required artifacts, no validation expectations, no examples, no templates, and no normative wording.
- If an edit changes emphasis, interpretation, examples, or template content, it is not mechanical-only and `SCENARIO RED` must run.
- Only purely mechanical fixes such as spelling, formatting, or broken-link repairs may skip `SCENARIO RED`, and that exception must be stated explicitly in the handoff.
- Base `SCENARIO RED` findings on real scenario runs against the active agent instructions or an explicitly authorized evaluation harness. If execution is blocked, record the blocker explicitly instead of fabricating outcomes.
- Use subagents or external evaluators when the user explicitly asks for parallel agent work or a separate evaluator; otherwise run scenarios locally.
- If a behavior-changing edit was made before `SCENARIO RED` ran, treat that lapse as a real failure mode, run the missing scenario coverage against the actual change, and include that lapse in the handoff.
- `SCENARIO RED`: identify likely failure modes, shortcuts, or rationalizations in agent behavior.
- `INSTRUCTION GREEN`: write the minimum wording needed to make the skill follow the Beer pattern and block the observed shortcut.
- `PATTERN REFACTOR`: tighten wording, move detail into `references/`, and remove unnecessary bulk.

Temporary notes, scenario drafts, or scratch files may exist during this loop.

Do not leave those temporary authoring artifacts in the final skill package unless the user explicitly asks to keep them.

### Phase 2: Build the Final Skill Package

The final deliverable is the skill package itself, not the internal scenario/instruction/refactor notes.

- `name` must match the directory name exactly.
- `description` contains trigger conditions only; no workflow summary.
- The final directory must match `docs/skill-authoring/skill-pattern.md`.
- `SKILL.md`, `references/workflow.md`, `references/communication.md`, and `references/quick-ref.md` are required.
- Add optional files only when the skill explicitly references or needs them.
- Keep the body lean; overflow moves to `references/`.

### Phase 3: Validate and Clean

Run the validation stack:

```bash
node scripts/maintenance/check-markdown-links.mjs skills/<category>/<skill-name>
node scripts/maintenance/sync-skills.mjs --dry-run
```

Those commands check link integrity and skill sync only. They do not prove semantic rules such as routing-only `description`, tag conventions, dependency declarations, or body tone.

Before completion:

1. Remove temporary scenario/instruction/refactor artifacts from the skill directory unless the user asked to keep them.
2. Ensure every referenced file exists.
3. Manually review the Beer pattern checklist items not covered by the repo-native commands, including workflow route metadata when present, and record concrete evidence for each reviewed item in the handoff or validation report using line references or field values, and use file-specific observations only when those stronger forms are not possible.
4. Confirm the final output is a clean skill package that matches the Beer pattern.

---

## Key References

- [test-driven-development](../../support/test-driven-development/SKILL.md) - Use for fail-first production-code verification, not skill-authoring pressure tests
- [Workflow detail](references/workflow.md) - Full SCENARIO RED -> INSTRUCTION GREEN -> PATTERN REFACTOR instructions
- [Quick reference](references/quick-ref.md) - Checklists and cleanup rules
- [Communication templates](references/communication.md) - Prompt formats
- [Pressure test template](references/pressure-test-template.md) - Scenario templates
- [Skill pattern](../../../docs/skill-authoring/skill-pattern.md) - Final output contract
- [Creation log template](references/creation-log-template.md) - Optional if the user asks to keep process notes
