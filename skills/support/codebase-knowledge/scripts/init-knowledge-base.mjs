#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DEFAULT_OUTPUT_ROOT = "Docs";

const DOC_PATHS = {
  repoFlow: "Flows/repo-flow.md",
  architectureOverview: "Architecture/system-overview.md",
  implementationRules: "Conventions/implementation-rules.md",
  cliEntrypoints: "CriticalFlows/cli-entrypoints-and-onboarding.md",
  workflowRouting: "CriticalFlows/workflow-routing.md",
  commandBoundary: "Boundaries/command-entrypoints-and-state.md",
  frontendBackendBoundary: "Boundaries/frontend-backend-proxy.md",
};

const LEGACY_DOC_PATHS = new Map([
  ["flows/repo-flow.md", DOC_PATHS.repoFlow],
  ["architecture/system-overview.md", DOC_PATHS.architectureOverview],
  ["conventions/implementation-rules.md", DOC_PATHS.implementationRules],
  ["critical-flows/cli-entrypoints-and-onboarding.md", DOC_PATHS.cliEntrypoints],
  ["critical-flows/workflow-routing.md", DOC_PATHS.workflowRouting],
  ["boundaries/command-entrypoints-and-state.md", DOC_PATHS.commandBoundary],
  ["backend/request-lifecycle.md", "Backend/request-lifecycle.md"],
  ["frontend/app-structure-and-api-access.md", "Frontend/app-structure-and-api-access.md"],
  ["boundaries/frontend-backend-proxy.md", DOC_PATHS.frontendBackendBoundary],
]);

const IGNORED_DIR_NAMES = new Set([
  ".beer",
  ".git",
  ".hg",
  ".svn",
  ".next",
  ".turbo",
  ".cache",
  ".idea",
  ".vscode",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "tmp",
  "temp",
]);

const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".conf",
  ".config",
  ".css",
  ".cs",
  ".go",
  ".html",
  ".java",
  ".js",
  ".json",
  ".jsx",
  ".mjs",
  ".md",
  ".py",
  ".rb",
  ".rs",
  ".sh",
  ".sql",
  ".svelte",
  ".ts",
  ".tsx",
  ".txt",
  ".vue",
  ".xml",
  ".yaml",
  ".yml",
]);

const SOURCE_CODE_EXTENSIONS = new Set([
  ".cjs",
  ".cs",
  ".go",
  ".java",
  ".js",
  ".jsx",
  ".mjs",
  ".py",
  ".rb",
  ".rs",
  ".svelte",
  ".ts",
  ".tsx",
  ".vue",
]);

const TEXT_BASENAMES = new Set([
  "dockerfile",
  "makefile",
  "package-lock.json",
  "package.json",
  "pnpm-lock.yaml",
  "readme",
  "tsconfig.json",
  "yarn.lock",
]);

const SNIPPET_HINT_PATTERNS = [
  /\bexport\b/,
  /\bfunction\b/,
  /\bclass\b/,
  /\brouter\./,
  /\bapp\.(get|post|put|delete|patch)\(/,
  /\bfetch\(/,
  /\bconst\b/,
  /\breturn\b/,
];

const PATH_MARKERS = {
  backend: [
    /(^|\/)(api|server|backend|routes|route|controllers?|handlers?|middleware)(\/|$)/i,
    /(^|\/)(services?|repositories?|domain|application|infrastructure)(\/|$)/i,
  ],
  frontend: [
    /(^|\/)(frontend|client|web|ui|components?|pages|hooks|composables|views|app)(\/|$)/i,
    /\.(jsx|tsx|vue|svelte)$/i,
  ],
  boundary: [
    /(^|\/)(proxy|gateway|middleware|api-client|clients?|contracts?|dto|boundaries)(\/|$)/i,
    /(^|\/)(lib\/api|services\/api|shared\/api)(\/|$)/i,
  ],
};

const CONTENT_MARKERS = {
  backend: [
    /\bexpress\b/i,
    /\bfastify\b/i,
    /\bnestjs\b/i,
    /\brouter\./i,
    /\bapp\.(get|post|put|delete|patch)\(/i,
  ],
  frontend: [
    /from\s+["']react["']/i,
    /from\s+["']next\//i,
    /\bvue\b/i,
    /\bsvelte\b/i,
    /\buseState\b/i,
    /\bcreateApp\b/i,
  ],
  boundary: [
    /\bfetch\(/i,
    /\baxios\b/i,
    /\bproxy\b/i,
    /\bapi client\b/i,
    /\bAuthorization\b/i,
  ],
  state: [
    /\.beer\/state\.json/i,
    /\.beer\/HANDOFF\.json/i,
    /\bcontext_stage\b/i,
    /\bapproved_gates\b/i,
  ],
};

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function isSameOrInside(childPath, parentPath) {
  const relativePath = path.relative(parentPath, childPath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function findDocsAnchorRoot(resolvedSourcePath) {
  let current = resolvedSourcePath;

  try {
    if (fs.existsSync(current) && fs.statSync(current).isFile()) {
      current = path.dirname(current);
    }
  } catch {
    // Fall back to the provided source path when stat information is unavailable.
  }

  let gitRoot = "";

  while (true) {
    if (fs.existsSync(path.join(current, ".beer"))) {
      return current;
    }

    if (!gitRoot && fs.existsSync(path.join(current, ".git"))) {
      gitRoot = current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return gitRoot || resolvedSourcePath;
}

function resolveOutputRoot(outputRoot, resolvedSourcePath) {
  if (path.isAbsolute(outputRoot)) {
    return path.resolve(outputRoot);
  }

  return path.resolve(findDocsAnchorRoot(resolvedSourcePath), outputRoot);
}

function normalizeDocPath(filePath) {
  const normalized = normalizePath(filePath);
  if (LEGACY_DOC_PATHS.has(normalized)) {
    return LEGACY_DOC_PATHS.get(normalized);
  }
  if (normalized.startsWith("flows/")) {
    return `Flows/${normalized.slice("flows/".length)}`;
  }
  if (normalized.startsWith("architecture/")) {
    return `Architecture/${normalized.slice("architecture/".length)}`;
  }
  if (normalized.startsWith("conventions/")) {
    return `Conventions/${normalized.slice("conventions/".length)}`;
  }
  if (normalized.startsWith("critical-flows/")) {
    return `CriticalFlows/${normalized.slice("critical-flows/".length)}`;
  }
  if (normalized.startsWith("boundaries/")) {
    return `Boundaries/${normalized.slice("boundaries/".length)}`;
  }
  if (normalized.startsWith("backend/")) {
    return `Backend/${normalized.slice("backend/".length)}`;
  }
  if (normalized.startsWith("frontend/")) {
    return `Frontend/${normalized.slice("frontend/".length)}`;
  }
  return normalized;
}

function titleCase(value) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function unique(values) {
  return [...new Set(values)];
}

function stripLeadingAndTrailingBlankLines(lines) {
  let start = 0;
  let end = lines.length;

  while (start < end && lines[start].trim() === "") {
    start += 1;
  }
  while (end > start && lines[end - 1].trim() === "") {
    end -= 1;
  }

  return lines.slice(start, end);
}

function quoteFiles(files) {
  return files.map((file) => `- \`${file}\``).join("\n");
}

function summarizeConfidence(confidence, reason) {
  if (confidence === "high") {
    return `High: ${reason}`;
  }
  if (confidence === "medium") {
    return `Medium: ${reason}`;
  }
  return `Low: ${reason}`;
}

function clampList(items, limit = 6) {
  return items.slice(0, limit);
}

function inferCodeFence(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".ts" || extension === ".tsx") {
    return "ts";
  }
  if (extension === ".js" || extension === ".jsx" || extension === ".mjs" || extension === ".cjs") {
    return "js";
  }
  if (extension === ".json") {
    return "json";
  }
  if (extension === ".md") {
    return "md";
  }
  if (extension === ".yml" || extension === ".yaml") {
    return "yaml";
  }
  if (extension === ".sh") {
    return "bash";
  }
  if (extension === ".cs") {
    return "csharp";
  }
  if (extension === ".py") {
    return "python";
  }
  return "text";
}

function extractRepresentativeSnippet(textFiles, keyFiles) {
  for (const file of keyFiles) {
    const content = textFiles.get(file);
    if (!content) {
      continue;
    }

    const lines = content.split(/\r?\n/);
    let startIndex = lines.findIndex((line) => SNIPPET_HINT_PATTERNS.some((pattern) => pattern.test(line)));

    if (startIndex === -1) {
      startIndex = lines.findIndex((line) => line.trim() !== "");
    }
    if (startIndex === -1) {
      continue;
    }

    const snippetLines = stripLeadingAndTrailingBlankLines(lines.slice(startIndex, startIndex + 8));
    if (snippetLines.length === 0) {
      continue;
    }

    return {
      file,
      language: inferCodeFence(file),
      code: snippetLines.join("\n"),
    };
  }

  return null;
}

function createEmptyScan(generatedAt, sourcePath) {
  return {
    generatedAt,
    sourcePath,
    repoShape: "unclassified repository",
    files: [],
    topLevelDirs: [],
    topLevelFiles: [],
    docEntries: [],
    dominantPatterns: [],
    taskIndex: {},
    criticalFiles: [],
    searchIndex: {},
    detectedAreas: [],
    discoveryLanes: [],
    criticalFlowCount: 0,
  };
}

export function parseArgs(argv) {
  const args = {
    outputRoot: DEFAULT_OUTPUT_ROOT,
    sourcePath: "",
    gitnexusEvidence: "",
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
    if (arg === "--gitnexus-evidence") {
      args.gitnexusEvidence = next;
      index += 1;
      continue;
    }
    if (arg.startsWith("--gitnexus-evidence=")) {
      args.gitnexusEvidence = arg.slice("--gitnexus-evidence=".length);
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

  if (!args.sourcePath) {
    throw new Error("Missing required argument: --source-path");
  }

  return {
    ...args,
    outputRoot: resolveOutputRoot(args.outputRoot, path.resolve(args.sourcePath)),
    resolvedSourcePath: path.resolve(args.sourcePath),
  };
}

export function printHelp() {
  process.stdout.write(
    [
      "Usage:",
      "  node skills/support/codebase-knowledge/scripts/init-knowledge-base.mjs --source-path <path> [--output-root Docs] [options]",
      "",
      "Scans the repository and writes evidence-backed project docs in one pass.",
      "Prefers imported GitNexus evidence when provided and falls back to local source scanning.",
      "By default, output is written to <target-repo>/Docs beside .beer when present.",
      "",
      "Options:",
      "  --output-root <dir>    Default: Docs",
      "  --gitnexus-evidence <file.json>",
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
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeMarkdown(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${content.trim()}\n`, "utf8");
}

export function ensureDirs(root) {
  fs.mkdirSync(root, { recursive: true });
}

function shouldIgnoreDirectory(fullPath, ignoredRoots) {
  const name = path.basename(fullPath);
  if (IGNORED_DIR_NAMES.has(name)) {
    return true;
  }

  return ignoredRoots.some((ignoredRoot) => fullPath === ignoredRoot || fullPath.startsWith(`${ignoredRoot}${path.sep}`));
}

function collectFiles(sourceRoot, ignoredRoots = []) {
  if (!fs.existsSync(sourceRoot)) {
    return [];
  }

  const queue = [sourceRoot];
  const files = [];

  while (queue.length > 0) {
    const current = queue.shift();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!shouldIgnoreDirectory(fullPath, ignoredRoots)) {
          queue.push(fullPath);
        }
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      files.push(normalizePath(path.relative(sourceRoot, fullPath)));
    }
  }

  return files.sort();
}

function isTextFile(relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  if (TEXT_EXTENSIONS.has(extension)) {
    return true;
  }

  const baseName = path.basename(relativePath).toLowerCase();
  return TEXT_BASENAMES.has(baseName);
}

function isSourceCodeFile(relativePath) {
  return SOURCE_CODE_EXTENSIONS.has(path.extname(relativePath).toLowerCase());
}

function readTextFiles(sourceRoot, files) {
  const contents = new Map();

  for (const relativePath of files) {
    if (!isTextFile(relativePath)) {
      continue;
    }

    const absolutePath = path.join(sourceRoot, relativePath);
    const stat = fs.statSync(absolutePath);
    if (stat.size > 256 * 1024) {
      continue;
    }

    try {
      contents.set(relativePath, fs.readFileSync(absolutePath, "utf8"));
    } catch {
      // Ignore files that are not valid UTF-8 or become unavailable during the scan.
    }
  }

  return contents;
}

function filterTextMap(textFiles, predicate) {
  const filtered = new Map();
  for (const [relativePath, content] of textFiles.entries()) {
    if (predicate(relativePath, content)) {
      filtered.set(relativePath, content);
    }
  }
  return filtered;
}

function isTestLikeFile(relativePath) {
  return /(^|\/)test\//i.test(relativePath) || /\.test\./i.test(relativePath);
}

function findFilesByPattern(files, patterns, limit = 6) {
  return clampList(
    files.filter((file) => patterns.some((pattern) => pattern.test(file))),
    limit,
  );
}

function findFilesContaining(textFiles, patterns, limit = 6) {
  const matches = [];

  for (const [relativePath, content] of textFiles.entries()) {
    if (patterns.some((pattern) => pattern.test(content))) {
      matches.push(relativePath);
    }
  }

  return clampList(matches.sort(), limit);
}

function matchesAnyPattern(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}

function collectTopLevel(files) {
  const directories = new Set();
  const rootFiles = [];

  for (const file of files) {
    const [firstSegment, ...rest] = file.split("/");
    if (rest.length === 0) {
      rootFiles.push(firstSegment);
      continue;
    }
    directories.add(firstSegment);
  }

  return {
    directories: [...directories].sort(),
    files: rootFiles.sort(),
  };
}

function safeReadJson(sourceRoot, relativePath) {
  try {
    const absolutePath = path.join(sourceRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch {
    return null;
  }
}

function safeReadJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => typeof item === "string" && item.trim() !== "");
}

function normalizeDocPathArray(value) {
  return normalizeStringArray(value).map(normalizeDocPath);
}

function normalizeGraphPattern(pattern) {
  if (!pattern || typeof pattern !== "object" || typeof pattern.name !== "string") {
    return null;
  }

  return {
    name: pattern.name,
    confidence: ["high", "medium", "low"].includes(pattern.confidence) ? pattern.confidence : "medium",
    areas: normalizeStringArray(pattern.areas),
    summary: typeof pattern.summary === "string" ? pattern.summary : "",
    keyFiles: normalizeStringArray(pattern.key_files || pattern.keyFiles),
    tags: normalizeStringArray(pattern.tags),
  };
}

function inferDocRole({ area, title, file }) {
  const normalizedFile = normalizeDocPath(file || "").toLowerCase();
  const normalizedTitle = (title || "").toLowerCase();

  if (normalizedFile === DOC_PATHS.architectureOverview.toLowerCase()) {
    return "architecture-overview";
  }
  if (normalizedFile === DOC_PATHS.repoFlow.toLowerCase()) {
    return "repo-flow-map";
  }
  if (normalizedFile === DOC_PATHS.implementationRules.toLowerCase()) {
    return "implementation-rules";
  }
  if (normalizedFile === DOC_PATHS.cliEntrypoints.toLowerCase()) {
    return "cli-entrypoints";
  }
  if (normalizedFile === DOC_PATHS.workflowRouting.toLowerCase()) {
    return "workflow-routing";
  }
  if (normalizedFile === DOC_PATHS.commandBoundary.toLowerCase()) {
    return "command-boundary";
  }
  if (normalizedFile === DOC_PATHS.frontendBackendBoundary.toLowerCase()) {
    return "frontend-backend-boundary";
  }
  if (area === "backend" && /request|lifecycle|handler|endpoint/.test(`${normalizedTitle} ${normalizedFile}`)) {
    return "backend-request-lifecycle";
  }
  if (area === "frontend" && /app|api|page|route|access/.test(`${normalizedTitle} ${normalizedFile}`)) {
    return "frontend-app-api-access";
  }

  return normalizedTitle.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "generated-doc";
}

function normalizeGraphDoc(doc) {
  if (!doc || typeof doc !== "object" || typeof doc.file !== "string" || typeof doc.title !== "string") {
    return null;
  }

  const area = typeof doc.area === "string" ? doc.area : "architecture";
  const file = normalizeDocPath(doc.file);
  const title = doc.title;

  return {
    area,
    kind: typeof doc.kind === "string" ? doc.kind : "pattern",
    role: typeof doc.role === "string" ? doc.role : inferDocRole({ area, title, file }),
    title,
    file,
    confidence: ["high", "medium", "low"].includes(doc.confidence) ? doc.confidence : "medium",
    summary: typeof doc.summary === "string" ? doc.summary : "",
    tags: normalizeStringArray(doc.tags),
    keyFiles: normalizeStringArray(doc.key_files || doc.keyFiles),
    whatThisIs: typeof doc.what_this_is === "string" ? doc.what_this_is : (typeof doc.whatThisIs === "string" ? doc.whatThisIs : ""),
    whyItExistsHere: typeof doc.why_it_exists_here === "string" ? doc.why_it_exists_here : (typeof doc.whyItExistsHere === "string" ? doc.whyItExistsHere : ""),
    howToFollow: normalizeStringArray(doc.how_to_follow || doc.howToFollow),
    commonVariants: normalizeStringArray(doc.common_variants || doc.commonVariants),
    doNotDo: normalizeStringArray(doc.do_not_do || doc.doNotDo),
    riskWhenChanging: typeof doc.risk_when_changing === "string" ? doc.risk_when_changing : (typeof doc.riskWhenChanging === "string" ? doc.riskWhenChanging : ""),
    confidenceReason: typeof doc.confidence_reason === "string" ? doc.confidence_reason : (typeof doc.confidenceReason === "string" ? doc.confidenceReason : "graph evidence prioritized current source links and graph context"),
    verificationTargets: normalizeVerificationTargets(doc.verification_targets || doc.verificationTargets),
  };
}

function normalizeStringMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalized = {};
  for (const [key, items] of Object.entries(value)) {
    normalized[key] = normalizeDocPathArray(items);
  }
  return normalized;
}

function normalizeVerificationTargets(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      symbols: [],
      processes: [],
      queries: [],
    };
  }

  const normalizedQueries = Array.isArray(value.queries)
    ? value.queries
      .filter((item) => item && typeof item === "object" && typeof item.tool === "string")
      .map((item) => ({
        tool: item.tool,
        query: typeof item.query === "string" ? item.query : undefined,
        target: typeof item.target === "string" ? item.target : undefined,
        direction: typeof item.direction === "string" ? item.direction : undefined,
      }))
    : [];

  return {
    symbols: normalizeStringArray(value.symbols),
    processes: normalizeStringArray(value.processes),
    queries: normalizedQueries,
  };
}

function normalizeTaskIndex(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalized = {};
  for (const [key, rawEntry] of Object.entries(value)) {
    if (Array.isArray(rawEntry)) {
      normalized[key] = {
        docs: normalizeDocPathArray(rawEntry),
        pattern_targets: [],
        layer_targets: [],
        boundary_targets: [],
        verification_targets: normalizeVerificationTargets({}),
      };
      continue;
    }

    if (!rawEntry || typeof rawEntry !== "object") {
      continue;
    }

    normalized[key] = {
      docs: normalizeDocPathArray(rawEntry.docs),
      pattern_targets: normalizeStringArray(rawEntry.pattern_targets || rawEntry.patternTargets),
      layer_targets: normalizeStringArray(rawEntry.layer_targets || rawEntry.layerTargets),
      boundary_targets: normalizeStringArray(rawEntry.boundary_targets || rawEntry.boundaryTargets),
      verification_targets: normalizeVerificationTargets(rawEntry.verification_targets || rawEntry.verificationTargets),
    };
  }
  return normalized;
}

function loadGitNexusEvidence(args) {
  if (!args.gitnexusEvidence) {
    return null;
  }

  const evidencePath = path.resolve(args.gitnexusEvidence);
  const raw = safeReadJsonFile(evidencePath);
  if (!raw || typeof raw !== "object") {
    return null;
  }

  return {
    path: evidencePath,
    repoShape: typeof raw.repo_shape === "string" ? raw.repo_shape : (typeof raw.repoShape === "string" ? raw.repoShape : ""),
    dominantPatterns: Array.isArray(raw.dominant_patterns || raw.dominantPatterns)
      ? (raw.dominant_patterns || raw.dominantPatterns).map(normalizeGraphPattern).filter(Boolean)
      : [],
    docs: Array.isArray(raw.docs) ? raw.docs.map(normalizeGraphDoc).filter(Boolean) : [],
    taskIndex: normalizeTaskIndex(raw.task_index || raw.taskIndex),
    searchIndex: normalizeStringMap(raw.search_index || raw.searchIndex),
    criticalFiles: normalizeStringArray(raw.critical_files || raw.criticalFiles),
    notes: normalizeStringArray(raw.notes),
  };
}

function resolveGeneratedFromCommit(args, notes) {
  if (!args.generatedFromCommit.startsWith("unknown-")) {
    return args.generatedFromCommit;
  }

  try {
    const commit = execSync("git rev-parse HEAD", {
      cwd: args.resolvedSourcePath,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    if (commit) {
      return commit;
    }
  } catch {
    notes.push("generated_from_commit uses an explicit fallback because Git metadata was unavailable.");
  }

  return args.generatedFromCommit;
}

function scoreConfidence(score) {
  if (score >= 4) {
    return "high";
  }
  if (score >= 2) {
    return "medium";
  }
  return "low";
}

function buildRepoShape({
  packageManifest,
  skillFiles,
  commandScripts,
  backendScore,
  frontendScore,
}) {
  if (skillFiles.length >= 3 && commandScripts.length >= 3) {
    return "Node-based skill and workflow repository";
  }
  if (backendScore >= 2 && frontendScore >= 2) {
    return "Full-stack application repository";
  }
  if (backendScore >= 2) {
    return "Backend-oriented application repository";
  }
  if (frontendScore >= 2) {
    return "Frontend-oriented application repository";
  }
  if (packageManifest?.workspaces) {
    return "Workspace-style Node repository";
  }
  return "General project repository";
}

function hasFileMatching(files, patterns) {
  return files.some((file) => patterns.some((pattern) => pattern.test(file)));
}

function detectBackendDocPlan(facts) {
  const files = facts.codeFiles || [];
  const layeredSignals = [
    /(^|\/)(application)(\/|$)/i,
    /(^|\/)(domain)(\/|$)/i,
    /(^|\/)(infrastructure)(\/|$)/i,
    /(^|\/)(api|controllers?|presentation)(\/|$)/i,
  ].filter((pattern) => files.some((file) => pattern.test(file))).length;
  const verticalSliceSignals = [
    /(^|\/)(features?|modules?|slices?|use-cases?|usecases)(\/|$)/i,
    /(^|\/)(commands?|queries?)(\/|$)/i,
  ].filter((pattern) => files.some((file) => pattern.test(file))).length;
  const hasRouteEntrypoint = hasFileMatching(files, [
    /(^|\/)(routes?|controllers?|api)(\/|$)/i,
    /(^|\/)app\.(js|ts|mjs|cjs)$/i,
  ]);
  const hasServiceSurface = hasFileMatching(files, [
    /(^|\/)(services?|repositories?|handlers?|middleware)(\/|$)/i,
  ]);

  if (layeredSignals >= 3) {
    return {
      role: "backend-request-lifecycle",
      architectureStyle: "layered-backend",
      file: "Backend/patterns/request-lifecycle.md",
      indexKey: "request-lifecycle",
      targetPath: "backend.pattern_groups.request-lifecycle",
      reason: "application, domain, infrastructure, and entrypoint layers were detected together",
    };
  }

  if (verticalSliceSignals >= 2) {
    return {
      role: "backend-request-lifecycle",
      architectureStyle: "vertical-slice-backend",
      file: "Backend/feature-slices/request-lifecycle.md",
      indexKey: "request-lifecycle",
      targetPath: "backend.pattern_groups.request-lifecycle",
      reason: "feature/module folders and command/query surfaces were detected together",
    };
  }

  if (hasRouteEntrypoint && hasServiceSurface) {
    return {
      role: "backend-request-lifecycle",
      architectureStyle: "route-service-backend",
      file: "Backend/request-lifecycle.md",
      indexKey: "request-lifecycle",
      targetPath: "backend.pattern_groups.request-lifecycle",
      reason: "route or API entrypoints and service-oriented files repeat without a full layer stack",
    };
  }

  return {
    role: "backend-request-lifecycle",
    architectureStyle: "backend-surface",
    file: "Backend/backend-flow.md",
    indexKey: "backend-flow",
    targetPath: "backend.pattern_groups.backend-flow",
    reason: "backend files were detected, but no stronger architecture archetype cleared the threshold",
  };
}

function detectFrontendDocPlan(facts) {
  const files = facts.codeFiles || [];
  const featureSignals = [
    /(^|\/)(features?|modules?|slices?)(\/|$)/i,
    /(^|\/)(hooks?|composables?|stores?|state)(\/|$)/i,
  ].filter((pattern) => files.some((file) => pattern.test(file))).length;

  if (featureSignals >= 2) {
    return {
      role: "frontend-app-api-access",
      architectureStyle: "feature-structured-frontend",
      file: "Frontend/patterns/app-structure-and-api-access.md",
      indexKey: "app-structure-and-api-access",
      targetPath: "frontend.pattern_groups.app-structure-and-api-access",
      reason: "feature folders and shared state/composable surfaces were detected together",
    };
  }

  return {
    role: "frontend-app-api-access",
    architectureStyle: "frontend-surface",
    file: "Frontend/app-structure-and-api-access.md",
    indexKey: "app-structure-and-api-access",
    targetPath: "frontend.pattern_groups.app-structure-and-api-access",
    reason: "frontend page/component/API files repeat without a stronger feature-pattern split",
  };
}

function createPattern(name, confidence, areas, summary, keyFiles, tags) {
  return {
    name,
    confidence,
    areas,
    summary,
    keyFiles: clampList(unique(keyFiles), 6),
    tags,
  };
}

function buildDominantPatterns(facts) {
  const patterns = [];

  if (facts.commandScripts.length >= 3 || Object.keys(facts.packageManifest?.bin || {}).length > 0) {
    patterns.push(
      createPattern(
        "Command-oriented Node entrypoints",
        facts.commandScripts.length >= 5 ? "high" : "medium",
        ["architecture", "critical-flows"],
        "Command handlers are concentrated under stable script entrypoints instead of being scattered across the repo.",
        [
          facts.packageJsonPath,
          ...facts.commandScripts,
        ].filter(Boolean),
        ["commands", "cli", "entrypoints"],
      ),
    );
  }

  if (facts.skillFiles.length >= 3) {
    patterns.push(
      createPattern(
        "Skill-package structure with progressive disclosure",
        facts.skillFiles.length >= 6 && facts.referenceDocs.length >= 6 ? "high" : "medium",
        ["architecture", "conventions", "critical-flows"],
        "Capability is organized into `SKILL.md` packages backed by focused references and helper scripts.",
        [
          ...facts.skillFiles,
          ...facts.referenceDocs,
        ],
        ["skills", "references", "workflow"],
      ),
    );
  }

  if (facts.testFiles.length >= 2) {
    patterns.push(
      createPattern(
        "Repository-native verification via targeted tests",
        facts.testFiles.length >= 4 ? "high" : "medium",
        ["conventions"],
        "Automated checks live in a dedicated test surface and verify repo helpers directly.",
        facts.testFiles,
        ["tests", "verification"],
      ),
    );
  }

  if (facts.backendConfidence !== null) {
    patterns.push(
      createPattern(
        facts.backendDocPlan?.architectureStyle === "layered-backend"
          ? "Layered backend request flow"
          : facts.backendDocPlan?.architectureStyle === "vertical-slice-backend"
            ? "Vertical-slice backend flow"
            : "Backend request and service flow",
        facts.backendConfidence,
        ["backend", "architecture"],
        facts.backendDocPlan?.reason || "Backend responsibilities are concentrated in route, handler, service, or persistence-oriented files.",
        facts.backendFiles,
        ["backend", "request", "service"],
      ),
    );
  }

  if (facts.frontendConfidence !== null) {
    patterns.push(
      createPattern(
        facts.frontendDocPlan?.architectureStyle === "feature-structured-frontend"
          ? "Feature-structured frontend app flow"
          : "Frontend app and API-access surface",
        facts.frontendConfidence,
        ["frontend", "architecture"],
        facts.frontendDocPlan?.reason || "UI structure is organized around page/component surfaces and API-facing client helpers.",
        facts.frontendFiles,
        ["frontend", "components", "api"],
      ),
    );
  }

  if (facts.boundaryConfidence !== null) {
    patterns.push(
      createPattern(
        "Frontend/backend boundary",
        facts.boundaryConfidence,
        ["boundaries"],
        "Cross-boundary coupling is visible in API clients, proxy layers, or contract-bearing files.",
        facts.boundaryFiles,
        ["boundary", "api", "proxy"],
      ),
    );
  }

  if (facts.commandBoundaryConfidence !== null) {
    patterns.push(
      createPattern(
        "Command entrypoints guarded by workflow state contracts",
        facts.commandBoundaryConfidence,
        ["boundaries", "critical-flows"],
        "CLI entrypoints and workflow/state artifacts form a critical seam that must stay consistent.",
        facts.commandBoundaryFiles,
        ["boundary", "state", "commands"],
      ),
    );
  }

  return clampList(patterns, 6);
}

function createDoc({
  generatedAt,
  area,
  kind,
  role,
  architectureStyle,
  docPlanReason,
  title,
  file,
  confidence,
  summary,
  tags,
  keyFiles,
  whatThisIs,
  whyItExistsHere,
  howToFollow,
  commonVariants,
  doNotDo,
  flowDiagram,
  riskWhenChanging,
  confidenceReason,
  verificationTargets = { symbols: [], processes: [], queries: [] },
  textFiles,
}) {
  const normalizedKeyFiles = clampList(unique(keyFiles), 8);
  const representativeSnippet = extractRepresentativeSnippet(textFiles, normalizedKeyFiles);
  const sourceEvidence = clampList(normalizedKeyFiles, 4);

  const content = [
    "---",
    `area: ${area}`,
    `kind: ${kind}`,
    `pattern: ${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    `detected_at: ${generatedAt}`,
    `confidence: ${confidence}`,
    `file_count: ${normalizedKeyFiles.length}`,
    "source_authority: current repository source",
    "status: current",
    "---",
    "",
    `# ${title}`,
    "",
    "## What This Is",
    whatThisIs,
    "",
    "## Why It Exists Here",
    whyItExistsHere,
    "",
    ...(flowDiagram
      ? [
          "## Flow Diagram",
          "",
          "```mermaid",
          flowDiagram,
          "```",
          "",
        ]
      : []),
    "## How To Follow It",
    ...howToFollow.map((line) => `- ${line}`),
    "",
    "## Common Variants In This Repo",
    ...commonVariants.map((line) => `- ${line}`),
    "",
    "## Do Not Do",
    ...doNotDo.map((line) => `- ${line}`),
    "",
    "## Key Files",
    quoteFiles(normalizedKeyFiles),
    "",
    "## Source Evidence",
    ...sourceEvidence.map((file, index) => index === 0 ? `- Primary evidence: \`${file}\`` : `- Supporting evidence: \`${file}\``),
    "",
    "## Representative Snippet",
    representativeSnippet
      ? `Representative snippet from \`${representativeSnippet.file}\`:`
      : "No representative snippet was promoted from the current evidence set.",
    representativeSnippet
      ? `\n\`\`\`${representativeSnippet.language}\n${representativeSnippet.code}\n\`\`\``
      : "",
    "",
    "## Risk When Changing",
    riskWhenChanging,
    "",
    "## Confidence",
    summarizeConfidence(confidence, confidenceReason),
    "",
    "## Verification Targets",
    verificationTargets.symbols.length > 0
      ? `- Symbols: ${verificationTargets.symbols.map((item) => `\`${item}\``).join(", ")}`
      : "- Symbols: none promoted",
    verificationTargets.processes.length > 0
      ? `- Processes: ${verificationTargets.processes.map((item) => `\`${item}\``).join(", ")}`
      : "- Processes: none promoted",
    ...(verificationTargets.queries.length > 0
      ? verificationTargets.queries.map((item) => {
          const parts = [`tool=\`${item.tool}\``];
          if (item.query) parts.push(`query=\`${item.query}\``);
          if (item.target) parts.push(`target=\`${item.target}\``);
          if (item.direction) parts.push(`direction=\`${item.direction}\``);
          return `- ${parts.join(" ")}`;
        })
      : ["- Queries: none promoted"]),
  ].join("\n");

  return {
    title,
    area,
    kind,
    role: role || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    architectureStyle,
    docPlanReason,
    file,
    confidence,
    summary,
    tags,
    keyFiles: normalizedKeyFiles,
    howToFollow,
    doNotDo,
    verificationTargets,
    content,
  };
}

function buildArchitectureDoc(facts) {
  const dominantPatternNames = facts.dominantPatterns.map((pattern) => pattern.name);
  const keyFiles = unique([
    facts.packageJsonPath,
    ...facts.commandScripts,
    ...facts.skillFiles,
  ].filter(Boolean));

  return createDoc({
    generatedAt: facts.generatedAt,
    area: "architecture",
    kind: "architecture",
    role: "architecture-overview",
    title: "System Overview",
    file: DOC_PATHS.architectureOverview,
    confidence: facts.dominantPatterns.length >= 2 ? "high" : "medium",
    summary: `Maps the repo shape, major surfaces, and dominant patterns observed in ${facts.repoShape.toLowerCase()}.`,
    tags: ["architecture", "overview", "repo-shape"],
    keyFiles,
    whatThisIs: `${facts.repoShape} with ${facts.files.length} scanned files across ${facts.topLevelDirs.length} major top-level directories.`,
    whyItExistsHere: "Future work needs a fast way to orient itself before changing command surfaces, skill packages, or implementation boundaries.",
    howToFollow: [
      "Start at the package or root manifest to identify entrypoints and execution surfaces.",
      "Use the dominant patterns list to decide whether a change belongs in commands, skill packages, tests, or docs.",
      "Read the critical-flow docs before changing command routing or workflow-owned artifacts.",
    ],
    commonVariants: [
      `Top-level directories observed: ${facts.topLevelDirs.join(", ") || "none detected"}.`,
      `Top-level files observed: ${facts.topLevelFiles.join(", ") || "none detected"}.`,
      `Dominant patterns: ${dominantPatternNames.join("; ") || "no dominant patterns promoted"}.`,
    ],
    doNotDo: [
      "Do not infer repository-wide rules from a single folder without checking the matching doc or evidence files.",
      "Do not add new top-level surfaces when an existing command, skill, or reference structure already fits the change.",
    ],
    riskWhenChanging: "High. Repo-shape changes alter how later contributors discover entrypoints, conventions, and cross-cutting flows.",
    confidenceReason: "repo shape, entrypoints, and dominant surfaces were inferred from repeated files and directory structure",
    verificationTargets: {
      symbols: [],
      processes: ["RepositoryShape"],
      queries: [
        { tool: "query", query: "repo architecture and entrypoints" },
      ],
    },
    textFiles: facts.textFiles,
  });
}

function buildRepoFlowDiagram(facts) {
  const lines = [
    "flowchart TD",
    "  Task[\"Task or change request\"]",
    "  Source[\"Read current source\"]",
    "  Entry[\"Find repo entrypoint\"]",
    "  Verify[\"Verify changed flow\"]",
    "  Docs[\"Refresh Docs if flow changed\"]",
    "  Task --> Source",
    "  Source --> Entry",
  ];
  const surfaces = [];

  if (facts.commandScripts.length > 0) {
    lines.push("  Command[\"Command or tooling flow\"]");
    lines.push("  Entry --> Command");
    surfaces.push("Command");
  }
  if (facts.backendConfidence !== null) {
    lines.push("  Backend[\"Backend request flow\"]");
    lines.push("  Entry --> Backend");
    surfaces.push("Backend");
  }
  if (facts.frontendConfidence !== null) {
    lines.push("  Frontend[\"Frontend app and API flow\"]");
    lines.push("  Entry --> Frontend");
    surfaces.push("Frontend");
  }
  if (facts.boundaryConfidence !== null) {
    lines.push("  Boundary[\"Boundary or contract flow\"]");
    lines.push("  Entry --> Boundary");
    surfaces.push("Boundary");
  }
  if (surfaces.length === 0) {
    lines.push("  LocalFiles[\"Nearest source files\"]");
    lines.push("  Entry --> LocalFiles");
    surfaces.push("LocalFiles");
  }

  for (const surface of surfaces) {
    lines.push(`  ${surface} --> Verify`);
  }

  lines.push("  Verify --> Docs");
  return lines.join("\n");
}

function buildRepoFlowDoc(facts) {
  const flowSteps = [];

  if (facts.commandScripts.length > 0) {
    flowSteps.push("For command/tooling work, start from the exposed package or command entrypoint, then trace into the matching command script.");
  }
  if (facts.backendConfidence !== null) {
    flowSteps.push("For backend work, start from request entrypoints or handlers, then follow the repo's detected backend flow before changing persistence or side effects.");
  }
  if (facts.frontendConfidence !== null) {
    flowSteps.push("For frontend work, start from page/app/component entrypoints, then follow shared API or state helpers before changing leaf UI.");
  }
  if (facts.boundaryConfidence !== null) {
    flowSteps.push("For cross-boundary work, inspect boundary docs before editing callers or responders on either side.");
  }
  if (facts.testFiles.length > 0) {
    flowSteps.push("Use repo-native tests or verification scripts as the final proof path for changed flows.");
  }

  const keyFiles = unique([
    facts.packageJsonPath,
    ...facts.commandScripts.slice(0, 4),
    ...facts.backendFiles.slice(0, 3),
    ...facts.frontendFiles.slice(0, 3),
    ...facts.boundaryFiles.slice(0, 3),
    ...facts.testFiles.slice(0, 3),
  ].filter(Boolean));

  return createDoc({
    generatedAt: facts.generatedAt,
    area: "flows",
    kind: "flow-map",
    role: "repo-flow-map",
    title: "Repository Flow Map",
    file: DOC_PATHS.repoFlow,
    confidence: flowSteps.length >= 3 ? "high" : "medium",
    summary: "Default map of how implementation work should trace through this repo before changing code.",
    tags: ["flow", "entrypoints", "verification"],
    keyFiles,
    whatThisIs: "The default flow map every future task should read before using more specific architecture, pattern, boundary, or critical-flow docs.",
    whyItExistsHere: "Flow is the stable baseline artifact. Architecture and pattern folders adapt to the repo, but every repo still needs a source-linked path for tracing work.",
    howToFollow: flowSteps.length > 0
      ? flowSteps
      : ["Start from the repo manifest or nearest entrypoint, identify the files touched by the task, then verify against current source before trusting generated docs."],
    commonVariants: [
      `Command surfaces detected: ${facts.commandScripts.length}.`,
      `Backend evidence files detected: ${facts.backendFiles.length}.`,
      `Frontend evidence files detected: ${facts.frontendFiles.length}.`,
      `Boundary evidence files detected: ${facts.boundaryFiles.length}.`,
      `Verification files detected: ${facts.testFiles.length}.`,
    ],
    doNotDo: [
      "Do not skip flow tracing just because architecture or pattern docs are absent.",
      "Do not treat generated architecture or pattern folders as mandatory when this flow map is the only well-supported artifact.",
    ],
    flowDiagram: buildRepoFlowDiagram(facts),
    riskWhenChanging: "Medium to high. Missing the repo's entrypoint and verification flow makes later implementation and review work rely on guesses.",
    confidenceReason: flowSteps.length >= 3
      ? "multiple repo surfaces provided evidence for a task flow map"
      : "source code exists, so a minimal flow map is required even when specialized patterns are not yet strong enough to promote",
    verificationTargets: {
      symbols: [],
      processes: ["RepositoryFlow"],
      queries: [
        { tool: "query", query: "repo flow entrypoints verification" },
      ],
    },
    textFiles: facts.textFiles,
  });
}

function buildConventionsDoc(facts) {
  const conventions = [];

  if (facts.skillFiles.length >= 3) {
    conventions.push("Skill packages repeat a `SKILL.md` plus `references/` structure under `skills/`.");
  }
  if (facts.commandScripts.length >= 3) {
    conventions.push("Node helpers are grouped under `scripts/commands/` or adjacent script surfaces instead of being spread throughout feature folders.");
  }
  if (facts.testFiles.length >= 2) {
    conventions.push("Automated checks live under `test/` with `*.test.*` naming.");
  }
  if (facts.referenceDocs.length >= 3) {
    conventions.push("Long-form procedural detail is pushed into `references/*.md` rather than bloating the entry doc.");
  }

  return createDoc({
    generatedAt: facts.generatedAt,
    area: "conventions",
    kind: "convention",
    role: "implementation-rules",
    title: "Implementation Rules",
    file: DOC_PATHS.implementationRules,
    confidence: conventions.length >= 3 ? "high" : "medium",
    summary: "Captures repeated directory, naming, and documentation conventions that future edits should preserve.",
    tags: ["conventions", "naming", "structure"],
    keyFiles: unique([
      ...facts.skillFiles,
      ...facts.referenceDocs,
      ...facts.commandScripts,
      ...facts.testFiles,
    ]),
    whatThisIs: "The stable implementation rules repeated across commands, skill packages, references, and tests.",
    whyItExistsHere: "The repo relies on consistent folder layout and document layering; breaking those conventions makes navigation and automation less reliable.",
    howToFollow: conventions.length > 0 ? conventions : ["No stable conventions were strong enough to promote beyond the repo-shape overview."],
    commonVariants: [
      facts.skillFiles.length > 0 ? `Skill packages detected: ${facts.skillFiles.length}.` : "No repeated skill-package structure was detected.",
      facts.commandScripts.length > 0 ? `Command scripts detected: ${facts.commandScripts.length}.` : "No dedicated command script surface was detected.",
      facts.testFiles.length > 0 ? `Test files detected: ${facts.testFiles.length}.` : "No repeated test naming convention was detected.",
    ],
    doNotDo: [
      "Do not introduce ad hoc folder layouts when the repo already repeats a stable package shape.",
      "Do not move critical procedural detail out of references and into unrelated docs without a clear routing benefit.",
    ],
    riskWhenChanging: "Medium to high. Convention drift makes the repo harder to scan and weakens downstream automation assumptions.",
    confidenceReason: "the promoted rules were repeated across multiple files and folder surfaces",
    verificationTargets: {
      symbols: [],
      processes: [],
      queries: [
        { tool: "query", query: "implementation conventions and repeated package structure" },
      ],
    },
    textFiles: facts.textFiles,
  });
}

function buildCliFlowDoc(facts) {
  return createDoc({
    generatedAt: facts.generatedAt,
    area: "critical-flows",
    kind: "critical-flow",
    role: "cli-entrypoints",
    title: "CLI Entrypoints And Onboarding",
    file: DOC_PATHS.cliEntrypoints,
    confidence: facts.commandScripts.length >= 5 ? "high" : "medium",
    summary: "Shows how package-level entrypoints hand off into command scripts and onboarding/status flows.",
    tags: ["critical-flow", "cli", "onboarding"],
    keyFiles: unique([
      facts.packageJsonPath,
      ...facts.commandScripts,
    ]),
    whatThisIs: "The critical path from package-level command entrypoints into the repo's command handlers.",
    whyItExistsHere: "CLI routing is a high-blast-radius seam: if entrypoint wiring drifts, onboarding, status checks, and command execution all fail together.",
    howToFollow: [
      "Start at the root manifest or bin mapping to see which executable names are exposed.",
      "Trace into `scripts/commands/` to find the concrete command handler for the behavior being changed.",
      "Treat onboarding and status commands as contract-bearing entrypoints rather than throwaway utilities.",
    ],
    commonVariants: [
      `Package bin entries detected: ${Object.keys(facts.packageManifest?.bin || {}).join(", ") || "none"}.`,
      `Command scripts detected: ${facts.commandScripts.length}.`,
      "Onboarding, status, and command helpers may be split into separate files even when they share the same repo-level contract.",
    ],
    doNotDo: [
      "Do not change executable names or command paths without checking every command entrypoint that routes through them.",
      "Do not hide critical command behavior inside unrelated helper files when a command surface already exists.",
    ],
    riskWhenChanging: "High. Entrypoint regressions make the repo feel broken even when most implementation code is intact.",
    confidenceReason: "root manifests and repeated command script paths provide direct evidence for the command flow",
    verificationTargets: {
      symbols: ["main", "onboard", "status"],
      processes: ["CLIEntrypoints"],
      queries: [
        { tool: "query", query: "CLI entrypoints and onboarding flow" },
      ],
    },
    textFiles: facts.textFiles,
  });
}

function buildWorkflowRoutingDoc(facts) {
  return createDoc({
    generatedAt: facts.generatedAt,
    area: "critical-flows",
    kind: "critical-flow",
    role: "workflow-routing",
    title: "Workflow Routing",
    file: DOC_PATHS.workflowRouting,
    confidence: facts.workflowSkillFiles.length >= 4 ? "high" : "medium",
    summary: "Explains how workflow and support skills divide responsibility and hand work from one phase to the next.",
    tags: ["critical-flow", "workflow", "skills"],
    keyFiles: unique([
      ...facts.workflowSkillFiles,
      ...facts.supportSkillFiles,
      ...facts.workflowDocs,
    ]),
    whatThisIs: "The repo-level workflow path that routes work between public entry skills and downstream helpers.",
    whyItExistsHere: "This repository encodes behavior as skill packages; changing the routing contract can break multiple flows at once.",
    howToFollow: [
      "Start with the public entry skill or catalog entry that receives the user-facing request.",
      "Trace handoff language and references before changing downstream ownership or route boundaries.",
      "Preserve the distinction between workflow skills, support skills, and meta skills when adding new capabilities.",
    ],
    commonVariants: [
      `Workflow skills detected: ${facts.workflowSkillFiles.length}.`,
      `Support skills detected: ${facts.supportSkillFiles.length}.`,
      "Detailed routing usually lives in references or ecosystem flow docs rather than in a single source file.",
    ],
    doNotDo: [
      "Do not move ownership from one skill family to another without updating the routing docs and contracts together.",
      "Do not treat support skills as public workflow entrypoints unless the package explicitly says so.",
    ],
    riskWhenChanging: "High. Routing drift creates broken handoffs, stale docs, and conflicting ownership assumptions.",
    confidenceReason: "multiple workflow/support skill packages and routing docs point to the same staged flow model",
    verificationTargets: {
      symbols: ["using-beer", "planning", "validating"],
      processes: ["WorkflowRouting"],
      queries: [
        { tool: "query", query: "workflow routing and skill handoff flow" },
      ],
    },
    textFiles: facts.textFiles,
  });
}

function buildCommandBoundaryDoc(facts) {
  return createDoc({
    generatedAt: facts.generatedAt,
    area: "boundaries",
    kind: "boundary",
    role: "command-boundary",
    title: "Command Entrypoints And State",
    file: DOC_PATHS.commandBoundary,
    confidence: facts.commandBoundaryConfidence,
    summary: "Documents the seam between command entrypoints and workflow/state artifacts that downstream phases rely on.",
    tags: ["boundary", "state", "commands"],
    keyFiles: facts.commandBoundaryFiles,
    whatThisIs: "The boundary between command handlers and the stateful artifacts or contracts they read or update.",
    whyItExistsHere: "Entrypoints can look local, but they often coordinate shared state or gate decisions that affect later phases.",
    howToFollow: [
      "Identify the command script first, then inspect the state or contract files it reads or mutates.",
      "Preserve naming and path expectations for stateful files before changing command behavior.",
      "Treat onboarding, status, and route-selection code as boundary code, not as disposable glue.",
    ],
    commonVariants: [
      `State-bearing files referenced by text scan: ${facts.commandBoundaryFiles.join(", ")}.`,
      "The same command surface may read config, write state, and route to a downstream workflow skill.",
    ],
    doNotDo: [
      "Do not update command behavior without checking whether it changes a shared state contract.",
      "Do not rename or relocate state-bearing artifacts without updating every command that consumes them.",
    ],
    riskWhenChanging: "High. Boundary regressions often surface as broken routing or stale state rather than obvious compilation failures.",
    confidenceReason: "command scripts and state-contract references were both detected in current source",
    verificationTargets: {
      symbols: ["approved_gates", "next_handoff"],
      processes: ["CommandStateBoundary"],
      queries: [
        { tool: "query", query: "command state boundary and workflow handoff" },
      ],
    },
    textFiles: facts.textFiles,
  });
}

function buildBackendDoc(facts) {
  const plan = facts.backendDocPlan || detectBackendDocPlan(facts);
  return createDoc({
    generatedAt: facts.generatedAt,
    area: "backend",
    kind: "pattern",
    role: plan.role,
    architectureStyle: plan.architectureStyle,
    docPlanReason: plan.reason,
    title: "Request Lifecycle",
    file: plan.file,
    confidence: facts.backendConfidence,
    summary: "Shows the repeated backend path from entrypoint-style files into service, domain, or persistence work.",
    tags: ["backend", "request", "lifecycle"],
    keyFiles: facts.backendFiles,
    whatThisIs: "The backend request path repeated across route, handler, middleware, and service-oriented files.",
    whyItExistsHere: `Backend changes are safer when they preserve the repo's observed ${plan.architectureStyle} shape instead of forcing a generic layer template.`,
    howToFollow: [
      "Start from route or handler entrypoints before changing service or repository code.",
      "Check where middleware, authentication, or persistence boundaries appear in the existing flow.",
      "Preserve the repeated flow shape found in this repo instead of assuming every backend is four-layer.",
    ],
    commonVariants: [
      `Detected backend architecture style: ${plan.architectureStyle}.`,
      `Doc path selected because ${plan.reason}.`,
      `Backend evidence files: ${facts.backendFiles.join(", ")}.`,
      "Read-heavy paths may be thinner than mutation flows, but they should still respect the same entrypoint boundaries.",
    ],
    doNotDo: [
      "Do not bypass repeated service or middleware boundaries without proving the repo already allows it.",
      "Do not infer one backend file as the universal template unless the pattern repeats across multiple files.",
    ],
    riskWhenChanging: "High. Request-flow changes affect auth, validation, persistence, and external side effects together.",
    confidenceReason: "route, service, and backend-oriented files were repeated strongly enough to promote a canonical flow",
    verificationTargets: {
      symbols: facts.backendFiles.slice(0, 3).map((file) => path.basename(file, path.extname(file))),
      processes: ["BackendRequestLifecycle"],
      queries: [
        { tool: "query", query: "backend request lifecycle and handler flow" },
      ],
    },
    textFiles: facts.textFiles,
  });
}

function buildFrontendDoc(facts) {
  const plan = facts.frontendDocPlan || detectFrontendDocPlan(facts);
  return createDoc({
    generatedAt: facts.generatedAt,
    area: "frontend",
    kind: "pattern",
    role: plan.role,
    architectureStyle: plan.architectureStyle,
    docPlanReason: plan.reason,
    title: "App Structure And API Access",
    file: plan.file,
    confidence: facts.frontendConfidence,
    summary: "Explains the repeated frontend shape for pages/components and the helpers that reach APIs or shared state.",
    tags: ["frontend", "app", "api"],
    keyFiles: facts.frontendFiles,
    whatThisIs: "The frontend structure repeated across page, component, app, and API-client surfaces.",
    whyItExistsHere: `Frontend work stays consistent when UI entrypoints and API access patterns stay aligned with the observed ${plan.architectureStyle} shape.`,
    howToFollow: [
      "Start from page, app, or component entrypoints before changing lower-level API helpers.",
      "Trace where API calls are centralized instead of duplicating fetch logic inside leaf components.",
      "Preserve repeated naming and placement rules for components, hooks, or app-level modules.",
    ],
    commonVariants: [
      `Detected frontend architecture style: ${plan.architectureStyle}.`,
      `Doc path selected because ${plan.reason}.`,
      `Frontend evidence files: ${facts.frontendFiles.join(", ")}.`,
      "Pages, app modules, or feature folders may differ slightly, but API access should still follow the repeated helper surface.",
    ],
    doNotDo: [
      "Do not scatter API calls across unrelated UI files when the repo already exposes a client helper surface.",
      "Do not infer a single component layout as canonical unless it repeats across multiple frontend entrypoints.",
    ],
    riskWhenChanging: "Medium to high. Frontend structure drift creates inconsistent API usage and makes the app harder to navigate.",
    confidenceReason: "page/component files and frontend-specific source markers were repeated across the scan",
    verificationTargets: {
      symbols: facts.frontendFiles.slice(0, 3).map((file) => path.basename(file, path.extname(file))),
      processes: ["FrontendApiAccess"],
      queries: [
        { tool: "query", query: "frontend app structure and api access" },
      ],
    },
    textFiles: facts.textFiles,
  });
}

function buildBoundaryDoc(facts) {
  return createDoc({
    generatedAt: facts.generatedAt,
    area: "boundaries",
    kind: "boundary",
    role: "frontend-backend-boundary",
    title: "Frontend Backend Proxy",
    file: DOC_PATHS.frontendBackendBoundary,
    confidence: facts.boundaryConfidence,
    summary: "Captures the seam between frontend callers and backend-facing proxy, contract, or API-client files.",
    tags: ["boundary", "frontend", "backend", "proxy"],
    keyFiles: facts.boundaryFiles,
    whatThisIs: "The cross-boundary shape between frontend code and the files that bridge into backend APIs or contracts.",
    whyItExistsHere: "This seam breaks easily: small API or proxy changes can ripple across the UI and request layer together.",
    howToFollow: [
      "Identify the API client, proxy, or contract file before touching either the UI caller or backend endpoint.",
      "Preserve request and response shape expectations across both sides of the seam.",
      "Use boundary files as the integration point instead of creating a new ad hoc bridge.",
    ],
    commonVariants: [
      `Boundary evidence files: ${facts.boundaryFiles.join(", ")}.`,
      "Some flows may call backend APIs directly while others route through a shared proxy or client helper.",
    ],
    doNotDo: [
      "Do not change a boundary file in isolation without checking the caller and responder on each side.",
      "Do not duplicate contract logic in multiple frontend features when a shared boundary file already exists.",
    ],
    riskWhenChanging: "High. Boundary changes often fail at runtime through mismatched contracts or auth/caching drift.",
    confidenceReason: "frontend and backend evidence was paired with proxy or API-client markers in current source",
    verificationTargets: {
      symbols: facts.boundaryFiles.slice(0, 3).map((file) => path.basename(file, path.extname(file))),
      processes: ["FrontendBackendBoundary"],
      queries: [
        { tool: "query", query: "frontend backend proxy and contract boundary" },
      ],
    },
    textFiles: facts.textFiles,
  });
}

function buildTaskIndex(docEntries) {
  const taskIndex = {};

  function add(task, file, options = {}) {
    if (!taskIndex[task]) {
      taskIndex[task] = {
        docs: [],
        pattern_targets: [],
        layer_targets: [],
        boundary_targets: [],
        verification_targets: {
          symbols: [],
          processes: [],
          queries: [],
        },
      };
    }

    taskIndex[task].docs = unique([...(taskIndex[task].docs || []), file]);
    taskIndex[task].pattern_targets = unique([
      ...(taskIndex[task].pattern_targets || []),
      ...(options.patternTargets || []),
    ]);
    taskIndex[task].layer_targets = unique([
      ...(taskIndex[task].layer_targets || []),
      ...(options.layerTargets || []),
    ]);
    taskIndex[task].boundary_targets = unique([
      ...(taskIndex[task].boundary_targets || []),
      ...(options.boundaryTargets || []),
    ]);

    const currentTargets = taskIndex[task].verification_targets;
    taskIndex[task].verification_targets = {
      symbols: unique([...(currentTargets.symbols || []), ...normalizeStringArray(options.verificationTargets?.symbols)]),
      processes: unique([...(currentTargets.processes || []), ...normalizeStringArray(options.verificationTargets?.processes)]),
      queries: unique([
        ...(currentTargets.queries || []).map((item) => JSON.stringify(item)),
        ...((options.verificationTargets?.queries || []).filter(Boolean).map((item) => JSON.stringify(item))),
      ]).map((item) => JSON.parse(item)),
    };
  }

  for (const entry of docEntries) {
    if (entry.role === "repo-flow-map") {
      add("understand repo flow", entry.file, {
        patternTargets: ["flows.repo-flow"],
        verificationTargets: entry.verificationTargets,
      });
      add("trace default flow", entry.file, {
        patternTargets: ["flows.repo-flow"],
        verificationTargets: entry.verificationTargets,
      });
    }
    if (entry.role === "architecture-overview") {
      add("understand repo shape", entry.file);
      add("trace architecture", entry.file);
    }
    if (entry.role === "implementation-rules") {
      add("follow repo conventions", entry.file);
      add("add new repo artifact", entry.file);
    }
    if (entry.role === "cli-entrypoints") {
      add("change command entrypoint", entry.file);
      add("touch onboarding", entry.file);
    }
    if (entry.role === "workflow-routing") {
      add("change workflow skill", entry.file);
      add("change routing", entry.file);
    }
    if (entry.role === "command-boundary") {
      add("touch command boundary", entry.file, {
        boundaryTargets: ["boundaries.command-entrypoints-and-state"],
        verificationTargets: entry.verificationTargets,
      });
      add("change workflow state", entry.file, {
        boundaryTargets: ["boundaries.command-entrypoints-and-state"],
        verificationTargets: entry.verificationTargets,
      });
    }
    if (entry.role === "backend-request-lifecycle") {
      add("add backend endpoint", entry.file, {
        patternTargets: ["backend.pattern_groups.request-lifecycle"],
        layerTargets: ["backend.pattern_groups.request-lifecycle"],
        verificationTargets: entry.verificationTargets,
      });
      add("change backend handler flow", entry.file, {
        patternTargets: ["backend.pattern_groups.request-lifecycle"],
        layerTargets: ["backend.pattern_groups.request-lifecycle"],
        verificationTargets: entry.verificationTargets,
      });
    }
    if (entry.role === "frontend-app-api-access") {
      add("add frontend api call", entry.file, {
        patternTargets: ["frontend.pattern_groups.app-structure-and-api-access"],
        layerTargets: ["frontend.pattern_groups.app-structure-and-api-access"],
        verificationTargets: entry.verificationTargets,
      });
      add("change frontend page/composable flow", entry.file, {
        patternTargets: ["frontend.pattern_groups.app-structure-and-api-access"],
        layerTargets: ["frontend.pattern_groups.app-structure-and-api-access"],
        verificationTargets: entry.verificationTargets,
      });
    }
    if (entry.role === "frontend-backend-boundary") {
      add("change proxy", entry.file, {
        boundaryTargets: ["boundaries.frontend-backend-proxy"],
        verificationTargets: entry.verificationTargets,
      });
      add("change api boundary", entry.file, {
        boundaryTargets: ["boundaries.frontend-backend-proxy"],
        verificationTargets: entry.verificationTargets,
      });
      add("change auth", entry.file, {
        boundaryTargets: ["boundaries.frontend-backend-proxy"],
        verificationTargets: entry.verificationTargets,
      });
    }
  }

  return taskIndex;
}

function buildSearchIndex(docEntries) {
  const searchIndex = {};

  for (const entry of docEntries) {
    const keywords = unique([
      entry.title.toLowerCase(),
      ...entry.tags.map((tag) => tag.toLowerCase()),
    ]);

    for (const keyword of keywords) {
      searchIndex[keyword] = unique([...(searchIndex[keyword] || []), entry.file]);
    }
  }

  return searchIndex;
}

function mergeStringMaps(primary, fallback) {
  const merged = {};
  for (const [key, value] of Object.entries(fallback || {})) {
    merged[key] = unique([...(Array.isArray(value) ? value : [])]);
  }
  for (const [key, value] of Object.entries(primary || {})) {
    merged[key] = unique([...(merged[key] || []), ...(Array.isArray(value) ? value : [])]);
  }
  return merged;
}

function mergeTaskIndex(primary, fallback) {
  const merged = normalizeTaskIndex(fallback);
  for (const [key, value] of Object.entries(normalizeTaskIndex(primary))) {
    const existing = merged[key] || {
      docs: [],
      pattern_targets: [],
      layer_targets: [],
      boundary_targets: [],
      verification_targets: { symbols: [], processes: [], queries: [] },
    };
    merged[key] = {
      docs: unique([...(existing.docs || []), ...(value.docs || [])]),
      pattern_targets: unique([...(existing.pattern_targets || []), ...(value.pattern_targets || [])]),
      layer_targets: unique([...(existing.layer_targets || []), ...(value.layer_targets || [])]),
      boundary_targets: unique([...(existing.boundary_targets || []), ...(value.boundary_targets || [])]),
      verification_targets: {
        symbols: unique([...(existing.verification_targets?.symbols || []), ...(value.verification_targets?.symbols || [])]),
        processes: unique([...(existing.verification_targets?.processes || []), ...(value.verification_targets?.processes || [])]),
        queries: unique([
          ...((existing.verification_targets?.queries || []).map((item) => JSON.stringify(item))),
          ...((value.verification_targets?.queries || []).map((item) => JSON.stringify(item))),
        ]).map((item) => JSON.parse(item)),
      },
    };
  }
  return merged;
}

function buildGraphDocEntry(doc, facts) {
  return createDoc({
    generatedAt: facts.generatedAt,
    area: doc.area,
    kind: doc.kind,
    role: doc.role,
    title: doc.title,
    file: doc.file,
    confidence: doc.confidence,
    summary: doc.summary,
    tags: doc.tags,
    keyFiles: doc.keyFiles,
    whatThisIs: doc.whatThisIs,
    whyItExistsHere: doc.whyItExistsHere,
    howToFollow: doc.howToFollow.length > 0 ? doc.howToFollow : ["Follow the graph-backed entrypoints and preserve the documented seam."],
    commonVariants: doc.commonVariants.length > 0 ? doc.commonVariants : ["Graph evidence promoted this doc ahead of local-only heuristics."],
    doNotDo: doc.doNotDo.length > 0 ? doc.doNotDo : ["Do not rewrite this pattern without checking the graph-backed callers, consumers, or route flows first."],
    riskWhenChanging: doc.riskWhenChanging || "High. This doc was promoted from graph evidence because it shapes shared flows or boundaries.",
    confidenceReason: doc.confidenceReason,
    verificationTargets: doc.verificationTargets,
    textFiles: facts.textFiles,
  });
}

function mergeGraphEvidence(scan, graphEvidence) {
  if (!graphEvidence) {
    return scan;
  }

  const merged = {
    ...scan,
    graphEvidenceUsed: true,
    graphEvidencePath: graphEvidence.path,
  };

  if (graphEvidence.repoShape) {
    merged.repoShape = graphEvidence.repoShape;
  }

  if (graphEvidence.docs.length > 0) {
    const graphDocEntries = graphEvidence.docs.map((doc) => buildGraphDocEntry(doc, merged));
    const graphFiles = new Set(graphDocEntries.map((entry) => entry.file));
    merged.docEntries = [
      ...graphDocEntries,
      ...scan.docEntries.filter((entry) => !graphFiles.has(entry.file)),
    ];
  }

  if (graphEvidence.dominantPatterns.length > 0) {
    merged.dominantPatterns = graphEvidence.dominantPatterns;
  }

  merged.criticalFiles = unique([
    ...graphEvidence.criticalFiles,
    ...merged.docEntries.flatMap((entry) => entry.keyFiles),
    ...scan.criticalFiles,
  ]).slice(0, 12);

  const fallbackTaskIndex = buildTaskIndex(merged.docEntries);
  const fallbackSearchIndex = buildSearchIndex(merged.docEntries);
  merged.taskIndex = Object.keys(graphEvidence.taskIndex).length > 0
    ? mergeTaskIndex(graphEvidence.taskIndex, fallbackTaskIndex)
    : fallbackTaskIndex;
  merged.searchIndex = Object.keys(graphEvidence.searchIndex).length > 0
    ? mergeStringMaps(graphEvidence.searchIndex, fallbackSearchIndex)
    : fallbackSearchIndex;
  merged.detectedAreas = unique(merged.docEntries.map((entry) => entry.area));
  merged.criticalFlowCount = merged.docEntries.filter((entry) => entry.area === "critical-flows").length;
  merged.notes = unique([...(scan.notes || []), ...graphEvidence.notes]);

  return merged;
}

export function buildReadme(args, scan) {
  const dominantPatterns = scan.dominantPatterns.length > 0
    ? scan.dominantPatterns.map((pattern) => `- ${pattern.name} (${pattern.confidence}): ${pattern.summary}`)
    : ["- No dominant pattern cleared the promotion threshold for this scan."];

  const taskBuckets = Object.entries(scan.taskIndex);
  const taskLines = taskBuckets.length > 0
    ? taskBuckets.map(([task, entry]) => `- ${titleCase(task)}: ${(entry.docs || []).map((file) => `\`${file}\``).join(", ")}`)
    : ["- No task-oriented routing entries were promoted from this scan."];

  const flowEntries = scan.docEntries.filter((entry) => entry.area === "flows");
  const flowLines = flowEntries.length > 0
    ? flowEntries.map((entry) => `- ${entry.title}: \`${entry.file}\` (${entry.summary})`)
    : ["- No repo flow doc was generated."];

  const boundaryEntries = scan.docEntries.filter((entry) => entry.area === "boundaries");
  const boundaryLines = boundaryEntries.length > 0
    ? boundaryEntries.map((entry) => `- ${entry.title}: \`${entry.file}\` (${entry.summary})`)
    : ["- No standalone boundary doc was promoted from this scan."];

  const criticalFlowEntries = scan.docEntries.filter((entry) => entry.area === "critical-flows");
  const criticalFlowLines = criticalFlowEntries.length > 0
    ? criticalFlowEntries.map((entry) => `- ${entry.title}: \`${entry.file}\``)
    : ["- No critical flow doc was promoted from this scan."];

  const generatedDocs = scan.docEntries.length > 0
    ? scan.docEntries.map((entry) => `- ${entry.title}: \`${entry.file}\``)
    : ["- No evidence-backed doc was generated beyond metadata and index files."];

  return [
    "# Codebase Docs",
    "",
    `Pattern-first implementation map generated from \`${args.sourcePath}\` as a ${scan.repoShape.toLowerCase()}.`,
    "",
    "- Current source remains authoritative.",
    "- Commit policy: `local-cache-by-default`.",
    `- Invocation reason: \`${args.invocationReason}\`.`,
    `- Scan scope: \`${args.scanScope}\`.`,
    `- Discovery strategy: \`pattern-first\` with \`one-pass real scan -> child-agent lane fan-out -> single-writer synthesis\`.`,
    `- Evidence priority: \`${scan.graphEvidenceUsed ? "GitNexus-first with local confirmation" : "local scan fallback"}\`.`,
    "",
    "## Dominant Patterns",
    "",
    ...dominantPatterns,
    "",
    "## Start Here By Task",
    "",
    ...taskLines,
    "",
    "## Flow Map",
    "",
    ...flowLines,
    "",
    "## High-Risk Boundaries",
    "",
    ...boundaryLines,
    "",
    "## Critical Flows",
    "",
    ...criticalFlowLines,
    "",
    "## Generated Docs",
    "",
    ...generatedDocs,
    "",
    "## Source Of Truth",
    "",
    "- This generated map is advisory. If an entry drifts from current code, trust the repository source and refresh Docs.",
  ].join("\n");
}

export function buildIndex(scan) {
  const stats = {
    total_files: scan.files.length,
    generated_docs: scan.docEntries.length,
    flow_docs: scan.docEntries.filter((entry) => entry.area === "flows").length,
    backend_docs: scan.docEntries.filter((entry) => entry.area === "backend").length,
    frontend_docs: scan.docEntries.filter((entry) => entry.area === "frontend").length,
    boundary_docs: scan.docEntries.filter((entry) => entry.area === "boundaries").length,
    critical_flows: scan.docEntries.filter((entry) => entry.area === "critical-flows").length,
  };

  const backendRequestLifecycle = scan.docEntries.find((entry) => entry.role === "backend-request-lifecycle");
  const frontendApiAccess = scan.docEntries.find((entry) => entry.role === "frontend-app-api-access");
  const frontendBackendBoundary = scan.docEntries.find((entry) => entry.role === "frontend-backend-boundary");
  const commandStateBoundary = scan.docEntries.find((entry) => entry.role === "command-boundary");
  const repoFlow = scan.docEntries.find((entry) => entry.role === "repo-flow-map");

  return {
    version: "1.0",
    generated_at: scan.generatedAt,
    strategy: "pattern-first",
    stats,
    entries: scan.docEntries.map((entry) => ({
      title: entry.title,
      area: entry.area,
      kind: entry.kind,
      role: entry.role,
      architecture_style: entry.architectureStyle,
      doc_plan_reason: entry.docPlanReason,
      file: entry.file,
      confidence: entry.confidence,
      tags: entry.tags,
      summary: entry.summary,
    })),
    dominant_patterns: scan.dominantPatterns.map((pattern) => ({
      name: pattern.name,
      confidence: pattern.confidence,
      areas: pattern.areas,
      summary: pattern.summary,
      key_files: pattern.keyFiles,
    })),
    backend: {
      pattern_groups: backendRequestLifecycle
        ? {
            "request-lifecycle": {
              architecture_style: backendRequestLifecycle.architectureStyle || "backend-surface",
              mission: "orchestrate backend request flow while preserving the architecture style actually detected in this repo",
              dominant_patterns: backendRequestLifecycle.howToFollow,
              do_not_do: backendRequestLifecycle.doNotDo,
              docs: [backendRequestLifecycle.file],
              verification_targets: backendRequestLifecycle.verificationTargets,
            },
          }
        : {},
      layer_patterns: {},
      flow_patterns: backendRequestLifecycle
        ? {
            "request-lifecycle": {
              docs: [backendRequestLifecycle.file],
              verification_targets: backendRequestLifecycle.verificationTargets,
            },
          }
        : {},
    },
    frontend: {
      pattern_groups: frontendApiAccess
        ? {
            "app-structure-and-api-access": {
              architecture_style: frontendApiAccess.architectureStyle || "frontend-surface",
              mission: "keep frontend pages, components, and API access aligned with the frontend structure actually detected in this repo",
              dominant_patterns: frontendApiAccess.howToFollow,
              do_not_do: frontendApiAccess.doNotDo,
              docs: [frontendApiAccess.file],
              verification_targets: frontendApiAccess.verificationTargets,
            },
          }
        : {},
      layer_patterns: {},
      flow_patterns: frontendApiAccess
        ? {
            "app-structure-and-api-access": {
              docs: [frontendApiAccess.file],
              verification_targets: frontendApiAccess.verificationTargets,
            },
          }
        : {},
    },
    flows: {
      ...(repoFlow
        ? {
            "repo-flow": {
              summary: repoFlow.summary,
              docs: [repoFlow.file],
              verification_targets: repoFlow.verificationTargets,
            },
          }
        : {}),
    },
    boundaries: {
      ...(frontendBackendBoundary
        ? {
            "frontend-backend-proxy": {
              summary: frontendBackendBoundary.summary,
              docs: [frontendBackendBoundary.file],
              verification_targets: frontendBackendBoundary.verificationTargets,
            },
          }
        : {}),
      ...(commandStateBoundary
        ? {
            "command-entrypoints-and-state": {
              summary: commandStateBoundary.summary,
              docs: [commandStateBoundary.file],
              verification_targets: commandStateBoundary.verificationTargets,
            },
          }
        : {}),
    },
    task_index: scan.taskIndex,
    critical_files: scan.criticalFiles,
    conventions: {
      source_authority: "current repository source",
      repo_shape: scan.repoShape,
      discovery_execution: "parallel-child-agents",
      evidence_priority: scan.graphEvidenceUsed ? "gitnexus-first" : "local-fallback",
    },
    search_index: scan.searchIndex,
  };
}

export function buildMetadata(args, scan) {
  const notes = unique([...(args.note || []), ...(scan.notes || [])]);
  const generatedFromCommit = resolveGeneratedFromCommit(args, notes);

  if (generatedFromCommit.startsWith("unknown-") && notes.length === 0) {
    notes.push("generated_from_commit uses an explicit fallback because Git metadata was unavailable.");
  }

  const confidenceSummary = {
    high: scan.docEntries.filter((entry) => entry.confidence === "high").length,
    medium: scan.docEntries.filter((entry) => entry.confidence === "medium").length,
    low: scan.docEntries.filter((entry) => entry.confidence === "low").length,
  };

  return {
    version: "1.0",
    generated_at: scan.generatedAt,
    generated_from_commit: generatedFromCommit,
    source_authority: "current repository source",
    commit_policy: "local-cache-by-default",
    invocation_reason: args.invocationReason,
    scan_scope: args.scanScope,
    gitnexus_status: args.gitnexusStatus,
    mode: scan.graphEvidenceUsed && args.gitnexusStatus === "available" ? "gitnexus-assisted" : args.mode,
    strategy: "pattern-first",
    source_path: args.sourcePath,
    repo_shape: scan.repoShape,
    discovery: {
      pre_scan: "real-repo-scan",
      execution: "parallel-child-agents",
      synthesis: "single-writer",
      evidence_priority: scan.graphEvidenceUsed ? "gitnexus-first" : "local-fallback",
      lanes: scan.discoveryLanes,
      doc_plan: scan.docPlan || [],
      optional_lanes: [
        "integration-patterns",
        "state-boundaries",
      ],
    },
    stats: {
      files_scanned: args.filesScanned || scan.files.length,
      patterns_detected: scan.dominantPatterns.length,
      docs_generated: scan.docEntries.length,
      discovery_lanes: scan.discoveryLanes.length,
    },
    confidence_summary: confidenceSummary,
    notes,
  };
}

export function scanRepository(args) {
  const generatedAt = new Date().toISOString();
  const sourceRoot = args.resolvedSourcePath || path.resolve(args.sourcePath);
  const ignoredRoots = [];

  if (isSameOrInside(args.outputRoot, sourceRoot)) {
    ignoredRoots.push(args.outputRoot);
  }

  const files = collectFiles(sourceRoot, ignoredRoots);
  const topLevel = collectTopLevel(files);
  const textFiles = readTextFiles(sourceRoot, files);
  const codeFiles = files.filter((file) => isSourceCodeFile(file) && !isTestLikeFile(file));
  const codeTextFiles = filterTextMap(textFiles, (relativePath) => isSourceCodeFile(relativePath) && !isTestLikeFile(relativePath));
  const frontendCandidateTextFiles = filterTextMap(
    codeTextFiles,
    (relativePath) => matchesAnyPattern(relativePath, PATH_MARKERS.frontend),
  );
  const packageJsonPath = files.includes("package.json") ? "package.json" : files.find((file) => file.endsWith("/package.json")) || null;
  const packageManifest = packageJsonPath ? safeReadJson(sourceRoot, packageJsonPath) : null;
  const skillFiles = clampList(files.filter((file) => file.endsWith("/SKILL.md") || file === "SKILL.md"), 12);
  const workflowSkillFiles = clampList(skillFiles.filter((file) => file.includes("/workflow/")), 8);
  const supportSkillFiles = clampList(skillFiles.filter((file) => file.includes("/support/")), 8);
  const referenceDocs = clampList(files.filter((file) => /(^|\/)references\/.+\.md$/i.test(file)), 12);
  const workflowDocs = clampList(files.filter((file) => /workflow|catalog|overview/i.test(file) && file.endsWith(".md")), 8);
  const commandScripts = clampList(files.filter((file) => /(^|\/)scripts\/commands\/.+\.(mjs|js|ts)$/i.test(file)), 10);
  const testFiles = clampList(files.filter((file) => /(^|\/)test\/.+\.test\./i.test(file) || /\.test\./i.test(file)), 10);

  const backendFiles = unique([
    ...findFilesByPattern(codeFiles, PATH_MARKERS.backend, 8),
    ...findFilesContaining(codeTextFiles, CONTENT_MARKERS.backend, 6),
  ]).slice(0, 8);
  const frontendFiles = unique([
    ...findFilesByPattern(codeFiles, PATH_MARKERS.frontend, 8),
    ...findFilesContaining(frontendCandidateTextFiles, CONTENT_MARKERS.frontend, 6),
  ]).slice(0, 8);
  const boundaryFiles = unique([
    ...findFilesByPattern(codeFiles, PATH_MARKERS.boundary, 8),
    ...findFilesContaining(codeTextFiles, CONTENT_MARKERS.boundary, 6),
  ]).slice(0, 8);
  const stateFiles = findFilesContaining(textFiles, CONTENT_MARKERS.state, 8);

  const backendScore = backendFiles.length >= 4 ? 4 : backendFiles.length >= 2 ? 2 : 0;
  const frontendScore = frontendFiles.length >= 4 ? 4 : frontendFiles.length >= 2 ? 2 : 0;
  const boundaryScore = frontendScore >= 2 && backendScore >= 2 && boundaryFiles.length >= 2
    ? Math.min(4, boundaryFiles.length >= 4 ? 4 : 2)
    : 0;
  const commandBoundaryScore = commandScripts.length >= 3 && stateFiles.length >= 1
    ? (stateFiles.length >= 3 ? 4 : 2)
    : 0;

  const repoShape = buildRepoShape({
    packageManifest,
    skillFiles,
    commandScripts,
    backendScore,
    frontendScore,
  });

  const facts = {
    generatedAt,
    sourcePath: args.sourcePath,
    files,
    codeFiles,
    topLevelDirs: topLevel.directories,
    topLevelFiles: topLevel.files,
    packageJsonPath,
    packageManifest,
    skillFiles,
    workflowSkillFiles,
    supportSkillFiles,
    referenceDocs,
    workflowDocs,
    commandScripts,
    testFiles,
    backendFiles,
    frontendFiles,
    boundaryFiles,
    commandBoundaryFiles: unique([
      ...commandScripts,
      ...stateFiles,
      ...workflowDocs,
    ]).slice(0, 8),
    backendConfidence: backendScore >= 2 ? scoreConfidence(backendScore) : null,
    frontendConfidence: frontendScore >= 2 ? scoreConfidence(frontendScore) : null,
    boundaryConfidence: boundaryScore >= 2 ? scoreConfidence(boundaryScore) : null,
    commandBoundaryConfidence: commandBoundaryScore >= 2 ? scoreConfidence(commandBoundaryScore) : null,
    repoShape,
    textFiles,
    discoveryLanes: [
      "architecture-and-conventions",
      "backend",
      "frontend",
      "boundaries",
      "critical-flows",
    ],
  };

  if (facts.backendConfidence !== null) {
    facts.backendDocPlan = detectBackendDocPlan(facts);
  }
  if (facts.frontendConfidence !== null) {
    facts.frontendDocPlan = detectFrontendDocPlan(facts);
  }
  facts.docPlan = [
    facts.backendDocPlan,
    facts.frontendDocPlan,
  ].filter(Boolean);

  const dominantPatterns = buildDominantPatterns(facts);
  facts.dominantPatterns = dominantPatterns;

  const docEntries = [
    buildArchitectureDoc(facts),
    buildConventionsDoc(facts),
  ];

  if (codeFiles.length > 0) {
    docEntries.unshift(buildRepoFlowDoc(facts));
  }

  if (commandScripts.length >= 3) {
    docEntries.push(buildCliFlowDoc(facts));
  }
  if (workflowSkillFiles.length >= 3) {
    docEntries.push(buildWorkflowRoutingDoc(facts));
  }
  if (facts.commandBoundaryConfidence !== null) {
    docEntries.push(buildCommandBoundaryDoc(facts));
  }
  if (facts.backendConfidence !== null) {
    docEntries.push(buildBackendDoc(facts));
  }
  if (facts.frontendConfidence !== null) {
    docEntries.push(buildFrontendDoc(facts));
  }
  if (facts.boundaryConfidence !== null) {
    docEntries.push(buildBoundaryDoc(facts));
  }

  const criticalFiles = unique([
    packageJsonPath,
    ...docEntries.flatMap((entry) => entry.keyFiles),
  ].filter(Boolean)).slice(0, 12);
  const taskIndex = buildTaskIndex(docEntries);
  const searchIndex = buildSearchIndex(docEntries);
  const detectedAreas = unique(docEntries.map((entry) => entry.area));

  const localScan = {
    ...createEmptyScan(generatedAt, args.sourcePath),
    ...facts,
    docEntries,
    taskIndex,
    criticalFiles,
    searchIndex,
    detectedAreas,
    criticalFlowCount: docEntries.filter((entry) => entry.area === "critical-flows").length,
    notes: [],
  };

  const graphEvidence = loadGitNexusEvidence(args);
  return mergeGraphEvidence(localScan, graphEvidence);
}

export function initializeKnowledgeBase(args) {
  const scan = scanRepository(args);
  ensureDirs(args.outputRoot);

  const metadata = buildMetadata(args, scan);
  const index = buildIndex(scan);
  const readme = buildReadme(args, scan);

  writeJson(path.join(args.outputRoot, "00-metadata.json"), metadata);
  writeJson(path.join(args.outputRoot, "index.json"), index);
  writeMarkdown(path.join(args.outputRoot, "README.md"), readme);

  for (const entry of scan.docEntries) {
    writeMarkdown(path.join(args.outputRoot, entry.file), entry.content);
  }

  return scan;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const scan = initializeKnowledgeBase(args);

  process.stdout.write(
    [
      `Knowledge docs written to ${args.outputRoot}`,
      `Source path: ${args.sourcePath}`,
      `Repo shape: ${scan.repoShape}`,
      `Docs generated: ${scan.docEntries.length}`,
      `Dominant patterns captured: ${scan.dominantPatterns.length}`,
      `Critical flows documented: ${scan.criticalFlowCount}`,
      `Strategy: pattern-first`,
      `Evidence priority: ${scan.graphEvidenceUsed ? "GitNexus-first with local confirmation" : "local fallback"}`,
      `Discovery execution: one-pass real scan -> child-agent lane fan-out -> single-writer synthesis`,
    ].join("\n") + "\n",
  );
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  process.exitCode = main();
}
