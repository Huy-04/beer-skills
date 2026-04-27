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
  const config = JSON.parse(fs.readFileSync(path.join(repoRoot, ".beer", "config.json"), "utf8"));

  assert.equal(result.applied, true);
  assert.equal(result.status, "up_to_date");
  assert.equal(fs.existsSync(path.join(repoRoot, ".beer", "state.json")), true);
  assert.equal(fs.existsSync(path.join(repoRoot, ".beer", "skills")), true);
  assert.equal(fs.existsSync(path.join(repoRoot, ".beer", "scripts")), true);
  assert.equal(fs.existsSync(path.join(repoRoot, ".beer", "bin", "beer.mjs")), true);
  assert.equal(fs.existsSync(path.join(repoRoot, ".beer", "bin", "beer.cmd")), true);
  assert.equal(config.models.orchestrator.model, "gpt-5.4");
  assert.equal(config.models.orchestrator.reasoning_effort, "high");
  assert.equal(config.models.coding.model, "gpt-5.3-codex");
  assert.equal(config.models.coding.reasoning_effort, "high");
  assert.equal(config.models.research_synthesis.model, "gpt-5.4-mini");
  assert.equal(config.models.research_synthesis.reasoning_effort, "medium");
});

test("removeRepo deletes the managed .beer directory", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);

  const result = removeRepo(repoRoot);

  assert.equal(result.status, "removed");
  assert.equal(fs.existsSync(path.join(repoRoot, ".beer")), false);
  assert.equal(result.removed_cli.status, "removed");
  assert.deepEqual(result.removed_empty_dirs, []);
});

test("removeRepo removes empty project skill directories after skill sync", () => {
  const repoRoot = makeTempRepo();
  applyRepo(repoRoot);
  syncProjectSkills(repoRoot);

  const result = removeRepo(repoRoot);

  assert.equal(fs.existsSync(path.join(repoRoot, ".claude")), false);
  assert.equal(fs.existsSync(path.join(repoRoot, ".agents")), false);
  assert.equal(fs.existsSync(path.join(repoRoot, ".codex")), false);
  assert.ok(result.removed_empty_dirs.includes(".claude"));
  assert.ok(result.removed_empty_dirs.includes(".agents"));
  assert.ok(result.removed_empty_dirs.includes(".codex"));
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
  const customCodexSkillDir = path.join(repoRoot, ".agents", "skills", "custom-skill");
  fs.mkdirSync(customCodexSkillDir, { recursive: true });
  fs.writeFileSync(path.join(customCodexSkillDir, "SKILL.md"), "# custom codex\n", "utf8");

  const result = removeRepo(repoRoot);

  assert.equal(fs.existsSync(path.join(repoRoot, ".claude", "skills", "beer-agent-guidelines")), false);
  assert.equal(fs.existsSync(path.join(repoRoot, ".agents", "skills", "beer-agent-guidelines")), false);
  assert.equal(fs.existsSync(customSkillDir), true);
  assert.equal(fs.existsSync(customCodexSkillDir), true);
  assert.equal(fs.existsSync(path.join(repoRoot, "AGENTS.md")), false);
  assert.equal(fs.existsSync(path.join(repoRoot, "CLAUDE.md")), false);
  assert.equal(fs.existsSync(path.join(repoRoot, ".claude", "settings.json")), false);
  assert.equal(fs.existsSync(path.join(repoRoot, ".codex", "hooks.json")), false);
  assert.equal(fs.existsSync(path.join(repoRoot, ".codex", "config.toml")), false);
  assert.ok(result.removed_skills.includes("beer-agent-guidelines"));
  assert.equal(result.removed_cli.status, "removed");
  assert.equal(result.removed_empty_dirs.includes(".claude"), false);
  assert.equal(result.removed_empty_dirs.includes(".agents"), false);
  assert.ok(result.removed_empty_dirs.includes(".codex"));
});
