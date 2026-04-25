import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { parseCliArgs } from "../scripts/beer-cli/args.mjs";
import {
  buildClaudeCommandSpecs,
  getClaudeTargets,
  runClaude,
  toClaudeCommandName,
} from "../scripts/beer-cli/claude.mjs";

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "beer-claude-"));
}

test("parseCliArgs captures claude subcommands and flags", () => {
  const args = parseCliArgs(["claude", "install", "--global", "--json"]);

  assert.equal(args.command, "claude");
  assert.equal(args.subcommand, "install");
  assert.equal(args.global, true);
  assert.equal(args.json, true);
});

test("toClaudeCommandName prefixes skills with beer-", () => {
  assert.equal(toClaudeCommandName("using-beer"), "beer-using-beer");
  assert.equal(toClaudeCommandName("beer:using-beer"), "beer-using-beer");
});

test("getClaudeTargets resolves project and global Claude paths", () => {
  const targets = getClaudeTargets("C:\\Code\\Project\\BeerMovie");

  assert.equal(path.basename(targets.projectCommands), "commands");
  assert.equal(path.basename(targets.globalCommands), "commands");
});

test("buildClaudeCommandSpecs generates beer-prefixed command files", () => {
  const specs = buildClaudeCommandSpecs(path.join(process.cwd(), "skills"));
  const usingBeer = specs.find((spec) => spec.skillName === "using-beer");

  assert.ok(usingBeer);
  assert.equal(usingBeer.commandName, "beer-using-beer");
  assert.equal(usingBeer.commandFile, "beer-using-beer.md");
  assert.match(usingBeer.commandBody, /\/beer-using-beer/);
  assert.match(usingBeer.commandBody, /beer:using-beer/);
});

test("runClaude installs project slash commands by default", async () => {
  const repoRoot = makeTempRepo();
  const captured = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    captured.push(String(chunk));
    return true;
  };

  try {
    const code = await runClaude({
      subcommand: "install",
      repoRoot,
      json: false,
      global: false,
      all: false,
    });

    assert.equal(code, 0);
    assert.equal(fs.existsSync(path.join(repoRoot, ".claude", "commands", "beer-using-beer.md")), true);
    assert.match(
      fs.readFileSync(path.join(repoRoot, ".claude", "commands", "beer-using-beer.md"), "utf8"),
      /beer:using-beer/,
    );
    assert.match(captured.join(""), /Beer Claude Command Install/);
  } finally {
    process.stdout.write = originalWrite;
  }
});
