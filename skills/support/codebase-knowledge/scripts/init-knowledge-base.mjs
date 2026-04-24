#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const DEFAULT_AREAS = [
  "code-patterns",
  "folder-structure",
  "business-rules",
  "architecture",
  "dependencies",
  "conventions",
  "critical-sections",
];

function parseArgs(argv) {
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

function printHelp() {
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

function ensureDirs(root) {
  fs.mkdirSync(root, { recursive: true });
  for (const area of DEFAULT_AREAS) {
    fs.mkdirSync(path.join(root, area), { recursive: true });
  }
}

function buildMetadata(args) {
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
    source_path: args.sourcePath,
    stats: {
      files_scanned: args.filesScanned,
      patterns_detected: 0,
      analysis_lanes: 7,
    },
    confidence_summary: {
      high: 0,
      medium: 0,
      low: 0,
    },
    notes,
  };
}

function buildIndex() {
  return {
    version: "1.0",
    generated_at: new Date().toISOString(),
    stats: {
      total_files: 0,
      code_patterns: 0,
      business_rules: 0,
      critical_sections: 0,
    },
    entries: [],
    conventions: {},
    critical_files: [],
    search_index: {},
  };
}

function buildReadme(args) {
  return [
    "# Knowledge Base",
    "",
    `Generated from \`${args.sourcePath}\`.`,
    "",
    "- Current source remains authoritative.",
    "- Commit policy: `local-cache-by-default`.",
    `- Invocation reason: \`${args.invocationReason}\`.`,
    `- Scan scope: \`${args.scanScope}\`.`,
    "- Populate area markdown files before treating the cache as useful.",
    "",
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  ensureDirs(args.outputRoot);

  writeJson(path.join(args.outputRoot, "00-metadata.json"), buildMetadata(args));
  writeJson(path.join(args.outputRoot, "index.json"), buildIndex());
  fs.writeFileSync(path.join(args.outputRoot, "README.md"), buildReadme(args), "utf8");

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
}

main();
