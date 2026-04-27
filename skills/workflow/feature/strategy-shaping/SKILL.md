---
name: strategy-shaping
description: >
  This skill should be used when the user wants to discuss strategy, compare
  approaches, optimize a feature direction, evaluate tradeoffs, or shape an
  unclear feature before entering implementation workflow.
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  tags:
    - beer/workflow
    - workflow
    - strategy
  inputs: "User goal, uncertainty, constraints, repo evidence, optional external docs, and optional MCP evidence when already available"
  outputs: "Strategy brief with recommended direction, options considered, scope boundary, risks, and handoff seed for context-intake"
  upstream: "using-beer"
  downstream: "context-intake or user decision"
  dependencies: []
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
user-invocable: true
disable-model-invocation: false
---

# strategy-shaping

Shape unclear feature work before Beer starts the implementation workflow.
Use this skill when the user is still discussing direction, method, tradeoffs,
cost, or optimization and the task is not ready to become locked context yet.

## At a Glance

| | |
|---|---|
| **Use when** | The user wants strategy, approach comparison, optimization, or feature-shaping before coding |
| **Needs** | User goal, constraints, current repo evidence, and optional docs/MCP evidence if already available |
| **Produces** | A short strategy brief plus a handoff seed for `beer:context-intake` |
| **Next** | User decision, then `beer:context-intake` when the direction is selected |

## 30-Second Version

1. Confirm that the request is still strategy-shaped, not implementation-ready.
2. Restate the goal, unknowns, constraints, and success shape.
3. Gather only enough evidence to compare credible directions.
4. Use local repo evidence first; use free MCP sources only if already configured and relevant.
5. Compare at most three real options.
6. Recommend one direction and explain why it fits the repo and current constraints.
7. Set scope boundaries: now, later, and explicitly not in scope.
8. End with a handoff seed for `beer:context-intake`; do not skip into planning or code.

## Scope and Ownership

- `strategy-shaping` owns pre-workflow strategy discussion and direction choice.
- `context-intake` owns Beer task context recovery after the direction is chosen.
- `exploring` owns locked decisions and `history/<feature>/CONTEXT.md`.
- `planning` owns implementation decomposition and worker strategy.
- This skill does not approve Beer gates, create delivery beads, or start code edits.

Use this skill for questions like:

- "Which direction is better?"
- "How should we build this feature?"
- "Can this be simpler?"
- "Is this overkill?"
- "What strategy should we use before coding?"
- "Compare approaches before we enter the workflow."

Do not use it when:

- the task is already explicit enough for `beer:context-intake`;
- the user asks to debug a failure, which should route to `beer:debugging`;
- the user asks to scan or refresh generated `Docs/`, which should route to `beer:codebase-knowledge`;
- the user asks to edit Beer skills, which should route to `beer:writing-beer-skills`.

## Evidence Policy

Evidence is useful only when it changes the decision.

Prefer this order:

1. Existing user constraints and conversation.
2. Current repo files, docs, tests, and local patterns.
3. Existing generated `Docs/` when present, as optional hints only.
4. GitNexus or other configured local graph evidence when available.
5. Optional free MCP sources when already available:
   - DeepWiki or GitMCP for public GitHub repo comparison.
   - Context7 for current library/framework docs.
   - Filesystem MCP for allowed local folders.
   - Fetch MCP for a user-provided URL.

If an optional MCP source is missing, skip it. Do not install it, block the
strategy brief, or turn it into a dependency.

## Output Contract

Return a compact brief in prose, not a large planning document:

```markdown
# Strategy Brief: <feature or decision>

## Goal
<what the user is trying to achieve>

## Recommended Direction
<one chosen direction>

## Why This Direction
<repo evidence, constraints, simplicity, cost, and tradeoff reasoning>

## Options Considered
- <option A>: chosen because ...
- <option B>: not chosen because ...
- <option C>: defer because ...

## Scope Boundary
Now:
- ...

Later:
- ...

Not in this task:
- ...

## Evidence Used
- Repo: ...
- External/MCP: used/skipped, with reason

## Handoff To Beer
Next skill: `beer:context-intake`
Suggested route: `feature` or `small-fix`
Suggested work intent: `delivery`, `repair`, or `investigation`
Risk: `normal` or `high`
Seed context:
- ...
```

The recommended direction is not locked context. `context-intake` and
`exploring` must still verify the repo state before implementation planning.

## Hard Rules

- Never start implementation from this skill.
- Never treat a strategy brief as approved `CONTEXT.md`.
- Never mutate `.beer/state.json` or approve gates.
- Never require optional MCPs.
- Never compare fake options just to fill a template.
- Never hide uncertainty; state the gap and route it into the handoff seed.
- Never let optimization expand the scope without naming the deferred work.

## State Contract

- `.beer/state.json` remains unchanged.
- No Beer gate is approved by this skill.
- The handoff seed is advisory input for `context-intake`.
- If the user chooses a direction, route to `beer:context-intake` with the raw request plus the strategy brief.

## References

- [Workflow detail](references/workflow.md)
- [Quick reference](references/quick-ref.md)
- [Communication standards](references/communication.md)
- [Pressure scenarios](references/pressure-scenarios.md)
