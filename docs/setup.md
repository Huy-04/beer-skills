# Beer Setup

This page is the detailed setup and onboarding reference for Beer. The root
[README](../README.md) stays short and points here when you need the full flow.

## Standard Setup

Bootstrap Beer into the current repo without installing a global Beer CLI:

```bash
npx --yes --package github:Huy-04/beer-skills beer-skills init
node .beer/bin/beer.mjs --help
```

On Windows, the project-local `.cmd` shim avoids PowerShell execution-policy
friction:

```powershell
.\.beer\bin\beer.cmd status
```

Refresh the current repo after bootstrap:

```bash
node .beer/bin/beer.mjs refresh
```

Onboard a different repo:

```bash
npx --yes --package github:Huy-04/beer-skills beer-skills init --repo-root /path/to/project
```

Beer automatically uses the current repo by default. Use `--repo-root` only when
you want to target a different repo.

For guided workflows, Beer expects each task to carry a `history/<feature>/CONTEXT.md`.
Keep the file compact for `small-fix`, repair, and investigation work. Reserve
`.beer/seed/` for feature or debug discovery before the context is locked.

## What Init Creates

| Path | Purpose |
|---|---|
| `.beer/onboarding.json` | onboarding metadata |
| `.beer/state.json` | authoritative workflow state |
| `.beer/STATE.md` | human-readable state summary |
| `.beer/config.json` | repo-local Beer configuration |
| `.beer/scripts/` | managed script snapshot |
| `.beer/skills/` | synced skills for the target repo |
| `.beer/bin/` | project-local Beer CLI shims; removed by `uninstall` |
| `.claude/skills/` | Beer skills for Claude Code discovery; Beer removes old Beer skills first, then reinstalls the current set |
| `.agents/skills/` | Beer skills for Codex discovery; Beer removes old Beer skills first, then reinstalls the current set |
| `.claude/settings.json` | managed Beer Claude Code hooks for pre-edit flow lock and closeout guard |
| `.codex/config.toml` | managed Codex feature toggle enabling repo-local Beer hooks |
| `.codex/hooks.json` | managed Codex hook definitions for pre-edit flow lock and closeout guard |
| `AGENTS.md` | managed `beer-agent-guidelines` block for agent-facing repo rules |
| `CLAUDE.md` | managed `beer-agent-guidelines` block for Claude-facing repo rules |

`init`, `refresh`, `install`, and `update` all resync Beer skills into `.claude/skills` and `.agents/skills`, sync the Beer-managed block inside `AGENTS.md` and `CLAUDE.md`, refresh `.beer/bin`, refresh the managed Beer hook entries in `.claude/settings.json`, and refresh the managed Codex hook/config entries in `.codex/`.

## Custom Model Roles

Beer now keeps repo-local model-role preferences in `.beer/config.json`:

```json
{
  "models": {
    "orchestrator": { "model": "gpt-5.4", "reasoning_effort": "high" },
    "coding": { "model": "gpt-5.3-codex", "reasoning_effort": "high" },
    "research_synthesis": { "model": "gpt-5.4-mini", "reasoning_effort": "medium" }
  }
}
```

Edit these values when you want a repo to prefer different models by role.
Beer treats them as the default runtime contract for:

- orchestration and phase control
- coding and implementation workers
- search, reading, and synthesis-heavy tasks

`node .beer/bin/beer.mjs status` prints the active role mapping so you can confirm the repo-local configuration quickly.
Use `node .beer/bin/beer.mjs model-profile --role coding --json` or `node .beer/bin/beer.mjs model-profile --task-kind search --json`
when the coordinator needs the effective worker profile for a concrete task shape.
Use `node .beer/bin/beer.mjs orchestrate --json` to see the current coordinator decision, or
`node .beer/bin/beer.mjs orchestrate --apply --json` to materialize worker assignments for a swarm-approved slice.
Use `node .beer/bin/beer.mjs worker-bootstrap --json` to emit spawn-ready worker payloads, then
follow the [Host Runtime Contract](host-runtime-contract.md) when a host runtime
is responsible for the actual subagent launch.

## Tooling Options

`init` does not install external tools. Install tools only when explicitly
requested:

```bash
node .beer/bin/beer.mjs install gitnexus
node .beer/bin/beer.mjs install beads
```

After GitNexus is installed, index the repo:

```bash
npx gitnexus analyze
```

## Full Toolchain Commands

Beer toolchain install runs:

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
