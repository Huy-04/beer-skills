# Contributing

This repo is a skill bundle, not a normal app codebase. Most contributions fall
into one of three buckets:

- update an existing skill
- add a new skill
- refresh docs and inventories after structural changes

## Before You Edit

Read these first:

1. [README](README.md)
2. [docs/skill-authoring/skill-pattern.md](docs/skill-authoring/skill-pattern.md)
3. [docs/skill-authoring/skill-template.md](docs/skill-authoring/skill-template.md)
4. The matching workflow/support/meta template from `docs/skill-authoring/`

The root `README.md` is the canonical place for install, onboarding, and Codex
plugin setup. Keep secondary docs aligned to it instead of duplicating setup
flows in multiple places.

If you are changing workflow behavior, also read the relevant docs in `docs/`
and the affected skills in `skills/workflow/`.

## Repo Structure

| Path | Purpose |
|---|---|
| `skills/workflow/feature/` | feature workflow skills |
| `skills/workflow/debug/` | debug workflow skills |
| `skills/support/` | support skills |
| `skills/meta/` | meta-skills for maintaining Beer |
| `docs/` | public docs and authoring guides |
| `scripts/commands/` | public CLI entrypoints |
| `scripts/maintenance/` | validation and inventory helpers |
| `scripts/<domain>/` | implementation modules for Beer commands |

## Skill Contribution Rules

- Keep `name` equal to the directory name.
- Follow the frontmatter and section rules in `docs/skill-authoring/skill-pattern.md`.
- Keep `SKILL.md` concise and move detail into `references/`.
- Do not silently reintroduce old taxonomy such as `skills/core` or `skills/helpers`.
- If a skill writes or reads `.beer/state.json`, keep `state.json` authoritative and treat `STATE.md` as derived.
- Prefer route-aware behavior over forcing every task through the heaviest workflow.

## Validation Checklist

After editing skills or docs, run:

```bash
npm run check-links -- README.md docs skill-catalog.md CONTRIBUTING.md
node scripts/maintenance/sync-skills.mjs --dry-run
```

If you changed npm/package or Codex plugin install behavior, also smoke-test the
entry surfaces you touched:

```bash
node scripts/commands/beer-cli.mjs --help
npm.cmd pack --dry-run
codex.cmd plugin marketplace add <local-repo-path>
codex.cmd plugin marketplace remove beer-skills-local
```

If you changed the skill set or skill metadata, also run:

```bash
node scripts/maintenance/sync-skills.mjs
```

## When Updating Docs

- Treat the repo state as canonical.
- Write in present tense, not changelog style.
- Update all related docs together when a workflow or taxonomy changes.
- Keep install and onboarding instructions centralized in the root `README.md`.
- Keep public-facing docs GitHub-friendly. Avoid wiki-style links and repo-local note conventions in public docs.
- Prefer Mermaid for workflow diagrams in public-facing docs instead of ASCII flow art.

## When Adding a New Skill

1. Start from [docs/skill-authoring/skill-template.md](docs/skill-authoring/skill-template.md), then choose the matching workflow/support/meta template.
2. Put the skill in the right category.
3. Add or update `references/quick-ref.md`, `references/workflow.md`, and `references/communication.md`.
4. Pressure-test the skill if it governs behavior, gates, or routing.
5. Run `node scripts/maintenance/sync-skills.mjs`.

## Pull Request Expectations

A good contribution should make it easy to answer:

- what changed
- why the change is correct
- which workflow routes it affects
- how it was validated

For workflow changes, include the route or scenario you tested.

## Do Not Commit

- `.beer/`
- `.tmp/`
- `.npm-cache/`
- `.claude/`
- machine-local editor or shell state
