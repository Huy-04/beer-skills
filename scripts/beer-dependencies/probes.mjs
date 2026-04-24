import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { formatPluginSkillName, parseScalar } from "./metadata.mjs";

function canExecute(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function defaultCommandProbe(command, envPath = process.env.PATH || "") {
  const windowsExtensions =
    process.platform === "win32"
      ? (process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM")
          .split(";")
          .map((extension) => extension.toLowerCase())
      : [""];

  for (const segment of envPath.split(path.delimiter).filter(Boolean)) {
    const candidate = path.join(segment, command);
    const probePaths =
      process.platform === "win32" && path.extname(candidate) === ""
        ? [candidate, ...windowsExtensions.map((extension) => `${candidate}${extension}`)]
        : [candidate];

    for (const probePath of probePaths) {
      if (fs.existsSync(probePath) && canExecute(probePath)) {
        return {
          available: true,
          detail: probePath,
        };
      }
    }
  }

  return {
    available: false,
    detail: `Missing from PATH for command '${command}'`,
  };
}

function parseMcpServerNamesFromToml(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const source = fs.readFileSync(filePath, "utf8");
  const names = new Set();
  const patterns = [
    /^\s*\[mcp_servers\.([^\]]+)\]\s*$/gm,
    /^\s*\[mcp\.servers\.([^\]]+)\]\s*$/gm,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      names.add(parseScalar(match[1]));
    }
  }

  return [...names];
}

function parseMcpServerNamesFromJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return [];
    }
    const manifest =
      payload.mcpServers && typeof payload.mcpServers === "object" && !Array.isArray(payload.mcpServers)
        ? payload.mcpServers
        : payload;
    return Object.keys(manifest);
  } catch {
    return [];
  }
}

function resolvePluginMcpManifestPath(pluginRoot) {
  const pluginManifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  if (!fs.existsSync(pluginManifestPath)) {
    return null;
  }

  try {
    const payload = JSON.parse(fs.readFileSync(pluginManifestPath, "utf8"));
    const manifestPath = typeof payload?.mcpServers === "string" ? payload.mcpServers.trim() : "";
    if (!manifestPath) {
      return null;
    }
    return path.resolve(pluginRoot, manifestPath);
  } catch {
    return null;
  }
}

export function collectMcpSources({ repoRoot, skillsRoot, globalCodexConfigPath }) {
  const sources = [];
  const repoCodexConfigPath = path.join(repoRoot, ".codex", "config.toml");
  const globalConfigPath = globalCodexConfigPath || path.join(os.homedir(), ".codex", "config.toml");
  const pluginRoot = path.resolve(path.join(skillsRoot, ".."));

  sources.push({
    key: "repo_codex_config",
    type: "toml",
    path: repoCodexConfigPath,
    server_names: parseMcpServerNamesFromToml(repoCodexConfigPath),
  });

  sources.push({
    key: "global_codex_config",
    type: "toml",
    path: globalConfigPath,
    server_names: parseMcpServerNamesFromToml(globalConfigPath),
  });

  const pluginMcpManifestPath =
    resolvePluginMcpManifestPath(pluginRoot) || path.join(pluginRoot, ".mcp.json");
  sources.push({
    key: "plugin_mcp_manifest",
    type: "json",
    path: pluginMcpManifestPath,
    server_names: parseMcpServerNamesFromJson(pluginMcpManifestPath),
  });

  return sources;
}

export function probeDependency(dependency, context) {
  if (dependency.kind === "command") {
    const command = dependency.command || dependency.id;
    const result = context.commandProbe(command);
    return {
      ...dependency,
      target: command,
      available: result.available,
      probe: {
        kind: "command",
        detail: result.detail,
      },
    };
  }

  if (dependency.kind === "mcp_server") {
    const requestedNames = Array.isArray(dependency.server_names)
      ? dependency.server_names
      : [dependency.server_names].filter(Boolean);
    const requestedSources = Array.isArray(dependency.config_sources)
      ? dependency.config_sources
      : [dependency.config_sources].filter(Boolean);
    const candidateSources =
      requestedSources.length > 0
        ? context.mcpSources.filter((source) => requestedSources.includes(source.key))
        : context.mcpSources;
    const configuredNames = new Set();
    const matchedSources = [];

    for (const source of candidateSources) {
      const sourceNames = source.server_names || [];
      for (const serverName of sourceNames) {
        configuredNames.add(serverName);
      }
      const hasMatch = requestedNames.some((name) => sourceNames.includes(name));
      if (hasMatch) {
        matchedSources.push(source.key);
      }
    }

    const available = requestedNames.length > 0 && requestedNames.some((name) => configuredNames.has(name));
    return {
      ...dependency,
      target: requestedNames,
      available,
      probe: {
        kind: "mcp_server",
        detail: available
          ? `Configured in ${matchedSources.join(", ")}`
          : `Missing from configured MCP sources (${candidateSources.map((source) => source.key).join(", ")})`,
        matched_sources: matchedSources,
        checked_sources: candidateSources.map((source) => source.key),
      },
    };
  }

  if (dependency.kind === "skill") {
    const target = dependency.skill_name || dependency.id;
    const available =
      context.skillCatalog.has(target) || context.skillCatalog.has(formatPluginSkillName(target));
    return {
      ...dependency,
      target,
      available,
      probe: {
        kind: "skill",
        detail: available
          ? `Declared in skill bundle as '${formatPluginSkillName(target)}'`
          : `Missing from loaded skill bundle for '${target}'`,
      },
    };
  }

  return {
    ...dependency,
    target: dependency.id,
    available: false,
    probe: {
      kind: "unknown",
      detail: `Unsupported dependency kind '${dependency.kind || "unknown"}'`,
    },
  };
}
