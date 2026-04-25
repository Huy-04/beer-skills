import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { applyRepo } from "../scripts/commands/onboard-beer.mjs";
import { recordApproval } from "../scripts/commands/beer-approve.mjs";
import { readBeerState, writeBeerState } from "../scripts/beer-state/core.mjs";

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "beer-approve-"));
}

test("recordApproval records context approval when CONTEXT.md exists", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);
  const historyDir = path.join(repoRoot, "history", "example");
  fs.mkdirSync(historyDir, { recursive: true });
  fs.writeFileSync(path.join(historyDir, "CONTEXT.md"), "# Context\n", "utf8");

  const state = readBeerState(repoRoot);
  state.feature_slug = "example";
  state.active_skill = "exploring";
  state.phase = "exploring";
  state.context_stage = "locked";
  state.context_path = "history/example/CONTEXT.md";
  writeBeerState(repoRoot, state);

  const result = recordApproval({ repoRoot, approval: "context" });

  assert.equal(result.ok, true);
  assert.equal(result.state.approved_gates.context, true);
  assert.equal(result.state.next_handoff, "beer:planning");
});

test("recordApproval blocks execution approval when validation has not passed", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);

  const state = readBeerState(repoRoot);
  state.feature_slug = "example";
  state.active_skill = "validating";
  state.phase = "validating";
  state.route = "feature";
  state.approved_gates.phase_plan = true;
  state.validation_status = "";
  state.execution_target = "executing";
  writeBeerState(repoRoot, state);

  const result = recordApproval({ repoRoot, approval: "execution" });

  assert.equal(result.ok, false);
  assert.equal(result.code, "validation_not_passed");
});

test("recordApproval records review approval and points to compounding", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);

  const state = readBeerState(repoRoot);
  state.feature_slug = "example";
  state.active_skill = "reviewing";
  state.phase = "reviewing";
  state.review_status = "pass";
  writeBeerState(repoRoot, state);

  const result = recordApproval({
    repoRoot,
    approval: "review",
    reviewQualityRunner: () => ({
      ok: true,
      code: "review_quality_passed",
      summary: "Review quality passed.",
      next_steps: [],
      code_quantity_status: "pass",
      pattern_status: "pass",
      review_quality_status: "pass",
    }),
    gitNexusIndexRunner: () => ({
      repo_root: repoRoot,
      status: "completed",
      code: "completed",
      command: "npx gitnexus analyze",
      reason: "GitNexus index refreshed for the current repo.",
    }),
  });

  assert.equal(result.ok, true);
  assert.equal(result.state.approved_gates.review, true);
  assert.equal(result.state.next_handoff, "beer:compounding");
  assert.equal(result.state.gitnexus_refresh_status, "completed");
  assert.equal(result.state.code_quantity_status, "pass");
  assert.equal(result.state.pattern_status, "pass");
  assert.equal(result.state.review_quality_status, "pass");
  assert.equal(result.gitnexus_index?.status, "completed");
});

test("recordApproval blocks review approval when review quality fails", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);

  const state = readBeerState(repoRoot);
  state.feature_slug = "example";
  state.active_skill = "reviewing";
  state.phase = "reviewing";
  state.review_status = "pass";
  writeBeerState(repoRoot, state);

  const result = recordApproval({
    repoRoot,
    approval: "review",
    reviewQualityRunner: () => ({
      ok: false,
      code: "review_quality_failed",
      summary: "Review quality failed for the current diff.",
      next_steps: ["Reslice the work before review approval."],
      code_quantity_status: "fail",
      pattern_status: "pass",
      review_quality_status: "fail",
    }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "review_quality_failed");
  assert.equal(result.state.approved_gates.review, false);
  assert.equal(result.state.code_quantity_status, "fail");
  assert.equal(result.state.review_quality_status, "fail");
});
