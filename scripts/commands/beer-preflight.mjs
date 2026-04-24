#!/usr/bin/env node
// beer-preflight.mjs - Runtime dependency probe + degradation routing
// Usage: node scripts/commands/beer-preflight.mjs [--repo-root <path>] [--json]

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectMcpSources, resolveSkillsRoot } from "./beer-dependencies.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const args = process.argv.slice(2);
const repoRootFlag = args.indexOf("--repo-root");
const repoRoot = repoRootFlag >= 0 ? args[repoRootFlag + 1] : process.cwd();
const jsonOutput = args.includes("--json");
const dryRun = args.includes("--dry-run");

function probeCommand(cmd) {
  if (cmd === "node") {
    return { ok: true, version: process.version };
  }

  try {
    const envPath = process.env.PATH || "";
    const windowsExtensions =
      process.platform === "win32"
        ? (process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM")
            .split(";")
            .map((extension) => extension.toLowerCase())
        : [""];

    for (const segment of envPath.split(path.delimiter).filter(Boolean)) {
      const candidate = path.join(segment, cmd);
      const probePaths =
        process.platform === "win32" && path.extname(candidate) === ""
          ? [candidate, ...windowsExtensions.map((extension) => `${candidate}${extension}`)]
          : [candidate];

      for (const probePath of probePaths) {
        if (fs.existsSync(probePath)) {
          return { ok: true, version: null };
        }
      }
    }

    return { ok: false, version: null };
  } catch {
    return { ok: false, version: null };
  }
}

function probeMcp(root, serverName) {
  try {
    const skillsRoot = resolveSkillsRoot(root);
    const sources = collectMcpSources({ repoRoot: root, skillsRoot });
    const matchedSources = sources.filter((source) => (source.server_names || []).includes(serverName));
    return {
      ok: matchedSources.length > 0,
      matched_sources: matchedSources.map((source) => source.key),
    };
  } catch {
    return { ok: false, matched_sources: [] };
  }
}

function buildAgentMailAvailability(probe) {
  if (!probe.ok) {
    return false;
  }

  return {
    configured: true,
    matched_sources: probe.matched_sources || [],
    live_verified: false,
    detail: "MCP config found; runtime liveness must be confirmed by the active agent before launching a swarm.",
  };
}

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function samePath(leftPath, rightPath) {
  return path.resolve(leftPath).toLowerCase() === path.resolve(rightPath).toLowerCase();
}

function probeGitNexusIndex(root) {
  const resolvedRoot = path.resolve(root);
  const localIndexPath = path.join(resolvedRoot, ".gitnexus");
  const registryPath = path.join(os.homedir(), ".gitnexus", "registry.json");
  const registry = readJsonIfExists(registryPath);
  const registryEntry = Array.isArray(registry)
    ? registry.find((entry) => entry?.path && samePath(entry.path, resolvedRoot))
    : null;

  return {
    ok: Boolean(registryEntry || fs.existsSync(localIndexPath)),
    registry_entry: registryEntry
      ? {
          name: registryEntry.name || "",
          indexed_at: registryEntry.indexedAt || "",
          last_commit: registryEntry.lastCommit || "",
          stats: registryEntry.stats || {},
        }
      : null,
    local_index_exists: fs.existsSync(localIndexPath),
  };
}

export function buildBeerPreflightReport(root = repoRoot) {
  const nodeProbe = probeCommand("node");
  const bdProbe = probeCommand("bd");
  const gitNexusProbe = probeMcp(root, "gitnexus");
  const gitNexusIndexProbe = probeGitNexusIndex(root);

  const result = {
    repoRoot: root,
    available_tools: {
      node: nodeProbe.ok ? { version: nodeProbe.version } : false,
      bd: bdProbe.ok ? { version: bdProbe.version } : false,
      agent_mail: false,
      gitnexus: gitNexusProbe.ok,
      gitnexus_index: gitNexusIndexProbe.ok ? gitNexusIndexProbe : false,
    },
    recommended_mode: "standard",
    degraded_features: [],
  };

  if (!nodeProbe.ok) {
    result.recommended_mode = "unavailable";
    result.degraded_features.push("Node.js runtime missing - all Beer features unavailable");
  } else {
    if (!bdProbe.ok) {
      result.recommended_mode = "degraded";
      result.degraded_features.push("bead_management: manual (bd missing)");
    }
    if (!bdProbe.ok) {
      result.recommended_mode = "degraded";
      result.degraded_features.push("coordination: direct_single_worker (bd missing)");
    }
    if (!gitNexusProbe.ok) {
      result.recommended_mode = "degraded";
      result.degraded_features.push("graph_context: manual inspection (GitNexus MCP missing)");
    } else if (!gitNexusIndexProbe.ok) {
      result.recommended_mode = "degraded";
      result.degraded_features.push("graph_context: unavailable for this repo (run npx gitnexus analyze)");
    }
  }

  return result;
}

export function main(argv = process.argv.slice(2)) {
  const localArgs = argv;
  const localRepoRootFlag = localArgs.indexOf("--repo-root");
  const localRepoRoot = localRepoRootFlag >= 0 ? localArgs[localRepoRootFlag + 1] : process.cwd();
  const localJsonOutput = localArgs.includes("--json");
  const localDryRun = localArgs.includes("--dry-run");
  const result = buildBeerPreflightReport(localRepoRoot);

  if (localDryRun) {
    result.dry_run = true;
  }

  if (localJsonOutput || localDryRun) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("Beer Preflight");
    console.log("==============");
    console.log(`Mode: ${result.recommended_mode}`);
    console.log(`Repo: ${result.repoRoot}`);
    console.log("Tools:");
    console.log(`  node: ${result.available_tools.node ? "OK" : "NO"} ${result.available_tools.node?.version || ""}`);
    console.log(`  bd:   ${result.available_tools.bd ? "OK" : "NO"}`);
      console.log(`  bd: ${result.available_tools.bd ? "OK" : "NO"}`);
    console.log(`  GitNexus MCP: ${result.available_tools.gitnexus ? "OK" : "NO"}`);
    console.log(`  GitNexus index: ${result.available_tools.gitnexus_index ? "OK" : "NO"}`);
    if (result.degraded_features.length) {
      console.log("Degraded:");
      result.degraded_features.forEach((detail) => console.log(`  - ${detail}`));
    }
  }

  return result.recommended_mode === "unavailable" ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
