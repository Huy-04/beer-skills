import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { syncProjectSkills } from "../scripts/beer-cli/skill-sync.mjs";

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "beer-install-"));
}

function writeBeerSkill(skillDir, name) {
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(
    path.join(skillDir, "SKILL.md"),
    [
      "---",
      `name: ${name}`,
      'description: "This skill should be used when testing cleanup."',
      "metadata:",
      '  version: "1.0.0"',
      "  ecosystem: beer",
      "---",
      "",
      "# Test Skill",
      "",
    ].join("\n"),
    "utf8",
  );
}

test("syncProjectSkills replaces Beer Claude skills and syncs repo instructions", () => {
  const repoRoot = makeTempRepo();
  const claudeSkillsDir = path.join(repoRoot, ".claude", "skills");
  const staleBeerSkillDir = path.join(claudeSkillsDir, "execution-guardrails");
  const customSkillDir = path.join(claudeSkillsDir, "custom-skill");

  writeBeerSkill(staleBeerSkillDir, "execution-guardrails");
  fs.mkdirSync(customSkillDir, { recursive: true });
  fs.writeFileSync(path.join(customSkillDir, "SKILL.md"), "# custom\n", "utf8");
  fs.writeFileSync(path.join(repoRoot, "AGENTS.md"), "Project note\n", "utf8");

  const result = syncProjectSkills(repoRoot);
  const agents = fs.readFileSync(path.join(repoRoot, "AGENTS.md"), "utf8");
  const claude = fs.readFileSync(path.join(repoRoot, "CLAUDE.md"), "utf8");

  assert.ok(result.removed_skills.includes("execution-guardrails"));
  assert.equal(fs.existsSync(staleBeerSkillDir), false);
  assert.equal(fs.existsSync(path.join(claudeSkillsDir, "agent-guidelines")), true);
  assert.equal(fs.existsSync(customSkillDir), true);
  assert.match(agents, /Project note/);
  assert.match(agents, /<!-- beer-agent-guidelines:start -->/);
  assert.match(claude, /<!-- beer-agent-guidelines:start -->/);
});
