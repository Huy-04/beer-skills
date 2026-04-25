import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { readBeerState, resolveRepoRoot } from "../beer-state/core.mjs";

const DOC_EXTENSIONS = new Set([".md", ".mdx", ".txt", ".rst"]);
const NON_IMPLEMENTATION_ROOTS = new Set([".beer", ".claude", ".codex", ".agents", "docs", "history"]);
const TEST_ROOTS = new Set(["test", "tests", "__tests__"]);
const STRATEGY_LIMITS = {
  "single-worker": {
    max_files: 12,
    max_lines: 600,
    max_implementation_areas: 3,
  },
  "multi-worker": {
    max_files: 28,
    max_lines: 1800,
    max_implementation_areas: 6,
  },
};

function normalizeCheckStatus(value) {
  return value === "pass" || value === "fail" ? value : "";
}

function parseNumstatLine(line) {
  const [rawAdditions, rawDeletions, filePath] = line.split("\t");
  if (!filePath) {
    return null;
  }
  const additions = rawAdditions === "-" ? 0 : Number.parseInt(rawAdditions, 10) || 0;
  const deletions = rawDeletions === "-" ? 0 : Number.parseInt(rawDeletions, 10) || 0;
  return {
    path: filePath.replace(/\\/g, "/"),
    additions,
    deletions,
  };
}

function mergeDiffEntries(entries) {
  const merged = new Map();
  for (const entry of entries) {
    const current = merged.get(entry.path) || { path: entry.path, additions: 0, deletions: 0 };
    current.additions = Math.max(current.additions, entry.additions);
    current.deletions = Math.max(current.deletions, entry.deletions);
    merged.set(entry.path, current);
  }
  return [...merged.values()];
}

function listTrackedDiff(repoRoot, args, execFileSyncImpl) {
  const output = execFileSyncImpl("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseNumstatLine)
    .filter(Boolean);
}

function countFileLines(filePath) {
  if (!fs.existsSync(filePath)) {
    return 0;
  }
  const text = fs.readFileSync(filePath, "utf8");
  if (text === "") {
    return 0;
  }
  return text.split(/\r?\n/).length;
}

function listUntrackedDiff(repoRoot, execFileSyncImpl) {
  const output = execFileSyncImpl("git", ["ls-files", "--others", "--exclude-standard"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((filePath) => ({
      path: filePath.replace(/\\/g, "/"),
      additions: countFileLines(path.join(repoRoot, filePath)),
      deletions: 0,
    }));
}

export function collectReviewDiffStats(options = {}) {
  const repoRoot = resolveRepoRoot(options.repoRoot);
  const execFileSyncImpl = options.execFileSyncImpl || execFileSync;

  try {
    const headTracked = listTrackedDiff(repoRoot, ["diff", "--numstat", "HEAD", "--"], execFileSyncImpl);
    const untracked = listUntrackedDiff(repoRoot, execFileSyncImpl);
    return {
      ok: true,
      repo_root: repoRoot,
      entries: mergeDiffEntries([...headTracked, ...untracked]),
    };
  } catch {
    try {
      const staged = listTrackedDiff(repoRoot, ["diff", "--numstat", "--cached", "--"], execFileSyncImpl);
      const unstaged = listTrackedDiff(repoRoot, ["diff", "--numstat", "--"], execFileSyncImpl);
      const untracked = listUntrackedDiff(repoRoot, execFileSyncImpl);
      return {
        ok: true,
        repo_root: repoRoot,
        entries: mergeDiffEntries([...staged, ...unstaged, ...untracked]),
      };
    } catch {
      return {
        ok: false,
        repo_root: repoRoot,
        code: "diff_unavailable",
        summary: "Review quality could not inspect the current diff.",
        next_steps: [
          "Run the review from a git-backed repo, or supply the diff through the normal repo workflow.",
        ],
      };
    }
  }
}

function isDocumentationPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  const extension = path.extname(normalized).toLowerCase();
  if (DOC_EXTENSIONS.has(extension)) {
    return true;
  }
  const firstSegment = normalized.split("/").filter(Boolean)[0] || "";
  return NON_IMPLEMENTATION_ROOTS.has(firstSegment);
}

function implementationArea(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  if (isDocumentationPath(normalized)) {
    return "";
  }
  const segments = normalized.split("/").filter(Boolean);
  const firstSegment = segments[0] || "(root)";
  if (TEST_ROOTS.has(firstSegment)) {
    return "";
  }
  return firstSegment;
}

function summarizeEntries(entries) {
  const reviewedEntries = entries.filter((entry) => !isDocumentationPath(entry.path));
  const implementationAreas = new Set(
    reviewedEntries
      .map((entry) => implementationArea(entry.path))
      .filter(Boolean),
  );
  const totalAdditions = reviewedEntries.reduce((sum, entry) => sum + entry.additions, 0);
  const totalDeletions = reviewedEntries.reduce((sum, entry) => sum + entry.deletions, 0);
  return {
    changed_files: reviewedEntries.length,
    total_additions: totalAdditions,
    total_deletions: totalDeletions,
    total_lines: totalAdditions + totalDeletions,
    implementation_areas: [...implementationAreas].sort(),
  };
}

function limitsForState(state) {
  return STRATEGY_LIMITS[state.orchestration_strategy] || STRATEGY_LIMITS["single-worker"];
}

export function buildReviewQualityStatePatch(result) {
  return {
    code_quantity_status: normalizeCheckStatus(result.code_quantity_status),
    pattern_status: normalizeCheckStatus(result.pattern_status),
    review_quality_status: normalizeCheckStatus(result.review_quality_status),
  };
}

export function assessReviewQuality(options = {}) {
  const repoRoot = resolveRepoRoot(options.repoRoot);
  const state = options.state || readBeerState(repoRoot);
  const diff = options.diffStats || collectReviewDiffStats({ repoRoot, execFileSyncImpl: options.execFileSyncImpl });
  if (!diff.ok) {
    return {
      repo_root: repoRoot,
      ok: false,
      code: diff.code,
      summary: diff.summary,
      next_steps: diff.next_steps || [],
      code_quantity_status: "fail",
      pattern_status: "fail",
      review_quality_status: "fail",
      metrics: {
        changed_files: 0,
        total_additions: 0,
        total_deletions: 0,
        total_lines: 0,
        implementation_areas: [],
      },
    };
  }

  const metrics = summarizeEntries(diff.entries || []);
  const limits = limitsForState(state);
  const quantityOk =
    metrics.changed_files <= limits.max_files &&
    metrics.total_lines <= limits.max_lines;
  const patternOk = metrics.implementation_areas.length <= limits.max_implementation_areas;
  const ok = quantityOk && patternOk;
  const nextSteps = [];

  if (!quantityOk) {
    nextSteps.push(
      `Reduce the review slice or reslice the work. Current diff is ${metrics.changed_files} files / ${metrics.total_lines} lines; target is <= ${limits.max_files} files and <= ${limits.max_lines} lines for ${state.orchestration_strategy || "single-worker"}.`,
    );
  }
  if (!patternOk) {
    nextSteps.push(
      `Pattern spread is too wide for the current strategy. Current implementation areas: ${metrics.implementation_areas.join(", ") || "(none)"}; target is <= ${limits.max_implementation_areas}.`,
    );
  }
  if (ok) {
    nextSteps.push("Review size and pattern spread are within the current Beer strategy.");
  }

  return {
    repo_root: repoRoot,
    ok,
    code: ok ? "review_quality_passed" : "review_quality_failed",
    summary: ok
      ? `Review quality passed: ${metrics.changed_files} reviewed files across ${metrics.implementation_areas.length} implementation areas.`
      : `Review quality failed: ${metrics.changed_files} reviewed files across ${metrics.implementation_areas.length} implementation areas exceeds the current ${state.orchestration_strategy || "single-worker"} limits.`,
    next_steps: nextSteps,
    code_quantity_status: quantityOk ? "pass" : "fail",
    pattern_status: patternOk ? "pass" : "fail",
    review_quality_status: ok ? "pass" : "fail",
    metrics,
    limits,
  };
}
