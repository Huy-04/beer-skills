export const GATES = new Set(["planning", "validating", "swarming", "reviewing", "compounding"]);

export function gateEnabled(state, gate) {
  const autoAccept = state.auto_accept || {};
  if (state.run_style === "go") {
    return true;
  }
  return Boolean(autoAccept.enabled && autoAccept[gate]);
}

export function hasBlockers(state) {
  return Array.isArray(state.blockers) && state.blockers.length > 0;
}

export function block(code, summary, nextSteps = []) {
  return { allow: false, code, summary, next_steps: nextSteps };
}

export function allow(code, summary, nextSteps = []) {
  return { allow: true, code, summary, next_steps: nextSteps };
}

export function assessAutoAcceptGate({ gate, status, preflight }) {
  const state = status.state_json || {};
  const tools = preflight.available_tools || {};

  if (!GATES.has(gate)) {
    return block("unknown_gate", `Unknown gate '${gate}'.`, ["Use planning, validating, swarming, reviewing, or compounding."]);
  }

  if (!gateEnabled(state, gate)) {
    return block("disabled", `Auto-accept is disabled for ${gate}.`, ["Pause and ask for human approval."]);
  }

  if (hasBlockers(state)) {
    return block("blockers_present", "Auto-accept blocked because state has active blockers.", [
      "Resolve or explicitly acknowledge blockers before advancing.",
    ]);
  }

  if (state.risk === "high") {
    return block("high_risk", "Auto-accept blocked for high-risk work.", [
      "Pause for human approval.",
      "Keep the risk note visible in the handoff.",
    ]);
  }

  if (gate === "planning") {
    if (state.route === "feature" && state.context_stage !== "locked") {
      return block("context_not_locked", "Feature planning cannot auto-accept without locked context.", [
        "Route through beer:context-intake and beer:exploring.",
      ]);
    }
    return allow("planning_allowed", "Planning gate may auto-advance.");
  }

  if (gate === "validating") {
    if (!state.approved_gates?.phase_plan) {
      return block("phase_plan_not_approved", "Execution cannot auto-accept before Gate 2 approves the phase plan.", [
        "Record approved_gates.phase_plan = true after planning approval.",
      ]);
    }
    if (state.validation_status !== "pass") {
      return block("validation_not_passed", "Execution cannot auto-accept before validation passes.", [
        "Finish validation and record validation_status = pass.",
      ]);
    }
    if (!["executing", "swarming"].includes(state.execution_target)) {
      return block("execution_target_missing", "Execution target is missing.", [
        "Set execution_target to executing or swarming after validation.",
      ]);
    }
    if (state.execution_target === "swarming" && !tools.bd) {
      return block("bd_missing", "Swarm execution cannot auto-accept without bd (beads).", [
        "Switch to direct execution only if validating approves a bounded direct slice.",
      ]);
    }
    return allow("execution_allowed", "Execution gate may auto-advance.");
  }

  if (gate === "swarming") {
    if (state.execution_target !== "swarming") {
      return block("not_swarm_target", "Swarming cannot auto-accept when execution_target is not swarming.", [
        "Use beer:executing for direct slices.",
      ]);
    }
    if (!tools.bd) {
      return block("bd_missing", "Swarming cannot auto-accept without bd (beads).", [
        "Return to beer:validating to choose a viable execution target.",
      ]);
    }
    if (!state.approved_gates?.execution) {
      return block("approval_missing", "Swarming cannot auto-accept without approved execution state.", [
        "Record approved_gates.execution = true after the validation gate.",
      ]);
    }
    return allow("swarming_allowed", "Swarm launch may auto-advance.");
  }

  if (gate === "reviewing") {
    if (!state.execution_evidence_path) {
      return block("evidence_missing", "Review cannot auto-accept without execution evidence.", [
        "Write execution evidence and store execution_evidence_path in state.",
      ]);
    }
    if (state.tdd_required && state.tdd_status !== "complete") {
      return block("tdd_evidence_missing", "Review cannot auto-accept while required TDD evidence is incomplete.", [
        "Complete RED/GREEN/REFACTOR evidence and store tdd_evidence_path in state.",
        "Use human approval for an explicit non-TDD route if TDD is blocked or waived.",
      ]);
    }
    if (state.tdd_required && !state.tdd_evidence_path) {
      return block("tdd_evidence_path_missing", "Review cannot auto-accept without a TDD evidence path.", [
        "Store the TDD handoff note path in tdd_evidence_path.",
      ]);
    }
    if (!["passed", "limited"].includes(state.verification_status)) {
      return block("verification_not_credible", "Review cannot auto-accept without credible verification.", [
        "Run or record focused verification before review.",
      ]);
    }
    return allow("review_allowed", "Review gate may auto-advance to findings.");
  }

  if (gate === "compounding") {
    if (state.review_status !== "pass") {
      return block("review_not_passed", "Compounding cannot auto-accept before review passes.", [
        "Finish review and resolve blocking findings.",
      ]);
    }
    if (!state.approved_gates?.review) {
      return block("review_not_approved", "Compounding cannot auto-accept before Gate 4 is approved.", [
        "Record approved_gates.review = true after the review gate passes.",
      ]);
    }
    if (Number(state.open_findings_count || 0) > 0) {
      return block("open_findings", "Compounding cannot auto-accept while findings remain open.", [
        "Resolve or explicitly defer non-blocking findings.",
      ]);
    }
    return allow("compounding_allowed", "Compounding may auto-advance.");
  }

  return block("unhandled_gate", `No policy implemented for ${gate}.`);
}
