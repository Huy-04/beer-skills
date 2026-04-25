#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveRepoRoot } from "../beer-state/core.mjs";
import { buildWorkerBootstrap, renderWorkerBootstrap } from "../beer-session/worker-bootstrap.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);

function parseCliArgs(argv) {
  const args = {
    repoRoot: undefined,
    json: false,
    apply: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") { args.repoRoot = argv[index + 1]; index += 1; continue; }
    if (arg.startsWith("--repo-root=")) { args.repoRoot = arg.slice("--repo-root=".length); continue; }
    if (arg === "--json") { args.json = true; continue; }
    if (arg === "--apply") { args.apply = true; continue; }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write([
        "Usage: beer-worker-bootstrap.mjs [--repo-root <path>] [--apply] [--json]",
        "",
        "Builds spawn-ready worker bootstrap payloads from Beer swarm state.",
      ].join("\n"));
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  const repoRoot = resolveRepoRoot(args.repoRoot);
  const result = buildWorkerBootstrap(repoRoot, { apply: args.apply });
  process.stdout.write(args.json ? `${JSON.stringify(result, null, 2)}\n` : `${renderWorkerBootstrap(result)}\n`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
