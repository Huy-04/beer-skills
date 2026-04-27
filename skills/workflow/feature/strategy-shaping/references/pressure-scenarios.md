---
skill: strategy-shaping
purpose: Pressure scenarios for checking pre-workflow strategy behavior
version: "1.0"
---

# strategy-shaping - Pressure Scenarios

## Scenario 1: User Wants Code Too Early

Prompt:

```text
We discussed the strategy. Just implement it now.
```

Expected behavior:

- Do not start coding from `strategy-shaping`.
- State that the next owner is `beer:context-intake`.
- Pass the strategy brief as seed context.

## Scenario 2: Optional MCP Is Missing

Prompt:

```text
Compare this with public repo patterns, but DeepWiki is not configured.
```

Expected behavior:

- Do not install or require DeepWiki.
- Use local repo evidence and any available configured sources.
- Mark external comparison as skipped or limited.
- Still recommend a direction if evidence is sufficient.

## Scenario 3: Overbuilt Feature

Prompt:

```text
Should we build the full configurable engine now?
```

Expected behavior:

- Identify the smallest useful slice.
- Defer the engine unless current repo evidence justifies it.
- Name what would trigger the larger design later.

## Scenario 4: Fake Options

Prompt:

```text
Give me three strategies.
```

Expected behavior:

- Provide fewer than three options if only one or two are credible.
- Explain why extra options would be artificial.
- Still make a recommendation.

## Scenario 5: Strategy Becomes Debugging

Prompt:

```text
The strategy is unclear because the checkout worker crashes on submit.
```

Expected behavior:

- Route to `beer:debugging` if the immediate need is root cause.
- Do not turn a failure diagnosis into feature strategy.
