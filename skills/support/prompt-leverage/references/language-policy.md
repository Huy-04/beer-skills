---
skill: prompt-leverage
purpose: Multilingual language policy for prompt normalization and durable Beer docs
version: "1.0"
---

# prompt-leverage - Language Policy

## Core Model

Treat language handling as four separate fields:

- `input_language`
- `working_language`
- `output_language`
- `artifact_language` when a durable doc or generated artifact is being edited

Do not assume they are identical.

## Defaults

| Input | Working prompt | Final prose |
|---|---|---|
| Vietnamese | English | Vietnamese |
| Chinese | English | Chinese |
| English | English | English |
| Mixed | English | Dominant user-facing language |
| Explicit output language | English unless artifact rules require otherwise | Requested language |

## Preserve Exactly

- file names and file paths
- commands, flags, shell fragments, and env vars
- code blocks and inline code
- skill ids such as `beer:planning`
- artifact names such as `CONTEXT.md`, `phase-plan.md`, `D1`, `P1`, and `Gate 2`
- Beer workflow nouns that should stay canonical

Translate prose around preserved terms only.

## Glossary Guidance

Prefer preserved Beer terms with short local-language glosses over inventing localized replacements.

Examples:

- `swarming` (parallel worker orchestration)
- `bead` (work item)
- `prompt-leverage` (contextual prompt builder)

## Prompt Normalization Rules

1. Detect the user's language and any explicit output-language request.
2. Lock preserved artifacts before rewriting prose.
3. Choose working language for downstream execution.
4. Normalize only natural-language prose.
5. Keep final prose aligned with the user's language expectation.

## Durable Artifact Rules

When translating or normalizing docs:

- prose can be translated or mirrored
- executable and addressable text stays exact
- glossary choices stay consistent inside the artifact
- preserved Beer terms can include a short gloss when helpful

## Communication Rules

- Say what language changed and what stayed exact.
- Do not imply that commands, paths, or Beer artifacts were translated when they were preserved.
- Keep one consistent treatment for each Beer term inside one artifact.

## Red Flags

- Translating `beer:planning` into natural prose and then using it as an id
- Rewriting a command or path for readability
- Using multiple localized labels for one Beer term in a single artifact
- Assuming Vietnamese or Chinese input means the working prompt must also be Vietnamese or Chinese
