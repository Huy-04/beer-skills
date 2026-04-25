#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkCommand, hasMcpServer } from "../onboard-beer/checks.mjs";
import { buildDefaultConfig, buildDefaultState, buildDefaultStateMd, utcNow } from "../onboard-beer/defaults.mjs";
import { MANAGED_SCRIPT_FILES, MANAGED_SKILL_SENTINEL, MIN_NODE_MAJOR } from "../onboard-beer/manifest.mjs";
import { removeInstalledBeerSkills, removeManagedAgentGuidelines, syncProjectSkills } from "../beer-cli/skill-sync.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(SCRIPT_PATH);
const SCRIPTS_ROOT = path.dirname(SCRIPT_DIR);
const INSTALL_ROOT = path.dirname(SCRIPTS_ROOT);

export function getNodeRuntimeStatus(version = process.versions.node) {
  const major = Number.parseInt(String(version).split(".")[0] || "0", 10);
  const supported = Number.isFinite(major) && major >= MIN_NODE_MAJOR;
  return { command: "node", minimum_major: MIN_NODE_MAJOR, supported, version };
}

export function resolveRepoRoot(explicitRoot) {
  if (explicitRoot) {
    return path.resolve(explicitRoot);
  }
  const cwd = path.resolve(process.cwd());
  try {
    const stdout = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    });
    return path.resolve(stdout.trim());
  } catch {
    return cwd;
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function samePath(leftPath, rightPath) {
  return path.resolve(leftPath) === path.resolve(rightPath);
}

function syncTree(sourcePath, targetPath, options = {}) {
  if (!fs.existsSync(sourcePath) || samePath(sourcePath, targetPath)) {
    return false;
  }

  if (options.clean && fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  fs.cpSync(sourcePath, targetPath, {
    recursive: true,
    force: true,
  });
  return true;
}

function hasManagedScripts(scriptsDir) {
  return MANAGED_SCRIPT_FILES.every((fileName) =>
    fs.existsSync(path.join(scriptsDir, fileName)),
  );
}

function hasManagedSkills(skillsDir) {
  return fs.existsSync(path.join(skillsDir, MANAGED_SKILL_SENTINEL));
}

export function checkRepo(repoRoot) {
  const runtime = getNodeRuntimeStatus();
  if (!runtime.supported) {
    return {
      repo_root: repoRoot,
      status: "missing_runtime",
      message: `Beer requires Node.js ${MIN_NODE_MAJOR}+. Install Node.js and rerun onboarding.`,
      details: { runtime },
    };
  }

  const beerDir = path.join(repoRoot, ".beer");
  const statePath = path.join(beerDir, "state.json");
  const stateMdPath = path.join(beerDir, "STATE.md");
  const configPath = path.join(beerDir, "config.json");
  const skillsDir = path.join(beerDir, "skills");
  const scriptsDir = path.join(beerDir, "scripts");

  const stateExists = fs.existsSync(statePath);
  const stateMdExists = fs.existsSync(stateMdPath);
  const configExists = fs.existsSync(configPath);
  const skillsExists = fs.existsSync(skillsDir);
  const scriptsExists = fs.existsSync(scriptsDir);
  const skillsReady = skillsExists && hasManagedSkills(skillsDir);
  const scriptsReady = scriptsExists && hasManagedScripts(scriptsDir);

  const bdOk = checkCommand("bd");
  const gitnexusOk = hasMcpServer(repoRoot, "gitnexus");

  const actions = [];

  if (!stateExists) actions.push("create-state.json");
  if (!stateMdExists) actions.push("create-STATE.md");
  if (!configExists) actions.push("create-config.json");
  if (!skillsExists) actions.push("create-skills-dir");
  if (!skillsReady) actions.push("sync-skills-snapshot");
  if (!scriptsExists) actions.push("create-scripts-dir");
  if (!scriptsReady) actions.push("sync-scripts-snapshot");

  return {
    repo_root: repoRoot,
    status: actions.length === 0 ? "up_to_date" : "needs_onboarding",
    actions,
    requires_confirmation: false,
    details: {
      runtime,
      state_exists: stateExists,
      state_md_exists: stateMdExists,
      config_exists: configExists,
      skills_exist: skillsExists,
      skills_ready: skillsReady,
      scripts_exist: scriptsExists,
      scripts_ready: scriptsReady,
      bd_available: bdOk,
      gitnexus_available: gitnexusOk,
    },
  };
}

export function applyRepo(repoRoot) {
  const runtime = getNodeRuntimeStatus();
  if (!runtime.supported) {
    return {
      repo_root: repoRoot,
      status: "missing_runtime",
      applied: false,
      message: `Beer requires Node.js ${MIN_NODE_MAJOR}+.`,
    };
  }

  const beerDir = path.join(repoRoot, ".beer");
  const statePath = path.join(beerDir, "state.json");
  const stateMdPath = path.join(beerDir, "STATE.md");
  const configPath = path.join(beerDir, "config.json");
  const skillsDir = path.join(beerDir, "skills");
  const scriptsDir = path.join(beerDir, "scripts");
  const onboardingPath = path.join(beerDir, "onboarding.json");
  const sourceSkillsDir = path.join(INSTALL_ROOT, "skills");
  const sourceScriptsDir = SCRIPTS_ROOT;

  ensureDir(beerDir);
  ensureDir(skillsDir);
  ensureDir(scriptsDir);

  if (!fs.existsSync(statePath)) {
    fs.writeFileSync(statePath, `${JSON.stringify(buildDefaultState(), null, 2)}\n`, "utf8");
  }

  if (!fs.existsSync(stateMdPath)) {
    fs.writeFileSync(stateMdPath, buildDefaultStateMd(), "utf8");
  }

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, `${JSON.stringify(buildDefaultConfig(), null, 2)}\n`, "utf8");
  }

  syncTree(sourceSkillsDir, skillsDir);
  syncTree(sourceScriptsDir, scriptsDir, { clean: true });

  const onboardingPayload = {
    schema_version: "1.0",
    plugin: "beer",
    plugin_version: "1.0.0",
    installed_at: utcNow(),
    status: "complete",
    managed_assets: {
      state_file: ".beer/state.json",
      state_md_file: ".beer/STATE.md",
      config_file: ".beer/config.json",
      skills_dir: ".beer/skills",
      scripts_dir: ".beer/scripts",
    },
  };
  fs.writeFileSync(onboardingPath, `${JSON.stringify(onboardingPayload, null, 2)}\n`, "utf8");

  return {
    ...checkRepo(repoRoot),
    applied: true,
    result: onboardingPayload,
  };
}

export function removeRepo(repoRoot) {
  const beerDir = path.join(repoRoot, ".beer");
  const existed = fs.existsSync(beerDir);

  if (existed) {
    fs.rmSync(beerDir, { recursive: true, force: true });
  }

  const removedSkills = removeInstalledBeerSkills(repoRoot).removed;
  const removedGuidelines = removeManagedAgentGuidelines(repoRoot).files;
  const removedAnything =
    existed ||
    removedSkills.length > 0 ||
    removedGuidelines.some((file) => file.status === "removed" || file.status === "updated");

  return {
    repo_root: repoRoot,
    removed: removedAnything,
    status: removedAnything ? "removed" : "not_installed",
    managed_root: ".beer",
    removed_skills: removedSkills,
    removed_guidelines: removedGuidelines,
  };
}

function parseCliArgs(argv) {
  const args = { repoRoot: undefined, apply: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") { args.repoRoot = argv[index + 1]; index += 1; continue; }
    if (arg.startsWith("--repo-root=")) { args.repoRoot = arg.slice("--repo-root=".length); continue; }
    if (arg === "--apply") { args.apply = true; continue; }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write([
        "Usage: onboard-beer.mjs [--repo-root <path>] [--apply]",
        "",
        "Checks or applies Beer repo onboarding.",
        "  --repo-root <path>  Path to repository root (default: git top-level or cwd)",
        "  --apply             Apply onboarding (create/update managed files)",
      ].join("\n"));
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  const repoRoot = resolveRepoRoot(args.repoRoot);
  const payload = args.apply
    ? {
        ...applyRepo(repoRoot),
        skill_install: syncProjectSkills(repoRoot),
      }
    : checkRepo(repoRoot);
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  return payload.status === "missing_runtime" ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
