#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildBeerPreflightReport } from "./beer-preflight.mjs";
import { readBeerStatus, resolveRepoRoot } from "../beer-state/core.mjs";
import { assessAutoAcceptGate } from "../beer-auto-accept/policy.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);

export { assessAutoAcceptGate } from "../beer-auto-accept/policy.mjs";

export function assessAutoAccept(options = {}) {
  const repoRoot = resolveRepoRoot(options.repoRoot);
  const status = readBeerStatus(repoRoot);
  const preflight = buildBeerPreflightReport(repoRoot);
  const gate = options.gate || "validating";
  return {
    repo_root: repoRoot,
    gate,
    ...assessAutoAcceptGate({ gate, status, preflight }),
    state: {
      route: status.state_json.route,
      risk: status.state_json.risk,
      run_style: status.state_json.run_style,
      orchestration_strategy: status.state_json.orchestration_strategy,
      execution_target: status.state_json.execution_target,
      contract_verified: status.state_json.contract_verified,
      approved_gates: status.state_json.approved_gates,
      validation_status: status.state_json.validation_status,
      validator_status: status.state_json.validator_status,
      verification_status: status.state_json.verification_status,
      gitnexus_refresh_status: status.state_json.gitnexus_refresh_status,
      code_quantity_status: status.state_json.code_quantity_status,
      pattern_status: status.state_json.pattern_status,
      review_quality_status: status.state_json.review_quality_status,
      review_status: status.state_json.review_status,
      knowledge_base_refresh_status: status.state_json.knowledge_base_refresh_status,
      open_findings_count: status.state_json.open_findings_count,
    },
  };
}

export function renderAutoAccept(result) {
  return [
    "Beer Auto-Accept Gate",
    `Repo: ${result.repo_root}`,
    `Gate: ${result.gate}`,
    `Decision: ${result.allow ? "ALLOW" : "BLOCK"}`,
    `Code: ${result.code}`,
    `Reason: ${result.summary}`,
    "",
    "Next steps:",
    ...(result.next_steps.length > 0 ? result.next_steps.map((step) => `- ${step}`) : ["- (none)"]),
  ].join("\n");
}

function parseCliArgs(argv) {
  const args = { repoRoot: undefined, gate: "validating", json: false };
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
    if (arg === "--gate") {
      args.gate = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (arg.startsWith("--gate=")) {
      args.gate = arg.slice("--gate=".length);
      continue;
    }
    if (arg === "--json") {
      args.json = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write([
        "Usage: beer-auto-accept.mjs [--repo-root <path>] [--gate planning|validating|swarming|reviewing|compounding] [--json]",
        "",
        "Evaluates whether a Beer gate may auto-advance for run_style=go or auto_accept policy.",
      ].join("\n"));
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  const result = assessAutoAccept(args);
  process.stdout.write(args.json ? `${JSON.stringify(result, null, 2)}\n` : `${renderAutoAccept(result)}\n`);
  return result.allow ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
