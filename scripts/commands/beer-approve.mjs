#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readBeerState, readBeerStatus, resolveRepoRoot, writeBeerState } from "../beer-state/core.mjs";
import { runGitNexusIndex } from "../beer-cli/index.mjs";
import { assessReviewQuality, buildReviewQualityStatePatch } from "../beer-session/review-quality-guard.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const APPROVALS = new Set(["context", "phase-plan", "execution", "review"]);

function normalizeApproval(value) {
  return APPROVALS.has(value) ? value : "";
}

function readContextPath(status) {
  return status.state_json.context_path || (status.state_json.feature_slug ? `history/${status.state_json.feature_slug}/CONTEXT.md` : "");
}

function resolveRepoPath(repoRoot, relativePath) {
  return path.isAbsolute(relativePath) ? relativePath : path.join(repoRoot, relativePath);
}

export function assessApproval(options = {}) {
  const repoRoot = resolveRepoRoot(options.repoRoot);
  const approval = normalizeApproval(options.approval);
  const status = readBeerStatus(repoRoot);
  const state = readBeerState(repoRoot);

  if (!approval) {
    return {
      repo_root: repoRoot,
      approval: options.approval || "",
      ok: false,
      code: "unknown_approval",
      summary: `Unknown approval '${options.approval || ""}'.`,
      next_steps: [
        "Use context, phase-plan, execution, or review.",
      ],
      state,
    };
  }

  if (!status.onboarding.exists) {
    return {
      repo_root: repoRoot,
      approval,
      ok: false,
        code: "onboarding_missing",
        summary: "Approval cannot be recorded before Beer onboarding exists.",
        next_steps: [
        "Run beer init first.",
        ],
        state,
      };
  }

  if (!status.state_json.exists) {
    return {
      repo_root: repoRoot,
      approval,
      ok: false,
      code: "state_missing",
      summary: "Approval cannot be recorded because .beer/state.json is missing.",
      next_steps: [
        "Restore or recreate .beer/state.json before recording approvals.",
      ],
      state,
    };
  }

  if (approval === "context") {
    const contextPath = readContextPath(status);
    if (!contextPath) {
      return {
        repo_root: repoRoot,
        approval,
        ok: false,
        code: "context_path_missing",
        summary: "Context approval needs a CONTEXT.md path in state.",
        next_steps: [
          "Write history/<feature>/CONTEXT.md and store its path in context_path first.",
        ],
        state,
      };
    }
    const absoluteContextPath = resolveRepoPath(repoRoot, contextPath);
    if (!fs.existsSync(absoluteContextPath)) {
      return {
        repo_root: repoRoot,
        approval,
        ok: false,
        code: "context_file_missing",
        summary: `Context approval cannot proceed because ${contextPath} is missing.`,
        next_steps: [
          "Create or restore CONTEXT.md before recording Gate 1 approval.",
        ],
        state,
      };
    }
  }

  if (approval === "phase-plan" && !state.route) {
    return {
      repo_root: repoRoot,
      approval,
      ok: false,
      code: "route_missing",
      summary: "Phase-plan approval needs an active route.",
      next_steps: [
        "Run planning first and record route in state.",
      ],
      state,
    };
  }

  if (approval === "execution") {
    if (!state.approved_gates?.phase_plan) {
      return {
        repo_root: repoRoot,
        approval,
        ok: false,
        code: "phase_plan_not_approved",
        summary: "Execution approval depends on Gate 2 first.",
        next_steps: [
          "Approve phase-plan before approving execution.",
        ],
        state,
      };
    }
    if (state.validation_status !== "pass") {
      return {
        repo_root: repoRoot,
        approval,
        ok: false,
        code: "validation_not_passed",
        summary: "Execution approval needs validation_status = pass.",
        next_steps: [
          "Finish validating and record validation_status = pass first.",
        ],
        state,
      };
    }
    if (!["executing", "swarming"].includes(state.execution_target)) {
      return {
        repo_root: repoRoot,
        approval,
        ok: false,
        code: "execution_target_missing",
        summary: "Execution approval needs execution_target = executing or swarming.",
        next_steps: [
          "Set execution_target during validating before approving execution.",
        ],
        state,
      };
    }
  }

  if (approval === "review") {
    if (state.review_status !== "pass") {
      return {
        repo_root: repoRoot,
        approval,
        ok: false,
        code: "review_not_passed",
        summary: "Review approval needs review_status = pass.",
        next_steps: [
          "Finish reviewing and resolve blocking findings first.",
        ],
        state,
      };
    }
  }

  return {
    repo_root: repoRoot,
    approval,
    ok: true,
    code: "ready",
    summary: `Manual approval for ${approval} may be recorded.`,
    next_steps: [
      "Apply the approval to .beer/state.json.",
    ],
    state,
  };
}

function applyMutation(state, approval) {
  const nextState = {
    ...state,
    approved_gates: {
      ...(state.approved_gates || {}),
    },
  };

  if (approval === "context") {
    nextState.approved_gates.context = true;
    nextState.context_stage = "locked";
    nextState.next_handoff = "beer:planning";
    return nextState;
  }

  if (approval === "phase-plan") {
    nextState.approved_gates.phase_plan = true;
    nextState.next_handoff = "beer:validating";
    return nextState;
  }

  if (approval === "execution") {
    nextState.approved_gates.execution = true;
    nextState.next_handoff = nextState.execution_target === "swarming" ? "beer:swarming" : "beer:executing";
    return nextState;
  }

  nextState.approved_gates.review = true;
  nextState.gitnexus_refresh_status = "";
  nextState.knowledge_base_refresh_status = "";
  nextState.closeout_ready = false;
  nextState.next_handoff = "beer:compounding";
  return nextState;
}

function mapGitNexusRefreshStatus(result) {
  if (!result) {
    return "";
  }

  if (result.status === "completed") {
    return "completed";
  }
  if (result.status === "skipped") {
    return "skipped";
  }
  if (result.status === "manual_required") {
    return "manual-required";
  }
  if (result.status === "failed") {
    return "failed";
  }

  return "";
}

export function recordApproval(options = {}) {
  const assessment = assessApproval(options);
  if (!assessment.ok) {
    return assessment;
  }

  const repoRoot = assessment.repo_root;
  let reviewQuality = null;
  if (assessment.approval === "review") {
    reviewQuality =
      typeof options.reviewQualityRunner === "function"
        ? options.reviewQualityRunner({ repoRoot, state: assessment.state })
        : assessReviewQuality({ repoRoot, state: assessment.state });
    const qualityState = writeBeerState(repoRoot, {
      ...assessment.state,
      ...buildReviewQualityStatePatch(reviewQuality),
    });
    if (!reviewQuality.ok) {
      return {
        repo_root: repoRoot,
        approval: assessment.approval,
        ok: false,
        code: reviewQuality.code,
        summary: reviewQuality.summary,
        next_steps: reviewQuality.next_steps,
        review_quality: reviewQuality,
        state: qualityState,
      };
    }
  }
  const currentState = readBeerState(repoRoot);
  const updatedState = writeBeerState(repoRoot, applyMutation(currentState, assessment.approval));
  const gitNexusIndex =
    assessment.approval === "review"
      ? (typeof options.gitNexusIndexRunner === "function"
          ? options.gitNexusIndexRunner({ repoRoot })
          : runGitNexusIndex({ repoRoot }))
      : null;
  const finalizedState =
    assessment.approval === "review"
      ? writeBeerState(repoRoot, {
          ...updatedState,
          gitnexus_refresh_status: mapGitNexusRefreshStatus(gitNexusIndex),
        })
      : updatedState;
  const nextSteps = [
    `Continue with ${finalizedState.next_handoff || "the next workflow step"}.`,
  ];

  if (gitNexusIndex?.status === "completed") {
    nextSteps.push("GitNexus index refreshed automatically for the current repo.");
  } else if (gitNexusIndex?.status === "skipped") {
    nextSteps.push("Post-task GitNexus refresh was skipped because no graph-relevant repo changes were detected.");
  } else if (gitNexusIndex?.status === "manual_required") {
    nextSteps.push(`Run ${gitNexusIndex.command} from the repo root after installing npx support.`);
  } else if (gitNexusIndex?.status === "failed") {
    nextSteps.push("Rerun beer index after reviewing the GitNexus refresh failure.");
  }

  if (assessment.approval === "review") {
    nextSteps.push("Before leaving compounding, run beer closeout-guard with an explicit knowledge-base decision.");
  }

  return {
    repo_root: repoRoot,
    approval: assessment.approval,
    ok: true,
    code: "recorded",
    summary: `Recorded ${assessment.approval} approval in .beer/state.json.`,
    next_steps: nextSteps,
    gitnexus_index: gitNexusIndex,
    review_quality: reviewQuality,
    state: finalizedState,
  };
}

export function renderApproval(result) {
  const lines = [
    "Beer Approval",
    `Repo: ${result.repo_root}`,
    `Approval: ${result.approval || "(none)"}`,
    `Decision: ${result.ok ? "RECORDED" : "BLOCKED"}`,
    `Code: ${result.code}`,
    `Reason: ${result.summary}`,
  ];

  if (result.gitnexus_index) {
    lines.push(`GitNexus index: ${result.gitnexus_index.status}`);
    if (result.gitnexus_index.reason) {
      lines.push(`GitNexus detail: ${result.gitnexus_index.reason}`);
    }
  }

  lines.push("");
  lines.push("Next steps:");
  lines.push(...(result.next_steps.length > 0 ? result.next_steps.map((step) => `- ${step}`) : ["- (none)"]));
  return lines.join("\n");
}

function parseCliArgs(argv) {
  const args = { repoRoot: undefined, approval: "", json: false };
  const remaining = [...argv];
  const approval = remaining[0] && !remaining[0].startsWith("-") ? remaining.shift() : "";
  args.approval = approval;

  for (let index = 0; index < remaining.length; index += 1) {
    const arg = remaining[index];
    if (arg === "--repo-root") {
      args.repoRoot = remaining[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--repo-root=")) {
      args.repoRoot = arg.slice("--repo-root=".length);
      continue;
    }
    if (arg === "--json") {
      args.json = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write([
        "Usage: beer-approve.mjs <context|phase-plan|execution|review> [--repo-root <path>] [--json]",
        "",
        "Records a manual Beer gate approval in .beer/state.json for guided workflows.",
        "Review approval also triggers the post-task GitNexus repo refresh path.",
      ].join("\n"));
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  const result = recordApproval(args);
  process.stdout.write(args.json ? `${JSON.stringify(result, null, 2)}\n` : `${renderApproval(result)}\n`);
  return result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
