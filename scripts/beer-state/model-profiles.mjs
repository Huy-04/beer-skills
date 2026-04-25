const ROLE_ALIASES = new Map([
  ["orchestrator", "orchestrator"],
  ["orchestration", "orchestrator"],
  ["manager", "orchestrator"],
  ["coding", "coding"],
  ["code", "coding"],
  ["implement", "coding"],
  ["implementation", "coding"],
  ["research_synthesis", "research_synthesis"],
  ["research-synthesis", "research_synthesis"],
  ["research", "research_synthesis"],
  ["synthesis", "research_synthesis"],
  ["search", "research_synthesis"],
]);

const TASK_KIND_TO_ROLE = new Map([
  ["query", "research_synthesis"],
  ["search", "research_synthesis"],
  ["read", "research_synthesis"],
  ["summarize", "research_synthesis"],
  ["synthesize", "research_synthesis"],
  ["research", "research_synthesis"],
  ["investigate", "research_synthesis"],
  ["coding", "coding"],
  ["code", "coding"],
  ["implement", "coding"],
  ["patch", "coding"],
  ["fix", "coding"],
  ["refactor", "coding"],
  ["test", "coding"],
  ["orchestrate", "orchestrator"],
  ["coordinate", "orchestrator"],
  ["plan", "orchestrator"],
  ["planning", "orchestrator"],
  ["validate", "orchestrator"],
  ["review", "orchestrator"],
  ["route", "orchestrator"],
]);

function normalizeToken(value) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_") : "";
}

export function normalizeModelRole(value) {
  const normalized = normalizeToken(value);
  return ROLE_ALIASES.get(normalized) || "";
}

export function inferModelRoleFromTaskKind(value) {
  const normalized = normalizeToken(value);
  return TASK_KIND_TO_ROLE.get(normalized) || "";
}

export function resolveModelProfile(config, options = {}) {
  const explicitRole = normalizeModelRole(options.role);
  const inferredRole = inferModelRoleFromTaskKind(options.taskKind);
  const role = explicitRole || inferredRole || "orchestrator";
  const profile = config?.models?.[role] || {};

  return {
    role,
    task_kind: normalizeToken(options.taskKind),
    source: explicitRole
      ? "explicit-role"
      : inferredRole
        ? `task-kind:${normalizeToken(options.taskKind)}`
        : "default-role",
    model: typeof profile.model === "string" ? profile.model : "",
    reasoning_effort: typeof profile.reasoning_effort === "string" ? profile.reasoning_effort : "",
  };
}

export function renderModelProfileResolution(result) {
  return [
    `Role: ${result.role || "(none)"}`,
    `Task kind: ${result.task_kind || "(none)"}`,
    `Source: ${result.source || "(none)"}`,
    `Model: ${result.model || "(none)"}`,
    `Reasoning effort: ${result.reasoning_effort || "(none)"}`,
  ].join("\n");
}
