#!/usr/bin/env node

import { readBeerStatus, renderBeerStatus, resolveRepoRoot } from "../beer-state/core.mjs";

function parseCliArgs(argv) {
  const args = {
    repoRoot: undefined,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") {
      args.repoRoot = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--repo-root=")) {
      args.repoRoot = arg.slice("--repo-root=".length);
      continue;
    }
    if (arg === "--json") {
      args.json = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage: beer-status.mjs [--repo-root <path>] [--json]",
          "",
          "Shows a read-only Beer status snapshot from onboarding, state, and handoff files.",
        ].join("\n"),
      );
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  const repoRoot = resolveRepoRoot(args.repoRoot);
  const status = readBeerStatus(repoRoot);

  process.stdout.write(
    args.json ? `${JSON.stringify(status, null, 2)}\n` : `${renderBeerStatus(status)}\n`,
  );
  return 0;
}

if (process.argv[1]) {
  process.exitCode = main();
}
