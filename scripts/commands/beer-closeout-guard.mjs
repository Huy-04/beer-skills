#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { assessCloseoutGuard } from "../beer-session/closeout-guard.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);

function parseCliArgs(argv) {
  const args = {
    repoRoot: undefined,
    json: false,
    knowledgeBase: "",
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
    if (arg === "--knowledge-base") {
      args.knowledgeBase = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (arg.startsWith("--knowledge-base=")) {
      args.knowledgeBase = arg.slice("--knowledge-base=".length);
      continue;
    }
    if (arg === "--json") {
      args.json = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage: beer-closeout-guard.mjs [--repo-root <path>] [--knowledge-base <not-needed|approved|declined|refreshed>] [--json]",
          "",
          "Checks whether Beer closeout obligations are recorded before compounding finishes.",
          "The approved generated Docs status is intermediate; final closeout requires refreshed, declined, or not-needed.",
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

  if (decision.state?.gitnexus_refresh_status) {
    lines.push(`GitNexus refresh: ${decision.state.gitnexus_refresh_status}`);
  }

  if (decision.state?.knowledge_base_refresh_status) {
    lines.push(`Generated Docs refresh: ${decision.state.knowledge_base_refresh_status}`);
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
  const decision = assessCloseoutGuard({
    repoRoot: args.repoRoot,
    knowledgeBase: args.knowledgeBase,
  });

  process.stdout.write(args.json ? `${JSON.stringify(decision, null, 2)}\n` : `${renderDecision(decision)}\n`);
  return decision.allow ? 0 : 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
