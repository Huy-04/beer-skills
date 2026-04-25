# Beer Documentation

This directory contains the public reference docs for Beer Skills. The root
[README](../README.md) remains the canonical source for installation,
onboarding, commands, and repository layout.

Script layout uses three buckets:

- `scripts/commands/` for public command entrypoints
- `scripts/<domain>/` for internal runtime and workflow modules
- `scripts/beer-cli/` for helper modules that only back the `beer` wrapper

## Start Here

| Document | Use it for |
|---|---|
| [Ecosystem Flow Overview](ecosystem-flow-overview.md) | understanding the full workflow, support skills, artifacts, and dependency tiers |
| [Commands Reference](../COMMANDS.md) | CLI commands, package commands, and onboarded-repo commands |
| [Setup Guide](setup.md) | installation, onboarding, tooling setup, and automation settings |
| [Seed Context Contract](seed-context-contract.md) | knowing when inferred context becomes locked planning context |
| [Skill Catalog](../skill-catalog.md) | scanning every public Beer skill and its trigger point |

## Authoring and Maintenance

| Document | Use it for |
|---|---|
| [Skill Pattern](skill-authoring/skill-pattern.md) | Beer skill structure, frontmatter, reference files, and validation rules |
| [Skill Template Guide](skill-authoring/skill-template.md) | choose the right starting template for a new `SKILL.md` |
| [Workflow Skill Template](skill-authoring/workflow-skill-template.md) | starting point for workflow skills |
| [Support Skill Template](skill-authoring/support-skill-template.md) | starting point for support skills |
| [Meta Skill Template](skill-authoring/meta-skill-template.md) | starting point for meta skills |
| [Generated Skill Inventory](skill-inventory.json) | machine-generated list of current skills |
| [Contributing](../CONTRIBUTING.md) | contribution workflow and validation checklist |

## Recommended Reading Order

For a new user:

1. [Root README](../README.md)
2. [Commands Reference](../COMMANDS.md)
3. [Setup Guide](setup.md)
4. [Skill Catalog](../skill-catalog.md)
5. [Ecosystem Flow Overview](ecosystem-flow-overview.md)
6. [Seed Context Contract](seed-context-contract.md)

For a skill author:

1. [Contributing](../CONTRIBUTING.md)
2. [Skill Pattern](skill-authoring/skill-pattern.md)
3. [Skill Template Guide](skill-authoring/skill-template.md)
4. The matching workflow/support/meta template
5. The existing skill closest to the behavior being added or changed

## Documentation Rules

- Keep setup commands in the root README and link to them from secondary docs.
- Keep skill counts and categories aligned with
  [skill-inventory.json](skill-inventory.json).
- Write docs in present tense, as reference material, not changelog notes.
- Prefer relative Markdown links that work on GitHub.
