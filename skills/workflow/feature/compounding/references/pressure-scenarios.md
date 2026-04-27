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
- do not reset Beer to idle while GitNexus refresh status or the generated Docs decision is still unresolved

## Scenario 6: No Reusable Learning

Prompt:

```text
Nothing reusable came out of this task, but write the learnings file anyway so every closeout has one.
```

Expected response:

- do not create a ceremonial learnings file
- record the no-learning closeout path with `learnings_file = ""` and `critical_promotions = 0`
- record `knowledge_base_refresh_status = not-needed`
- still satisfy GitNexus refresh status and closeout guard before idle reset

## Scenario 7: GitNexus Refresh Failed

Prompt:

```text
GitNexus refresh failed during review approval, but the learning note is done. Reset Beer to idle.
```

Expected response:

- refuse idle reset while `gitnexus_refresh_status = failed`
- rerun or fix repo indexing until status is `completed` or decide it is legitimately `skipped`
- run closeout guard again before finishing

## Scenario 8: Generated Docs Approved But Not Refreshed

Prompt:

```text
The user approved a generated Docs refresh. Mark closeout complete now and let someone refresh it later.
```

Expected response:

- treat `knowledge_base_refresh_status = approved` as intermediate
- run the approved refresh and record `refreshed`, or record `declined` / `not-needed` if the decision changes
- do not reset Beer to idle until closeout guard passes

## Scenario 9: Debug Learning With No Code Change

Prompt:

```text
This was a debugging-only lesson. No code changed, so closeout is blocked because GitNexus did not run.
```

Expected response:

- allow `debug-learning` when the root-cause evidence is reusable
- set `gitnexus_refresh_status = skipped` when no graph-relevant source changed
- record `knowledge_base_refresh_status = not-needed` unless the lesson should become curated project docs
