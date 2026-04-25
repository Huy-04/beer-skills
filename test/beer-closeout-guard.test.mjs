import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { recordApproval } from "../scripts/commands/beer-approve.mjs";
import { applyRepo } from "../scripts/commands/onboard-beer.mjs";
import { assessCloseoutGuard } from "../scripts/beer-session/closeout-guard.mjs";
import { readBeerState, writeBeerState } from "../scripts/beer-state/core.mjs";

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "beer-closeout-guard-"));
}

test("closeout guard blocks compounding until knowledge-base decision is recorded", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);

  const state = readBeerState(repoRoot);
  state.feature_slug = "example";
  state.active_skill = "reviewing";
  state.phase = "reviewing";
  state.review_route = "feature-final";
  state.review_status = "pass";
  writeBeerState(repoRoot, state);

  recordApproval({
    repoRoot,
    approval: "review",
    gitNexusIndexRunner: () => ({
      repo_root: repoRoot,
      status: "completed",
      code: "completed",
      command: "npx gitnexus analyze",
      reason: "GitNexus index refreshed for the current repo.",
    }),
  });

  const decision = assessCloseoutGuard({ repoRoot });

  assert.equal(decision.allow, false);
  assert.equal(decision.code, "knowledge_base_decision_missing");
});

test("closeout guard allows compounding once closeout obligations are recorded", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);

  const state = readBeerState(repoRoot);
  state.feature_slug = "example";
  state.active_skill = "reviewing";
  state.phase = "reviewing";
  state.review_route = "feature-final";
  state.review_status = "pass";
  writeBeerState(repoRoot, state);

  recordApproval({
    repoRoot,
    approval: "review",
    gitNexusIndexRunner: () => ({
      repo_root: repoRoot,
      status: "completed",
      code: "completed",
      command: "npx gitnexus analyze",
      reason: "GitNexus index refreshed for the current repo.",
    }),
  });

  const decision = assessCloseoutGuard({
    repoRoot,
    knowledgeBase: "not-needed",
  });

  assert.equal(decision.allow, true);
  assert.equal(decision.code, "closeout_ready");
  assert.equal(decision.state.gitnexus_refresh_status, "completed");
  assert.equal(decision.state.knowledge_base_refresh_status, "not-needed");
  assert.equal(decision.state.closeout_ready, true);
});

test("closeout guard blocks when GitNexus closeout failed or needs manual work", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);

  writeBeerState(repoRoot, {
    ...readBeerState(repoRoot),
    active_skill: "compounding",
    phase: "compounding",
    review_route: "feature-final",
    review_status: "pass",
    next_handoff: "beer:compounding",
    approved_gates: {
      context: true,
      phase_plan: true,
      execution: true,
      review: true,
    },
    gitnexus_refresh_status: "manual-required",
    knowledge_base_refresh_status: "declined",
  });

  const decision = assessCloseoutGuard({ repoRoot });

  assert.equal(decision.allow, false);
  assert.equal(decision.code, "gitnexus_closeout_incomplete");
});
