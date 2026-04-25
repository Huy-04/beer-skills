# Beer Setup

This page is the detailed setup and onboarding reference for Beer. The root
[README](../README.md) stays short and points here when you need the full flow.

## Standard Setup

Install Beer globally from GitHub:

```bash
npm install -g github:Huy-04/beer-skills
beer --help
```

On Windows PowerShell, `beer` resolves through `beer.ps1`. Set this once for
the current user so the CLI can run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Onboard the current repo:

```bash
beer init
```

Onboard a different repo:

```bash
beer init --repo-root /path/to/project
```

Install Beer slash commands for Claude Code in the current repo:

```bash
beer claude install
```

This creates commands like `/beer-using-beer` and `/beer-execution-guardrails`
inside `.claude/commands/`.

Install Beer slash commands for Claude Code globally:

```bash
beer claude install --global
```

Install both project and user Claude slash commands in one run:

```bash
beer claude install --all
```

Beer automatically uses the current repo by default. Use `--repo-root` only when
you want to target a different repo.

For guided workflows, Beer expects each task to carry a `history/<feature>/CONTEXT.md`.
Keep the file compact for `small-fix` and `debug-escalation` routes. Reserve
`.beer/seed/` for feature or debug discovery before the context is locked.

## What `beer init` Creates

| Path | Purpose |
|---|---|
| `.beer/onboarding.json` | onboarding metadata |
| `.beer/state.json` | authoritative workflow state |
| `.beer/STATE.md` | human-readable state summary |
| `.beer/config.json` | repo-local Beer configuration |
| `.beer/scripts/` | managed script snapshot |
| `.beer/skills/` | synced skills for the target repo |

`beer claude install` is separate from `beer init`. It manages Claude Code
slash-command files:

| Target | Path |
|---|---|
| Project commands | `./.claude/commands/beer-*.md` |
| User commands | `~/.claude/commands/beer-*.md` |

## Tooling Options

During `beer init`, Beer asks whether to install the full toolchain.

| Choice | Result |
|---|---|
| `y` | run full tool install |
| `n` | keep minimal setup and install tools later |

Install tools later with:

```bash
beer install gitnexus
beer install beads
```

After GitNexus is installed, index the repo:

```bash
npx gitnexus analyze
```

## Automation Modes

| Mode | Command |
|---|---|
| Minimal | `beer init --minimal` |
| Full | `beer init --full` |

Beer only runs the full installer when `bash` and `curl` are available. If not,
it prints the official install command and leaves the repo in minimal mode.

On Windows, `C:\Windows\System32\bash.exe` can exist even when WSL has no Linux
distribution installed. Beer treats that as not usable for the full installer.
Install Git Bash or a working WSL distro, then rerun `--full` or run the
printed installer command manually.

## Full Toolchain Commands

Beer `--full` mode installs:

```bash
npx -y gitnexus@latest setup
npm install -g @beads/bd
```

Use those commands directly if you prefer to manage tools outside the Beer CLI.

## Dependency Tiers

Beer uses the highest viable route supported by the current machine.

| Route | Minimum dependency set |
|---|---|
| Onboarding or status only | `node` |
| Small guided path | `node` |
| Standard path | `node` + `bd` |
| Swarm execution path | `node` + `bd` |
| Graph-augmented work | configured GitNexus MCP server plus an indexed repo |

Preflight reports GitNexus in two parts:

- `GitNexus MCP`: Codex or another MCP client can see the `gitnexus` server.
- `GitNexus index`: the target repo appears indexed locally. If this is missing,
  run `npx gitnexus analyze` from the repo root.

## Local Checkout Development

If this repo is already checked out locally, onboard a target repo directly:

```bash
node /path/to/beer-skills/scripts/commands/onboard-beer.mjs --repo-root /path/to/project --apply
```

## Codex Plugin Install

This repo ships local plugin metadata for Codex, so Codex can use the
repository as a plugin source.

Add this local checkout as a marketplace root:

```bash
codex plugin marketplace add /path/to/beer-skills
```

Local marketplace metadata is stored in
[.agents/plugins/marketplace.json](../.agents/plugins/marketplace.json).

Codex plugin installation registers the Beer skills and plugin metadata. Repo
bootstrap still uses the same `npx` entrypoint:

```bash
npx --yes --package github:Huy-04/beer-skills beer-skills init --repo-root /path/to/project
```
