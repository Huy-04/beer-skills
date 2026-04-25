# Host Runtime Contract

Beer can now prepare orchestration state, resolve worker profiles, and emit
spawn-ready worker payloads. The host runtime still owns the actual subagent
launch and result collection.

Use this contract when the host runtime is responsible for calling
`spawn_agent`, selecting the worker model, waiting for completion, and feeding
results back into Beer state.

## What Beer Owns

Beer owns:

- workflow state in `.beer/state.json`
- repo-local model-role defaults in `.beer/config.json`
- orchestration planning through `beer orchestrate`
- spawn-ready worker payload generation through `beer worker-bootstrap`
- flow guards and closeout guards

Beer does not directly call the outer runtime's `spawn_agent` tool from these
Node scripts.

## Runtime Sequence

1. Read and materialize the orchestration decision:

```bash
beer orchestrate --apply --json
```

2. Read the worker payloads:

```bash
beer worker-bootstrap --json
```

3. For each emitted worker payload, the host runtime should:

- use `worker.model` as the spawned worker model
- use `worker.reasoning_effort` as the spawned worker reasoning level
- use `worker.prompt` as the worker's task prompt
- preserve `worker.codex_name`, `worker.role`, and `worker.task_kind` as the
  worker identity contract

4. Wait for worker completion and collect:

- files touched
- verification run
- blockers
- concise completion note

5. Feed the result back into Beer by updating:

- `active_workers[*].status`
- `active_workers[*].notes`
- `execution-evidence.md` for completed work
- `next_handoff` when the whole slice is done

## Worker Payload Mapping

Beer currently emits worker bootstrap payloads shaped for a host runtime:

| Beer field | Host runtime use |
|---|---|
| `codex_name` | stable worker label |
| `role` | orchestration role (`coding`, `research_synthesis`, etc.) |
| `task_kind` | concrete task shape used for profile selection |
| `model` | spawned worker model |
| `reasoning_effort` | spawned worker reasoning setting |
| `assigned_work_item` | worker-specific scope |
| `context_path` | locked context file to load before work |
| `verification_expectation` | required completion evidence |
| `prompt` | final worker prompt |

## Completion Rules

The host runtime should not mark the slice complete just because workers exited.
Only hand off when:

- all required work items are complete
- execution evidence exists
- no unresolved blocker remains
- Beer still points to the same validated slice

Then:

- hand off to `beer:reviewing` if the feature is done
- hand off to `beer:planning` if another slice or phase remains

## Minimal Host Responsibilities

The host runtime should:

- trust Beer for route, gate, and profile decisions
- avoid mutating route/risk/strategy during worker launch
- stop the swarm when the coordination substrate becomes unsafe
- route back to `planning` or `validating` when the validated slice no longer matches reality

The host runtime should not:

- invent new worker scopes outside the validated slice
- override model profiles without a deliberate repo-local config change
- skip Beer guards because the runtime already "knows" the task
