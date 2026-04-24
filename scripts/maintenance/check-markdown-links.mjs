#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MARKDOWN_LINK_PATTERN = /\[[^\]]*?\]\((?!https?:|mailto:|#|file:)([^)]+)\)/g;
const SCRIPT_PATH = fileURLToPath(import.meta.url);

export function parseArgs(argv) {
  const args = {
    repoRoot: process.cwd(),
    targets: [],
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
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage: check-markdown-links.mjs [--repo-root <path>] [file-or-dir ...]",
          "",
          "Checks relative Markdown links for missing targets.",
        ].join("\n"),
      );
      process.exit(0);
    }
    args.targets.push(arg);
  }

  return args;
}

export function collectMarkdownFiles(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return [];
  }

  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    return targetPath.toLowerCase().endsWith(".md") ? [targetPath] : [];
  }

  const results = [];
  const queue = [targetPath];
  while (queue.length > 0) {
    const current = queue.shift();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

export function shouldIgnoreTarget(target) {
  return (
    !target ||
    target.startsWith("/") ||
    target.startsWith("<") ||
    target.includes("*") ||
    target.includes("...") ||
    target.includes("|")
  );
}

export function findBrokenLinks(markdownFile) {
  const text = fs.readFileSync(markdownFile, "utf8");
  const broken = [];

  for (const match of text.matchAll(MARKDOWN_LINK_PATTERN)) {
    const rawTarget = match[1].trim();
    if (shouldIgnoreTarget(rawTarget)) {
      continue;
    }
    const normalized = rawTarget.split("#")[0].trim();
    if (!normalized || shouldIgnoreTarget(normalized)) {
      continue;
    }
    const resolved = path.resolve(path.dirname(markdownFile), normalized);
    if (!fs.existsSync(resolved)) {
      broken.push({
        target: rawTarget,
        resolved,
      });
    }
  }

  return broken;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const targets =
    args.targets.length > 0
      ? args.targets.map((target) => path.resolve(args.repoRoot, target))
      : [args.repoRoot];

  const markdownFiles = [...new Set(targets.flatMap((target) => collectMarkdownFiles(target)))].sort();
  const failures = [];

  for (const markdownFile of markdownFiles) {
    const brokenLinks = findBrokenLinks(markdownFile);
    if (brokenLinks.length === 0) {
      continue;
    }
    failures.push({
      file: path.relative(args.repoRoot, markdownFile),
      brokenLinks: brokenLinks.map((brokenLink) => ({
        target: brokenLink.target,
        resolved: path.relative(args.repoRoot, brokenLink.resolved),
      })),
    });
  }

  if (failures.length === 0) {
    process.stdout.write(`Markdown link check passed for ${markdownFiles.length} file(s).\n`);
    return 0;
  }

  process.stdout.write("Markdown link check failed.\n");
  for (const failure of failures) {
    process.stdout.write(`- ${failure.file}\n`);
    for (const brokenLink of failure.brokenLinks) {
      process.stdout.write(`  - ${brokenLink.target} -> ${brokenLink.resolved}\n`);
    }
  }
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
