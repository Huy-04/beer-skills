#!/usr/bin/env node

import fs from "node:fs";

import { assessCloseoutGuard } from "../beer-session/closeout-guard.mjs";

function readHookInput() {
  try {
    const source = fs.readFileSync(0, "utf8").trim();
    return source ? JSON.parse(source) : {};
  } catch {
    return {};
  }
}

function main() {
  const input = readHookInput();
  if (input.stop_hook_active) {
    return 0;
  }

  const assessment = assessCloseoutGuard({
    repoRoot: input.cwd,
  });

  if (assessment.allow) {
    return 0;
  }

  process.stdout.write(`${JSON.stringify({
    decision: "block",
    reason: assessment.summary,
  })}\n`);
  return 0;
}

process.exitCode = main();
