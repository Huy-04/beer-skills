import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function isExecutable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function resolveCommand(command, options = {}) {
  const envPath = options.envPath ?? process.env.PATH ?? "";
  const platform = options.platform || process.platform;
  const pathExists = options.pathExists || fs.existsSync;
  const executableCheck = options.executableCheck || isExecutable;
  const windowsExtensions =
    platform === "win32"
      ? (options.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM")
          .split(";")
          .map((extension) => extension.toLowerCase())
      : [""];

  for (const segment of envPath.split(path.delimiter).filter(Boolean)) {
    const candidate = path.join(segment, command);
    const probePaths =
      platform === "win32" && path.extname(candidate) === ""
        ? [...windowsExtensions.map((extension) => `${candidate}${extension}`), candidate]
        : [candidate];

    for (const probePath of probePaths) {
      if (pathExists(probePath) && executableCheck(probePath)) {
        return probePath;
      }
    }
  }

  return "";
}

export function buildGitNexusSetupCommand() {
  return "npx -y gitnexus@latest setup";
}

export function buildGitNexusAnalyzeCommand() {
  return "npx gitnexus analyze";
}

export function buildBeadsInstallCommand() {
  return "npm install -g @beads/bd";
}

export function isWindowsShellCommand(commandPath, platform = process.platform) {
  return platform === "win32" && [".cmd", ".bat"].includes(path.extname(commandPath).toLowerCase());
}

export function quoteWindowsShellArg(value) {
  const text = String(value);
  if (text === "") {
    return '""';
  }
  return `"${text.replace(/"/g, '\\"')}"`;
}

function quoteWindowsArg(arg) {
  const text = String(arg);
  if (!text.includes(" ") && !text.includes('"')) {
    return text;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

function runResolvedCommand(commandPath, args, options = {}) {
  const platform = options.platform || process.platform;
  if (isWindowsShellCommand(commandPath, platform)) {
    const cmd = [commandPath, ...args].map(quoteWindowsArg).join(" ");
    execSync(cmd, {
      cwd: options.cwd,
      stdio: options.stdio || "inherit",
    });
    return;
  }

  execFileSync(commandPath, args, {
    cwd: options.cwd,
    stdio: options.stdio || "inherit",
  });
}

export function runToolchainCommand(commandPath, args, options = {}) {
  return runResolvedCommand(commandPath, args, options);
}

export function commandRuns(commandPath, args) {
  try {
    runResolvedCommand(commandPath, args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function normalizeToolError(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

export function installGitNexus(options = {}) {
  const npxPath = resolveCommand("npx");
  const gitNexusCommand = buildGitNexusSetupCommand();

  if (options.alreadyInstalled) {
    return {
      id: "gitnexus",
      attempted: false,
      status: "skipped",
      installer_command: gitNexusCommand,
      reason: "GitNexus MCP already available; skipping setup.",
    };
  }

  if (!npxPath) {
    return {
      id: "gitnexus",
      attempted: false,
      status: "manual_required",
      installer_command: gitNexusCommand,
      reason: "GitNexus setup requires npx on PATH.",
    };
  }

  if (options.dryRun) {
    return {
      id: "gitnexus",
      attempted: false,
      status: "dry_run",
      installer_command: gitNexusCommand,
      reason: "Dry run requested.",
    };
  }

  try {
    runResolvedCommand(npxPath, ["-y", "gitnexus@latest", "setup"]);
    return {
      id: "gitnexus",
      attempted: true,
      status: "completed",
      installer_command: gitNexusCommand,
    };
  } catch (error) {
    return {
      id: "gitnexus",
      attempted: true,
      status: "failed",
      installer_command: gitNexusCommand,
      reason: normalizeToolError(error),
    };
  }
}

export function installBeads(options = {}) {
  const npmPath = resolveCommand("npm");
  const beadsCommand = buildBeadsInstallCommand();

  if (!npmPath) {
    return {
      id: "beads",
      attempted: false,
      status: "manual_required",
      installer_command: beadsCommand,
      reason: "Beads install requires npm on PATH.",
    };
  }

  if (options.dryRun) {
    return {
      id: "beads",
      attempted: false,
      status: "dry_run",
      installer_command: beadsCommand,
      reason: "Dry run requested.",
    };
  }

  try {
    runResolvedCommand(npmPath, ["install", "-g", "@beads/bd"]);
    return {
      id: "beads",
      attempted: true,
      status: "completed",
      installer_command: beadsCommand,
    };
  } catch (error) {
    return {
      id: "beads",
      attempted: true,
      status: "failed",
      installer_command: beadsCommand,
      reason: normalizeToolError(error),
    };
  }
}

export function installFullToolchain({ dryRunTools }) {
  const steps = [
    installGitNexus({ dryRun: dryRunTools }),
    installBeads({ dryRun: dryRunTools }),
  ];

  return {
    attempted: steps.some((step) => step.attempted),
    status: steps.every((step) => ["completed", "skipped"].includes(step.status))
      ? "completed"
      : steps.some((step) => step.status === "failed")
        ? "failed"
        : steps.some((step) => step.status === "manual_required")
          ? "manual_required"
          : "dry_run",
    steps,
  };
}
