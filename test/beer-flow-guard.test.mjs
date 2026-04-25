import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { applyRepo } from "../scripts/commands/onboard-beer.mjs";
import { assessFlowGuard } from "../scripts/beer-session/flow-guard.mjs";
import { writeBeerState } from "../scripts/beer-state/core.mjs";

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "beer-flow-guard-"));
}

test("flow guard blocks non-trivial edits before Beer route lock", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);

  const decision = assessFlowGuard({
    repoRoot,
    tool: "Edit",
    paths: ["src/app.ts"],
  });

  assert.equal(decision.allow, false);
  assert.equal(decision.code, "beer_flow_lock");
});

test("flow guard allows managed instruction file sync", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);

  const decision = assessFlowGuard({
    repoRoot,
    tool: "Edit",
    paths: ["AGENTS.md", "CLAUDE.md"],
  });

  assert.equal(decision.allow, true);
  assert.equal(decision.code, "managed_instruction_files");
});

test("flow guard allows executing when execution gate is approved", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);
  writeBeerState(repoRoot, {
    active_skill: "executing",
    phase: "executing",
    execution_target: "executing",
    approved_gates: {
      context: true,
      phase_plan: true,
      execution: true,
      review: false,
    },
  });

  const decision = assessFlowGuard({
    repoRoot,
    tool: "Edit",
    paths: ["src/app.ts"],
  });

  assert.equal(decision.allow, true);
  assert.equal(decision.code, "coding_skill_active");
});

test("flow guard allows explicit trivial bypass", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);

  const decision = assessFlowGuard({
    repoRoot,
    tool: "Edit",
    paths: ["README.md"],
    trivial: true,
  });

  assert.equal(decision.allow, true);
  assert.equal(decision.code, "trivial_bypass");
});
