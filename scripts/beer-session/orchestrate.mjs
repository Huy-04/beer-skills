import { readBeerStatus, writeBeerState } from "../beer-state/core.mjs";
import { inferModelRoleFromTaskKind, resolveModelProfile } from "../beer-state/model-profiles.mjs";

function inferTaskKindFromWorkItem(value) {
  const text = typeof value === "string" ? value.toLowerCase() : "";
  if (!text) {
    return "implement";
  }
  if (/(search|query|read|research|summari|synthesi|docs?)/.test(text)) {
    return "search";
  }
  if (/(review|validate|gate|plan|coordinate|orchestrat)/.test(text)) {
    return "review";
  }
  if (/(test|regression|spec)/.test(text)) {
    return "test";
  }
  return "implement";
}

function resolveWorkerCount(state, sourceItems) {
  if (Number.isFinite(state.planned_workers) && state.planned_workers > 0) {
    return state.planned_workers;
  }
  if (sourceItems.length > 0) {
    return sourceItems.length;
  }
  return state.execution_target === "swarming" ? 2 : 1;
}

function buildWorkerAssignments(status) {
  const state = status.state_json;
  const config = status.config;
  const sourceItems = Array.isArray(state.active_beads) && state.active_beads.length > 0
    ? state.active_beads
    : state.current_slice
      ? [state.current_slice]
      : [];
  const workerCount = Math.max(
    state.execution_target === "swarming" ? 2 : 1,
    resolveWorkerCount(state, sourceItems),
  );

  return Array.from({ length: workerCount }, (_, index) => {
    const workItem = sourceItems[index] || sourceItems[sourceItems.length - 1] || `${state.current_slice || "current-slice"}-${index + 1}`;
    const taskKind = inferTaskKindFromWorkItem(workItem);
    const role = inferModelRoleFromTaskKind(taskKind) || "coding";
    const profile = resolveModelProfile(config, { role });

    return {
      codex_name: `worker-${index + 1}`,
      status: "assigned",
      bead_id: typeof workItem === "string" ? workItem : "",
      role,
      task_kind: taskKind,
      model: profile.model,
      reasoning_effort: profile.reasoning_effort,
    };
  });
}

export function buildOrchestrationPlan(repoRoot) {
  const status = readBeerStatus(repoRoot);
  const state = status.state_json;
  const config = status.config;
  const coordinatorProfile = resolveModelProfile(config, { role: "orchestrator" });

  if (!status.onboarding.exists) {
    return {
      repo_root: repoRoot,
      status: "blocked",
      reason: "Beer onboarding is missing.",
      mode: "blocked",
      coordinator_profile: coordinatorProfile,
      next_handoff: "",
      worker_assignments: [],
    };
  }

  if (!state.approved_gates?.execution || !state.execution_target) {
    return {
      repo_root: repoRoot,
      status: "waiting",
      reason: "Execution is not approved yet.",
      mode: "waiting",
      coordinator_profile: coordinatorProfile,
      next_handoff: state.next_handoff || "beer:validating",
      worker_assignments: [],
    };
  }

  if (state.execution_target === "swarming") {
    return {
      repo_root: repoRoot,
      status: "ready",
      reason: "Swarm execution is approved and worker coordination may begin.",
      mode: "swarming",
      coordinator_profile: coordinatorProfile,
      next_handoff: state.next_handoff || "beer:swarming",
      worker_assignments: buildWorkerAssignments(status),
    };
  }

  const directProfile = resolveModelProfile(config, { role: "coding" });
  return {
    repo_root: repoRoot,
    status: "ready",
    reason: "Direct execution is approved.",
    mode: "direct",
    coordinator_profile: coordinatorProfile,
    direct_profile: directProfile,
    next_handoff: state.next_handoff || "beer:executing",
    worker_assignments: [],
  };
}

export function applyOrchestrationPlan(repoRoot, plan) {
  const status = readBeerStatus(repoRoot);
  const state = status.state_json;

  if (plan.mode === "swarming") {
    return writeBeerState(repoRoot, {
      ...state,
      active_skill: "swarming",
      phase: "executing",
      execution_target: "swarming",
      swarm_status: "initializing",
      active_workers: plan.worker_assignments,
      next_handoff: "beer:swarming",
    });
  }

  if (plan.mode === "direct") {
    return writeBeerState(repoRoot, {
      ...state,
      active_skill: "executing",
      phase: "executing",
      execution_target: "executing",
      swarm_status: "",
      active_workers: [],
      next_handoff: "beer:executing",
    });
  }

  return state;
}

export function renderOrchestrationPlan(plan) {
  const lines = [
    "Beer Orchestration",
    `Repo: ${plan.repo_root}`,
    `Status: ${plan.status}`,
    `Mode: ${plan.mode}`,
    `Reason: ${plan.reason}`,
    `Coordinator: ${plan.coordinator_profile?.model || "(none)"} (${plan.coordinator_profile?.reasoning_effort || "(none)"})`,
    `Next handoff: ${plan.next_handoff || "(none)"}`,
  ];

  if (plan.direct_profile) {
    lines.push(`Direct execution profile: ${plan.direct_profile.model || "(none)"} (${plan.direct_profile.reasoning_effort || "(none)"})`);
  }

  if (Array.isArray(plan.worker_assignments) && plan.worker_assignments.length > 0) {
    lines.push("", "Worker assignments:");
    for (const worker of plan.worker_assignments) {
      lines.push(
        `- ${worker.codex_name}: ${worker.role} -> ${worker.model} (${worker.reasoning_effort}) [${worker.task_kind}]${worker.bead_id ? ` bead=${worker.bead_id}` : ""}`,
      );
    }
  }

  return lines.join("\n");
}
