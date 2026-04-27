#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkCommand, hasMcpServer } from "../onboard-beer/checks.mjs";
import { buildDefaultConfig, buildDefaultState, buildDefaultStateMd, utcNow } from "../onboard-beer/defaults.mjs";
import { MANAGED_CLI_FILES, MANAGED_SCRIPT_FILES, MANAGED_SKILL_SENTINEL, MIN_NODE_MAJOR } from "../onboard-beer/manifest.mjs";
import {
  removeInstalledBeerSkills,
  removeManagedAgentGuidelines,
  removeManagedClaudeHookSettings,
  removeManagedCodexConfig,
  removeManagedCodexHookSettings,
  syncProjectSkills,
} from "../beer-cli/skill-sync.mjs";

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

function hasManagedCli(binDir) {
  return MANAGED_CLI_FILES.every((fileName) =>
    fs.existsSync(path.join(binDir, fileName)),
  );
}

function hasManagedSkills(skillsDir) {
  return fs.existsSync(path.join(skillsDir, MANAGED_SKILL_SENTINEL));
}

function writeExecutableFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
  try {
    fs.chmodSync(filePath, 0o755);
  } catch {
    // Best effort only. Windows relies on .cmd/.ps1 wrappers.
  }
}

function syncProjectCli(repoRoot) {
  const binDir = path.join(repoRoot, ".beer", "bin");
  ensureDir(binDir);

  writeExecutableFile(
    path.join(binDir, "beer.mjs"),
    [
      "#!/usr/bin/env node",
      "",
      'import { main } from "../scripts/commands/beer-cli.mjs";',
      "",
      "main().then(",
      "  (code) => {",
      "    process.exitCode = code;",
      "  },",
      "  (error) => {",
      "    console.error(error instanceof Error ? error.message : String(error));",
      "    process.exitCode = 1;",
      "  },",
      ");",
      "",
    ].join("\n"),
  );

  writeExecutableFile(
    path.join(binDir, "beer"),
    [
      "#!/usr/bin/env sh",
      'DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"',
      'exec node "$DIR/beer.mjs" "$@"',
      "",
    ].join("\n"),
  );

  fs.writeFileSync(
    path.join(binDir, "beer.cmd"),
    [
      "@echo off",
      'node "%~dp0beer.mjs" %*',
      "",
    ].join("\r\n"),
    "utf8",
  );

  fs.writeFileSync(
    path.join(binDir, "beer.ps1"),
    [
      '& node "$PSScriptRoot/beer.mjs" @args',
      "exit $LASTEXITCODE",
      "",
    ].join("\r\n"),
    "utf8",
  );

  return {
    path: binDir,
    files: [...MANAGED_CLI_FILES],
  };
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
  const binDir = path.join(beerDir, "bin");

  const stateExists = fs.existsSync(statePath);
  const stateMdExists = fs.existsSync(stateMdPath);
  const configExists = fs.existsSync(configPath);
  const skillsExists = fs.existsSync(skillsDir);
  const scriptsExists = fs.existsSync(scriptsDir);
  const cliExists = fs.existsSync(binDir);
  const skillsReady = skillsExists && hasManagedSkills(skillsDir);
  const scriptsReady = scriptsExists && hasManagedScripts(scriptsDir);
  const cliReady = cliExists && hasManagedCli(binDir);

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
  if (!cliExists) actions.push("create-cli-bin");
  if (!cliReady) actions.push("sync-project-cli");

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
      cli_exists: cliExists,
      cli_ready: cliReady,
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
  const binDir = path.join(beerDir, "bin");
  const onboardingPath = path.join(beerDir, "onboarding.json");
  const sourceSkillsDir = path.join(INSTALL_ROOT, "skills");
  const sourceScriptsDir = SCRIPTS_ROOT;

  ensureDir(beerDir);
  ensureDir(skillsDir);
  ensureDir(scriptsDir);
  ensureDir(binDir);

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
  syncProjectCli(repoRoot);

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
      cli_dir: ".beer/bin",
      cli_entrypoint: ".beer/bin/beer.mjs",
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
  const cliDir = path.join(beerDir, "bin");
  const existed = fs.existsSync(beerDir);
  const cliExisted = fs.existsSync(cliDir);

  if (existed) {
    fs.rmSync(beerDir, { recursive: true, force: true });
  }

  const removedSkillCleanup = removeInstalledBeerSkills(repoRoot);
  const removedSkills = removedSkillCleanup.removed;
  const removedGuidelines = removeManagedAgentGuidelines(repoRoot).files;
  const removedHooks = removeManagedClaudeHookSettings(repoRoot);
  const removedCodexHooks = removeManagedCodexHookSettings(repoRoot);
  const removedCodexConfig = removeManagedCodexConfig(repoRoot);
  const removedAnything =
    existed ||
    removedSkills.length > 0 ||
    removedGuidelines.some((file) => file.status === "removed" || file.status === "updated") ||
    ["removed", "updated"].includes(removedHooks.status) ||
    ["removed", "updated"].includes(removedCodexHooks.status) ||
    ["removed", "updated"].includes(removedCodexConfig.status);

  return {
    repo_root: repoRoot,
    removed: removedAnything,
    status: removedAnything ? "removed" : "not_installed",
    managed_root: ".beer",
    removed_skills: removedSkills,
    removed_skill_targets: removedSkillCleanup.targets,
    removed_cli: {
      path: ".beer/bin",
      status: cliExisted ? "removed" : "missing",
    },
    removed_guidelines: removedGuidelines,
    removed_hooks: removedHooks,
    removed_codex_hooks: removedCodexHooks,
    removed_codex_config: removedCodexConfig,
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
