import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { renderBeerStateMarkdown } from "./markdown.mjs";
import {
  buildNextReads,
  buildRecommendedActions,
  parseLooseKeyValueMarkdown,
} from "./status.mjs";
import {
  buildDefaultConfig,
  buildDefaultState,
  normalizeBeerConfig,
  normalizeBeerState,
} from "./schema.mjs";

export {
  CONFIG_SCHEMA_VERSION,
  STATE_SCHEMA_VERSION,
  buildDefaultConfig,
  buildDefaultState,
  normalizeBeerConfig,
  normalizeBeerState,
} from "./schema.mjs";

export {
  assessPlanningGate,
  deriveFeatureSlug,
  renderBeerStatus,
  resolveLockedContextPath,
} from "./status.mjs";

export {
  inferModelRoleFromTaskKind,
  normalizeModelRole,
  renderModelProfileResolution,
  resolveModelProfile,
} from "./model-profiles.mjs";

export { renderBeerStateMarkdown } from "./markdown.mjs";

export function resolveRepoRoot(explicitRoot, startFrom = process.cwd()) {
  if (explicitRoot) {
    return path.resolve(explicitRoot);
  }

  const cwd = path.resolve(startFrom);
  try {
    const stdout = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return path.resolve(stdout.trim());
  } catch {
    let candidate = cwd;
    while (true) {
      if (
        fs.existsSync(path.join(candidate, ".git")) ||
        fs.existsSync(path.join(candidate, ".beer", "onboarding.json"))
      ) {
        return candidate;
      }
      const parent = path.dirname(candidate);
      if (parent === candidate) {
        return cwd;
      }
      candidate = parent;
    }
  }
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function fileTextIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

export function getBeerStatePaths(repoRoot) {
  return {
    onboarding: path.join(repoRoot, ".beer", "onboarding.json"),
    stateJson: path.join(repoRoot, ".beer", "state.json"),
    stateMarkdown: path.join(repoRoot, ".beer", "STATE.md"),
    handoff: path.join(repoRoot, ".beer", "HANDOFF.json"),
    config: path.join(repoRoot, ".beer", "config.json"),
    agents: path.join(repoRoot, "AGENTS.md"),
    readme: path.join(repoRoot, "README.md"),
    criticalPatterns: path.join(repoRoot, "history", "learnings", "critical-patterns.md"),
  };
}

export function readBeerState(repoRoot) {
  const paths = getBeerStatePaths(repoRoot);
  return normalizeBeerState(readJsonIfExists(paths.stateJson));
}

export function readBeerConfig(repoRoot) {
  const paths = getBeerStatePaths(repoRoot);
  return normalizeBeerConfig(readJsonIfExists(paths.config));
}

export function writeBeerState(repoRoot, nextState) {
  const paths = getBeerStatePaths(repoRoot);
  const normalized = normalizeBeerState(nextState);
  ensureParent(paths.stateJson);
  fs.writeFileSync(paths.stateJson, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  ensureParent(paths.stateMarkdown);
  fs.writeFileSync(paths.stateMarkdown, renderBeerStateMarkdown(normalized), "utf8");
  return normalized;
}

export function readBeerStatus(repoRoot) {
  const paths = getBeerStatePaths(repoRoot);
  const onboarding = readJsonIfExists(paths.onboarding);
  const stateJson = readJsonIfExists(paths.stateJson);
  const config = readJsonIfExists(paths.config);
  const handoff = readJsonIfExists(paths.handoff);
  const stateMarkdownText = fileTextIfExists(paths.stateMarkdown);
  const stateMarkdown = parseLooseKeyValueMarkdown(stateMarkdownText);

  const status = {
    repo_root: repoRoot,
    onboarding: {
      exists: Boolean(onboarding),
      status: onboarding?.status || "",
      plugin_version: onboarding?.plugin_version || "",
    },
    state_json: {
      exists: Boolean(stateJson),
      ...normalizeBeerState(stateJson),
    },
    config: {
      exists: Boolean(config),
      ...normalizeBeerConfig(config),
    },
    state_markdown: {
      exists: stateMarkdownText.trim() !== "",
      ...stateMarkdown,
    },
    handoff: {
      exists: Boolean(handoff),
      feature: typeof handoff?.feature === "string" ? handoff.feature : "",
      skill: typeof handoff?.skill === "string" ? handoff.skill : "",
      phase: typeof handoff?.phase === "string" ? handoff.phase : "",
      next_action: typeof handoff?.next_action === "string" ? handoff.next_action : "",
      context_pct:
        typeof handoff?.context_pct === "number"
          ? handoff.context_pct
          : typeof handoff?.context_pct === "string"
            ? handoff.context_pct
            : "",
    },
    critical_patterns_exists: fs.existsSync(paths.criticalPatterns),
    next_reads: [],
    recommended_actions: [],
  };

  status.next_reads = buildNextReads(status);
  status.recommended_actions = buildRecommendedActions(status);

  return status;
}
