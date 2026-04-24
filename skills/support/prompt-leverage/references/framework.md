# Prompt Leverage Framework

Use this reference to build context-aware prompts. The goal is not to make prompts longer; it is to make every instruction load-bearing and grounded in known context.

## Core Model

`Original Request -> Context Packet -> Intent + Unknowns -> Contextual Prompt`

The script produces the context packet. The agent synthesizes the final prompt.

## Context Dimensions

Collect and use these dimensions when available:

1. Original request
2. Relevant repo docs
3. Relevant files or directories
4. Mentioned skills
5. Package scripts or commands
6. Beer state and artifacts
7. Preserved technical identifiers
8. Explicit constraints
9. Unknowns and assumptions

## Prompt Shapes

### Lightweight Context Prompt

Use when the request is clear and low risk.

```text
Context:
- ...

Task:
- ...

Output:
- ...
```

### Standard Execution Prompt

Use for normal coding, analysis, writing, review, or planning.

```text
Context:
- ...

Objective:
- ...

Scope:
- In scope:
- Out of scope:

Execution Guidance:
- ...

Verification:
- ...

Output Contract:
- ...
```

### Deep Context Prompt

Use for ambiguous, cross-file, high-risk, or multi-phase work.

```text
Context:
- Known facts:
- Relevant files/systems:
- Constraints:
- Unknowns:

Objective:
- ...

Decision Points:
- ...

Execution Guidance:
- Discovery:
- Implementation or analysis:
- Verification:

Stop / Ask Criteria:
- ...

Output Contract:
- ...
```

## Ask Policy

Ask at most 3 questions if a missing fact is critical.

Ask when:

- target file/system cannot be resolved
- acceptance criteria are missing for high-risk work
- the prompt could reasonably mean multiple incompatible tasks
- required credentials, environment, or external system access is unknown

Do not ask when:

- a safe assumption is obvious and low risk
- local context resolves the ambiguity
- the user explicitly asked for autonomous execution

## Quality Rubric

A strong contextual prompt:

1. preserves original intent
2. includes only real context or explicit assumptions
3. reduces ambiguity
4. tells the downstream agent how to inspect and verify
5. has clear stop/ask criteria
6. avoids filler that does not affect execution
