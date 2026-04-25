#!/usr/bin/env node

/*
Usage:
  node skills/workflow/feature/debugging/scripts/write-debug-note.mjs \
    --classification "Build failure in api" \
    --root-cause "src/api.ts:42 - null config was passed into createClient" \
    --trigger "npm run build after config refactor" \
    --fix "Guard config before createClient" \
    --signal "TS2345 or null config near createClient"

Options:
  --repo-root <path>  Repository root. Defaults to current working directory.
  --date <YYYY-MM-DD> Entry date. Defaults to today's date.
  --dry-run          Print the note without writing.
  --json             Print JSON result.
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);

function parseArgs(argv) {
  const args = {
    repoRoot: process.cwd(),
    date: new Date().toISOString().slice(0, 10),
    dryRun: false,
    json: false,
  };

  const valueOptions = new Set(["classification", "root-cause", "trigger", "fix", "signal", "repo-root", "date"]);

  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];

    if (raw === "--help" || raw === "-h") {
      printHelp();
      process.exit(0);
    }
    if (raw === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (raw === "--json") {
      args.json = true;
      continue;
    }

    const eq = raw.match(/^--([^=]+)=(.*)$/);
    if (eq && valueOptions.has(eq[1])) {
      args[toCamel(eq[1])] = eq[2];
      continue;
    }

    const option = raw.match(/^--(.+)$/);
    if (option && valueOptions.has(option[1])) {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) {
        throw new Error(`Missing value for ${raw}`);
      }
      args[toCamel(option[1])] = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${raw}`);
  }

  args.repoRoot = path.resolve(args.repoRoot);
  return args;
}

function toCamel(name) {
  return name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function printHelp() {
  process.stdout.write(
    [
      "Usage: write-debug-note.mjs --classification <text> --root-cause <text> --trigger <text> --fix <text> --signal <text>",
      "",
      "Appends a reusable debugging note to .beer/tmp/debug-notes.md.",
    ].join("\n") + "\n",
  );
}

function requireFields(args) {
  const required = ["classification", "rootCause", "trigger", "fix", "signal"];
  const missing = required.filter((field) => !String(args[field] || "").trim());
  if (missing.length > 0) {
    throw new Error(`Missing required option(s): ${missing.map((field) => `--${toKebab(field)}`).join(", ")}`);
  }
}

function toKebab(name) {
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function buildNote(args) {
  return [
    `## Debug Note: ${args.date} - ${args.classification}`,
    "",
    `**Root cause**: ${args.rootCause}`,
    `**Trigger**: ${args.trigger}`,
    `**Fix**: ${args.fix}`,
    `**Signal**: ${args.signal}`,
    "",
  ].join("\n");
}

function appendNote(args) {
  const note = buildNote(args);
  const outputPath = path.join(args.repoRoot, ".beer", "tmp", "debug-notes.md");

  if (!args.dryRun) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.appendFileSync(outputPath, note, "utf8");
  }

  return {
    wrote: !args.dryRun,
    outputPath,
    note,
  };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  requireFields(args);
  const result = appendNote(args);

  if (args.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (args.dryRun) {
    process.stdout.write(result.note);
  } else {
    process.stdout.write(`Debug note appended to ${path.relative(args.repoRoot, result.outputPath)}\n`);
  }

  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  try {
    process.exitCode = main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
