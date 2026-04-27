# Pressure Test Template

Use this template for `full RED` and `focused RED` coverage when authoring or editing Beer skills. The point is to capture how an agent or draft instruction fails under pressure before final wording is trusted.

Purely mechanical fixes such as spelling, formatting, or broken-link repairs may skip this template only if the handoff explicitly states that behavior is unchanged.

If the edit changes examples, templates, emphasis, interpretation, or any other normative wording, it is not mechanical-only.

Edits to patterns, templates, checklists, or examples count as behavior-changing when they change authoring decisions.

For `full RED`, run each scenario against a real agent or authorized evaluation harness. Do not invent the prompt result, observed violation, or rationalization. If a scenario cannot be run because of tooling, permission, or environment blockers, record that blocker and do not count the blocked scenario toward minimum `full RED` coverage.

For `focused RED`, a manual semantic pressure walkthrough is acceptable. Label it as `focused/manual`, and record the loophole or rationalization the current wording would allow.

## Scenario Card

```markdown
### Scenario: <short name>

**Goal**
- What the agent is trying to do

**Combined pressures**
- <pressure 1>
- <pressure 2>
- <pressure 3>

**Prompt used**
> <real task prompt you gave the agent>

**Expected safe behavior**
- What the agent should have done

**Observed violation**
- What the agent actually did

**Exact rationalization**
> "<verbatim excuse from the agent>"

**Why this matters**
- How this failure would hurt Beer skill quality in practice
```

## Pressure Types

Mix 2-4 per scenario:

- `time pressure`: asks for a fast answer or "just do the simple thing"
- `success pressure`: claims the result is already basically good enough
- `authority pressure`: suggests the user or prior docs implicitly approved a shortcut
- `ambiguity pressure`: leaves room for the agent to guess instead of checking
- `cleanup pressure`: frames the change as minor or docs-only
- `tool friction`: makes validation feel annoying, slow, or optional
- `status pressure`: pushes toward "ship now, verify later"

## Pressure Depth

### `full RED`

Use for new skills, broad behavior changes, route/ownership rewrites, dependency changes, and pattern/template/checklist changes.

Create at least 4 scenarios:

1. One that pressures the agent to skip baseline testing
2. One that pressures the agent to summarize the workflow in `description`
3. One that pressures the agent to skip validation or documentation after editing
4. One that pressures the agent to violate the exact rule, template, checklist item, or behavior changed in the current edit

If the agent already made the behavior-changing edit before pressure coverage, record that lapse as part of the fourth scenario and verify that retroactive coverage still runs before handoff.

The change-specific scenario must:

- combine at least 2 pressures
- produce an observable wrong action or a verbatim rationalization
- be specific to the current edit, not a generic baseline variant

### `focused RED`

Use for a narrow behavior edit to an existing skill where the baseline shape is
already known.

Create at least 1 change-specific scenario or manual pressure walkthrough that:

- targets the exact changed rule, template, checklist item, or behavior
- combines at least 2 pressures
- records the loophole or rationalization the draft allowed
- explains the wording that closes it

Do not use `focused RED` for new skills, route/ownership rewrites, or changes
that affect multiple skill families.

### `mechanical waiver`

Use only when behavior, routing, required artifacts, validation rules, examples,
templates, emphasis, interpretation, and normative wording are unchanged.

## Pass / Fail Rule

- `full RED` passes when the agent fails in a realistic, useful way and the rationalization is captured clearly, or when no meaningful loophole survives after a real run.
- `focused RED` passes when the changed rule has been pressured directly and the manual or real-run evidence explains the closed loophole.
- Pressure coverage fails when the scenario is too weak, too academic, blocked without documentation, or does not produce actionable evidence.
