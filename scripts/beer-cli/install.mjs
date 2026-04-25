import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildBeerPreflightReport } from "../commands/beer-preflight.mjs";
import { resolveRepoRoot as resolveOnboardRepoRoot } from "../commands/onboard-beer.mjs";
import { installBeads, installGitNexus } from "./toolchain.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const INSTALL_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..");
const PACKAGED_SKILLS_ROOT = path.join(INSTALL_ROOT, "skills");

const INSTALLERS = {
  beads: installBeads,
  gitnexus: installGitNexus,
};

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

  function walk(dir, relative = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relative, entry.name);
      if (fs.existsSync(path.join(fullPath, "SKILL.md"))) {
        skills.push({
          name: entry.name,
          sourcePath: fullPath,
        });
      } else {
        walk(fullPath, relPath);
      }
    }
  }

  walk(root);
  return skills;
}

export function syncProjectSkills(repoRoot) {
  const targetDir = path.join(repoRoot, ".claude", "skills");
  fs.mkdirSync(targetDir, { recursive: true });

  const skillDirs = findSkillDirectories(PACKAGED_SKILLS_ROOT);

  const results = [];
  for (const skill of skillDirs) {
    const targetSkillDir = path.join(targetDir, skill.name);
    const existed = fs.existsSync(targetSkillDir);

    if (existed) {
      fs.rmSync(targetSkillDir, { recursive: true, force: true });
    }

    fs.mkdirSync(targetSkillDir, { recursive: true });
    copyDirRecursive(skill.sourcePath, targetSkillDir);

    results.push({
      name: skill.name,
      status: existed ? "updated" : "created",
    });
  }

  return {
    path: targetDir,
    skills: results,
  };
}

function renderInstallResult(result) {
  const lines = ["Beer Tool Install"];

  if (result.status === "completed") {
    lines.push(`${result.id}: installed`);
  } else if (result.status === "skipped") {
    lines.push(`${result.id}: skipped`);
    lines.push(`  Reason: ${result.reason}`);
  } else if (result.status === "manual_required") {
    lines.push(`${result.id}: manual required`);
    lines.push(`  Command: ${result.installer_command}`);
    lines.push(`  Reason: ${result.reason}`);
  } else if (result.status === "failed") {
    lines.push(`${result.id}: failed`);
    lines.push(`  Reason: ${result.reason}`);
  } else if (result.status === "dry_run") {
    lines.push(`${result.id}: dry run`);
    lines.push(`  Command: ${result.installer_command}`);
  } else {
    lines.push(`${result.id}: unknown status (${result.status})`);
  }

  return lines.join("\n");
}

export async function runInstall(args) {
  const tool = args.tool;

  if (!tool) {
    const repoRoot = resolveOnboardRepoRoot(args.repoRoot);
    const result = syncProjectSkills(repoRoot);

    const lines = ["Beer Skill Install"];
    lines.push(`Target: ${repoRoot}`);
    lines.push(`Skills directory: ${result.path}`);
    lines.push(`Installed ${result.skills.length} skill(s):`);
    for (const skill of result.skills) {
      lines.push(`  ${skill.status === "created" ? "+" : "~"} ${skill.name}`);
    }
    process.stdout.write(lines.join("\n") + "\n");
    return 0;
  }

  const installer = INSTALLERS[tool];
  if (!installer) {
    process.stdout.write(`Unknown tool: ${tool}\n`);
    process.stdout.write("Available tools: beads, gitnexus\n");
    process.stdout.write("Or run 'beer install' to install skills into the current project.\n");
    return 1;
  }

  const preflight = buildBeerPreflightReport(resolveOnboardRepoRoot(args.repoRoot));
  const result = installer({
    dryRun: args.dryRunTools,
    alreadyInstalled: tool === "gitnexus" ? Boolean(preflight.available_tools.gitnexus) : false,
  });
  process.stdout.write(`${renderInstallResult(result)}\n`);

  return ["completed", "skipped"].includes(result.status) ? 0 : 1;
}
