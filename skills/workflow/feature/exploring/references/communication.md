---
skill: exploring
purpose: Communication standards and anti-rationalization rules
version: "1.0"
---

# exploring - Communication Standards

## Default Tone

- Practical first
- One question at a time
- Concrete tradeoffs over abstractions
- Plain language before terminology

## Standard Messages

### Small-Fix Exemption

```text
This looks like a small, local, low-ambiguity fix.
Skipping locked-context capture in `exploring`.

Next step: route to `beer:planning` with `route = small-fix` and `orchestration_strategy = single-worker`.
```

Here `single-worker` is the exemption constraint. Do not use this message if the quick scout already suggests `multi-worker` planning or explicit dependency management.

### Seeded Context Input

```text
Seed context was found in `.beer/seed/`.
I will use it only as inferred input for questions, not as locked decisions.
```

### Decision Locking

```text
Locking decision D{N}: [concrete summary]. Confirmed?
```

### Delegated Area

```text
Delegated area: [area].
I can choose within these constraints: [constraints].
```

### Handoff

```text
Decisions captured. CONTEXT.md written to `history/<feature>/CONTEXT.md`.
CONTEXT.md is now the single source of truth for downstream planning.
Invoke `beer:planning`.
```

## Red Flags

Stop immediately if:

1. You asked two questions in one message.
2. You answered your own question without waiting for the user.
3. You turned seed statements into locked decisions without confirmation.
4. You treated a delegated area as if the user had already chosen the final answer.
5. You drifted into planning, library selection, or execution detail.
6. You kept exploring when the task really qualified for the small-fix exemption.

## Anti-Patterns

### Anti-Pattern 1: "This is too small to ask questions"

Wrong:
- Skip exploring even though the change is feature-shaped.

Correct:
- If product or behavior decisions still matter, run exploring.
- If it is truly a tiny local fix, exit exploring through the small-fix exemption.

### Anti-Pattern 2: "Seed already tells us what to do"

Wrong:
- Copy seeded statements into D1, D2, D3.

Correct:
- Treat seed as inferred input only.
- Lock decisions only after user confirmation.

### Anti-Pattern 3: "Delegated means already decided"

Wrong:
- Turn "you decide" into a user-confirmed locked decision without surfacing the actual choice.

Correct:
- Record the delegated area and constraints under `Agent Discretion`.
- Only create a decision ID when the user confirms the final direction.

### Anti-Pattern 4: Batched questions

Wrong:
- Ask multiple gray-area questions in the same message.

Correct:
- Ask one question, wait, then continue.

### Anti-Pattern 5: "Let's also plan while we're here"

Wrong:
- Start decomposing work, suggesting libraries, or creating delivery structure.

Correct:
- Stop at locked context and hand off to `beer:planning`.

## Self-Review Checklist

- [ ] Small-fix exemption checked first
- [ ] All locked decisions are user-confirmed
- [ ] Delegated areas are separated from locked decisions
- [ ] No seeded inference was promoted without confirmation
- [ ] No placeholders remain in `CONTEXT.md`
- [ ] `.beer/state.json` updated before regenerating `.beer/STATE.md`
