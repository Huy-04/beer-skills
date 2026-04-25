import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  buildBeerSelfUpdateCommand,
  installGitNexus,
  isWindowsShellCommand,
  quoteWindowsShellArg,
  resolveCommand,
} from "../scripts/beer-cli/toolchain.mjs";

test("resolveCommand prefers Windows PATHEXT commands before extensionless shims", () => {
  const root = "C:\\Program Files\\nodejs";
  const commandPath = path.join(root, "npx");
  const commandCmdPath = `${commandPath}.cmd`;
  const existing = new Set([commandPath, commandCmdPath]);

  const result = resolveCommand("npx", {
    envPath: root,
    platform: "win32",
    pathExt: ".EXE;.CMD;.BAT;.COM",
    pathExists: (filePath) => existing.has(filePath),
    executableCheck: () => true,
  });

  assert.equal(result, commandCmdPath);
});

test("resolveCommand still finds extensionless commands on non-Windows platforms", () => {
  const root = "/usr/local/bin";
  const commandPath = path.join(root, "bash");

  const result = resolveCommand("bash", {
    envPath: root,
    platform: "linux",
    pathExists: (filePath) => filePath === commandPath,
    executableCheck: () => true,
  });

  assert.equal(result, commandPath);
});

test("isWindowsShellCommand detects cmd and bat only on Windows", () => {
  assert.equal(isWindowsShellCommand("C:\\Program Files\\nodejs\\npx.cmd", "win32"), true);
  assert.equal(isWindowsShellCommand("C:\\tools\\run.bat", "win32"), true);
  assert.equal(isWindowsShellCommand("C:\\tools\\node.exe", "win32"), false);
  assert.equal(isWindowsShellCommand("/usr/bin/npx.cmd", "linux"), false);
});

test("quoteWindowsShellArg escapes double quotes", () => {
  assert.equal(quoteWindowsShellArg('say "hi"'), '"say \\"hi\\""');
});

test("buildBeerSelfUpdateCommand uses the GitHub package source", () => {
  assert.equal(buildBeerSelfUpdateCommand(), "npm install -g github:Huy-04/beer-skills");
});

test("installGitNexus skips setup when GitNexus is already available", () => {
  const result = installGitNexus({ alreadyInstalled: true });

  assert.equal(result.id, "gitnexus");
  assert.equal(result.attempted, false);
  assert.equal(result.status, "skipped");
  assert.equal(result.installer_command, "npx -y gitnexus@latest setup");
  assert.equal(result.reason, "GitNexus MCP already available; skipping setup.");
});
