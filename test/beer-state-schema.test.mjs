import assert from "node:assert/strict";
import test from "node:test";

import { normalizeBeerState } from "../scripts/beer-state/schema.mjs";

test("normalizeBeerState migrates legacy debug-escalation route into feature repair intent", () => {
  const state = normalizeBeerState({
    route: "debug-escalation",
  });

  assert.equal(state.route, "feature");
  assert.equal(state.work_intent, "repair");
});
