import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildWorkerBootstrap } from "../scripts/beer-session/worker-bootstrap.mjs";
import { buildDefaultConfig, buildDefaultState } from "../scripts/beer-state/schema.mjs";

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "beer-worker-bootstrap-"));
}

function writeBeerFiles(repoRoot, stateOverrides = {}, configOverrides = {}) {
  fs.mkdirSync(path.join(repoRoot, ".beer"), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, "history", "invoice-export"), { recursive: true });
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
  fs.writeFileSync(
    path.join(repoRoot, "history", "invoice-export", "CONTEXT.md"),
    "# Context\n",
    "utf8",
  );
}

test("buildWorkerBootstrap emits spawn-ready prompts for active workers", () => {
  const repoRoot = makeTempRepo();
  writeBeerFiles(repoRoot, {
    feature_slug: "invoice-export",
    context_stage: "locked",
    context_path: "history/invoice-export/CONTEXT.md",
    phase: "executing",
    current_slice: "Phase 1",
    execution_target: "swarming",
    approved_gates: {
      context: true,
      phase_plan: true,
      execution: true,
      review: false,
    },
    active_workers: [
      {
        codex_name: "worker-1",
        role: "coding",
        task_kind: "implement",
        model: "gpt-5.3-codex",
        reasoning_effort: "high",
        bead_id: "Implement export endpoint",
        status: "assigned",
      },
    ],
  });

  const result = buildWorkerBootstrap(repoRoot);

  assert.equal(result.workers.length, 1);
  assert.equal(result.workers[0].assigned_work_item, "Implement export endpoint");
  assert.equal(result.workers[0].model, "gpt-5.3-codex");
  assert.match(result.workers[0].prompt, /Assigned profile: coding -> gpt-5\.3-codex \(high\)/);
  assert.match(result.workers[0].prompt, /Locked context: history\/invoice-export\/CONTEXT\.md/);
});
