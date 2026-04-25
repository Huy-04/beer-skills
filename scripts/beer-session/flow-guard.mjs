import path from "node:path";

import { readBeerStatus, resolveRepoRoot } from "../beer-state/core.mjs";

const CODING_SKILLS = new Set([
  "executing",
  "swarming",
  "debugging",
  "test-driven-development",
  "writing-beer-skills",
  "beer-agent-guidelines",
]);

const MANAGED_INSTRUCTION_FILES = new Set(["AGENTS.md", "CLAUDE.md"]);

function normalizePaths(filePaths, repoRoot) {
  if (!Array.isArray(filePaths)) {
    return [];
  }

  return filePaths
    .filter((filePath) => typeof filePath === "string" && filePath.trim() !== "")
    .map((filePath) => path.basename(path.resolve(repoRoot, filePath)));
}

function isManagedInstructionOnly(targetFiles) {
  return targetFiles.length > 0 && targetFiles.every((fileName) => MANAGED_INSTRUCTION_FILES.has(fileName));
}

function hasExecutionApproval(status) {
  const state = status.state_json || {};
  return Boolean(
    state.approved_gates?.execution &&
    ["executing", "swarming"].includes(state.execution_target),
  );
}

function hasExecutionHandoff(status) {
  const nextHandoff = status.state_json?.next_handoff || "";
  return nextHandoff.includes("beer:executing") || nextHandoff.includes("beer:swarming");
}

function buildAllow(code, summary, extra = {}) {
  return {
    allow: true,
    code,
    summary,
    ...extra,
  };
}

function buildBlock(code, summary, status, extra = {}) {
  return {
    allow: false,
    code,
    summary,
    next_reads: status.next_reads || [],
    recommended_actions: status.recommended_actions || [],
    ...extra,
  };
}

export function assessFlowGuard(options = {}) {
  const repoRoot = resolveRepoRoot(options.repoRoot);
  const status = readBeerStatus(repoRoot);
  const targetFiles = normalizePaths(options.paths, repoRoot);
  const activeSkill = status.state_json?.active_skill || status.state_markdown?.skill || "";

  if (!status.onboarding.exists) {
    return buildAllow("not_onboarded", "Beer onboarding is missing; flow guard is inactive.", {
      repo_root: repoRoot,
      target_files: targetFiles,
    });
  }

  if (!status.config?.features?.codex_hooks) {
    return buildAllow("hooks_disabled", "Beer codex hooks are disabled in config.", {
      repo_root: repoRoot,
      target_files: targetFiles,
    });
  }

  if (options.trivial) {
    return buildAllow("trivial_bypass", "Trivial-task bypass was explicitly requested.", {
      repo_root: repoRoot,
      target_files: targetFiles,
    });
  }

  if (isManagedInstructionOnly(targetFiles)) {
    return buildAllow("managed_instruction_files", "Managed instruction files are exempt from flow lock.", {
      repo_root: repoRoot,
      target_files: targetFiles,
    });
  }

  if (CODING_SKILLS.has(activeSkill)) {
    if (["executing", "swarming"].includes(activeSkill) && !hasExecutionApproval(status)) {
      return buildBlock(
        "execution_gate_missing",
        "Execution skill is active, but Gate 3 approval is not recorded yet.",
        status,
        {
          repo_root: repoRoot,
          target_files: targetFiles,
          active_skill: activeSkill,
        },
      );
    }

    return buildAllow("coding_skill_active", `Coding is allowed while ${activeSkill} is the active Beer skill.`, {
      repo_root: repoRoot,
      target_files: targetFiles,
      active_skill: activeSkill,
    });
  }

  if (hasExecutionApproval(status) && hasExecutionHandoff(status)) {
    return buildAllow("execution_handoff_ready", "Execution approval is recorded and the next Beer handoff is an execution route.", {
      repo_root: repoRoot,
      target_files: targetFiles,
      active_skill: activeSkill,
    });
  }

  return buildBlock(
    "beer_flow_lock",
    "Beer flow lock is active. Route through the correct Beer skill before coding.",
    status,
    {
      repo_root: repoRoot,
      target_files: targetFiles,
      active_skill: activeSkill,
    },
  );
}
