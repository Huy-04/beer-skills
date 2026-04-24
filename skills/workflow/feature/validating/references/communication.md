---
skill: validating
purpose: Plain-language validation summaries and risk reporting
version: "1.0"
---

# validating - Communication Standards

## Standard Messages

### Feature Route

```text
Validation route: feature.
I am checking whether the current phase is ready for its approved execution path.
```

### Small Direct-Fix Route

```text
Validation route: small direct fix.
This is a compact safety gate before direct execution.
```

### Debug-Escalation Route

```text
Validation route: debug escalation.
I am checking whether the planned repair still matches the proven root cause and is safe to execute.
```

### Approval Ask

```text
Validation complete.
Route: [feature | small direct fix | debug escalation]
Current slice: [name]
Execution target: [swarming | executing]
Risk notes: [summary]
Auto-accept policy: [not used | ALLOW | BLOCK: reason]

Approve execution? (yes / revise / no)
```

## Red Flags

Stop immediately if:

1. feature validation starts from seed-only context
2. compact routes are being failed only because they do not have beads
3. debug escalation no longer mentions the root cause
4. the chosen execution target does not match slice size
5. auto-accept is being used to hide a high-risk pause

## Anti-Patterns

### Anti-Pattern 1: "No beads means not ready"

Wrong:
- fail a compact route because `.beads` does not exist

Correct:
- validate the route at the depth it actually needs

### Anti-Pattern 2: "Every route needs the full 8-dimension pass"

Wrong:
- force small direct fixes through full feature validation or a swarm path

Correct:
- use the full set for feature routes and compact checks for compact routes

### Anti-Pattern 3: "Debug escalation is just feature work now"

Wrong:
- ignore the root cause and validate a broadened redesign

Correct:
- keep the repair bounded and anchored to the debug evidence

### Anti-Pattern 4: "Auto-accept means always proceed"

Wrong:
- continue despite auth, data migration, security, or unresolved high-risk concerns

Correct:
- pause even with auto-accept when the risk still needs a human gate
- use `beer-auto-accept.mjs --gate validating` as the source of truth
