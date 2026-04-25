#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { readBeerConfig, resolveRepoRoot } from "../beer-state/core.mjs";
import { renderModelProfileResolution, resolveModelProfile } from "../beer-state/model-profiles.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);

function parseCliArgs(argv) {
  const args = {
    repoRoot: undefined,
    role: undefined,
    taskKind: undefined,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") { args.repoRoot = argv[index + 1]; index += 1; continue; }
    if (arg.startsWith("--repo-root=")) { args.repoRoot = arg.slice("--repo-root=".length); continue; }
    if (arg === "--role") { args.role = argv[index + 1]; index += 1; continue; }
    if (arg.startsWith("--role=")) { args.role = arg.slice("--role=".length); continue; }
    if (arg === "--task-kind") { args.taskKind = argv[index + 1]; index += 1; continue; }
    if (arg.startsWith("--task-kind=")) { args.taskKind = arg.slice("--task-kind=".length); continue; }
    if (arg === "--json") { args.json = true; continue; }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write([
        "Usage: beer-model-profile.mjs [--repo-root <path>] [--role <role>] [--task-kind <kind>] [--json]",
        "",
        "Resolves the Beer-configured model profile for a coordinator or worker role.",
        "  --role <name>        Explicit role: orchestrator, coding, research_synthesis",
        "  --task-kind <kind>   Infer role from work kind: search, summarize, implement, fix, review, etc.",
        "  --json               Print JSON",
      ].join("\n"));
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

export function resolveConfiguredModelProfile(options = {}) {
  const repoRoot = resolveRepoRoot(options.repoRoot);
  const config = readBeerConfig(repoRoot);
  return {
    repo_root: repoRoot,
    ...resolveModelProfile(config, {
      role: options.role,
      taskKind: options.taskKind,
    }),
  };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  const result = resolveConfiguredModelProfile(args);
  process.stdout.write(args.json ? `${JSON.stringify(result, null, 2)}\n` : `${renderModelProfileResolution(result)}\n`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
