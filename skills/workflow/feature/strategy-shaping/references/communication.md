---
skill: strategy-shaping
purpose: Communication standards for pre-workflow strategy discussions
version: "1.0"
---

# strategy-shaping - Communication Standards

## Tone

Be decisive and concrete. The user is asking for engineering judgment before
workflow machinery starts.

Prefer:

- "I recommend X because..."
- "This part is overkill for the first slice because..."
- "Defer Y; it becomes useful only after..."
- "This repo already has a pattern for..."

Avoid:

- long neutral comparisons with no recommendation;
- pretending optional MCP evidence was used;
- turning the answer into a full implementation plan;
- saying "we can do everything" when scope should be cut.

## Brief Shape

Use short sections:

```markdown
## Recommended Direction
...

## Why
...

## Scope Boundary
Now:
- ...

Later:
- ...

## Handoff
Next skill: `beer:context-intake`
...
```

## When Evidence Is Thin

Say what is known, what is assumed, and what must be verified next:

```text
Current evidence is enough to choose a direction, but not enough to lock
implementation context. `context-intake` should verify <gap> before exploring
locks `CONTEXT.md`.
```

## When MCP Is Unavailable

Use plain wording:

```text
I did not use external MCP evidence here because no configured source was
needed for this decision. The recommendation is based on local repo evidence.
```

or:

```text
DeepWiki/Context7 would be useful for external comparison, but they are not
configured in this session. I am not blocking the strategy on them.
```

## When The User Is Ready To Build

Do not continue strategy discussion after the direction is chosen:

```text
Direction selected. Next step is `beer:context-intake`; it should verify the
repo context and prepare the handoff into `exploring`.
```
