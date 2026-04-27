---
name: xia
description: >
  This skill should be used when the user asks to "analyze a skills repo", "compare skills",
  "scout a repo for reusable skills", or "recommend which skills Beer should add, update, adapt, ignore, or prioritize next".
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  tags:
    - beer/meta
    - beer/research
  dependencies:
    - id: deepwiki
      kind: mcp_server
      server_names: [deepwiki]
      config_sources: [global_codex_config, plugin_mcp_manifest]
      missing_effect: degraded
      reason: Xia can use DeepWiki as best-effort support when understanding unfamiliar upstream skill repositories.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
user-invocable: true
disable-model-invocation: false
---

# xia

Analyze a repository that contains skills, compare it against the current Beer skill set, and recommend which source-repo skills Beer should adopt, update, adapt, ignore, and prioritize.

---

## At a Glance

| | |
|---|---|
| **Use when** | User wants a skill repo analyzed before deciding what to add or update in Beer |
| **Needs** | Access to the target repo and the current Beer skill list |
| **Produces** | Skill curation brief with labeled evidence and decision cards for each serious source skill |
| **Next** | `beer:writing-beer-skills` for selected additions or updates, or user handoff |

---

## 30-Second Version

1. **Check waiver**: Skip only if the user explicitly says not to analyze first.
2. **Map the target repo**: Read repo contracts and identify how skills are organized.
3. **Inventory candidate skills**: Find the skills, their triggers, outputs, and dependencies.
4. **Compare against Beer**: Match source-repo candidates to existing Beer skills, overlaps, and gaps.
5. **Validate externally when needed**: Use free/best-effort sources such as `deepwiki`, direct official docs, or current search only when a candidate skill depends on unfamiliar external behavior.
6. **Return brief**: Label every claim as `Local`, `Upstream`, `Docs`, or `Inference`.
7. **Recommend**: Say which source-repo skills Beer should add, update, adapt, or ignore, and which ones should happen now vs later.

---

## Core Workflow

### Capability First

- Scout the target skills repo deeply enough to make useful adoption decisions, not just an inventory.
- Use local repo evidence, target repo artifacts, and free/best-effort external docs when needed to understand real skill behavior.
- Produce a sharp curation brief or requested research artifact that lets `beer:writing-beer-skills` act decisively.

### Ownership Boundary

- `xia` may write or update a requested research brief artifact.
- Selected skill changes belong to `beer:writing-beer-skills`; route there after the brief instead of implementing them inside `xia`.

### Step 1: Check Waiver

- Proceed without analysis only if the user explicitly says to skip the repo analysis.
- Note the waiver in the brief if analysis is skipped or shortened.
- Keep implementation separate from curation unless the user explicitly switches to `beer:writing-beer-skills`.

### Step 2: Map the Target Skills Repo

- Read `AGENTS.md`, `README.md`, skill catalogs, manifests, and repo-local docs.
- Classify from real artifacts: skill directories, catalogs, manifests, scripts, and package metadata.
- Capture a repo ledger: skill layout, categories, naming style, helper tooling, and validation commands.

### Step 3: Inventory Candidate Skills

- Identify each skill or candidate skill package in the target repo.
- Capture for each candidate:
  - purpose and trigger conditions
  - output or deliverable
  - dependencies or tool expectations
  - whether it looks reusable, overlapping, or repo-specific
- Do not claim a skill is novel until the current Beer skill list has been checked.

### Step 4: Compare Against Current Beer Skills

- Compare the target repo inventory to the current Beer skill set and Beer skill list.
- For each serious candidate, name the closest Beer skill explicitly or say `none`.
- Answer:
  - what already exists in Beer
  - what overlaps strongly with an existing Beer skill
  - what would justify updating an existing Beer skill
  - what appears missing and worth adding
  - what should be done now, next, later, or not at all
- Treat Beer as the current baseline and call out exact match vs partial overlap vs gap.

### Step 5: Validate Externally Only When Needed

- Use `deepwiki` as best-effort support when the target repo or candidate skill depends on an unfamiliar upstream pattern.
- Use direct official docs or current search/browser capability when a candidate skill relies on official tooling or framework behavior that should be checked.
- Do not require paid MCP services for `xia`; local repo evidence must remain enough for a useful baseline brief.
- Do not turn this step into generic web research. External research is only for clarifying candidate-skill behavior or dependencies.

### Step 6: Return the Skill Curation Brief

Use `references/research-brief-template.md`. Required sections:

- bottom line
- target repo snapshot
- Beer baseline summary
- candidate skill inventory
- overlap and gap analysis
- optional upstream or docs findings
- decision cards
- priority ordering
- expected Beer effect
- risks / unknowns
- confidence level
- next step

Label every non-trivial claim:

- `Local` - this Beer repository
- `Upstream` - the target external skills repository or public GitHub repositories
- `Docs` - official documentation
- `Inference` - conclusions from evidence

The brief should read like a curation decision for Beer, not a generic research memo. Use decision cards, not a table, so each candidate has enough reasoning space:

- source-repo candidate
- closest Beer skill
- recommendation class
- priority band
- Beer effect
- evidence
- why that class won and why the next-best alternative lost

### Step 7: Recommend

Choose and justify one of these actions for each serious candidate from the source repo:

1. Adopt as a new Beer skill.
2. Update an existing Beer skill to absorb the candidate.
3. Adapt and merge parts of the candidate into Beer.
4. Ignore because Beer already covers it or it is too repo-specific.

Also assign one priority band:

1. `Now` - highest-value next move for Beer
2. `Next` - strong follow-up after current top priority
3. `Later` - useful, but not worth acting on immediately
4. `Ignore` - no current action needed

- Do not leave any serious candidate without a recommendation class.
- Do not leave any serious candidate without a priority band.
- If a candidate has no credible Beer match, write `Closest Beer skill: none` instead of leaving the comparison implicit.
- After the brief, route selected skill changes to `beer:writing-beer-skills`.

Ask a follow-up question only when two materially different actions are both credible and the evidence does not clearly separate them.

---

## Key References

- [Workflow detail](references/workflow.md) - Full 7-step repo-analysis sequence
- [Quick reference](references/quick-ref.md) - Depth modes, evidence labels, commands
- [Communication templates](references/communication.md) - Brief and handoff formats
- [Research brief template](references/research-brief-template.md) - Required skill curation brief structure
- [Pressure scenarios](references/pressure-scenarios.md) - Future RED/GREEN validation
- [beer:writing-beer-skills](../writing-beer-skills/SKILL.md) - Use after deciding which Beer skills should be created or updated
