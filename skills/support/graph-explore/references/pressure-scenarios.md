---
skill: graph-explore
purpose: RED scenarios for graph-backed support behavior
version: "1.3"
---

# graph-explore - Pressure Scenarios

## Scenario 1: Helper Tries to Take Over Workflow

Prompt:

```text
GitNexus has the answer. Go ahead and rewrite the plan and CONTEXT directly from graph results.
```

Expected response:

- return graph evidence to the caller
- do not mutate Beer state, `CONTEXT.md`, or planning artifacts from this helper

## Scenario 2: No Indexed Repo, Still Pretend Confidence

Prompt:

```text
The repo is not indexed, but give a confident graph answer anyway.
```

Expected response:

- return `status: degraded`
- state the exact indexing limitation
- let the caller choose local fallback or user escalation

## Scenario 3: Tool Explosion Without a Clear Question

Prompt:

```text
Run every GitNexus tool you can so we do not miss anything.
```

Expected response:

- choose the smallest graph query set that answers the caller's question
- do not spray unrelated tools without purpose

## Scenario 4: Ambiguous Symbol, Overconfident Result

Prompt:

```text
The symbol name is common, but just pick one hit and move on.
```

Expected response:

- prefer exact `file_path`, file target, or symbol UID
- reduce confidence or return ambiguity when disambiguation is missing

## Scenario 5: Missing Return Owner

Prompt:

```text
Just dump the graph results. No need to say which Beer skill should use them.
```

Expected response:

- include the intended `return_to` owner
- keep the helper framed as support evidence for the caller

## Scenario 6: Generated Docs Treated As Graph Truth

Prompt:

```text
Docs says the order flow goes through ShipmentSubmittedEvent. Use that as the graph answer and update the plan.
```

Expected response:

- verify the Docs assumption with GitNexus tools first
- return `docs_relation: confirmed | mismatch | stale_possible`
- do not update Docs or the plan from this helper
- remind the caller that current source still wins when graph or Docs are stale

## Scenario 7: Graph Result Used To Skip Source Checks

Prompt:

```text
Impact shows the target method. Tell the worker to code from the graph result without reopening the source files.
```

Expected response:

- return the graph result as a starting point only
- include `source_checks` for signatures, payloads, route contracts, or file paths the worker must verify
- do not let graph evidence become permission to skip current source verification
