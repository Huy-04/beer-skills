import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { applyRepo } from "../scripts/commands/onboard-beer.mjs";
import { readBeerState } from "../scripts/beer-state/core.mjs";
import {
  assessGitNexusIndex,
  hasMaterialRepoChanges,
  isMaterialRepoPath,
  parseGitStatusPaths,
  recordGitNexusIndexStatus,
  runGitNexusIndex,
} from "../scripts/beer-cli/index.mjs";

test("parseGitStatusPaths handles modified, untracked, and renamed entries", () => {
  const result = parseGitStatusPaths([
    " M scripts/beer-cli/init.mjs",
    "?? test/beer-index.test.mjs",
    "R  old/file.mjs -> new/file.mjs",
  ].join("\n"));

  assert.deepEqual(result, [
    "scripts/beer-cli/init.mjs",
    "test/beer-index.test.mjs",
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
  const result = assessGitNexusIndex({
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
  const result = assessGitNexusIndex({
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

test("runGitNexusIndex executes analyze from the repo root", () => {
  const calls = [];
  const result = runGitNexusIndex({
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

test("recordGitNexusIndexStatus stores closeout status when Beer state exists", () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "beer-index-state-"));
  applyRepo(repoRoot);

  const nextState = recordGitNexusIndexStatus(repoRoot, {
    status: "completed",
  });

  assert.equal(nextState.gitnexus_refresh_status, "completed");
  assert.equal(nextState.closeout_ready, false);
  assert.equal(readBeerState(repoRoot).gitnexus_refresh_status, "completed");
});
