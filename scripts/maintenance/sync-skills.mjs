#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const SCRIPT_PATH = fileURLToPath(import.meta.url);

function isTopLevelField(line) {
  return /^[A-Za-z0-9_-]+:\s*/.test(line);
}

function cleanScalar(value) {
  return value.replace(/^["']|["']$/g, "").trim();
}

export function parseArgs(argv) {
  const args = {
    repoRoot: process.cwd(),
    dryRun: false,
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
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage: sync-skills.mjs [--repo-root <path>] [--dry-run]",
          "",
          "Builds a repo-local skill inventory report and flags declaration mismatches.",
        ].join("\n"),
      );
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

export function collectSkillFiles(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) {
    return [];
  }

  const queue = [skillsRoot];
  const files = [];

  while (queue.length > 0) {
    const current = queue.shift();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name === "SKILL.md") {
        files.push(fullPath);
      }
    }
  }

  return files.sort();
}

export function parseFrontmatter(markdownText) {
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

    const key = fieldMatch[1];
    const rawValue = fieldMatch[2];
    if (rawValue === ">" || rawValue === "|") {
      const blockLines = [];
      let cursor = index + 1;
      while (cursor < lines.length) {
        const candidate = lines[cursor];
        if (candidate.trim() === "") {
          blockLines.push("");
          cursor += 1;
          continue;
        }
        if (!/^\s+/.test(candidate) && isTopLevelField(candidate)) {
          break;
        }
        blockLines.push(candidate.replace(/^\s{2}/, ""));
        cursor += 1;
      }

      const normalized =
        rawValue === ">"
          ? blockLines.map((blockLine) => blockLine.trim()).filter(Boolean).join(" ")
          : blockLines.join("\n").trim();
      fields[key] = normalized;
      index = cursor - 1;
      continue;
    }

    if (rawValue === "") {
      continue;
    }

    fields[key] = cleanScalar(rawValue);
  }
  return fields;
}

function getSkillClassification(relativePath) {
  const normalizedPath = relativePath.split(path.sep).join("/");
  const segments = normalizedPath.split("/");

  if (segments[0] !== "skills") {
    return {
      category: "unknown",
      family: "",
    };
  }

  if (segments[1] === "workflow") {
    return {
      category: "workflow",
      family: segments[2] || "",
    };
  }

  return {
    category: segments[1] || "unknown",
    family: "",
  };
}

export function buildInventory(repoRoot) {
  const skillsRoot = path.join(repoRoot, "skills");
  const files = collectSkillFiles(skillsRoot);
  const entries = [];
  const issues = [];
  const seenNames = new Map();

  for (const filePath of files) {
    const source = fs.readFileSync(filePath, "utf8");
    const frontmatter = parseFrontmatter(source);
    const directoryName = path.basename(path.dirname(filePath));
    const declaredName = frontmatter.name || "";
    const relativePath = path.relative(repoRoot, filePath);
    const classification = getSkillClassification(relativePath);
    const entry = {
      name: declaredName,
      description: frontmatter.description || "",
      category: classification.category,
      family: classification.family,
      directory: directoryName,
      file: relativePath,
    };
    entries.push(entry);

    if (!declaredName) {
      issues.push(`${relativePath}: missing frontmatter name`);
    } else if (declaredName !== directoryName) {
      issues.push(`${relativePath}: frontmatter name "${declaredName}" does not match directory "${directoryName}"`);
    }

    if (!frontmatter.description) {
      issues.push(`${relativePath}: missing frontmatter description`);
    } else if (!frontmatter.description.startsWith("This skill should be used when")) {
      issues.push(
        `${relativePath}: description must start with "This skill should be used when"`,
      );
    }

    if (declaredName) {
      const collisions = seenNames.get(declaredName) || [];
      collisions.push(relativePath);
      seenNames.set(declaredName, collisions);
    }
  }

  for (const [name, locations] of seenNames.entries()) {
    if (locations.length > 1) {
      issues.push(`Duplicate skill name "${name}" declared in: ${locations.join(", ")}`);
    }
  }

  return {
    generated_at: new Date().toISOString(),
    skills_total: entries.length,
    entries,
    issues,
  };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const report = buildInventory(args.repoRoot);
  const outputPath = path.join(args.repoRoot, "docs", "skill-inventory.json");

  if (!args.dryRun) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  process.stdout.write(
    [
      args.dryRun ? "Skill sync dry-run complete." : `Skill inventory written to ${path.relative(args.repoRoot, outputPath)}.`,
      `Skills found: ${report.skills_total}`,
      report.issues.length === 0 ? "Issues: none" : `Issues: ${report.issues.length}`,
      ...report.issues.map((issue) => `- ${issue}`),
    ].join("\n") + "\n",
  );

  return report.issues.length === 0 ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
