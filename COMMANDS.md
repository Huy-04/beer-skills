# Beer Commands

This page is the command reference for Beer. The root
[README](README.md) stays focused on installation, onboarding, workflow
overview, and where to go next.

## Bootstrap Package

Bootstrap Beer into the current repo without installing a global Beer CLI:

```bash
npx --yes --package github:Huy-04/beer-skills beer-skills init
node .beer/bin/beer.mjs status
```

On Windows, the project-local shim is also available as
`.\.beer\bin\beer.cmd status`.

## Project-Local CLI

After bootstrap, run Beer from the current repo with
`node .beer/bin/beer.mjs <command>` or the Windows `.beer\bin\beer.cmd` shim.
The CLI lives under `.beer/`, so `uninstall` removes it with the rest of Beer.

| Command | Use it for |
|---|---|
| `node .beer/bin/beer.mjs update` | refresh project-local Beer files from the current package |
| `node .beer/bin/beer.mjs refresh` | refresh Beer-managed files in the current repo |
| `node .beer/bin/beer.mjs uninstall --yes` | remove project-local Beer assets, including `.beer/`, the local CLI, Beer skills, managed instruction blocks, and managed hooks |
| `node .beer/bin/beer.mjs approve <context|phase-plan|execution|review>` | record a manual gate approval in guided workflow runs |
| `node .beer/bin/beer.mjs index` | refresh the current repo's GitNexus index |
| `node .beer/bin/beer.mjs check-tools` | check whether `bd`, GitNexus MCP, and the GitNexus index are available |
| `node .beer/bin/beer.mjs install` | reinstall project-local Beer assets and skills |
| `node .beer/bin/beer.mjs install gitnexus` | install external GitNexus setup when explicitly requested |
| `node .beer/bin/beer.mjs install beads` | install external `bd` when explicitly requested |
| `node .beer/bin/beer.mjs status` | read current Beer state for a repo |
| `node .beer/bin/beer.mjs flow-guard --tool Edit --path src/foo.ts --json` | inspect the pre-edit Beer gate manually |
| `node .beer/bin/beer.mjs review-guard --json` | inspect review-time code quantity and pattern spread manually |
| `node .beer/bin/beer.mjs closeout-guard --knowledge-base not-needed --json` | inspect closeout readiness manually |
| `node .beer/bin/beer.mjs auto-accept --gate <gate> --json` | check whether a gate may auto-advance |
| `node .beer/bin/beer.mjs dependencies` | print dependency status for the current bundle |
| `node .beer/bin/beer.mjs planning-gate --route <route> --json` | check whether planning may proceed |
| `node .beer/bin/beer.mjs model-profile --role <role> --json` | resolve the configured model profile for a Beer role |
| `node .beer/bin/beer.mjs orchestrate --json` | build the current orchestration plan from Beer state |
| `node .beer/bin/beer.mjs worker-bootstrap --json` | build spawn-ready worker payloads from current swarm state |

Use `--repo-root /path/to/project` only when you want to target a different repo
than the current working directory.

## Package Commands

Use these before a repo has been bootstrapped or when `.beer/` was removed:

| Goal | Command |
|---|---|
| Init the current repo | `npx --yes --package github:Huy-04/beer-skills beer-skills init` |
| Refresh managed repo files | `npx --yes --package github:Huy-04/beer-skills beer-skills refresh` |
| Remove Beer from the current repo | `npx --yes --package github:Huy-04/beer-skills beer-skills uninstall --yes` |
| Read repo status | `npx --yes --package github:Huy-04/beer-skills beer-skills status --json` |
| Check auto-accept gate | `npx --yes --package github:Huy-04/beer-skills beer-skills auto-accept --gate validating --json` |
| Check review-time quantity and pattern guard | `npx --yes --package github:Huy-04/beer-skills beer-skills review-guard --json` |
| Record guided approval | `npx --yes --package github:Huy-04/beer-skills beer-skills approve phase-plan --json` |
| Refresh the current repo's GitNexus index | `npx --yes --package github:Huy-04/beer-skills beer-skills index --json` |
| Show dependency status | `npx --yes --package github:Huy-04/beer-skills beer-skills dependencies` |
| Check planning gate | `npx --yes --package github:Huy-04/beer-skills beer-skills planning-gate --route feature --json` |
| Resolve a configured model profile | `npx --yes --package github:Huy-04/beer-skills beer-skills model-profile --task-kind search --json` |
| Build the current orchestration plan | `npx --yes --package github:Huy-04/beer-skills beer-skills orchestrate --json` |
| Build spawn-ready worker payloads | `npx --yes --package github:Huy-04/beer-skills beer-skills worker-bootstrap --json` |

## Commands Inside an Onboarded Repo

| Goal | Command |
|---|---|
| Refresh Beer files | `node .beer/bin/beer.mjs refresh` |
| Read status JSON | `node .beer/scripts/commands/beer-status.mjs --json` |
| Check auto-accept gate | `node .beer/scripts/commands/beer-auto-accept.mjs --gate validating --json` |
| Record guided approval | `node .beer/scripts/commands/beer-approve.mjs phase-plan --json` |
| Refresh the current repo's GitNexus index | `node .beer/bin/beer.mjs index --json` |
| Show dependency status | `node .beer/scripts/commands/beer-dependencies.mjs` |
| Check planning gate | `node .beer/scripts/commands/beer-planning-gate.mjs --route feature` |
| Resolve a configured model profile | `node .beer/scripts/commands/beer-model-profile.mjs --task-kind implement --json` |
| Build the current orchestration plan | `node .beer/scripts/commands/beer-orchestrate.mjs --json` |
| Build spawn-ready worker payloads | `node .beer/scripts/commands/beer-worker-bootstrap.mjs --json` |
| Check pre-edit Beer flow lock manually | `node .beer/scripts/commands/beer-flow-guard.mjs --tool Edit --path src/foo.ts --json` |
| Check review-time quantity and pattern guard manually | `node .beer/scripts/commands/beer-review-guard.mjs --json` |
| Check compounding closeout obligations manually | `node .beer/scripts/commands/beer-closeout-guard.mjs --knowledge-base not-needed --json` |

## Commands While Developing Beer

| Goal | Command |
|---|---|
| Read status | `npm run status` |
| Check auto-accept gate | `npm run auto:accept -- --gate validating --json` |
| Show dependency status | `npm run dependencies` |
| Check planning gate | `npm run planning:gate` |
| Validate links | `npm run check-links -- README.md docs skill-catalog.md` |
| Sync skill inventory | `npm run skills:sync` |

## Notes

- `update` refreshes project-local Beer files from the current package source. It does not update or install a global Beer CLI.
- `init`, `install`, `refresh`, and `update` remove old Beer skills in `./.claude/skills/` and `./.agents/skills/`, reinstall the current set, sync `AGENTS.md` / `CLAUDE.md`, and keep `.beer/bin` current.
- `refresh` updates repo-local managed files in `.beer/` and resyncs Beer skills plus managed guideline files.
- `status` includes the repo-local model-role mapping from `.beer/config.json` so you can confirm orchestrator / coding / research defaults.
- `model-profile` resolves the effective profile for an explicit role or a task kind, so coordinators can choose worker models from repo-local Beer config instead of hardcoding them.
- `orchestrate` reads `.beer/state.json` and `.beer/config.json`, resolves coordinator/worker profiles, and can materialize swarm worker assignments with `--apply`.
- `worker-bootstrap` turns active swarm worker assignments into spawn-ready payloads/prompts for the host runtime.
- The host runtime mapping from those payloads into real worker launches is documented in [docs/host-runtime-contract.md](docs/host-runtime-contract.md).
- Beer installs Claude Code hooks into `.claude/settings.json` so the repo-local flow guard runs automatically on `PreToolUse` for `Edit|MultiEdit|Write`.
- Beer installs Codex hooks into `.codex/hooks.json` and enables repo-local Beer hooks from `.codex/config.toml`.
- Both Claude and Codex get a closeout hook so the repo-local closeout guard blocks closeout when GitNexus refresh or the knowledge-base decision is still missing.
- `approve review` now requires the review-quality guard to pass first, then runs the automatic post-task GitNexus refresh path for the current repo.
- `index` reruns the current repo's GitNexus refresh path manually when needed.
- `uninstall` removes project-local Beer assets, including `.beer/`, the local
  CLI under `.beer/bin`, Beer skills in `.claude/skills` and `.agents/skills`,
  managed instruction blocks, and managed hooks. It does not remove external
  tools such as GitNexus or `bd`.
- In guided workflow runs, use `node .beer/bin/beer.mjs approve <context|phase-plan|execution|review>` to
  record a real manual gate decision instead of editing `.beer/state.json` by
  hand.
- Route, risk, run style, and orchestration strategy now belong to
  `beer:using-beer` during the live agent session, not to a standalone CLI classifier.
- Every task should carry a `history/<feature>/CONTEXT.md`. Keep it compact for
  `small-fix`, repair, and investigation work; reserve `.beer/seed/` for
  feature discovery before the context is locked.
- On Windows, prefer `.\.beer\bin\beer.cmd` to avoid PowerShell execution-policy friction.
