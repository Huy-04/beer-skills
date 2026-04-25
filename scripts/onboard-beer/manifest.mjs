import path from "node:path";

export const MIN_NODE_MAJOR = 18;

export const MANAGED_SCRIPT_FILES = [
  path.join("commands", "beer-approve.mjs"),
  path.join("commands", "beer-auto-accept.mjs"),
  path.join("commands", "beer-cli.mjs"),
  path.join("commands", "beer-dependencies.mjs"),
  path.join("commands", "beer-planning-gate.mjs"),
  path.join("commands", "beer-preflight.mjs"),
  path.join("commands", "beer-status.mjs"),
  path.join("commands", "onboard-beer.mjs"),
  path.join("beer-auto-accept", "policy.mjs"),
  path.join("beer-cli", "args.mjs"),
  path.join("beer-cli", "help.mjs"),
  path.join("beer-cli", "init.mjs"),
  path.join("beer-cli", "post-task-refresh.mjs"),
  path.join("beer-cli", "refresh.mjs"),
  path.join("beer-cli", "toolchain.mjs"),
  path.join("beer-cli", "uninstall.mjs"),
  path.join("beer-cli", "update.mjs"),
  path.join("beer-dependencies", "core.mjs"),
  path.join("beer-dependencies", "metadata.mjs"),
  path.join("beer-dependencies", "probes.mjs"),
  path.join("beer-state", "core.mjs"),
  path.join("beer-state", "markdown.mjs"),
  path.join("beer-state", "schema.mjs"),
  path.join("beer-state", "status.mjs"),
  path.join("onboard-beer", "checks.mjs"),
  path.join("onboard-beer", "defaults.mjs"),
  path.join("onboard-beer", "manifest.mjs"),
];

export const MANAGED_SKILL_SENTINEL = path.join("workflow", "feature", "using-beer", "SKILL.md");
