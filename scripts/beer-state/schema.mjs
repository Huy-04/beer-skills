export const STATE_SCHEMA_VERSION = "1.0";
export const CONFIG_SCHEMA_VERSION = "1.0";

const DEFAULT_APPROVED_GATES = {
  context: false,
  phase_plan: false,
  execution: false,
  review: false,
};

const DEFAULT_AUTO_ACCEPT = {
  enabled: false,
  planning: false,
  validating: false,
  swarming: false,
  reviewing: false,
  compounding: false,
};

function utcNow() {
  return new Date().toISOString();
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => typeof item === "string" && item.trim() !== "");
}

function normalizeActiveWorkers(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((worker) => ({
      codex_name: typeof worker.codex_name === "string" ? worker.codex_name : "",
      status: typeof worker.status === "string" ? worker.status : "",
      bead_id: typeof worker.bead_id === "string" ? worker.bead_id : "",
    }));
}

function normalizeApprovedGates(value) {
  const gates = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    context: Boolean(gates.context),
    phase_plan: Boolean(gates.phase_plan),
    execution: Boolean(gates.execution),
    review: Boolean(gates.review),
  };
}

function normalizeContextStage(value) {
  return value === "seeded" || value === "locked" ? value : "none";
}

function normalizeMode(value) {
  return value === "small" || value === "standard" ? value : "standard";
}

function normalizeRisk(value) {
  return value === "high" ? "high" : "normal";
}

function normalizeRunStyle(value) {
  return value === "go" ? "go" : "guided";
}

export function normalizePlanningRoute(value) {
  return value === "feature" || value === "small-fix" || value === "debug-escalation" ? value : "";
}

function normalizeExecutionTarget(value) {
  return value === "executing" || value === "swarming" ? value : "";
}

function normalizeValidationStatus(value) {
  return value === "pending" || value === "pass" || value === "fail" ? value : "";
}

function normalizeSwarmStatus(value) {
  return value === "initializing" || value === "active" || value === "blocked" || value === "complete"
    ? value
    : "";
}

function normalizeTddStatus(value) {
  return value === "not-required" ||
    value === "required" ||
    value === "blocked" ||
    value === "waived" ||
    value === "complete"
    ? value
    : "not-required";
}

function normalizeReviewStatus(value) {
  return value === "pending" || value === "pass" || value === "repair-needed" || value === "review-only"
    ? value
    : "";
}

function normalizeVerificationStatus(value) {
  return value === "not-run" || value === "passed" || value === "failed" || value === "limited"
    ? value
    : "not-run";
}

function normalizePathString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeContextConfidence(value) {
  return Number.isFinite(value) ? value : 0;
}

function normalizeConfigAutoAccept(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    enabled: normalizeBoolean(source.enabled, DEFAULT_AUTO_ACCEPT.enabled),
    planning: normalizeBoolean(source.planning, DEFAULT_AUTO_ACCEPT.planning),
    validating: normalizeBoolean(source.validating, DEFAULT_AUTO_ACCEPT.validating),
    swarming: normalizeBoolean(source.swarming, DEFAULT_AUTO_ACCEPT.swarming),
    reviewing: normalizeBoolean(source.reviewing, DEFAULT_AUTO_ACCEPT.reviewing),
    compounding: normalizeBoolean(source.compounding, DEFAULT_AUTO_ACCEPT.compounding),
  };
}

export function buildDefaultState(overrides = {}) {
  const approvedGates = normalizeApprovedGates(overrides.approved_gates);
  return {
    schema_version: STATE_SCHEMA_VERSION,
    feature_slug: typeof overrides.feature_slug === "string" ? overrides.feature_slug : "",
    mode: normalizeMode(overrides.mode),
    risk: normalizeRisk(overrides.risk),
    run_style: normalizeRunStyle(overrides.run_style),
    active_skill: typeof overrides.active_skill === "string" ? overrides.active_skill : "",
    context_stage: normalizeContextStage(overrides.context_stage),
    seed_path: normalizePathString(overrides.seed_path, ".beer/seed/"),
    context_path: normalizePathString(overrides.context_path),
    context_confidence: normalizeContextConfidence(overrides.context_confidence),
    phase: typeof overrides.phase === "string" ? overrides.phase : "idle",
    phase_number: Number.isFinite(overrides.phase_number) ? overrides.phase_number : 0,
    planning_route: normalizePlanningRoute(overrides.planning_route),
    current_phase_name: typeof overrides.current_phase_name === "string" ? overrides.current_phase_name : "",
    current_slice: typeof overrides.current_slice === "string" ? overrides.current_slice : "",
    prep_depth: overrides.prep_depth === "compact" || overrides.prep_depth === "full" ? overrides.prep_depth : "",
    execution_target: normalizeExecutionTarget(overrides.execution_target),
    validation_status: normalizeValidationStatus(overrides.validation_status),
    spike_status: typeof overrides.spike_status === "string" ? overrides.spike_status : "",
    swarm_status: normalizeSwarmStatus(overrides.swarm_status),
    active_work_item: typeof overrides.active_work_item === "string" ? overrides.active_work_item : "",
    tdd_required: normalizeBoolean(overrides.tdd_required, false),
    tdd_status: normalizeTddStatus(overrides.tdd_status),
    tdd_evidence_path: normalizePathString(overrides.tdd_evidence_path),
    execution_evidence_path: normalizePathString(overrides.execution_evidence_path),
    verification_status: normalizeVerificationStatus(overrides.verification_status),
    review_route:
      overrides.review_route === "feature-final" ||
      overrides.review_route === "direct-completion" ||
      overrides.review_route === "manual-review"
        ? overrides.review_route
        : "",
    review_status: normalizeReviewStatus(overrides.review_status),
    open_findings_count: Number.isFinite(overrides.open_findings_count) ? overrides.open_findings_count : 0,
    compounding_route:
      overrides.compounding_route === "feature-closeout" ||
      overrides.compounding_route === "direct-completion" ||
      overrides.compounding_route === "debug-learning"
        ? overrides.compounding_route
        : "",
    learnings_file: normalizePathString(overrides.learnings_file),
    critical_promotions: Number.isFinite(overrides.critical_promotions) ? overrides.critical_promotions : 0,
    next_handoff: typeof overrides.next_handoff === "string" ? overrides.next_handoff : "",
    epic_id: typeof overrides.epic_id === "string" ? overrides.epic_id : "",
    approved_gates: {
      ...DEFAULT_APPROVED_GATES,
      ...approvedGates,
    },
    active_beads: normalizeStringArray(overrides.active_beads),
    active_workers: normalizeActiveWorkers(overrides.active_workers),
    auto_accept: {
      enabled: Boolean(overrides.auto_accept?.enabled),
      planning: Boolean(overrides.auto_accept?.planning),
      validating: Boolean(overrides.auto_accept?.validating),
      swarming: Boolean(overrides.auto_accept?.swarming),
      reviewing: Boolean(overrides.auto_accept?.reviewing),
      compounding: Boolean(overrides.auto_accept?.compounding),
    },
    blockers: normalizeStringArray(overrides.blockers),
    last_updated:
      typeof overrides.last_updated === "string" && overrides.last_updated
        ? overrides.last_updated
        : utcNow(),
  };
}

export function buildDefaultConfig(overrides = {}) {
  const features =
    overrides.features && typeof overrides.features === "object" && !Array.isArray(overrides.features)
      ? overrides.features
      : {};
  const defaults =
    overrides.defaults && typeof overrides.defaults === "object" && !Array.isArray(overrides.defaults)
      ? overrides.defaults
      : {};
  const dependencies =
    overrides.dependencies && typeof overrides.dependencies === "object" && !Array.isArray(overrides.dependencies)
      ? overrides.dependencies
      : {};

  return {
    schema_version: CONFIG_SCHEMA_VERSION,
    ecosystem: "beer",
    version: typeof overrides.version === "string" && overrides.version ? overrides.version : "1.0.0",
    features: {
      context_intake: normalizeBoolean(
        Object.prototype.hasOwnProperty.call(features, "context_intake")
          ? features.context_intake
          : features.context_coordination,
        true,
      ),
      graph_explore: normalizeBoolean(features.graph_explore, true),
      multi_agent: normalizeBoolean(features.multi_agent, false),
      codex_hooks: normalizeBoolean(features.codex_hooks, true),
    },
    defaults: {
      mode:
        defaults.mode === "small" || defaults.mode === "standard" || defaults.mode === "auto"
          ? defaults.mode
          : "auto",
      risk: defaults.risk === "high" ? "high" : "normal",
      run_style: defaults.run_style === "go" ? "go" : "guided",
      max_workers: Number.isFinite(defaults.max_workers) ? defaults.max_workers : 3,
      context_threshold: Number.isFinite(defaults.context_threshold) ? defaults.context_threshold : 0.65,
    },
    auto_accept: normalizeConfigAutoAccept(overrides.auto_accept),
    dependencies: {
      task_tracker: typeof dependencies.task_tracker === "string" ? dependencies.task_tracker : "beads",
      graph_engine: typeof dependencies.graph_engine === "string" ? dependencies.graph_engine : "gitnexus",
    },
  };
}

export function normalizeBeerState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return buildDefaultState();
  }

  return buildDefaultState(state);
}

export function normalizeBeerConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return buildDefaultConfig();
  }

  return buildDefaultConfig(config);
}
