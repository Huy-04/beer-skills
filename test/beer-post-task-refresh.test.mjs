import assert from "node:assert/strict";
import test from "node:test";

import {
  assessPostTaskGitNexusRefresh,
  hasMaterialRepoChanges,
  isMaterialRepoPath,
  parseGitStatusPaths,
  runPostTaskGitNexusRefresh,
} from "../scripts/beer-cli/post-task-refresh.mjs";

test("parseGitStatusPaths handles modified, untracked, and renamed entries", () => {
  const result = parseGitStatusPaths([
    " M scripts/beer-cli/init.mjs",
    "?? test/beer-post-task-refresh.test.mjs",
    "R  old/file.mjs -> new/file.mjs",
  ].join("\n"));

  assert.deepEqual(result, [
    "scripts/beer-cli/init.mjs",
    "test/beer-post-task-refresh.test.mjs",
    "new/file.mjs",
  ]);
});

test("isMaterialRepoPath ignores markdown and Beer state paths", () => {
  assert.equal(isMaterialRepoPath("README.md"), false);
  assert.equal(isMaterialRepoPath("history/example/CONTEXT.md"), false);
  assert.equal(isMaterialRepoPath(".beer/state.json"), false);
  assert.equal(isMaterialRepoPath("scripts/beer-cli/init.mjs"), true);
});

test("hasMaterialRepoChanges returns true only for graph-relevant changes", () => {
  assert.equal(hasMaterialRepoChanges(["README.md", "docs/setup.md"]), false);
  assert.equal(hasMaterialRepoChanges(["scripts/beer-cli/init.mjs"]), true);
});

test("assessment skips refresh when no material changes are present", () => {
  const result = assessPostTaskGitNexusRefresh({
    repoRoot: "C:\\Code\\Project\\Example",
    npxPath: "C:\\Program Files\\nodejs\\npx.cmd",
    detectResult: {
      ok: true,
      code: "detected",
      paths: ["README.md", "docs/setup.md"],
    },
  });

  assert.equal(result.status, "skipped");
  assert.equal(result.code, "no_material_changes");
});

test("assessment falls back to manual when npx is missing", () => {
  const result = assessPostTaskGitNexusRefresh({
    repoRoot: "C:\\Code\\Project\\Example",
    npxPath: "",
    detectResult: {
      ok: true,
      code: "detected",
      paths: ["scripts/beer-cli/init.mjs"],
    },
  });

  assert.equal(result.status, "manual_required");
  assert.equal(result.command, "npx gitnexus analyze");
});

test("runPostTaskGitNexusRefresh executes analyze from the repo root", () => {
  const calls = [];
  const result = runPostTaskGitNexusRefresh({
    repoRoot: "C:\\Code\\Project\\Example",
    npxPath: "C:\\Program Files\\nodejs\\npx.cmd",
    detectResult: {
      ok: true,
      code: "detected",
      paths: ["scripts/beer-cli/init.mjs"],
    },
    commandRunner: (commandPath, args, options) => {
      calls.push({ commandPath, args, options });
    },
  });

  assert.equal(result.status, "completed");
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, ["gitnexus", "analyze"]);
  assert.equal(calls[0].options.cwd, "C:\\Code\\Project\\Example");
});
