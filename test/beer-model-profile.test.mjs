import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { resolveConfiguredModelProfile } from "../scripts/commands/beer-model-profile.mjs";
import { buildDefaultConfig } from "../scripts/beer-state/schema.mjs";

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "beer-model-profile-"));
}

test("resolveConfiguredModelProfile uses explicit role", () => {
  const repoRoot = makeTempRepo();
  fs.mkdirSync(path.join(repoRoot, ".beer"), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, ".beer", "config.json"),
    `${JSON.stringify(buildDefaultConfig(), null, 2)}\n`,
    "utf8",
  );

  const result = resolveConfiguredModelProfile({
    repoRoot,
    role: "coding",
  });

  assert.equal(result.role, "coding");
  assert.equal(result.model, "gpt-5.3-codex");
  assert.equal(result.reasoning_effort, "high");
  assert.equal(result.source, "explicit-role");
});

test("resolveConfiguredModelProfile infers research_synthesis from search task kind", () => {
  const repoRoot = makeTempRepo();
  fs.mkdirSync(path.join(repoRoot, ".beer"), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, ".beer", "config.json"),
    `${JSON.stringify(buildDefaultConfig(), null, 2)}\n`,
    "utf8",
  );

  const result = resolveConfiguredModelProfile({
    repoRoot,
    taskKind: "search",
  });

  assert.equal(result.role, "research_synthesis");
  assert.equal(result.model, "gpt-5.4-mini");
  assert.equal(result.reasoning_effort, "medium");
  assert.equal(result.source, "task-kind:search");
});
