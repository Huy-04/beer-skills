import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { listSkillDeclarationFiles, parseSkillFile } from "../beer-dependencies/metadata.mjs";
import { resolveRepoRoot as resolveOnboardRepoRoot } from "../commands/onboard-beer.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const INSTALL_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..");
const PACKAGED_SKILLS_ROOT = path.join(INSTALL_ROOT, "skills");

function toPortablePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function stripBeerPrefix(skillName) {
  return skillName.startsWith("beer:") ? skillName.slice("beer:".length) : skillName;
}

export function toClaudeCommandName(skillName) {
  const base = stripBeerPrefix(skillName);
  return `beer-${base}`;
}

export function getClaudeTargets(repoRoot, overrides = {}) {
  const resolvedRepoRoot = resolveOnboardRepoRoot(repoRoot);
  return {
    repoRoot: resolvedRepoRoot,
    projectCommands: overrides.projectCommandsDir || path.join(resolvedRepoRoot, ".claude", "commands"),
    globalCommands:
      overrides.globalCommandsDir || path.join(process.env.USERPROFILE || process.env.HOME || "", ".claude", "commands"),
  };
}

function getProjectSkillSourceRoot(resolvedRepoRoot, explicitSkillsRoot) {
  if (explicitSkillsRoot) {
    return path.resolve(explicitSkillsRoot);
  }

  const repoSkillSnapshot = path.join(resolvedRepoRoot, ".beer", "skills");
  if (fs.existsSync(repoSkillSnapshot)) {
    return repoSkillSnapshot;
  }

  return PACKAGED_SKILLS_ROOT;
}

export function buildClaudeCommandSpecs(skillsRoot) {
  return listSkillDeclarationFiles(skillsRoot)
    .map((skillFilePath) => {
      const parsed = parseSkillFile(skillFilePath);
      const rawSkillName = stripBeerPrefix(parsed.skill_name);
      const relativeSkillDir = toPortablePath(path.relative(skillsRoot, path.dirname(skillFilePath)));
      const packagedSkillFile = path.join(PACKAGED_SKILLS_ROOT, relativeSkillDir, "SKILL.md");
      const repoSkillFile = `.beer/skills/${relativeSkillDir}/SKILL.md`;
      const commandName = toClaudeCommandName(rawSkillName);
      const commandFile = `${commandName}.md`;
      const embeddedSkill = fs.readFileSync(skillFilePath, "utf8").trim();

      const commandBody = [
        "---",
        `description: Beer skill command for ${rawSkillName}`,
        "---",
        "",
        `Use the Beer skill \`${rawSkillName}\`.`,
        "",
        `- Slash command name: \`/${commandName}\``,
        `- Internal Beer skill id: \`beer:${rawSkillName}\``,
        `- Prefer the repo-local skill snapshot at \`${repoSkillFile}\` when it exists.`,
        `- If the repo-local snapshot is missing, use the embedded fallback below.`,
        "- Keep the skill's routing, ownership boundary, and output contract intact.",
        "- If the skill depends on Beer onboarding and `.beer/` is missing, say so clearly instead of pretending the workflow is active.",
        "",
        `Repo-local preferred path: \`${repoSkillFile}\``,
        `Packaged fallback path: \`${toPortablePath(packagedSkillFile)}\``,
        "",
        "## Embedded fallback skill",
        "",
        embeddedSkill,
        "",
      ].join("\n");

      return {
        skillName: rawSkillName,
        beerSkillId: `beer:${rawSkillName}`,
        commandName,
        commandFile,
        relativeSkillDir,
        commandBody,
      };
    })
    .sort((left, right) => left.commandName.localeCompare(right.commandName));
}

function syncClaudeCommandDirectory(targetDir, commandSpecs) {
  fs.mkdirSync(targetDir, { recursive: true });

  const desiredFiles = new Set(commandSpecs.map((spec) => spec.commandFile));
  const existingBeerCommands = fs.existsSync(targetDir)
    ? fs.readdirSync(targetDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && /^beer-.*\.md$/i.test(entry.name))
        .map((entry) => entry.name)
    : [];

  const removed = [];
  for (const existingFile of existingBeerCommands) {
    if (!desiredFiles.has(existingFile)) {
      fs.rmSync(path.join(targetDir, existingFile), { force: true });
      removed.push(existingFile);
    }
  }

  const files = [];
  for (const spec of commandSpecs) {
    const targetPath = path.join(targetDir, spec.commandFile);
    const existed = fs.existsSync(targetPath);
    fs.writeFileSync(targetPath, `${spec.commandBody.trimEnd()}\n`, "utf8");
    files.push({
      name: spec.commandFile,
      command: `/${spec.commandName}`,
      status: existed ? "updated" : "created",
      path: targetPath,
    });
  }

  return {
    path: targetDir,
    files,
    removed,
  };
}

function renderClaudeCommandInstallResult(result) {
  const lines = ["Beer Claude Command Install"];
  for (const target of result.targets) {
    lines.push(`- ${target.scope}: ${target.files.length} command(s), removed ${target.removed.length}`);
    lines.push(`  Path: ${target.path}`);
  }
  return lines.join("\n");
}

function printClaudeUsage() {
  process.stdout.write("Usage: beer claude install [--global|--all] [--repo-root <path>]\n");
}

function installClaudeCommands(args) {
  const targets = getClaudeTargets(args.repoRoot, args);
  const installProject = !args.global || args.all;
  const installGlobal = args.global || args.all;
  const resolvedRepoRoot = targets.repoRoot;
  const projectSkillsRoot = getProjectSkillSourceRoot(resolvedRepoRoot, args.skillsRoot);
  const globalSkillsRoot = args.skillsRoot ? path.resolve(args.skillsRoot) : PACKAGED_SKILLS_ROOT;
  const results = [];

  if (installProject) {
    results.push({
      scope: "project",
      ...syncClaudeCommandDirectory(targets.projectCommands, buildClaudeCommandSpecs(projectSkillsRoot)),
    });
  }

  if (installGlobal) {
    results.push({
      scope: "global",
      ...syncClaudeCommandDirectory(targets.globalCommands, buildClaudeCommandSpecs(globalSkillsRoot)),
    });
  }

  const payload = {
    command: "claude",
    action: "install",
    repo_root: resolvedRepoRoot,
    targets: results,
  };

  process.stdout.write(
    args.json ? `${JSON.stringify(payload, null, 2)}\n` : `${renderClaudeCommandInstallResult(payload)}\n`,
  );

  return 0;
}

export async function runClaude(args) {
  const action = args.subcommand || "install";

  if (action === "install") {
    return installClaudeCommands(args);
  }

  printClaudeUsage();
  return 1;
}
