---
name: prompt-leverage
description: >
  This skill should be used when the user asks to upgrade, normalize, structure,
  improve, or leverage a prompt, especially when the prompt needs repository,
  skill, file, Beer workflow, or session context to be understood correctly.
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "2.0.0"
  ecosystem: beer
  tags:
    - beer/support
    - prompt
    - context
  dependencies: []
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
user-invocable: true
disable-model-invocation: false
---

# Prompt Leverage

Build context-aware execution prompts. Do not upgrade by keyword classification. First preserve the raw request, gather relevant local context, identify unknowns, then synthesize a prompt that makes the downstream task easier to execute correctly.

---

## At a Glance

| | |
|---|---|
| **Use when** | A raw prompt needs structure, repo context, or Beer-specific normalization |
| **Needs** | The original request, the invoking owner, and any local files, skills, or Beer artifacts it references |
| **Produces** | A context-aware execution prompt, a context packet, preserved identifiers, and explicit assumptions |
| **Next** | Hand the upgraded prompt to the downstream Beer skill or coding agent |

## 30-Second Version

1. Preserve the raw request exactly.
2. Gather only the local context the request actually points to.
3. Extract constraints, unknowns, and response-language intent.
4. Synthesize a proportional execution prompt.
5. Ask only when missing information blocks safe execution.
6. Return the raw request plus contextual prompt to the invoking owner.

---

## When to Invoke

| Scenario | Action |
|---|---|
| User asks to improve, upgrade, or structure a prompt | Build a contextual prompt |
| Request references a repo, file, skill, command, or Beer artifact | Gather matching local context first |
| Request is vague but likely actionable from project context | Build context packet, then synthesize |
| Critical context is missing | Ask at most 3 targeted questions |
| User uses `/raw` | Return the request unchanged |

---

## Contextual Builder Flow

1. **Preserve** the original request exactly, including code blocks, paths, commands, skill IDs, and Beer artifacts.
2. **Harvest context** from repo docs (`AGENTS.md`, `README.md`, package scripts, `.beer` state), mentioned files, and mentioned skills.
3. **Extract signals**: preserved identifiers, resolved local targets, relevant repo facts, explicit constraints, and unknowns.
4. **Synthesize semantically**: infer intent from the whole context, not from keyword categories.
5. **Ask or assume**: ask up to 3 questions only when missing information blocks safe execution; otherwise state assumptions.
6. **Hand off** a prompt with context, objective, scope, execution guidance, verification, output contract, and stop/ask criteria.
7. **Return** the packet to the invoking owner instead of silently taking over routing.

---

## Capability First

- Use as much relevant local context as needed to make the downstream task executable.
- Preserve nuance from mixed-language, partial, or informal user requests instead of compressing them into generic task labels.
- Produce a stronger execution prompt, not just a cleaner sentence.
- Surface unresolved ambiguity clearly so the workflow skill can route or ask with confidence.

---

## Raw Request Preservation Contract

- Keep the raw user request visible in every downstream handoff.
- Route with the raw request and contextual prompt together.
- The workflow router uses raw request plus contextual prompt; the upgraded prompt should add power without replacing original intent.
- If synthesis changes emphasis, state the assumption explicitly instead of presenting it as fact.

---

## Ownership Boundary

- `prompt-leverage` owns prompt normalization, context packet construction, Beer language-policy application during prompt synthesis, and ambiguity surfacing.
- `using-beer` or the calling workflow skill owns routing, state mutation, and final execution decisions.
- This skill may return a stronger execution prompt and structured context, but it must keep the raw request available for the router.
- Record the invoking owner and intended `return_to` target when prompt upgrade is part of a larger Beer workflow.

---

## Escape Hatch

| Command | Effect |
|---|---|
| `/raw [request]` | Skip upgrade entirely |
| `/light [request]` | Force light depth |
| `/standard [request]` | Force standard depth |
| `/deep [request]` | Force deep depth |

Depth changes how much context and verification to include. It does not change the user's intent.

---

## Script

Use the Node context collector when local context matters:

```bash
node skills/support/prompt-leverage/scripts/augment-prompt.mjs "your prompt"
node skills/support/prompt-leverage/scripts/augment-prompt.mjs --prompt-only "your prompt"
node skills/support/prompt-leverage/scripts/augment-prompt.mjs --format json "your prompt"
node skills/support/prompt-leverage/scripts/augment-prompt.mjs --repo-root /path/to/repo "your prompt"
```

The script creates a context packet. It does not decide the final prompt by keyword. Use the packet as grounding for synthesis.
In PowerShell, wrap prompts that contain backticks in single quotes so preserved ids such as `beer:planning` survive shell parsing.

---

## Final Prompt Shape

```text
Context:
- Known repo/session facts
- Relevant files, skills, commands, or Beer artifacts
- Constraints and preserved identifiers

Objective:
- What the downstream agent should accomplish

Scope:
- In scope
- Out of scope

Execution Guidance:
- How to inspect, reason, and proceed

Verification:
- Required checks before completion

Output Contract:
- Final answer structure, tone, and language

Stop / Ask Criteria:
- When to stop and ask instead of guessing
```

---

## Identity Rules

- Never change the user's underlying intent.
- Never translate file names, file paths, commands, env vars, code blocks, skill IDs, or Beer artifact names.
- Never infer missing facts as if they were known.
- Never force English output when the user clearly expects Vietnamese, Chinese, or another requested language.
- Never force localized labels onto Beer nouns that should stay stable.
- Keep the prompt proportional to actual context and risk.
- Log upgrades transparently.

## Language Policy

- Record `input_language`, `working_language`, and `output_language` separately when multilingual handling matters.
- Prefer English for working instructions unless the downstream artifact explicitly needs another language.
- Mirror the user's language for final prose unless they asked for a different output language.
- Preserve Beer nouns, skill ids, artifact names, commands, paths, and code exactly.
- Add short local-language glosses only when they improve comprehension without renaming canonical Beer terms.

---

## Output Contract

An upgraded prompt must include:

- original intent
- relevant local context that was actually found
- unresolved unknowns or assumptions
- preserved technical identifiers exactly as written
- explicit response-language intent when relevant
- verification and stop/ask criteria

---

## Integration

- `using-beer` should route from the raw request and contextual prompt together when an upgrade is applied.
- `context-intake` runs after normalization so discovery works from a cleaner request.
- Multilingual normalization uses this skill's language-policy reference instead of a separate Beer skill.

---

## Key References

- `references/framework.md` - Contextual builder model and prompt shapes
- `references/communication.md` - Transparent upgrade-report style
- `references/language-policy.md` - multilingual defaults, preservation rules, and glossary guidance
- `references/quick-ref.md` - Escape commands, script usage, examples
- `references/workflow.md` - Step-by-step invocation workflow
- `references/pressure-scenarios.md` - Edge cases for prompt upgrade authority and preservation

---

## Handoff

> Contextual prompt built. Return to the invoking owner with both the raw request and the contextual prompt.
