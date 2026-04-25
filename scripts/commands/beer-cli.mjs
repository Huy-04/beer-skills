#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { assessAutoAccept, renderAutoAccept } from "./beer-auto-accept.mjs";
import { main as closeoutGuardMain } from "./beer-closeout-guard.mjs";
import { buildBeerDependencyReport } from "./beer-dependencies.mjs";
import { main as flowGuardMain } from "./beer-flow-guard.mjs";
import { main as reviewGuardMain } from "./beer-review-guard.mjs";
import { parseCliArgs } from "../beer-cli/args.mjs";
import { printHelp } from "../beer-cli/help.mjs";
import { runCheckTools } from "../beer-cli/check-tools.mjs";
import { runBeerIndex } from "../beer-cli/index.mjs";
import { runRefresh } from "../beer-cli/refresh.mjs";
import { runInit } from "../beer-cli/init.mjs";
import { runInstall } from "../beer-cli/install.mjs";
import { runUninstall } from "../beer-cli/uninstall.mjs";
import { runUpdate } from "../beer-cli/update.mjs";
import { recordApproval, renderApproval } from "./beer-approve.mjs";
import { resolveRepoRoot as resolveOnboardRepoRoot } from "./onboard-beer.mjs";
import { main as planningGateMain } from "./beer-planning-gate.mjs";
import { readBeerStatus, renderBeerStatus } from "../beer-state/core.mjs";

function runCheckToolsWrapped(args) {
  return runCheckTools(args);
}

function runInstallWrapped(args) {
  return runInstall(args);
}

function runStatus(args) {
  const repoRoot = resolveOnboardRepoRoot(args.repoRoot);
  const status = readBeerStatus(repoRoot);
  process.stdout.write(args.json ? `${JSON.stringify(status, null, 2)}\n` : `${renderBeerStatus(status)}\n`);
  return 0;
}

function runDependencies(args) {
  const report = buildBeerDependencyReport({
    repoRoot: resolveOnboardRepoRoot(args.repoRoot),
  });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return 0;
}

function runApprove(args) {
  const result = recordApproval({
    repoRoot: args.repoRoot,
    approval: args.approval,
  });
  process.stdout.write(args.json ? `${JSON.stringify(result, null, 2)}\n` : `${renderApproval(result)}\n`);
  return result.ok ? 0 : 1;
}

function runAutoAccept(args) {
  const result = assessAutoAccept({
    repoRoot: args.repoRoot,
    gate: args.gate,
  });
  process.stdout.write(args.json ? `${JSON.stringify(result, null, 2)}\n` : `${renderAutoAccept(result)}\n`);
  return result.allow ? 0 : 1;
}

function runPlanningGate(args) {
  const gateArgs = [];
  if (args.repoRoot) {
    gateArgs.push("--repo-root", args.repoRoot);
  }
  if (args.json) {
    gateArgs.push("--json");
  }
  if (args.route) {
    gateArgs.push("--route", args.route);
  }
  return planningGateMain(gateArgs);
}

function runFlowGuard(args) {
  const guardArgs = [];
  if (args.repoRoot) {
    guardArgs.push("--repo-root", args.repoRoot);
  }
  if (args.tool) {
    guardArgs.push("--tool", args.tool);
  }
  for (const filePath of args.paths || []) {
    guardArgs.push("--path", filePath);
  }
  if (args.trivial) {
    guardArgs.push("--trivial");
  }
  if (args.json) {
    guardArgs.push("--json");
  }
  return flowGuardMain(guardArgs);
}

function runCloseoutGuard(args) {
  const guardArgs = [];
  if (args.repoRoot) {
    guardArgs.push("--repo-root", args.repoRoot);
  }
  if (args.knowledgeBase) {
    guardArgs.push("--knowledge-base", args.knowledgeBase);
  }
  if (args.json) {
    guardArgs.push("--json");
  }
  return closeoutGuardMain(guardArgs);
}

function runReviewGuard(args) {
  const guardArgs = [];
  if (args.repoRoot) {
    guardArgs.push("--repo-root", args.repoRoot);
  }
  if (args.json) {
    guardArgs.push("--json");
  }
  return reviewGuardMain(guardArgs);
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);

  switch (args.command) {
    case "init":
      return runInit(args);
    case "update":
      return runUpdate(args);
    case "refresh":
      return runRefresh(args);
    case "uninstall":
      return runUninstall(args);
    case "approve":
      return runApprove(args);
    case "check-tools":
      return runCheckToolsWrapped(args);
    case "install":
      return runInstallWrapped(args);
    case "index":
      return runBeerIndex(args);
    case "status":
      return runStatus(args);
    case "auto-accept":
      return runAutoAccept(args);
    case "dependencies":
      return runDependencies(args);
    case "planning-gate":
      return runPlanningGate(args);
    case "flow-guard":
      return runFlowGuard(args);
    case "closeout-guard":
      return runCloseoutGuard(args);
    case "review-guard":
      return runReviewGuard(args);
    case "help":
    default:
      printHelp();
      return 0;
  }
}

const entryHref = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";

if (
  entryHref === import.meta.url ||
  process.argv[1]?.toLowerCase().includes("beer-skills")
) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    },
  );
}
