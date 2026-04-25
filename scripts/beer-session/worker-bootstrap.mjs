import { readBeerStatus, resolveLockedContextPath } from "../beer-state/core.mjs";
import { applyOrchestrationPlan, buildOrchestrationPlan } from "./orchestrate.mjs";

function buildVerificationExpectation(state) {
  if (state.verification_status && state.verification_status !== "not-run") {
    return state.verification_status;
  }
  if (state.current_phase_name) {
    return `verify the approved outcome for ${state.current_phase_name}`;
  }
  if (state.current_slice) {
    return `verify the approved outcome for ${state.current_slice}`;
  }
  return "run the smallest credible verification path for the assigned work";
}

function buildWorkerPrompt(status, worker) {
  const state = status.state_json;
  const featureSlug = state.feature_slug || "(none)";
  const activeSlice = state.current_slice || state.current_phase_name || "(unnamed-slice)";
  const assignedWorkItem = worker.bead_id || state.active_work_item || activeSlice;
  const contextPath = resolveLockedContextPath(status) || state.context_path || "";
  const verificationExpectation = buildVerificationExpectation(state);

  return [
    `Swarm start for ${activeSlice}.`,
    `Your assigned work is ${assignedWorkItem}.`,
    `Assigned profile: ${worker.role || "coding"} -> ${worker.model || "(none)"} (${worker.reasoning_effort || "(none)"}).`,
    `Feature: ${featureSlug}.`,
    `Locked context: ${contextPath || "(none)"}.`,
    `Verification expectation: ${verificationExpectation}.`,
    "Stay inside the validated scope and report blockers immediately.",
  ].join(" ");
}

export function buildWorkerBootstrap(repoRoot, options = {}) {
  let status = readBeerStatus(repoRoot);
  const state = status.state_json;

  if (options.apply && state.execution_target === "swarming" && state.active_workers.length === 0) {
    const plan = buildOrchestrationPlan(repoRoot);
    if (plan.mode === "swarming") {
      applyOrchestrationPlan(repoRoot, plan);
      status = readBeerStatus(repoRoot);
    }
  }

  const nextState = status.state_json;
  const activeWorkers = Array.isArray(nextState.active_workers) ? nextState.active_workers : [];

  return {
    repo_root: repoRoot,
    feature_slug: nextState.feature_slug || "",
    current_slice: nextState.current_slice || nextState.current_phase_name || "",
    execution_target: nextState.execution_target || "",
    approved: Boolean(nextState.approved_gates?.execution),
    workers: activeWorkers.map((worker) => ({
      codex_name: worker.codex_name || "",
      role: worker.role || "",
      task_kind: worker.task_kind || "",
      model: worker.model || "",
      reasoning_effort: worker.reasoning_effort || "",
      assigned_work_item: worker.bead_id || nextState.active_work_item || nextState.current_slice || "",
      context_path: resolveLockedContextPath(status) || nextState.context_path || "",
      verification_expectation: buildVerificationExpectation(nextState),
      prompt: buildWorkerPrompt(status, worker),
    })),
  };
}

export function renderWorkerBootstrap(result) {
  const lines = [
    "Beer Worker Bootstrap",
    `Repo: ${result.repo_root}`,
    `Feature: ${result.feature_slug || "(none)"}`,
    `Current slice: ${result.current_slice || "(none)"}`,
    `Execution target: ${result.execution_target || "(none)"}`,
    `Execution approved: ${result.approved ? "yes" : "no"}`,
  ];

  if (result.workers.length === 0) {
    lines.push("Workers: none");
    return lines.join("\n");
  }

  lines.push("", "Workers:");
  for (const worker of result.workers) {
    lines.push(`- ${worker.codex_name}: ${worker.role || "(no role)"} -> ${worker.model || "(no model)"} (${worker.reasoning_effort || "(no reasoning)"})`);
    lines.push(`  task: ${worker.assigned_work_item || "(none)"}`);
    lines.push(`  prompt: ${worker.prompt}`);
  }

  return lines.join("\n");
}
