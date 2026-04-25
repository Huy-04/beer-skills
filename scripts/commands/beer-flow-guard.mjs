#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { assessFlowGuard } from "../beer-session/flow-guard.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);

function parseCliArgs(argv) {
  const args = {
    repoRoot: undefined,
    json: false,
    tool: "",
    trivial: false,
    paths: [],
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
    if (arg === "--tool") {
      args.tool = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (arg.startsWith("--tool=")) {
      args.tool = arg.slice("--tool=".length);
      continue;
    }
    if (arg === "--path") {
      args.paths.push(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg.startsWith("--path=")) {
      args.paths.push(arg.slice("--path=".length));
      continue;
    }
    if (arg === "--trivial") {
      args.trivial = true;
      continue;
    }
    if (arg === "--json") {
      args.json = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage: beer-flow-guard.mjs [--repo-root <path>] [--tool <name>] [--path <file>]... [--trivial] [--json]",
          "",
          "Returns ALLOW/BLOCK for Beer flow-locked edit operations.",
        ].join("\n"),
      );
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function renderDecision(decision) {
  const lines = [decision.allow ? "ALLOW" : "BLOCK", decision.summary];

  if (decision.active_skill) {
    lines.push(`Active skill: ${decision.active_skill}`);
  }

  if (decision.target_files?.length) {
    lines.push(`Target files: ${decision.target_files.join(", ")}`);
  }

  if (!decision.allow && decision.recommended_actions?.length) {
    lines.push("Recommended actions:");
    for (const action of decision.recommended_actions) {
      lines.push(`- ${action}`);
    }
  }

  return lines.join("\n");
}

export function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  const decision = assessFlowGuard({
    repoRoot: args.repoRoot,
    tool: args.tool,
    paths: args.paths,
    trivial: args.trivial,
  });

  process.stdout.write(args.json ? `${JSON.stringify(decision, null, 2)}\n` : `${renderDecision(decision)}\n`);
  return decision.allow ? 0 : 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
