# Beer Commands

This page is the command reference for Beer. The root
[README](README.md) stays focused on installation, onboarding, workflow
overview, and where to go next.

## Global Package

Install or update Beer globally:

```bash
npm install -g github:Huy-04/beer-skills
beer update
```

## Main CLI

| Command | Use it for |
|---|---|
| `beer init` | onboard the current repo and create `.beer/` |
| `beer refresh` | refresh Beer-managed files in the current repo |
| `beer uninstall --yes` | remove `.beer/` from the current repo |
| `beer approve <context|phase-plan|execution|review>` | record a manual gate approval in guided mode |
| `beer post-task-refresh` | rerun the current repo's GitNexus post-task refresh path |
| `beer check-tools` | check whether `bd`, GitNexus MCP, and the GitNexus index are available |
| `beer install gitnexus` | install GitNexus setup |
| `beer install beads` | install `bd` |
| `beer status` | read current Beer state for a repo |
| `beer auto-accept --gate <gate> --json` | check whether a gate may auto-advance |
| `beer dependencies` | print dependency status for the current bundle |
| `beer planning-gate --route <route> --json` | check whether planning may proceed |

Use `--repo-root /path/to/project` only when you want to target a different repo
than the current working directory.

## Package Commands

Use these when Beer is not installed globally:

| Goal | Command |
|---|---|
| Init the current repo | `npx --yes --package github:Huy-04/beer-skills beer-skills init` |
| Refresh managed repo files | `npx --yes --package github:Huy-04/beer-skills beer-skills refresh` |
| Remove Beer from the current repo | `npx --yes --package github:Huy-04/beer-skills beer-skills uninstall --yes` |
| Read repo status | `npx --yes --package github:Huy-04/beer-skills beer-skills status --json` |
| Check auto-accept gate | `npx --yes --package github:Huy-04/beer-skills beer-skills auto-accept --gate validating --json` |
| Record guided approval | `npx --yes --package github:Huy-04/beer-skills beer-skills approve phase-plan --json` |
| Rerun post-task GitNexus refresh | `npx --yes --package github:Huy-04/beer-skills beer-skills post-task-refresh --json` |
| Show dependency status | `npx --yes --package github:Huy-04/beer-skills beer-skills dependencies` |
| Check planning gate | `npx --yes --package github:Huy-04/beer-skills beer-skills planning-gate --route feature --json` |

## Commands Inside an Onboarded Repo

| Goal | Command |
|---|---|
| Refresh Beer files | `node .beer/scripts/commands/beer-cli.mjs refresh` |
| Read status JSON | `node .beer/scripts/commands/beer-status.mjs --json` |
| Check auto-accept gate | `node .beer/scripts/commands/beer-auto-accept.mjs --gate validating --json` |
| Record guided approval | `node .beer/scripts/commands/beer-approve.mjs phase-plan --json` |
| Rerun post-task GitNexus refresh | `node .beer/scripts/commands/beer-cli.mjs post-task-refresh --json` |
| Show dependency status | `node .beer/scripts/commands/beer-dependencies.mjs` |
| Check planning gate | `node .beer/scripts/commands/beer-planning-gate.mjs --route feature` |

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

- `beer update` updates the global Beer package from GitHub.
- `beer refresh` updates repo-local managed files in `.beer/`.
- `beer approve review` also runs the automatic post-task GitNexus refresh path for the current repo.
- `beer post-task-refresh` reruns that GitNexus refresh path manually when needed.
- `beer uninstall` removes `.beer/` only. It does not remove global tools such
  as GitNexus or `bd`.
- In guided mode, use `beer approve <context|phase-plan|execution|review>` to
  record a real manual gate decision instead of editing `.beer/state.json` by
  hand.
- Mode, risk, and first-route selection now belong to `beer:using-beer` during
  the live agent session, not to a standalone CLI classifier.
- Every task should carry a `history/<feature>/CONTEXT.md`. Keep it compact for
  `small-fix` and `debug-escalation`; reserve `.beer/seed/` for feature/debug
  discovery before the context is locked.
- On Windows PowerShell, `beer` resolves through `beer.ps1`. Set
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` so the CLI can run.
