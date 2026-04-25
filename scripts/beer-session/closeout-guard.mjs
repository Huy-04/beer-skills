import { readBeerState, readBeerStatus, resolveRepoRoot, writeBeerState } from "../beer-state/core.mjs";

const KNOWLEDGE_BASE_DECISIONS = new Set([
  "not-needed",
  "approved",
  "declined",
  "refreshed",
]);

const GITNEXUS_READY_STATUSES = new Set(["completed", "skipped"]);

function normalizeKnowledgeBaseDecision(value) {
  return KNOWLEDGE_BASE_DECISIONS.has(value) ? value : "";
}

function buildAllow(code, summary, extra = {}) {
  return {
    allow: true,
    code,
    summary,
    ...extra,
  };
}

function buildBlock(code, summary, status, extra = {}) {
  return {
    allow: false,
    code,
    summary,
    next_reads: status.next_reads || [],
    recommended_actions: status.recommended_actions || [],
    ...extra,
  };
}

function isCompoundingContext(state) {
  return state.phase === "compounding" ||
    state.active_skill === "compounding" ||
    state.next_handoff === "beer:compounding" ||
    state.review_route === "feature-final" ||
    state.review_route === "direct-completion" ||
    state.compounding_route === "feature-closeout" ||
    state.compounding_route === "direct-completion" ||
    state.compounding_route === "debug-learning";
}

function requiresReviewCloseoutChecks(state) {
  return state.review_route === "feature-final" ||
    state.review_route === "direct-completion" ||
    state.next_handoff === "beer:compounding";
}

export function assessCloseoutGuard(options = {}) {
  const repoRoot = resolveRepoRoot(options.repoRoot);
  const status = readBeerStatus(repoRoot);

  if (!status.onboarding.exists) {
    return buildBlock(
      "onboarding_missing",
      "Closeout guard cannot run before Beer onboarding exists.",
      status,
      {
        repo_root: repoRoot,
        state: readBeerState(repoRoot),
      },
    );
  }

  if (!status.state_json.exists) {
    return buildBlock(
      "state_missing",
      "Closeout guard cannot run because .beer/state.json is missing.",
      status,
      {
        repo_root: repoRoot,
        state: readBeerState(repoRoot),
      },
    );
  }

  const currentState = readBeerState(repoRoot);
  const knowledgeBaseDecision = normalizeKnowledgeBaseDecision(options.knowledgeBase);
  const nextState = knowledgeBaseDecision
    ? writeBeerState(repoRoot, {
        ...currentState,
        knowledge_base_refresh_status: knowledgeBaseDecision,
        closeout_ready: false,
      })
    : currentState;

  const nextStatus = knowledgeBaseDecision ? readBeerStatus(repoRoot) : status;

  if (!isCompoundingContext(nextState)) {
    return buildAllow(
      "not_in_closeout",
      "Beer is not currently in a compounding closeout path.",
      {
        repo_root: repoRoot,
        state: nextState,
      },
    );
  }

  if (requiresReviewCloseoutChecks(nextState)) {
    if (nextState.review_status !== "pass") {
      return buildBlock(
        "review_not_passed",
        "Closeout cannot proceed before review_status = pass.",
        nextStatus,
        {
          repo_root: repoRoot,
          state: nextState,
        },
      );
    }

    if (!nextState.approved_gates?.review) {
      return buildBlock(
        "review_not_approved",
        "Closeout cannot proceed before Gate 4 approval is recorded.",
        nextStatus,
        {
          repo_root: repoRoot,
          state: nextState,
        },
      );
    }
  }

  if (!GITNEXUS_READY_STATUSES.has(nextState.gitnexus_refresh_status)) {
    return buildBlock(
      "gitnexus_closeout_incomplete",
      "Closeout still needs a completed or skipped GitNexus refresh decision.",
      nextStatus,
      {
        repo_root: repoRoot,
        state: nextState,
      },
    );
  }

  if (!KNOWLEDGE_BASE_DECISIONS.has(nextState.knowledge_base_refresh_status)) {
    return buildBlock(
      "knowledge_base_decision_missing",
      "Closeout still needs an explicit knowledge-base refresh decision.",
      nextStatus,
      {
        repo_root: repoRoot,
        state: nextState,
      },
    );
  }

  const finalizedState = nextState.closeout_ready
    ? nextState
    : writeBeerState(repoRoot, {
        ...nextState,
        closeout_ready: true,
      });

  return buildAllow(
    "closeout_ready",
    "Closeout obligations are recorded. Compounding may finish cleanly.",
    {
      repo_root: repoRoot,
      state: finalizedState,
    },
  );
}
