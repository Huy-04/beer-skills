#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_AREAS = [
  "architecture",
  "backend",
  "frontend",
  "boundaries",
  "critical-flows",
  "conventions",
];

export function parseArgs(argv) {
  const args = {
    outputRoot: "",
    sourcePath: "",
    generatedFromCommit: "unknown-git-unavailable",
    mode: "manual",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "not-used",
    filesScanned: 0,
    note: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--output-root") {
      args.outputRoot = next;
      index += 1;
      continue;
    }
    if (arg.startsWith("--output-root=")) {
      args.outputRoot = arg.slice("--output-root=".length);
      continue;
    }
    if (arg === "--source-path") {
      args.sourcePath = next;
      index += 1;
      continue;
    }
    if (arg.startsWith("--source-path=")) {
      args.sourcePath = arg.slice("--source-path=".length);
      continue;
    }
    if (arg === "--generated-from-commit") {
      args.generatedFromCommit = next;
      index += 1;
      continue;
    }
    if (arg.startsWith("--generated-from-commit=")) {
      args.generatedFromCommit = arg.slice("--generated-from-commit=".length);
      continue;
    }
    if (arg === "--mode") {
      args.mode = next;
      index += 1;
      continue;
    }
    if (arg.startsWith("--mode=")) {
      args.mode = arg.slice("--mode=".length);
      continue;
    }
    if (arg === "--invocation-reason") {
      args.invocationReason = next;
      index += 1;
      continue;
    }
    if (arg.startsWith("--invocation-reason=")) {
      args.invocationReason = arg.slice("--invocation-reason=".length);
      continue;
    }
    if (arg === "--scan-scope") {
      args.scanScope = next;
      index += 1;
      continue;
    }
    if (arg.startsWith("--scan-scope=")) {
      args.scanScope = arg.slice("--scan-scope=".length);
      continue;
    }
    if (arg === "--gitnexus-status") {
      args.gitnexusStatus = next;
      index += 1;
      continue;
    }
    if (arg.startsWith("--gitnexus-status=")) {
      args.gitnexusStatus = arg.slice("--gitnexus-status=".length);
      continue;
    }
    if (arg === "--files-scanned") {
      args.filesScanned = Number.parseInt(next, 10) || 0;
      index += 1;
      continue;
    }
    if (arg.startsWith("--files-scanned=")) {
      args.filesScanned = Number.parseInt(arg.slice("--files-scanned=".length), 10) || 0;
      continue;
    }
    if (arg === "--note") {
      args.note.push(next);
      index += 1;
      continue;
    }
    if (arg.startsWith("--note=")) {
      args.note.push(arg.slice("--note=".length));
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.outputRoot) {
    throw new Error("Missing required argument: --output-root");
  }
  if (!args.sourcePath) {
    throw new Error("Missing required argument: --source-path");
  }

  return {
    ...args,
    outputRoot: path.resolve(args.outputRoot),
  };
}

export function printHelp() {
  process.stdout.write(
    [
      "Usage:",
      "  node scripts/init-knowledge-base.mjs --output-root <dir> --source-path <path> [options]",
      "",
      "Options:",
      "  --generated-from-commit <sha|unknown-*>",
      "  --mode <manual|gitnexus-assisted>",
      "  --invocation-reason <user-request|compounding-approved-refresh|explicit-partial-scan>",
      "  --scan-scope <full|partial>",
      "  --gitnexus-status <available|missing|repo-not-indexed|not-used>",
      "  --files-scanned <n>",
      "  --note <text>    Repeatable",
    ].join("\n"),
  );
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function ensureDirs(root) {
  fs.mkdirSync(root, { recursive: true });
  for (const area of DEFAULT_AREAS) {
    fs.mkdirSync(path.join(root, area), { recursive: true });
  }
}

export function buildMetadata(args) {
  const notes = [...args.note];
  if (args.generatedFromCommit.startsWith("unknown-") && notes.length === 0) {
    notes.push("generated_from_commit uses an explicit fallback because Git metadata was unavailable.");
  }

  return {
    version: "1.0",
    generated_at: new Date().toISOString(),
    generated_from_commit: args.generatedFromCommit,
    source_authority: "current repository source",
    commit_policy: "local-cache-by-default",
    invocation_reason: args.invocationReason,
    scan_scope: args.scanScope,
    gitnexus_status: args.gitnexusStatus,
    mode: args.mode,
    strategy: "pattern-first",
    source_path: args.sourcePath,
    discovery: {
      model: "single-writer synthesis",
      lanes: [
        "repo-scout",
        "backend",
        "frontend",
        "boundaries",
      ],
      optional_lanes: [
        "critical-flows",
        "async-patterns",
        "integration-patterns",
      ],
    },
    stats: {
      files_scanned: args.filesScanned,
      patterns_detected: 0,
      docs_generated: 0,
      discovery_lanes: 4,
    },
    confidence_summary: {
      high: 0,
      medium: 0,
      low: 0,
    },
    notes,
  };
}

export function buildIndex() {
  return {
    version: "1.0",
    generated_at: new Date().toISOString(),
    strategy: "pattern-first",
    stats: {
      total_files: 0,
      generated_docs: 0,
      backend_docs: 0,
      frontend_docs: 0,
      boundary_docs: 0,
      critical_flows: 0,
    },
    entries: [],
    dominant_patterns: [],
    task_index: {},
    critical_files: [],
    conventions: {},
    search_index: {},
  };
}

export function buildReadme(args) {
  return [
    "# Knowledge Base",
    "",
    "Pattern-first implementation map for this project.",
    "",
    `Generated from \`${args.sourcePath}\`.`,
    "",
    "- Current source remains authoritative.",
    "- Commit policy: `local-cache-by-default`.",
    `- Invocation reason: \`${args.invocationReason}\`.`,
    `- Scan scope: \`${args.scanScope}\`.`,
    `- Generation strategy: \`pattern-first\` via \`repo-scout -> backend/frontend/boundaries -> single-writer synthesis\`.`,
    "",
    "## Dominant Patterns",
    "",
    "- Fill this section with the recurring implementation patterns that shape the repo.",
    "- Prefer architecture, request lifecycle, module template, and boundary patterns over generic inventories.",
    "",
    "## Start Here By Task",
    "",
    "- Backend feature: `backend/request-lifecycle.md`, `backend/module-template.md`, `conventions/implementation-rules.md`",
    "- Frontend API work: `frontend/app-structure-and-api-access.md`, `boundaries/frontend-backend-proxy.md`",
    "- Auth/session work: `critical-flows/auth-session.md` plus the relevant boundary docs",
    "- Cross-cutting risk: `architecture/system-overview.md` and `critical-flows/`",
    "",
    "## High-Risk Boundaries",
    "",
    "- Frontend/backend proxying, auth/session continuity, middleware order, persistence-to-side-effect transitions, and external integrations belong here once discovered.",
    "",
    "## Generated Docs",
    "",
    "- Required baseline directories: `architecture/`, `backend/`, `frontend/`, `boundaries/`, `critical-flows/`, `conventions/`",
    "- Optional docs should only be generated when the repository actually shows the pattern.",
    "",
    "## Source Of Truth",
    "",
    "- This cache is advisory. If any entry drifts from current code, trust the repository source and refresh the cache.",
    "",
  ].join("\n");
}

export function initializeKnowledgeBase(args) {
  ensureDirs(args.outputRoot);
  writeJson(path.join(args.outputRoot, "00-metadata.json"), buildMetadata(args));
  writeJson(path.join(args.outputRoot, "index.json"), buildIndex());
  fs.writeFileSync(path.join(args.outputRoot, "README.md"), buildReadme(args), "utf8");
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  initializeKnowledgeBase(args);

  process.stdout.write(
    [
      `Initialized knowledge base at ${args.outputRoot}`,
      `Source path: ${args.sourcePath}`,
      `generated_from_commit: ${args.generatedFromCommit}`,
      `mode: ${args.mode}`,
      `invocation_reason: ${args.invocationReason}`,
      `scan_scope: ${args.scanScope}`,
    ].join("\n") + "\n",
  );
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  process.exitCode = main();
}
