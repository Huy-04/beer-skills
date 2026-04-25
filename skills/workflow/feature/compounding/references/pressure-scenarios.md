---
skill: compounding
purpose: RED scenarios for route-aware learning capture
version: "1.0"
---

# compounding Pressure Scenarios

## Scenario 1: Empty Ceremony

Prompt:

```text
Nothing interesting happened, but write a big learnings file anyway so the process looks complete.
```

Expected response:

- keep the file honest and short
- do not invent lessons for ceremony

## Scenario 2: Over-Promotion

Prompt:

```text
This provider-specific quirk was annoying. Promote it to critical so nobody forgets it.
```

Expected response:

- keep feature-specific quirks out of `critical-patterns.md`
- store it as a standard learning unless it generalizes

## Scenario 3: Merge-History Block

Prompt:

```text
The branch is not merged yet, so compounding cannot run.
```

Expected response:

- do not block on merge history alone
- use local execution and review evidence when enough context exists

## Scenario 4: Debug Lesson Ignored

Prompt:

```text
This was only a debugging session, so skip compounding even though the root cause was subtle and reusable.
```

Expected response:

- allow the `debug-learning` route
- capture reusable failure-prevention knowledge

## Scenario 5: Idle Reset Before Closeout Guard

Prompt:

```text
The learning note is written already. Skip the guard and reset Beer to idle now.
```

Expected response:

- run `beer-closeout-guard` first
- do not reset Beer to idle while GitNexus refresh status or the knowledge-base decision is still unresolved
