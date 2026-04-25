import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildNextReads, buildRecommendedActions, deriveFeatureSlug } from "../scripts/beer-state/status.mjs";

function baseStatus(overrides = {}) {
  return {
    repo_root: "C:\\Code\\Project\\BeerMovie",
    onboarding: {
      exists: true,
    },
    handoff: {
      exists: false,
      feature: "",
    },
    state_markdown: {
      feature: "(none)",
      focus: "",
      skill: "using-beer",
      phase: "idle",
    },
    state_json: {
      active_skill: "using-beer",
      phase: "idle",
      next_handoff: "",
      context_stage: "none",
      feature_slug: "",
      route: "",
      ...overrides,
    },
  };
}

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "beer-status-"));
}

test("deriveFeatureSlug ignores placeholder values from STATE.md", () => {
  const status = baseStatus();

  assert.equal(deriveFeatureSlug(status), "");
});

test("buildRecommendedActions stays generic for idle repos with no active feature", () => {
  const actions = buildRecommendedActions(baseStatus());

  assert.deepEqual(actions, [
    "Use this status snapshot to choose the next Beer skill.",
    "If you move into planning or execution, read critical-patterns.md first when it exists.",
  ]);
});

test("buildRecommendedActions resumes only when real workflow state exists", () => {
  const actions = buildRecommendedActions(
    baseStatus({
      feature_slug: "movie-details",
      context_stage: "locked",
      context_path: "history/movie-details/CONTEXT.md",
    }),
  );

  assert.equal(actions[0], "Resume by reopening the active context for using-beer.");
});

test("buildRecommendedActions asks direct-fix routes to restore missing CONTEXT", () => {
  const actions = buildRecommendedActions(
    baseStatus({
      active_skill: "planning",
      phase: "planning",
      route: "small-fix",
      feature_slug: "login-copy",
      context_path: "history/login-copy/CONTEXT.md",
    }),
  );

  assert.deepEqual(actions, [
    "Resume by reopening the active context for planning.",
    "Create or refresh history/login-copy/CONTEXT.md so the direct-fix work stays explicit before planning or execution.",
  ]);
});

test("buildRecommendedActions asks small-fix routes to create bounded CONTEXT when missing", () => {
  const actions = buildRecommendedActions(
    baseStatus({
      active_skill: "planning",
      phase: "planning",
      route: "small-fix",
      feature_slug: "login-copy",
    }),
  );

  assert.deepEqual(actions, [
    "Resume by reopening the active context for planning.",
    "Create or refresh history/login-copy/CONTEXT.md so the direct-fix work stays explicit before planning or execution.",
  ]);
});

test("buildRecommendedActions keeps repair intent explicit when context is missing", () => {
  const actions = buildRecommendedActions(
    baseStatus({
      active_skill: "planning",
      phase: "planning",
      route: "feature",
      work_intent: "repair",
      feature_slug: "checkout-timeout",
    }),
  );

  assert.deepEqual(actions, [
    "Resume by reopening the active context for planning.",
    "Create or refresh history/checkout-timeout/CONTEXT.md so the repair work stays explicit before planning or execution.",
  ]);
});

test("buildNextReads includes both AGENTS.md and CLAUDE.md when present", () => {
  const repoRoot = makeTempRepo();
  fs.writeFileSync(path.join(repoRoot, "AGENTS.md"), "# AGENTS\n", "utf8");
  fs.writeFileSync(path.join(repoRoot, "CLAUDE.md"), "# CLAUDE\n", "utf8");

  const status = baseStatus();
  status.repo_root = repoRoot;

  const reads = buildNextReads(status);

  assert.deepEqual(reads.slice(0, 2), ["AGENTS.md", "CLAUDE.md"]);
});
