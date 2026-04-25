import assert from "node:assert/strict";
import test from "node:test";

import { assessReviewQuality } from "../scripts/beer-session/review-quality-guard.mjs";

function buildState(overrides = {}) {
  return {
    orchestration_strategy: "single-worker",
    ...overrides,
  };
}

test("review quality passes for a bounded single-worker diff", () => {
  const result = assessReviewQuality({
    repoRoot: process.cwd(),
    state: buildState(),
    diffStats: {
      ok: true,
      entries: [
        { path: "scripts/commands/beer-approve.mjs", additions: 40, deletions: 10 },
        { path: "scripts/beer-state/status.mjs", additions: 20, deletions: 5 },
        { path: "test/beer-approve.test.mjs", additions: 30, deletions: 0 },
        { path: "README.md", additions: 12, deletions: 0 },
      ],
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.code_quantity_status, "pass");
  assert.equal(result.pattern_status, "pass");
  assert.equal(result.review_quality_status, "pass");
});

test("review quality fails when the diff is too large for single-worker execution", () => {
  const entries = Array.from({ length: 13 }, (_, index) => ({
    path: `scripts/module-${index}.mjs`,
    additions: 70,
    deletions: 10,
  }));
  const result = assessReviewQuality({
    repoRoot: process.cwd(),
    state: buildState({ orchestration_strategy: "single-worker" }),
    diffStats: {
      ok: true,
      entries,
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.code_quantity_status, "fail");
  assert.equal(result.pattern_status, "pass");
});

test("review quality fails when pattern spread exceeds the current strategy", () => {
  const result = assessReviewQuality({
    repoRoot: process.cwd(),
    state: buildState({ orchestration_strategy: "single-worker" }),
    diffStats: {
      ok: true,
      entries: [
        { path: "scripts/commands/beer-approve.mjs", additions: 10, deletions: 2 },
        { path: "skills/workflow/feature/reviewing/reviewer.js", additions: 8, deletions: 1 },
        { path: "src/review-validator.ts", additions: 5, deletions: 0 },
        { path: "assets/example.js", additions: 5, deletions: 1 },
      ],
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.code_quantity_status, "pass");
  assert.equal(result.pattern_status, "fail");
});
