import assert from "node:assert/strict";
import test from "node:test";

import { assessAutoAcceptGate } from "../scripts/beer-auto-accept/policy.mjs";

function status(overrides = {}) {
  return {
    state_json: {
      run_style: "go",
      risk: "normal",
      auto_accept: {},
      blockers: [],
      planning_route: "feature",
      context_stage: "locked",
      validation_status: "pass",
      execution_target: "executing",
      approved_gates: {
        context: false,
        phase_plan: true,
        execution: true,
        review: false,
      },
      execution_evidence_path: "history/example/execution-evidence.md",
      verification_status: "passed",
      review_status: "pass",
      open_findings_count: 0,
      ...overrides,
    },
  };
}

function preflight(overrides = {}) {
  return {
    available_tools: {
      bd: true,
      ...overrides,
    },
  };
}

test("blocks unknown gates", () => {
  const result = assessAutoAcceptGate({
    gate: "unknown",
    status: status(),
    preflight: preflight(),
  });

  assert.equal(result.allow, false);
  assert.equal(result.code, "unknown_gate");
});

test("blocks when auto-accept is disabled and run_style is guided", () => {
  const result = assessAutoAcceptGate({
    gate: "validating",
    status: status({ run_style: "guided" }),
    preflight: preflight(),
  });

  assert.equal(result.allow, false);
  assert.equal(result.code, "disabled");
});

test("blocks high-risk work even in go run style", () => {
  const result = assessAutoAcceptGate({
    gate: "validating",
    status: status({ risk: "high" }),
    preflight: preflight(),
  });

  assert.equal(result.allow, false);
  assert.equal(result.code, "high_risk");
});

test("allows validation gate for passed direct execution target", () => {
  const result = assessAutoAcceptGate({
    gate: "validating",
    status: status({ validation_status: "pass", execution_target: "executing" }),
    preflight: preflight({ agent_mail: false }),
  });

  assert.equal(result.allow, true);
  assert.equal(result.code, "execution_allowed");
});

test("blocks validation gate until phase-plan approval is recorded", () => {
  const result = assessAutoAcceptGate({
    gate: "validating",
    status: status({
      validation_status: "pass",
      execution_target: "executing",
      approved_gates: {
        context: true,
        phase_plan: false,
        execution: false,
        review: false,
      },
    }),
    preflight: preflight(),
  });

  assert.equal(result.allow, false);
  assert.equal(result.code, "phase_plan_not_approved");
});

test("blocks validation gate before validation passes", () => {
  const result = assessAutoAcceptGate({
    gate: "validating",
    status: status({ validation_status: "fail", execution_target: "executing" }),
    preflight: preflight(),
  });

  assert.equal(result.allow, false);
  assert.equal(result.code, "validation_not_passed");
});

test("blocks swarm launch without bd", () => {
  const result = assessAutoAcceptGate({
    gate: "swarming",
    status: status({ execution_target: "swarming" }),
    preflight: preflight({ bd: false }),
  });

  assert.equal(result.allow, false);
  assert.equal(result.code, "bd_missing");
});

test("blocks swarming gate until execution approval is recorded", () => {
  const result = assessAutoAcceptGate({
    gate: "swarming",
    status: status({
      execution_target: "swarming",
      approved_gates: {
        context: false,
        phase_plan: true,
        execution: false,
        review: false,
      },
    }),
    preflight: preflight(),
  });

  assert.equal(result.allow, false);
  assert.equal(result.code, "approval_missing");
});

test("allows review gate only with evidence and credible verification", () => {
  const result = assessAutoAcceptGate({
    gate: "reviewing",
    status: status({
      execution_evidence_path: "history/example/execution-evidence.md",
      verification_status: "passed",
    }),
    preflight: preflight(),
  });

  assert.equal(result.allow, true);
  assert.equal(result.code, "review_allowed");
});

test("blocks review gate when required TDD evidence is incomplete", () => {
  const result = assessAutoAcceptGate({
    gate: "reviewing",
    status: status({
      tdd_required: true,
      tdd_status: "required",
      tdd_evidence_path: "",
      execution_evidence_path: "history/example/execution-evidence.md",
      verification_status: "passed",
    }),
    preflight: preflight(),
  });

  assert.equal(result.allow, false);
  assert.equal(result.code, "tdd_evidence_missing");
});

test("allows review gate when required TDD evidence is complete", () => {
  const result = assessAutoAcceptGate({
    gate: "reviewing",
    status: status({
      tdd_required: true,
      tdd_status: "complete",
      tdd_evidence_path: "history/example/tdd-evidence.md",
      execution_evidence_path: "history/example/execution-evidence.md",
      verification_status: "passed",
    }),
    preflight: preflight(),
  });

  assert.equal(result.allow, true);
  assert.equal(result.code, "review_allowed");
});

test("blocks compounding when findings remain open", () => {
  const result = assessAutoAcceptGate({
    gate: "compounding",
    status: status({
      review_status: "pass",
      approved_gates: {
        context: false,
        phase_plan: true,
        execution: true,
        review: true,
      },
      open_findings_count: 1,
    }),
    preflight: preflight(),
  });

  assert.equal(result.allow, false);
  assert.equal(result.code, "open_findings");
});

test("blocks compounding until review approval is recorded", () => {
  const result = assessAutoAcceptGate({
    gate: "compounding",
    status: status({
      review_status: "pass",
      approved_gates: {
        context: false,
        phase_plan: true,
        execution: true,
        review: false,
      },
      open_findings_count: 0,
    }),
    preflight: preflight(),
  });

  assert.equal(result.allow, false);
  assert.equal(result.code, "review_not_approved");
});
