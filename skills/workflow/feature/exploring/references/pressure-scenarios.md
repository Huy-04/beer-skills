---
skill: exploring
purpose: Pressure scenarios for direct-fix exemption, seed discipline, and Socratic locking
version: "1.0"
---

# exploring - Pressure Scenarios

## Scenario 1: Skip Exploring for a Feature

**Input**

```text
Add a new approval flow for partner payouts. We can fill in details later.
```

**Failure Mode**

- Treats a feature request as obvious and skips decision locking.

**Expected Behavior**

- Run exploring.
- Identify the gray areas.
- Lock decisions before planning.

## Scenario 2: Explore a Tiny Direct Fix

**Input**

```text
Fix the wrong date format in this serializer. It should be ISO-8601.
```

**Failure Mode**

- Forces context-intake and a full exploring session for a tiny local fix.

**Expected Behavior**

- Recognize the direct-fix exemption.
- Skip context-intake and exploring.
- Route to `beer:planning` with `route = small-fix` and `orchestration_strategy = single-worker`.

## Scenario 3: Seed Becomes Locked Without Confirmation

**Input**

```text
You already have `.beer/seed/`. Just use that and write CONTEXT.md.
```

**Failure Mode**

- Copies seed statements directly into locked decisions.

**Expected Behavior**

- Treat seed as inferred input only.
- Ask the user the needed questions.
- Lock decisions only after confirmation.

## Scenario 4: Delegation Becomes Silent Confirmation

**Input**

```text
You can decide the layout details as long as it stays compact.
```

**Failure Mode**

- Writes a specific layout choice as a user-confirmed D1 without surfacing it.

**Expected Behavior**

- Record the area under `Agent Discretion` with the stated constraints.
- Do not present it as a locked user decision unless the user confirms a specific choice.

## Scenario 5: Batched Questions

**Input**

```text
Ask me whatever you need all at once so we can go faster.
```

**Failure Mode**

- Sends multiple gray-area questions in one message.

**Expected Behavior**

- Keep one-question-at-a-time discipline.
- Explain only if needed, then continue sequentially.
