#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { assessReviewQuality } from "../beer-session/review-quality-guard.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);

export { assessReviewQuality } from "../beer-session/review-quality-guard.mjs";

export function renderReviewQuality(result) {
  const metrics = result.metrics || {};
  const areas = Array.isArray(metrics.implementation_areas) && metrics.implementation_areas.length > 0
    ? metrics.implementation_areas.join(", ")
    : "(none)";
  return [
    "Beer Review Guard",
    `Repo: ${result.repo_root}`,
    `Decision: ${result.ok ? "ALLOW" : "BLOCK"}`,
    `Code: ${result.code}`,
    `Reason: ${result.summary}`,
    `Code quantity: ${result.code_quantity_status || "(none)"}`,
    `Pattern: ${result.pattern_status || "(none)"}`,
    `Reviewed files: ${metrics.changed_files || 0}`,
    `Changed lines: ${metrics.total_lines || 0}`,
    `Implementation areas: ${areas}`,
    "",
    "Next steps:",
    ...(result.next_steps.length > 0 ? result.next_steps.map((step) => `- ${step}`) : ["- (none)"]),
  ].join("\n");
}

function parseCliArgs(argv) {
  const args = { repoRoot: undefined, json: false };
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
      process.stdout.write([
        "Usage: beer-review-guard.mjs [--repo-root <path>] [--json]",
        "",
        "Checks review-time code quantity and pattern spread against the current Beer strategy.",
      ].join("\n"));
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  const result = assessReviewQuality({ repoRoot: args.repoRoot });
  process.stdout.write(args.json ? `${JSON.stringify(result, null, 2)}\n` : `${renderReviewQuality(result)}\n`);
  return result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
