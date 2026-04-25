#!/usr/bin/env node

import fs from "node:fs";

import { assessFlowGuard } from "../beer-session/flow-guard.mjs";

function readHookInput() {
  try {
    const source = fs.readFileSync(0, "utf8").trim();
    return source ? JSON.parse(source) : {};
  } catch {
    return {};
  }
}

function collectPaths(toolInput) {
  const paths = [];

  if (toolInput && typeof toolInput === "object" && !Array.isArray(toolInput)) {
    if (typeof toolInput.file_path === "string" && toolInput.file_path.trim() !== "") {
      paths.push(toolInput.file_path);
    }
    if (Array.isArray(toolInput.file_paths)) {
      for (const filePath of toolInput.file_paths) {
        if (typeof filePath === "string" && filePath.trim() !== "") {
          paths.push(filePath);
        }
      }
    }
  }

  return [...new Set(paths)];
}

function main() {
  const input = readHookInput();
  const assessment = assessFlowGuard({
    repoRoot: input.cwd,
    paths: collectPaths(input.tool_input),
  });

  if (assessment.allow) {
    return 0;
  }

  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: assessment.summary,
    },
  })}\n`);
  return 0;
}

process.exitCode = main();
