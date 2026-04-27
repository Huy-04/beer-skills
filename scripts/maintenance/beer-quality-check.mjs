#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const IGNORED_PATH_SEGMENTS = new Set([
  ".git",
  ".tmp",
  "node_modules",
  ".beer",
  ".claude",
]);
const STALE_WORDING_PATTERNS = [
  /\bdirect-fix\b/i,
  /\bdirect fix\b/i,
  /\bsmall direct-fix\b/i,
  /\bsmall direct fix\b/i,
];
const COMMAND_SCRIPT_PATTERN = /node\s+plugins\/beer-orchestration\/scripts\/([A-Za-z0-9-]+\.mjs)/g;

function normalizeLine(line) {
  return line.trim().replace(/\s+/g, " ");
}

function parseArgs(argv) {
  const args = {
    repoRoot: process.cwd(),
    hostRoot: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") {
      args.repoRoot = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg.startsWith("--repo-root=")) {
      args.repoRoot = path.resolve(arg.slice("--repo-root=".length));
      continue;
    }
    if (arg === "--host-root") {
      args.hostRoot = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg.startsWith("--host-root=")) {
      args.hostRoot = path.resolve(arg.slice("--host-root=".length));
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage: beer-quality-check.mjs [--repo-root <path>] [--host-root <path>]",
          "",
          "Runs lightweight static quality checks for Beer skills and optional beer-orchestrator host surface.",
        ].join("\n"),
      );
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function collectFiles(rootPath, predicate) {
  if (!rootPath || !fs.existsSync(rootPath)) {
    return [];
  }

  const queue = [rootPath];
  const files = [];
  while (queue.length > 0) {
    const current = queue.shift();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_PATH_SEGMENTS.has(entry.name) || entry.name.startsWith("tmp-")) {
        continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
        continue;
      }
      if (entry.isFile() && predicate(fullPath, entry.name)) {
        files.push(fullPath);
      }
    }
  }

  return files.sort();
}

function parseFrontmatter(markdownText) {
  const match = markdownText.match(FRONTMATTER_PATTERN);
  if (!match) {
    return {};
  }

  const fields = {};
  const lines = match[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fieldMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!fieldMatch) {
      continue;
    }
    const [, key, rawValue] = fieldMatch;
    const trimmedValue = rawValue.trim();

    if (trimmedValue === ">" || trimmedValue === "|") {
      const blockLines = [];
      for (let blockIndex = index + 1; blockIndex < lines.length; blockIndex += 1) {
        const blockLine = lines[blockIndex];
        if (/^\S/.test(blockLine)) {
          break;
        }
        blockLines.push(blockLine.replace(/^\s{2}/, "").trim());
        index = blockIndex;
      }
      fields[key] = blockLines.join(" ").trim();
      continue;
    }

    fields[key] = trimmedValue.replace(/^["']|["']$/g, "").trim();
  }
  return fields;
}

function findConsecutiveDuplicateLines(markdownText) {
  const issues = [];
  const lines = markdownText.split(/\r?\n/);
  for (let index = 1; index < lines.length; index += 1) {
    const previous = normalizeLine(lines[index - 1]);
    const current = normalizeLine(lines[index]);
    if (!previous || !current) {
      continue;
    }
    if (current === "}" || current === "- [ ]") {
      continue;
    }
    if (previous === current) {
      issues.push({
        line: index + 1,
        message: `consecutive duplicate line "${current}"`,
      });
    }
  }
  return issues;
}

function findStaleWording(text) {
  const issues = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (STALE_WORDING_PATTERNS.some((pattern) => pattern.test(line))) {
      issues.push({
        line: index + 1,
        message: `stale wording "${line.trim()}"`,
      });
    }
  }
  return issues;
}

function checkSkillFrontmatter(repoRoot) {
  const skillFiles = collectFiles(
    path.join(repoRoot, "skills"),
    (fullPath, name) => name === "SKILL.md" && fullPath.includes(`${path.sep}skills${path.sep}`),
  );
  const issues = [];

  for (const filePath of skillFiles) {
    const relativePath = path.relative(repoRoot, filePath);
    const text = fs.readFileSync(filePath, "utf8");
    const frontmatter = parseFrontmatter(text);
    const description = frontmatter.description || "";

    if (!frontmatter.name) {
      issues.push(`${relativePath}: missing frontmatter name`);
    }
    if (!description) {
      issues.push(`${relativePath}: missing frontmatter description`);
      continue;
    }
    if (
      !description.startsWith("This skill should be used when") &&
      !description.startsWith("Use when") &&
      !description.includes("Use this skill when") &&
      !description.includes("Use PROACTIVELY") &&
      !description.startsWith("Coordinate") &&
      !description.startsWith("This command")
    ) {
      issues.push(`${relativePath}: weak trigger phrasing in description`);
    }
  }

  return issues;
}

function checkMarkdownSurfaces(rootPath, label) {
  const markdownFiles = collectFiles(rootPath, (_fullPath, name) => name.toLowerCase().endsWith(".md"));
  const issues = [];

  for (const filePath of markdownFiles) {
    const relativePath = path.relative(rootPath, filePath);
    const text = fs.readFileSync(filePath, "utf8");

    for (const duplicate of findConsecutiveDuplicateLines(text)) {
      issues.push(`${label}/${relativePath}:${duplicate.line}: ${duplicate.message}`);
    }
    for (const stale of findStaleWording(text)) {
      issues.push(`${label}/${relativePath}:${stale.line}: ${stale.message}`);
    }
  }

  return issues;
}

function checkHostCommandScriptLinks(hostRoot) {
  const commandsRoot = path.join(hostRoot, "plugins", "beer-orchestration", "commands");
  const scriptsRoot = path.join(hostRoot, "plugins", "beer-orchestration", "scripts");
  const commandFiles = collectFiles(commandsRoot, (_fullPath, name) => name.toLowerCase().endsWith(".md"));
  const issues = [];

  for (const filePath of commandFiles) {
    const relativePath = path.relative(hostRoot, filePath);
    const text = fs.readFileSync(filePath, "utf8");
    for (const match of text.matchAll(COMMAND_SCRIPT_PATTERN)) {
      const scriptName = match[1];
      const scriptPath = path.join(scriptsRoot, scriptName);
      if (!fs.existsSync(scriptPath)) {
        issues.push(`${relativePath}: references missing script ${scriptName}`);
      }
    }
  }

  return issues;
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const issues = [];

  issues.push(...checkSkillFrontmatter(args.repoRoot));
  issues.push(...checkMarkdownSurfaces(args.repoRoot, "repo"));

  if (args.hostRoot) {
    issues.push(...checkMarkdownSurfaces(path.join(args.hostRoot, "plugins", "beer-orchestration"), "host"));
    issues.push(...checkHostCommandScriptLinks(args.hostRoot));
  }

  const summary = [
    `Beer quality check complete.`,
    `Repo root: ${args.repoRoot}`,
    args.hostRoot ? `Host root: ${args.hostRoot}` : "Host root: (not checked)",
    `Issues: ${issues.length}`,
    ...issues.map((issue) => `- ${issue}`),
  ];

  process.stdout.write(`${summary.join("\n")}\n`);
  return issues.length === 0 ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
