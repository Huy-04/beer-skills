---
skill: strategy-shaping
purpose: Detailed pre-workflow strategy process for shaping unclear feature direction before context intake
version: "1.0"
---

# strategy-shaping - Workflow Details

`strategy-shaping` exists for the stage before implementation workflow. The
user is not yet saying "do this exact task"; they are asking how the work should
be approached, whether the idea is overbuilt, which option fits the repo, or
what strategy should be used before entering Beer gates.

## Activation

Use this skill when the user asks for:

- strategy, method, approach, or direction;
- option comparison before implementation;
- cost, complexity, or overkill review;
- optimization of a feature plan before it becomes a task;
- product or architecture shaping where the next coding step is not yet clear.

Route away when:

- the requested change is already concrete enough for `beer:context-intake`;
- the user asks why something fails, which belongs to `beer:debugging`;
- the user asks for generated project docs, which belongs to `beer:codebase-knowledge`;
- the user asks to edit Beer skills, which belongs to `beer:writing-beer-skills`.

## Workflow

### 1. Frame The Decision

Restate:

- what the user wants to achieve;
- what is still undecided;
- what constraint matters most right now;
- what would make a direction "good enough" to enter the Beer workflow.

Do not ask a large discovery questionnaire. Ask only if one missing fact would
change the recommended direction.

### 2. Gather Minimal Evidence

Read repo evidence before using external sources. Useful evidence includes:

- existing feature boundaries and naming;
- current architecture or module pattern;
- tests and build shape;
- generated `Docs/` only when they already exist;
- GitNexus graph evidence when configured and relevant.

Optional MCP sources are accelerators, not dependencies:

- DeepWiki or GitMCP for public GitHub repo comparison;
- Context7 for current framework or library docs;
- Filesystem MCP for host-approved local folders;
- Fetch MCP for a user-provided URL.

If they are absent, record "skipped: not configured" or simply omit them. Never
install, require, or block on optional MCP tools.

### 3. Build Real Options

Consider at most three options. Each option must be a real implementation
direction or product strategy, not filler.

For each option, judge:

- fit with current repo patterns;
- implementation cost;
- testing and validation cost;
- ability to evolve later;
- risk of overengineering;
- risk of underbuilding.

### 4. Recommend One Direction

Choose one direction by default. Avoid ending with "it depends" unless the
missing fact is truly decisive.

The recommendation should name:

- the chosen direction;
- why it fits the current repo;
- what complexity it avoids;
- what it deliberately postpones;
- what could change the decision later.

### 5. Bound Scope

Separate:

- `Now`: the smallest useful version;
- `Later`: follow-up capability that should not block this task;
- `Not in this task`: work that would make the feature too large or unclear.

This is where overkill gets cut down before it reaches planning.

### 6. Handoff To Beer

End with a handoff seed. It is not locked context and not a plan.

Include:

- next skill: `beer:context-intake`;
- suggested route: `feature` or `small-fix`;
- suggested work intent: `delivery`, `repair`, or `investigation`;
- suggested risk: `normal` or `high`;
- repo files or docs worth reading next;
- unresolved gaps that `context-intake` or `exploring` must verify.

## Output Template

Use this shape unless the user asks for something shorter:

```markdown
# Strategy Brief: <feature or decision>

## Goal
...

## Recommended Direction
...

## Why This Direction
...

## Options Considered
- ...

## Scope Boundary
Now:
- ...

Later:
- ...

Not in this task:
- ...

## Evidence Used
- Repo: ...
- External/MCP: ...

## Handoff To Beer
Next skill: `beer:context-intake`
Suggested route: ...
Suggested work intent: ...
Risk: ...
Seed context:
- ...
```

## Anti-Patterns

- Turning strategy discussion into a full implementation plan.
- Creating delivery beads or worker assignments.
- Treating a public repo example as stronger than current repo evidence.
- Requiring DeepWiki, GitMCP, Context7, Fetch, or Filesystem MCP.
- Comparing three options when there is only one credible option.
- Saying "all approaches are fine" without a recommendation.
- Moving directly from strategy into code.
