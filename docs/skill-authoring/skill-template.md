# Skill Template Guide

Use the template that matches the skill's job instead of forcing every skill
into the same section layout.

## Choose a Starting Point

| Skill type | Use this template | When it fits |
|---|---|---|
| Workflow | [workflow-skill-template.md](workflow-skill-template.md) | The skill sequences work, owns route decisions, or mutates Beer state/artifacts |
| Support | [support-skill-template.md](support-skill-template.md) | The skill provides focused capability, evidence, testing proof, or helper output |
| Meta | [meta-skill-template.md](meta-skill-template.md) | The skill improves Beer itself through authoring, research, or curation |

## Shared Rules

- Keep `description` as routing-only trigger text.
- Match the directory name to `name`.
- Keep `SKILL.md` lean and move detail into `references/`.
- Add `references/workflow.md`, `references/quick-ref.md`, and `references/communication.md`.
- Use `docs/skill-authoring/skill-pattern.md` as the final source of truth.

## Typical Flow

1. Choose the correct template family.
2. Fill in frontmatter with real triggers and owned artifacts.
3. Write only the sections required for that skill type.
4. Add reference files for detail, examples, and communication text.
5. Run the normal doc and sync validation commands.
