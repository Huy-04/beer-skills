import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildIndex,
  buildMetadata,
  buildReadme,
  initializeKnowledgeBase,
} from "../skills/support/codebase-knowledge/scripts/init-knowledge-base.mjs";

test("buildMetadata uses pattern-first discovery lanes", () => {
  const metadata = buildMetadata({
    outputRoot: "C:\\tmp\\kb",
    sourcePath: ".",
    generatedFromCommit: "abc123",
    mode: "gitnexus-assisted",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "available",
    filesScanned: 42,
    note: [],
  });

  assert.equal(metadata.strategy, "pattern-first");
  assert.equal(metadata.discovery.model, "single-writer synthesis");
  assert.deepEqual(metadata.discovery.lanes, [
    "repo-scout",
    "backend",
    "frontend",
    "boundaries",
  ]);
  assert.equal(metadata.stats.discovery_lanes, 4);
  assert.equal(metadata.stats.docs_generated, 0);
});

test("buildIndex starts with task and boundary-aware buckets", () => {
  const index = buildIndex();

  assert.equal(index.strategy, "pattern-first");
  assert.deepEqual(index.dominant_patterns, []);
  assert.deepEqual(index.task_index, {});
  assert.equal(index.stats.backend_docs, 0);
  assert.equal(index.stats.boundary_docs, 0);
  assert.equal(index.stats.critical_flows, 0);
});

test("buildReadme advertises the pattern-first implementation map", () => {
  const readme = buildReadme({
    sourcePath: ".",
    invocationReason: "user-request",
    scanScope: "full",
  });

  assert.match(readme, /Pattern-first implementation map/);
  assert.match(readme, /repo-scout -> backend\/frontend\/boundaries -> single-writer synthesis/);
  assert.match(readme, /## Start Here By Task/);
  assert.match(readme, /backend\/request-lifecycle\.md/);
  assert.match(readme, /critical-flows\/auth-session\.md/);
});

test("initializeKnowledgeBase creates the new baseline directory layout", () => {
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), "beer-kb-"));

  initializeKnowledgeBase({
    outputRoot,
    sourcePath: ".",
    generatedFromCommit: "abc123",
    mode: "manual",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "not-used",
    filesScanned: 0,
    note: [],
  });

  for (const area of ["architecture", "backend", "frontend", "boundaries", "critical-flows", "conventions"]) {
    assert.equal(fs.existsSync(path.join(outputRoot, area)), true, `missing ${area}`);
  }

  const metadata = JSON.parse(fs.readFileSync(path.join(outputRoot, "00-metadata.json"), "utf8"));
  const index = JSON.parse(fs.readFileSync(path.join(outputRoot, "index.json"), "utf8"));
  const readme = fs.readFileSync(path.join(outputRoot, "README.md"), "utf8");

  assert.equal(metadata.strategy, "pattern-first");
  assert.equal(index.strategy, "pattern-first");
  assert.match(readme, /## High-Risk Boundaries/);
});
