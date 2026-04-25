import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTMATTER_PATTERN = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const MANAGED_BLOCK_START = "<!-- beer-agent-guidelines:start -->";
const MANAGED_BLOCK_END = "<!-- beer-agent-guidelines:end -->";
const MANAGED_BLOCK_PATTERN = new RegExp(
  `${MANAGED_BLOCK_START}[\\s\\S]*?${MANAGED_BLOCK_END}\\s*`,
  "m",
);

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const INSTALL_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..");
const PACKAGED_SKILLS_ROOT = path.join(INSTALL_ROOT, "skills");
const AGENT_GUIDELINES_REFERENCE_ROOT = path.join(
  PACKAGED_SKILLS_ROOT,
  "support",
  "agent-guidelines",
  "references",
);

const GUIDELINE_FILES = [
  {
    fileName: "CLAUDE.md",
    templatePath: path.join(AGENT_GUIDELINES_REFERENCE_ROOT, "claude-template.md"),
  },
  {
    fileName: "AGENTS.md",
    templatePath: path.join(AGENT_GUIDELINES_REFERENCE_ROOT, "agents-template.md"),
  },
];

function copyDirRecursive(source, target) {
  const entries = fs.readdirSync(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyDirRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function findSkillDirectories(root) {
  const skills = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      if (fs.existsSync(path.join(fullPath, "SKILL.md"))) {
        skills.push({
          name: entry.name,
          sourcePath: fullPath,
        });
      } else {
        walk(fullPath);
      }
    }
  }

  walk(root);
  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

function stripFrontmatter(markdownText) {
  return markdownText.replace(FRONTMATTER_PATTERN, "").trim();
}

function buildManagedBlock(templateText) {
  return [
    MANAGED_BLOCK_START,
    stripFrontmatter(templateText),
    MANAGED_BLOCK_END,
  ].join("\n");
}

function upsertManagedBlock(existingText, blockText) {
  const trimmedExisting = existingText.trim();
  if (!trimmedExisting) {
    return {
      content: `${blockText}\n`,
      block_status: "created",
      file_status: "created",
    };
  }

  if (MANAGED_BLOCK_PATTERN.test(existingText)) {
    const replaced = existingText.replace(MANAGED_BLOCK_PATTERN, `${blockText}\n`);
    return {
      content: replaced.endsWith("\n") ? replaced : `${replaced}\n`,
      block_status: "replaced",
      file_status: "updated",
    };
  }

  const separator = existingText.endsWith("\n") ? "\n" : "\n\n";
  return {
    content: `${existingText}${separator}${blockText}\n`,
    block_status: "added",
    file_status: "updated",
  };
}

function removeManagedBlock(existingText) {
  if (!MANAGED_BLOCK_PATTERN.test(existingText)) {
    return {
      changed: false,
      content: existingText,
    };
  }

  const withoutBlock = existingText.replace(MANAGED_BLOCK_PATTERN, "").trim();
  return {
    changed: true,
    content: withoutBlock ? `${withoutBlock}\n` : "",
  };
}

function isBeerSkillDirectory(skillDir) {
  const skillPath = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(skillPath)) {
    return false;
  }

  const source = fs.readFileSync(skillPath, "utf8");
  return /\becosystem:\s*["']?beer["']?\b/.test(source);
}

export function removeInstalledBeerSkills(repoRoot) {
  const targetDir = path.join(repoRoot, ".claude", "skills");
  const removed = [];

  if (!fs.existsSync(targetDir)) {
    return {
      path: targetDir,
      removed,
    };
  }

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const skillDir = path.join(targetDir, entry.name);
    if (!isBeerSkillDirectory(skillDir)) {
      continue;
    }

    fs.rmSync(skillDir, { recursive: true, force: true });
    removed.push(entry.name);
  }

  return {
    path: targetDir,
    removed: removed.sort(),
  };
}

export function syncAgentGuidelinesFiles(repoRoot) {
  const files = [];

  for (const fileSpec of GUIDELINE_FILES) {
    const targetPath = path.join(repoRoot, fileSpec.fileName);
    const templateText = fs.readFileSync(fileSpec.templatePath, "utf8");
    const blockText = buildManagedBlock(templateText);
    const existingText = fs.existsSync(targetPath)
      ? fs.readFileSync(targetPath, "utf8")
      : "";

    const next = upsertManagedBlock(existingText, blockText);
    fs.writeFileSync(targetPath, next.content, "utf8");

    files.push({
      name: fileSpec.fileName,
      path: targetPath,
      status: next.file_status,
      block_status: next.block_status,
    });
  }

  return { files };
}

export function removeManagedAgentGuidelines(repoRoot) {
  const files = [];

  for (const fileSpec of GUIDELINE_FILES) {
    const targetPath = path.join(repoRoot, fileSpec.fileName);
    if (!fs.existsSync(targetPath)) {
      files.push({
        name: fileSpec.fileName,
        status: "missing",
      });
      continue;
    }

    const existingText = fs.readFileSync(targetPath, "utf8");
    const next = removeManagedBlock(existingText);
    if (!next.changed) {
      files.push({
        name: fileSpec.fileName,
        status: "unchanged",
      });
      continue;
    }

    if (next.content) {
      fs.writeFileSync(targetPath, next.content, "utf8");
      files.push({
        name: fileSpec.fileName,
        status: "updated",
      });
      continue;
    }

    fs.rmSync(targetPath, { force: true });
    files.push({
      name: fileSpec.fileName,
      status: "removed",
    });
  }

  return { files };
}

export function syncProjectSkills(repoRoot) {
  const targetDir = path.join(repoRoot, ".claude", "skills");
  fs.mkdirSync(targetDir, { recursive: true });

  const cleanup = removeInstalledBeerSkills(repoRoot);
  const previouslyInstalled = new Set(cleanup.removed);
  const skillDirs = findSkillDirectories(PACKAGED_SKILLS_ROOT);

  const results = [];
  for (const skill of skillDirs) {
    const targetSkillDir = path.join(targetDir, skill.name);
    fs.mkdirSync(targetSkillDir, { recursive: true });
    copyDirRecursive(skill.sourcePath, targetSkillDir);

    results.push({
      name: skill.name,
      status: previouslyInstalled.has(skill.name) ? "updated" : "created",
    });
  }

  return {
    path: targetDir,
    removed_skills: cleanup.removed,
    skills: results,
    instruction_sync: syncAgentGuidelinesFiles(repoRoot),
  };
}
