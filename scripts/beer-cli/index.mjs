import { execFileSync } from "node:child_process";

import { resolveRepoRoot as resolveOnboardRepoRoot } from "../commands/onboard-beer.mjs";
import { readBeerStatus, writeBeerState } from "../beer-state/core.mjs";
import {
  buildGitNexusAnalyzeCommand,
  resolveCommand,
  runToolchainCommand,
} from "./toolchain.mjs";

const NON_MATERIAL_PREFIXES = [
  ".beer/",
  ".git/",
  "docs/",
  "history/",
  "research/",
];

const NON_MATERIAL_FILES = new Set([
  ".gitignore",
  "COMMANDS.md",
  "CONTRIBUTING.md",
  "LICENSE.md",
  "README.md",
  "skill-catalog.md",
]);

const NON_MATERIAL_EXTENSIONS = new Set([
  ".gif",
  ".jpeg",
  ".jpg",
  ".md",
  ".pdf",
  ".png",
  ".svg",
  ".txt",
]);

function normalizeRepoPath(filePath) {
  return String(filePath || "").replaceAll("\\", "/").replace(/^"+|"+$/g, "");
}

export function parseGitStatusPaths(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const payload = line.slice(3).trim();
      const candidate = payload.includes(" -> ")
        ? payload.slice(payload.lastIndexOf(" -> ") + 4)
        : payload;
      return normalizeRepoPath(candidate);
    })
    .filter(Boolean);
}

export function detectChangedPaths(repoRoot, options = {}) {
  const git = options.gitCommand || "git";
  const runner = options.execFileSyncImpl || execFileSync;

  try {
    const stdout = runner(git, ["status", "--porcelain=v1", "--untracked-files=all"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return {
      ok: true,
      code: "detected",
      paths: parseGitStatusPaths(stdout),
    };
  } catch (error) {
    return {
      ok: false,
      code: "git_status_unavailable",
      paths: [],
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function isMaterialRepoPath(filePath) {
  const normalized = normalizeRepoPath(filePath);
  if (!normalized) {
    return false;
  }

  if (NON_MATERIAL_FILES.has(normalized)) {
    return false;
  }

  if (NON_MATERIAL_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return false;
  }

  const lastDot = normalized.lastIndexOf(".");
  const extension = lastDot >= 0 ? normalized.slice(lastDot).toLowerCase() : "";
  if (NON_MATERIAL_EXTENSIONS.has(extension)) {
    return false;
  }

  return true;
}

export function hasMaterialRepoChanges(paths) {
  return paths.some((filePath) => isMaterialRepoPath(filePath));
}

export function assessGitNexusIndex(options = {}) {
  const repoRoot = resolveOnboardRepoRoot(options.repoRoot);
  const command = buildGitNexusAnalyzeCommand();
  const npxPath = options.npxPath ?? resolveCommand("npx");
  const detectResult =
    options.detectResult ||
    detectChangedPaths(repoRoot, {
      execFileSyncImpl: options.execFileSyncImpl,
      gitCommand: options.gitCommand,
    });

  if (!npxPath) {
    return {
      repo_root: repoRoot,
      status: "manual_required",
      code: "npx_missing",
      command,
      changed_paths: detectResult.paths || [],
      reason: "GitNexus repo refresh requires npx on PATH.",
    };
  }

  if (detectResult.ok && !hasMaterialRepoChanges(detectResult.paths || [])) {
    return {
      repo_root: repoRoot,
      status: "skipped",
      code: "no_material_changes",
      command,
      changed_paths: detectResult.paths || [],
      reason: "No graph-relevant repo changes detected after task closeout.",
    };
  }

  if (options.dryRun) {
    return {
      repo_root: repoRoot,
      status: "dry_run",
      code: detectResult.ok ? "ready" : detectResult.code,
      command,
      changed_paths: detectResult.paths || [],
      reason: detectResult.ok
        ? "Dry run requested."
        : "Git status was unavailable; dry run preserves the safe refresh path.",
    };
  }

  return {
    repo_root: repoRoot,
    status: "ready",
    code: detectResult.ok ? "ready" : detectResult.code,
    command,
    npx_path: npxPath,
    changed_paths: detectResult.paths || [],
    reason: detectResult.ok
      ? "Graph-relevant repo changes detected."
      : "Git status was unavailable; refreshing GitNexus to stay safe.",
  };
}

export function runGitNexusIndex(options = {}) {
  const assessment = assessGitNexusIndex(options);

  if (assessment.status !== "ready") {
    return assessment;
  }

  try {
    const runner = options.commandRunner || runToolchainCommand;
    runner(assessment.npx_path, ["gitnexus", "analyze"], {
      cwd: assessment.repo_root,
    });
    return {
      ...assessment,
      status: "completed",
      code: "completed",
      reason: "GitNexus index refreshed for the current repo.",
    };
  } catch (error) {
    return {
      ...assessment,
      status: "failed",
      code: "refresh_failed",
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function mapGitNexusRefreshStatus(result) {
  if (result?.status === "completed") {
    return "completed";
  }
  if (result?.status === "skipped") {
    return "skipped";
  }
  if (result?.status === "manual_required") {
    return "manual-required";
  }
  if (result?.status === "failed") {
    return "failed";
  }
  return "";
}

export function recordGitNexusIndexStatus(repoRoot, result) {
  const status = readBeerStatus(repoRoot);
  if (!status.state_json.exists) {
    return null;
  }

  const gitnexusStatus = mapGitNexusRefreshStatus(result);
  if (!gitnexusStatus) {
    return null;
  }

  return writeBeerState(repoRoot, {
    ...status.state_json,
    gitnexus_refresh_status: gitnexusStatus,
    closeout_ready: false,
  });
}

function renderBeerIndex(result) {
  const lines = [
    "Beer Index",
    `Repo: ${result.repo_root}`,
    `GitNexus: ${result.status}`,
  ];

  if (result.command) {
    lines.push(`Command: ${result.command}`);
  }

  if (result.reason) {
    lines.push(`Reason: ${result.reason}`);
  }

  if (result.changed_paths?.length) {
    lines.push("Changed paths:");
    for (const filePath of result.changed_paths) {
      lines.push(`- ${filePath}`);
    }
  }

  return lines.join("\n");
}

export async function runBeerIndex(args) {
  const result = runGitNexusIndex({
    repoRoot: args.repoRoot,
    dryRun: args.dryRunTools,
  });
  const recordedState = recordGitNexusIndexStatus(result.repo_root, result);
  const output = {
    ...result,
    state_updated: Boolean(recordedState),
    gitnexus_refresh_status: recordedState?.gitnexus_refresh_status || undefined,
  };

  process.stdout.write(
    args.json ? `${JSON.stringify(output, null, 2)}\n` : `${renderBeerIndex(output)}\n`,
  );

  return ["completed", "skipped", "dry_run"].includes(result.status) ? 0 : 1;
}
