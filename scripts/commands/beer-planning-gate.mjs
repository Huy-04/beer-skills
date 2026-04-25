#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { assessPlanningGate, readBeerStatus, resolveRepoRoot } from "../beer-state/core.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(SCRIPT_PATH);

function parseCliArgs(argv) {
  const args = {
    repoRoot: undefined,
    json: false,
    route: undefined,
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
    if (arg === "--route") {
      args.route = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--route=")) {
      args.route = arg.slice("--route=".length);
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage: beer-planning-gate.mjs [--repo-root <path>] [--route <feature|small-fix|debug-escalation>] [--json]",
          "",
          "Checks whether Beer planning may proceed for a route.",
          "",
          "Options:",
          "  --route <feature|small-fix|debug-escalation>",
        ].join("\n"),
      );
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

export function renderPlanningGate(result, repoRoot) {
  const statusLabel = result.ok ? "ready" : "blocked";
  const lines = [
    "Beer Planning Gate",
    `Repo: ${repoRoot}`,
    `Status: ${statusLabel}`,
    `Route: ${result.route || "feature"}`,
    `Context: ${result.context_stage || "none"}`,
    `Context path: ${result.context_path || "(none)"}`,
    `Reason: ${result.summary}`,
    "",
    "Next steps:",
    ...result.next_steps.map((item) => `- ${item}`),
  ];

  return lines.join("\n");
}

export function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  const repoRoot = resolveRepoRoot(args.repoRoot);
  const status = readBeerStatus(repoRoot);
  const result = assessPlanningGate(status, { route: args.route });
  const output = {
    repo_root: repoRoot,
    ...result,
  };

  process.stdout.write(
    args.json ? `${JSON.stringify(output, null, 2)}\n` : `${renderPlanningGate(result, repoRoot)}\n`,
  );
  return result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
