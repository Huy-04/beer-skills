import fs from "node:fs";
import path from "node:path";

import { normalizeRoute } from "./schema.mjs";

export function parseLooseKeyValueMarkdown(text) {
  const parsed = {};
  for (const line of text.split("\n")) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9 _/-]+):\s*(.+)$/);
    if (!match) {
      continue;
    }
    const key = match[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    parsed[key] = match[2].trim();
  }
  return parsed;
}

export function deriveFeatureSlug(status) {
  const candidate = (
    status.state_json.feature_slug ||
    status.handoff.feature ||
    status.state_markdown.feature ||
    status.state_markdown.focus ||
    ""
  );
  return candidate === "(none)" || candidate === "none" ? "" : candidate;
}

function deriveContextPath(status) {
  const explicitPath = status.state_json.context_path || "";
  if (explicitPath) {
    return explicitPath;
  }
  const featureSlug = deriveFeatureSlug(status);
  return featureSlug ? `history/${featureSlug}/CONTEXT.md` : "";
}

function resolveStatusPath(repoRoot, filePath) {
  if (!filePath) {
    return "";
  }

  return path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
}

export function resolveLockedContextPath(status) {
  if (status.state_json.context_stage !== "locked") {
    return "";
  }

  return deriveContextPath(status);
}

export function assessPlanningGate(status, options = {}) {
  const requestedRoute = normalizeRoute(options.route) || status.state_json.route || "feature";
  const workIntent = status.state_json.work_intent || "delivery";
  const contextStage = status.state_json.context_stage || "none";
  const seedPath = status.state_json.seed_path || ".beer/seed/";
  const contextPath = resolveLockedContextPath(status);

  if (!status.onboarding.exists) {
    return {
      ok: false,
      code: "onboarding_missing",
      summary: "Planning blocked: Beer onboarding is missing.",
      route: requestedRoute,
      work_intent: workIntent,
      context_stage: contextStage,
      context_path: "",
      next_steps: [
        "Run Beer onboarding before planning.",
        "Create .beer/state.json, then resume the Beer flow.",
      ],
    };
  }

  if (!status.state_json.exists) {
    return {
      ok: false,
      code: "state_missing",
      summary: "Planning blocked: .beer/state.json is missing.",
      route: requestedRoute,
      work_intent: workIntent,
      context_stage: contextStage,
      context_path: "",
      next_steps: [
        "Restore or recreate .beer/state.json before planning.",
        "If context is unknown, route through beer:context-intake first.",
      ],
    };
  }

  if (requestedRoute === "small-fix") {
    const taskContextPath = deriveContextPath(status);
    return {
      ok: true,
      code: "ready_small_fix",
      summary: "Planning may proceed on the small direct-fix route without locked feature context.",
      route: requestedRoute,
      work_intent: workIntent,
      context_stage: contextStage,
      context_path: taskContextPath || (contextStage === "seeded" ? seedPath : contextPath),
      next_steps: [
        taskContextPath
          ? `Read ${taskContextPath} to keep the ${workIntent === "delivery" ? "direct-fix" : workIntent} scope explicit.`
          : `Write a bounded history/<feature>/CONTEXT.md so the ${workIntent === "delivery" ? "direct fix" : workIntent} scope stays explicit.`,
        "Keep planning compact and confirm the direct-fix exemption still applies.",
        "If scope expands or product decisions appear, route through beer:context-intake and beer:exploring.",
      ],
    };
  }

  if (contextStage === "seeded") {
    return {
      ok: false,
      code: "context_seeded",
      summary: `Planning blocked: seed context at ${seedPath} is not locked yet.`,
      route: requestedRoute,
      work_intent: workIntent,
      context_stage: contextStage,
      context_path: seedPath,
      next_steps: [
        "Invoke beer:exploring to confirm decisions from the seed context.",
        "Write history/<feature>/CONTEXT.md and promote context_stage to locked.",
      ],
    };
  }

  if (contextStage !== "locked") {
    return {
      ok: false,
      code: "context_not_locked",
      summary: "Planning blocked: no locked context is available yet.",
      route: requestedRoute,
      work_intent: workIntent,
      context_stage: contextStage,
      context_path: "",
      next_steps: [
        "Invoke beer:context-intake if context is still sparse.",
        "Then run beer:exploring to lock decisions before planning.",
      ],
    };
  }

  if (!contextPath || contextPath === "history//CONTEXT.md") {
    return {
      ok: false,
      code: "context_path_missing",
      summary: "Planning blocked: locked context does not point to a CONTEXT.md path.",
      route: requestedRoute,
      work_intent: workIntent,
      context_stage: contextStage,
      context_path: contextPath,
      next_steps: [
        "Set context_path in .beer/state.json or provide a feature_slug.",
        "Re-run beer:exploring if the active feature context was never written.",
      ],
    };
  }

  const absoluteContextPath = resolveStatusPath(status.repo_root, contextPath);
  if (!fs.existsSync(absoluteContextPath)) {
    return {
      ok: false,
      code: "context_file_missing",
      summary: `Planning blocked: locked CONTEXT.md is missing at ${contextPath}.`,
      route: requestedRoute,
      work_intent: workIntent,
      context_stage: contextStage,
      context_path: contextPath,
      next_steps: [
        "Restore the missing CONTEXT.md file or re-run beer:exploring.",
        "Do not start planning until the locked context file exists.",
      ],
    };
  }

  if (requestedRoute === "feature" && !status.state_json.approved_gates?.context) {
    return {
      ok: false,
      code: "context_not_approved",
      summary: "Planning blocked: locked context exists, but Gate 1 approval is not recorded yet.",
      route: requestedRoute,
      work_intent: workIntent,
      context_stage: contextStage,
      context_path: contextPath,
      next_steps: [
        "Review the finished CONTEXT.md with the user and record approved_gates.context = true.",
        "Do not start feature planning before the context gate is genuinely approved.",
      ],
    };
  }

  return {
    ok: true,
    code: "ready",
    summary:
      workIntent === "delivery"
        ? `Planning may proceed with locked context at ${contextPath}.`
        : `Planning may proceed with locked context at ${contextPath} while keeping the ${workIntent} intent explicit.`,
    route: requestedRoute,
    work_intent: workIntent,
    context_stage: contextStage,
    context_path: contextPath,
    next_steps: [
      `Read ${contextPath} before discovery and phase planning.`,
      ...(workIntent === "delivery" ? [] : [`Preserve the proven root cause or failing path in the plan because this is ${workIntent} work.`]),
      "Continue into beer:planning.",
    ],
  };
}

export function buildNextReads(status) {
  const reads = [];

  if (fs.existsSync(path.join(status.repo_root, "AGENTS.md"))) {
    reads.push("AGENTS.md");
  }

  if (fs.existsSync(path.join(status.repo_root, "CLAUDE.md"))) {
    reads.push("CLAUDE.md");
  }

  if (
    reads.length === 0 &&
    fs.existsSync(path.join(status.repo_root, "README.md"))
  ) {
    reads.push("README.md");
  }

  if (status.handoff.exists) {
    reads.push(".beer/HANDOFF.json");
  }

  if (status.state_json.exists) {
    reads.push(".beer/state.json");
  }

  if (status.state_markdown.exists) {
    reads.push(".beer/STATE.md");
  }

  const contextPath = deriveContextPath(status);
  if (contextPath && fs.existsSync(resolveStatusPath(status.repo_root, contextPath))) {
    reads.push(contextPath);
  } else if (status.state_json.context_stage === "seeded") {
    reads.push(status.state_json.seed_path || ".beer/seed/");
  }

  if (status.critical_patterns_exists) {
    reads.push("history/learnings/critical-patterns.md");
  }

  return reads;
}

export function buildRecommendedActions(status) {
  if (!status.onboarding.exists) {
    const repoScript = path.join(status.repo_root, "scripts", "commands", "onboard-beer.mjs");
    const installedScript = path.join(status.repo_root, ".beer", "scripts", "commands", "onboard-beer.mjs");
    const onboardingCommand = fs.existsSync(repoScript)
      ? "node scripts/commands/onboard-beer.mjs --apply"
      : fs.existsSync(installedScript)
        ? "node .beer/scripts/commands/onboard-beer.mjs --apply"
        : "Run the Beer onboarding script from the Beer repo.";

    return [
      "Run Beer onboarding before continuing.",
      onboardingCommand,
    ];
  }

  if (status.handoff.exists) {
    return [
      "Surface the saved handoff to the user before resuming.",
      "Read the saved handoff, then reopen the active feature context.",
    ];
  }

  if (status.state_json.context_stage === "seeded") {
    return [
      "Seed context exists but is not locked yet.",
      "Invoke beer:exploring to convert .beer/seed/ into a locked CONTEXT.md before planning.",
    ];
  }

  const activeSkill = status.state_json.active_skill || status.state_markdown.skill || "";
  const phase = status.state_json.phase || status.state_markdown.phase || "";
  const featureSlug = deriveFeatureSlug(status);
  const route = status.state_json.route || "";
  const workIntent = status.state_json.work_intent || "delivery";
  const contextPath = deriveContextPath(status);
  const hasContextFile = contextPath && fs.existsSync(resolveStatusPath(status.repo_root, contextPath));
  const hasWorkflowState =
    (phase && phase !== "idle") ||
    Boolean(status.state_json.next_handoff) ||
    Boolean(featureSlug) ||
    status.state_json.context_stage === "seeded" ||
    status.state_json.context_stage === "locked";

  if (hasWorkflowState) {
    if (hasContextFile) {
      return [
        `Resume by reopening the active context for ${activeSkill || "the current skill"}.`,
        `Read ${contextPath} before planning or execution work.`,
      ];
    }
    if (featureSlug && (route === "small-fix" || workIntent !== "delivery")) {
      const routeLabel = route === "small-fix"
        ? (workIntent === "delivery" ? "direct-fix" : workIntent)
        : workIntent;
      return [
        `Resume by reopening the active context for ${activeSkill || "the current skill"}.`,
        `Create or refresh history/${featureSlug}/CONTEXT.md so the ${routeLabel} work stays explicit before planning or execution.`,
      ];
    }
    return [
      `Resume by reopening the active context for ${activeSkill || "the current skill"}.`,
      "Rebuild the missing task context before planning or execution continues.",
    ];
  }

  return [
    "Use this status snapshot to choose the next Beer skill.",
    "If you move into planning or execution, read critical-patterns.md first when it exists.",
  ];
}

export function renderBeerStatus(status) {
  const feature = deriveFeatureSlug(status) || "(none)";
  const skill = status.state_json.active_skill || status.state_markdown.skill || "(none)";
  const phase = status.state_json.phase || status.state_markdown.phase || "(none)";
  const route = status.state_json.route || "(none)";
  const workIntent = status.state_json.work_intent || "delivery";
  const executionTarget = status.state_json.execution_target || "(none)";
  const validationStatus = status.state_json.validation_status || "(none)";
  const validatorStatus = status.state_json.validator_status || "(none)";
  const verificationStatus = status.state_json.verification_status || "not-run";
  const gitNexusRefreshStatus = status.state_json.gitnexus_refresh_status || "(none)";
  const codeQuantityStatus = status.state_json.code_quantity_status || "(none)";
  const patternStatus = status.state_json.pattern_status || "(none)";
  const reviewQualityStatus = status.state_json.review_quality_status || "(none)";
  const approvedGates = status.state_json.approved_gates || {};
  const risk = status.state_json.risk || "normal";
  const runStyle = status.state_json.run_style || "guided";
  const orchestrationStrategy = status.state_json.orchestration_strategy || "(none)";
  const contextStage = status.state_json.context_stage || "none";
  const contextPath =
    deriveContextPath(status) ||
    (contextStage === "seeded" ? status.state_json.seed_path || ".beer/seed/" : "(none)");
  const epicId = status.state_json.epic_id || status.state_markdown.epic || "(none)";
  const knowledgeBaseRefreshStatus = status.state_json.knowledge_base_refresh_status || "(none)";
  const contractVerified = status.state_json.contract_verified ? "yes" : "no";
  const sliceCount = Number(status.state_json.slice_count || 0);
  const plannedWorkers = Number(status.state_json.planned_workers || 0);
  const closeoutReady = status.state_json.closeout_ready ? "yes" : "no";
  const handoff = status.handoff.exists ? "present" : "absent";
  const onboarding = status.onboarding.exists
    ? `${status.onboarding.status || "installed"}${status.onboarding.plugin_version ? ` (${status.onboarding.plugin_version})` : ""}`
    : "missing";

  return [
    "Beer Status",
    `Repo: ${status.repo_root}`,
    `Onboarding: ${onboarding}`,
    `Feature: ${feature}`,
    `Route: ${route}`,
    `Work intent: ${workIntent}`,
    `Risk: ${risk}`,
    `Run style: ${runStyle}`,
    `Orchestration: ${orchestrationStrategy}`,
    `Skill: ${skill}`,
    `Context: ${contextStage}`,
    `Context path: ${contextPath}`,
    `Phase: ${phase}`,
    `Slices: ${sliceCount}`,
    `Planned workers: ${plannedWorkers}`,
    `Execution target: ${executionTarget}`,
    `Gate approvals: context=${approvedGates.context ? "yes" : "no"}, phase_plan=${approvedGates.phase_plan ? "yes" : "no"}, execution=${approvedGates.execution ? "yes" : "no"}, review=${approvedGates.review ? "yes" : "no"}`,
    `Contract verified: ${contractVerified}`,
    `Validation: ${validationStatus}`,
    `Validator: ${validatorStatus}`,
    `Verification: ${verificationStatus}`,
    `GitNexus refresh: ${gitNexusRefreshStatus}`,
    `Code quantity: ${codeQuantityStatus}`,
    `Pattern: ${patternStatus}`,
    `Review quality: ${reviewQualityStatus}`,
    `Epic: ${epicId}`,
    `Knowledge-base refresh: ${knowledgeBaseRefreshStatus}`,
    `Closeout ready: ${closeoutReady}`,
    `Handoff: ${handoff}`,
    "",
    "Next reads:",
    ...status.next_reads.map((item) => `- ${item}`),
    "",
    "Recommended actions:",
    ...status.recommended_actions.map((item) => `- ${item}`),
  ].join("\n");
}
