import { normalizeBeerState } from "./schema.mjs";

export function renderBeerStateMarkdown(state) {
  const normalized = normalizeBeerState(state);
  const approvedGates = normalized.approved_gates || {};
  const contextPath =
    normalized.context_path
      ? normalized.context_path
      : normalized.context_stage === "seeded"
        ? normalized.seed_path || ".beer/seed/"
        : "(none)";
  const artifacts = [
    normalized.context_path,
    normalized.tdd_evidence_path,
    normalized.execution_evidence_path,
    normalized.learnings_file,
  ].filter(Boolean);

  return [
    "# Beer State",
    "",
    `Current: ${normalized.phase || "idle"}`,
    `Feature: ${normalized.feature_slug || "(none)"}`,
    `Route: ${normalized.route || "(none)"}`,
    `Risk: ${normalized.risk}`,
    `Run style: ${normalized.run_style}`,
    `Orchestration: ${normalized.orchestration_strategy || "(none)"}`,
    `Skill: ${normalized.active_skill || "(none)"}`,
    `Context: ${normalized.context_stage}`,
    `Context path: ${contextPath}`,
    `Current phase: ${normalized.current_phase_name || "(none)"}`,
    `Current slice: ${normalized.current_slice || "(none)"}`,
    `Slices: ${normalized.slice_count || 0}`,
    `Planned workers: ${normalized.planned_workers || 0}`,
    `Gate approvals: context=${approvedGates.context ? "yes" : "no"}, phase_plan=${approvedGates.phase_plan ? "yes" : "no"}, execution=${approvedGates.execution ? "yes" : "no"}, review=${approvedGates.review ? "yes" : "no"}`,
    `Contract verified: ${normalized.contract_verified ? "yes" : "no"}`,
    `Validation: ${normalized.validation_status || "(none)"}`,
    `Validator: ${normalized.validator_status || "(none)"}`,
    `Execution target: ${normalized.execution_target || "(none)"}`,
    `TDD required: ${normalized.tdd_required ? "yes" : "no"}`,
    `TDD status: ${normalized.tdd_status || "not-required"}`,
    `TDD evidence: ${normalized.tdd_evidence_path || "(none)"}`,
    `Execution evidence: ${normalized.execution_evidence_path || "(none)"}`,
    `Verification: ${normalized.verification_status || "not-run"}`,
    `GitNexus refresh: ${normalized.gitnexus_refresh_status || "(none)"}`,
    `Review: ${normalized.review_status || "(none)"}`,
    `Knowledge-base refresh: ${normalized.knowledge_base_refresh_status || "(none)"}`,
    `Closeout ready: ${normalized.closeout_ready ? "yes" : "no"}`,
    `Next handoff: ${normalized.next_handoff || "(none)"}`,
    "",
    "Artifacts:",
    ...(artifacts.length > 0 ? artifacts.map((artifact) => `- ${artifact}`) : ["- (none)"]),
    "",
    `Last updated: ${normalized.last_updated.slice(0, 10)}`,
    "",
  ].join("\n");
}
