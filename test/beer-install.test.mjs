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
  const codexSkillsDir = path.join(repoRoot, ".agents", "skills");
  const staleBeerSkillDir = path.join(claudeSkillsDir, "execution-guardrails");
  const staleCodexBeerSkillDir = path.join(codexSkillsDir, "execution-guardrails");
  const customSkillDir = path.join(claudeSkillsDir, "custom-skill");
  const customCodexSkillDir = path.join(codexSkillsDir, "custom-skill");

  writeBeerSkill(staleBeerSkillDir, "execution-guardrails");
  writeBeerSkill(staleCodexBeerSkillDir, "execution-guardrails");
  fs.mkdirSync(customSkillDir, { recursive: true });
  fs.writeFileSync(path.join(customSkillDir, "SKILL.md"), "# custom\n", "utf8");
  fs.mkdirSync(customCodexSkillDir, { recursive: true });
  fs.writeFileSync(path.join(customCodexSkillDir, "SKILL.md"), "# custom codex\n", "utf8");
  fs.writeFileSync(path.join(repoRoot, "AGENTS.md"), "Project note\n", "utf8");

  const result = syncProjectSkills(repoRoot);
  const agents = fs.readFileSync(path.join(repoRoot, "AGENTS.md"), "utf8");
  const claude = fs.readFileSync(path.join(repoRoot, "CLAUDE.md"), "utf8");
  const settings = JSON.parse(fs.readFileSync(path.join(repoRoot, ".claude", "settings.json"), "utf8"));
  const codexHooks = JSON.parse(fs.readFileSync(path.join(repoRoot, ".codex", "hooks.json"), "utf8"));
  const codexConfig = fs.readFileSync(path.join(repoRoot, ".codex", "config.toml"), "utf8");

  assert.ok(result.removed_skills.includes("execution-guardrails"));
  assert.equal(fs.existsSync(staleBeerSkillDir), false);
  assert.equal(fs.existsSync(staleCodexBeerSkillDir), false);
  assert.equal(fs.existsSync(path.join(claudeSkillsDir, "beer-agent-guidelines")), true);
  assert.equal(fs.existsSync(path.join(codexSkillsDir, "beer-agent-guidelines")), true);
  assert.equal(fs.existsSync(customSkillDir), true);
  assert.equal(fs.existsSync(customCodexSkillDir), true);
  assert.match(agents, /Project note/);
  assert.match(agents, /<!-- beer-agent-guidelines:start -->/);
  assert.match(claude, /<!-- beer-agent-guidelines:start -->/);
  assert.equal(settings.hooks.PreToolUse[0].matcher, "Edit|MultiEdit|Write");
  assert.match(settings.hooks.PreToolUse[0].hooks[0].command, /beer-pre-edit-hook/);
  assert.match(settings.hooks.Stop[0].hooks[0].command, /beer-closeout-hook/);
  assert.equal(codexHooks.hooks.PreToolUse[0].matcher, "Edit|Write");
  assert.match(codexHooks.hooks.PreToolUse[0].hooks[0].command, /beer-pre-edit-hook/);
  assert.match(codexHooks.hooks.Stop[0].hooks[0].command, /beer-closeout-hook/);
  assert.match(codexConfig, /\[features\]/);
  assert.match(codexConfig, /codex_hooks = true/);
  assert.deepEqual(result.targets.map((target) => target.id), ["claude", "codex"]);
});

test("syncProjectSkills preserves unrelated Claude settings while refreshing Beer hooks", () => {
  const repoRoot = makeTempRepo();
  const claudeDir = path.join(repoRoot, ".claude");
  fs.mkdirSync(claudeDir, { recursive: true });
  fs.writeFileSync(
    path.join(claudeDir, "settings.json"),
    `${JSON.stringify({
      permissions: {
        allow: ["Bash(npm test)"],
      },
      hooks: {
        PreToolUse: [
          {
            matcher: "Bash",
            hooks: [
              {
                type: "command",
                command: "echo custom",
              },
            ],
          },
          {
            matcher: "Edit|MultiEdit|Write",
            hooks: [
              {
                type: "command",
                command: "node \"$CLAUDE_PROJECT_DIR/.beer/scripts/hooks/beer-pre-edit-hook.mjs\"",
                timeout: 5,
              },
            ],
          },
        ],
      },
    }, null, 2)}\n`,
    "utf8",
  );

  syncProjectSkills(repoRoot);
  const settings = JSON.parse(fs.readFileSync(path.join(claudeDir, "settings.json"), "utf8"));

  assert.deepEqual(settings.permissions.allow, ["Bash(npm test)"]);
  assert.equal(settings.hooks.PreToolUse.length, 2);
  assert.equal(settings.hooks.PreToolUse[0].matcher, "Bash");
  assert.equal(settings.hooks.PreToolUse[1].matcher, "Edit|MultiEdit|Write");
  assert.equal(settings.hooks.PreToolUse[1].hooks[0].timeout, 30);
});

test("syncProjectSkills preserves unrelated Codex hooks and config while refreshing Beer hooks", () => {
  const repoRoot = makeTempRepo();
  const codexDir = path.join(repoRoot, ".codex");
  fs.mkdirSync(codexDir, { recursive: true });
  fs.writeFileSync(
    path.join(codexDir, "hooks.json"),
    `${JSON.stringify({
      hooks: {
        PreToolUse: [
          {
            matcher: "^Bash$",
            hooks: [
              {
                type: "command",
                command: "python hooks/custom.js",
              },
            ],
          },
          {
            matcher: "Edit|Write",
            hooks: [
              {
                type: "command",
                command: "node \"C:\\\\Repo\\\\.beer\\\\scripts\\\\hooks\\\\beer-pre-edit-hook.mjs\"",
                timeout: 5,
              },
            ],
          },
        ],
      },
    }, null, 2)}\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(codexDir, "config.toml"),
    [
      "model = \"gpt-5.4\"",
      "",
      "[features]",
      "multi_agent = true",
      "codex_hooks = false",
      "",
    ].join("\n"),
    "utf8",
  );

  syncProjectSkills(repoRoot);
  const hooks = JSON.parse(fs.readFileSync(path.join(codexDir, "hooks.json"), "utf8"));
  const config = fs.readFileSync(path.join(codexDir, "config.toml"), "utf8");

  assert.equal(hooks.hooks.PreToolUse.length, 2);
  assert.equal(hooks.hooks.PreToolUse[0].matcher, "^Bash$");
  assert.equal(hooks.hooks.PreToolUse[1].matcher, "Edit|Write");
  assert.equal(hooks.hooks.PreToolUse[1].hooks[0].timeout, 30);
  assert.match(config, /multi_agent = true/);
  assert.match(config, /# beer-codex-hooks:start mode=replace previous=false/);
  assert.match(config, /codex_hooks = true/);
});
