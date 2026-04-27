import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { build } from "../skills/support/prompt-leverage/scripts/augment-prompt.mjs";

test("prompt leverage preserves raw Vietnamese requests when /raw is used", () => {
  const result = build("/raw kiểm tra `beer:planning`", { repoRoot: path.resolve(".") });

  assert.equal(result.upgraded, false);
  assert.equal(result.rawRequest, "kiểm tra `beer:planning`");
  assert.equal(result.prompt, "kiểm tra `beer:planning`");
  assert.equal(result.language.outputLanguage, "Vietnamese");
});

test("prompt leverage resolves mentioned skill path aliases without false path unknowns", () => {
  const result = build("check prompt-leverage/SKILL.md and preserve `beer:planning`", {
    repoRoot: path.resolve("."),
  });

  assert.equal(result.upgraded, true);
  assert.ok(result.context.mentionedSkills.some((skill) => skill.name === "prompt-leverage"));
  assert.equal(result.context.unknowns.some((unknown) => unknown.includes("prompt-leverage/SKILL.md")), false);
  assert.equal(result.context.preservedIdentifiers.skillIds.includes("beer:planning"), true);
});

test("prompt leverage surfaces current Beer state fields without owning state changes", () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "prompt-leverage-state-"));
  fs.mkdirSync(path.join(repoRoot, ".beer"), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, ".beer", "state.json"),
    `${JSON.stringify({
      feature_slug: "checkout-flow",
      route: "feature",
      work_intent: "delivery",
      phase: "validating",
      context_stage: "locked",
      execution_target: "executing",
      contract_verified: true,
      tdd_required: true,
      tdd_status: "required",
      knowledge_base_refresh_status: "not-needed",
      next_handoff: "beer:executing",
    }, null, 2)}\n`,
    "utf8",
  );

  const result = build("prepare a prompt for the next Beer step", { repoRoot });

  assert.equal(result.context.beerFacts.state.feature_slug, "checkout-flow");
  assert.equal(result.context.beerFacts.state.route, "feature");
  assert.equal(result.context.beerFacts.state.work_intent, "delivery");
  assert.equal(result.context.beerFacts.state.tdd_status, "required");
  assert.match(result.prompt, /read-only context collection/);
  assert.match(result.prompt, /Do not mutate Beer state/);
});
