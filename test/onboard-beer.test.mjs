import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { applyRepo, checkRepo, removeRepo } from "../scripts/commands/onboard-beer.mjs";
import { syncProjectSkills } from "../scripts/beer-cli/skill-sync.mjs";

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "beer-onboard-"));
}

test("applyRepo creates managed Beer files", () => {
  const repoRoot = makeTempRepo();
  const result = applyRepo(repoRoot);

  assert.equal(result.applied, true);
  assert.equal(result.status, "up_to_date");
  assert.equal(fs.existsSync(path.join(repoRoot, ".beer", "state.json")), true);
  assert.equal(fs.existsSync(path.join(repoRoot, ".beer", "skills")), true);
  assert.equal(fs.existsSync(path.join(repoRoot, ".beer", "scripts")), true);
});

test("removeRepo deletes the managed .beer directory", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);

  const result = removeRepo(repoRoot);

  assert.equal(result.status, "removed");
  assert.equal(fs.existsSync(path.join(repoRoot, ".beer")), false);
});

test("checkRepo reports onboarding missing after removal", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);
  removeRepo(repoRoot);

  const result = checkRepo(repoRoot);

  assert.equal(result.status, "needs_onboarding");
  assert.ok(result.actions.includes("create-state.json"));
});

test("removeRepo removes installed Beer Claude skills and managed guideline files", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);
  syncProjectSkills(repoRoot);

  const customSkillDir = path.join(repoRoot, ".claude", "skills", "custom-skill");
  fs.mkdirSync(customSkillDir, { recursive: true });
  fs.writeFileSync(path.join(customSkillDir, "SKILL.md"), "# custom\n", "utf8");

  const result = removeRepo(repoRoot);

  assert.equal(fs.existsSync(path.join(repoRoot, ".claude", "skills", "beer-agent-guidelines")), false);
  assert.equal(fs.existsSync(customSkillDir), true);
  assert.equal(fs.existsSync(path.join(repoRoot, "AGENTS.md")), false);
  assert.equal(fs.existsSync(path.join(repoRoot, "CLAUDE.md")), false);
  assert.ok(result.removed_skills.includes("beer-agent-guidelines"));
});
