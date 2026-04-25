import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { applyOrchestrationPlan, buildOrchestrationPlan } from "../scripts/beer-session/orchestrate.mjs";
import { buildDefaultConfig, buildDefaultState } from "../scripts/beer-state/schema.mjs";

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "beer-orchestrate-"));
}

function writeBeerFiles(repoRoot, stateOverrides = {}, configOverrides = {}) {
  fs.mkdirSync(path.join(repoRoot, ".beer"), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, ".beer", "onboarding.json"),
    `${JSON.stringify({ status: "complete", plugin_version: "1.0.0" }, null, 2)}\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(repoRoot, ".beer", "state.json"),
    `${JSON.stringify(buildDefaultState(stateOverrides), null, 2)}\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(repoRoot, ".beer", "config.json"),
    `${JSON.stringify(buildDefaultConfig(configOverrides), null, 2)}\n`,
    "utf8",
  );
}

test("buildOrchestrationPlan resolves worker profiles for a swarm slice", () => {
  const repoRoot = makeTempRepo();
  writeBeerFiles(repoRoot, {
    feature_slug: "invoice-export",
    phase: "validating",
    execution_target: "swarming",
    orchestration_strategy: "multi-worker",
    planned_workers: 2,
    active_beads: ["Implement export endpoint", "Search existing download pattern"],
    approved_gates: {
      context: true,
      phase_plan: true,
      execution: true,
      review: false,
    },
  });

  const plan = buildOrchestrationPlan(repoRoot);

  assert.equal(plan.mode, "swarming");
  assert.equal(plan.coordinator_profile.model, "gpt-5.4");
  assert.equal(plan.worker_assignments.length, 2);
  assert.equal(plan.worker_assignments[0].role, "coding");
  assert.equal(plan.worker_assignments[0].model, "gpt-5.3-codex");
  assert.equal(plan.worker_assignments[1].role, "research_synthesis");
  assert.equal(plan.worker_assignments[1].model, "gpt-5.4-mini");
});

test("applyOrchestrationPlan materializes worker assignments into state", () => {
  const repoRoot = makeTempRepo();
  writeBeerFiles(repoRoot, {
    feature_slug: "invoice-export",
    phase: "validating",
    execution_target: "swarming",
    orchestration_strategy: "multi-worker",
    planned_workers: 2,
    active_beads: ["Implement export endpoint", "Search existing download pattern"],
    approved_gates: {
      context: true,
      phase_plan: true,
      execution: true,
      review: false,
    },
  });

  const plan = buildOrchestrationPlan(repoRoot);
  const nextState = applyOrchestrationPlan(repoRoot, plan);

  assert.equal(nextState.active_skill, "swarming");
  assert.equal(nextState.phase, "executing");
  assert.equal(nextState.swarm_status, "initializing");
  assert.equal(nextState.active_workers.length, 2);
  assert.equal(nextState.active_workers[0].model, "gpt-5.3-codex");
  assert.equal(nextState.active_workers[1].model, "gpt-5.4-mini");
});
