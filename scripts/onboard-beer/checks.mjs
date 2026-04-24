import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

export function checkCommand(command) {
  try {
    execFileSync(command, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return true;
  } catch {
    return false;
  }
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

function parseScalar(value) {
  const trimmed = String(value || "").trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
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
  const payload = readJsonIfExists(filePath);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }
  const manifest =
    payload.mcpServers && typeof payload.mcpServers === "object" && !Array.isArray(payload.mcpServers)
      ? payload.mcpServers
      : payload;
  return Object.keys(manifest);
}

export function hasMcpServer(repoRoot, serverName) {
  const candidates = [
    parseMcpServerNamesFromToml(path.join(repoRoot, ".codex", "config.toml")),
    parseMcpServerNamesFromToml(path.join(os.homedir(), ".codex", "config.toml")),
    parseMcpServerNamesFromJson(path.join(repoRoot, ".mcp.json")),
  ];
  return candidates.some((names) => names.includes(serverName));
}
