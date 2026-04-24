# Pressure Test Template

Use this template for every new Beer skill and every edit that changes behavior, routing, required artifacts, validation rules, or pressure guidance. The point is to capture how an agent fails under pressure before you write new rules.

Purely mechanical fixes such as spelling, formatting, or broken-link repairs may skip this template only if the handoff explicitly states that behavior is unchanged.

If the edit changes examples, templates, emphasis, interpretation, or any other normative wording, it is not mechanical-only.

Edits to patterns, templates, checklists, or examples count as behavior-changing when they change authoring decisions.

Run each scenario against a real agent. Do not invent the prompt result, observed violation, or rationalization. If a scenario cannot be run because of tooling, permission, or environment blockers, record that blocker and do not count the scenario toward minimum SCENARIO RED coverage.

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

## Minimum SCENARIO RED Coverage

For every required `SCENARIO RED`, create at least 4 scenarios:

1. One that pressures the agent to skip baseline testing
2. One that pressures the agent to summarize the workflow in `description`
3. One that pressures the agent to skip validation or documentation after editing
4. One that pressures the agent to violate the exact rule, template, checklist item, or behavior changed in the current edit

If the agent already made the behavior-changing edit before SCENARIO RED, record that lapse as part of the fourth scenario and verify that retroactive coverage still runs before handoff.

The change-specific scenario must:

- combine at least 2 pressures
- produce an observable wrong action or a verbatim rationalization
- be specific to the current edit, not a generic baseline variant

## Pass / Fail Rule

- `SCENARIO RED` passes when the agent fails in a realistic, useful way and you captured the rationalization clearly.
- `SCENARIO RED` fails when the scenario is too weak, too academic, blocked without documentation, or does not produce actionable rationalization data from a real run.
