---
skill: prompt-leverage
purpose: Step-by-step workflow for contextual prompt building
version: "2.0"
---

# Prompt Leverage - Workflow

---

## Overview

**Role:** Contextual prompt builder  
**Job:** Turn raw requests into context-grounded execution prompts for a calling Beer owner  
**When:** A prompt needs repo, file, skill, workflow, or language context to be understood correctly

This helper builds a prompt packet and returns it. It does not take over Beer
route ownership or state mutation.

---

## Step 1: Preserve Raw Request

Keep the original request intact. Preserve:

- code blocks
- file paths
- commands
- env vars and flags
- skill IDs
- Beer artifacts such as `CONTEXT.md`, `phase-plan.md`, `beer:planning`

Also record:

- `invoking_owner`
- intended `return_to`

---

## Step 2: Collect Context

Run the context collector when local context matters:

```bash
node skills/support/prompt-leverage/scripts/augment-prompt.mjs --format json "your prompt here"
```

The script gathers:

- repo instructions from `AGENTS.md`, `CLAUDE.md`, `README.md`
- package scripts and dependency names
- `.beer` state when present
- mentioned files and directories
- mentioned skills under `skills/*/*/SKILL.md`
- preserved identifiers and unknowns

Use `--repo-root <path>` when building a prompt for another repository.
In PowerShell, wrap prompts containing backticks in single quotes so preserved ids survive shell parsing.

---

## Step 3: Interpret Context Semantically

Do not classify by keyword. Read the original request and context packet together.

Extract:

- what the user is really trying to achieve
- target files, systems, or skills
- constraints already known from repo docs
- work already implied by Beer state
- unknowns that block safe execution
- output language and format expectations
- language-policy defaults from `references/language-policy.md` when multilingual handling matters

---

## Step 4: Ask or Assume

Ask at most 3 targeted questions only when missing information blocks a safe prompt.

If missing information is not blocking:

- state assumptions explicitly
- keep the prompt actionable
- avoid fabricating facts

---

## Step 5: Build Final Prompt

Return a contextual execution prompt with:

```text
Original Request:
- Raw user wording preserved exactly

Context:
- Known facts from the repo/session
- Relevant local files or skills
- Preserved identifiers

Objective:
- Desired outcome

Scope:
- In scope
- Out of scope

Execution Guidance:
- How to inspect, reason, and proceed

Verification:
- Required checks

Output Contract:
- Format, tone, detail level, language

Stop / Ask Criteria:
- When to stop and ask instead of guessing

Routing Safety:
- Downstream routing must inspect Original Request and Context together
- Do not route solely from the rewritten prompt if it narrows the user's intent
```

---

## Step 6: Transparent Log

Briefly report what changed:

```text
[UPGRADE] Contextual prompt built. Used AGENTS.md, package.json, and mentioned skill files. Preserved commands, paths, and Beer artifacts.
```

If `/raw` was used, say no upgrade was applied.

## Return Contract

Return:

- raw request
- contextual prompt
- context packet
- unresolved unknowns
- `return_to`

The caller decides whether to route, ask, or execute next.

---

## Verification Checklist

- [ ] Intent preserved
- [ ] Raw request is visible in the downstream handoff
- [ ] Context came from real files or was marked as assumption
- [ ] Technical identifiers preserved exactly
- [ ] Beer glossary handled consistently
- [ ] Final response language aligns with user expectation
- [ ] Critical unknowns are asked, not guessed
- [ ] Upgrade log emitted

---

## Red Flags

| Issue | Action |
|---|---|
| Prompt output is just a generic wrapper | Re-read context packet and add repo-specific facts |
| Script invents semantic task category | Remove it; intent belongs to synthesis |
| Translating `beer:planning`, `CONTEXT.md`, or commands | Revert and preserve exactly |
| Missing critical info but prompt proceeds anyway | Ask up to 3 targeted questions |
| Context packet has unresolved file mentions | Surface them as unknowns |

---

## Integration with Flow

```
using-beer
    |
    |-- Need prompt upgrade? --> prompt-leverage
    |                           -> preserve raw request
    |                           -> collect context packet
    |                           -> synthesize contextual prompt
    |                           -> route downstream with raw + contextual prompt
    |
    `-- /raw or already clear --> route directly
```
