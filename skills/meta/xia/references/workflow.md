---
name: xia
description: Detailed workflow for analyzing a skills repository against the current Beer skill set
version: "1.0.0"
---

# xia - Workflow Details

## Overview

**Role:** Skill-repo scout  
**Job:** Analyze a repository that contains skills, compare each serious source-repo candidate to the current Beer skill set, and recommend what Beer should add, update, adapt, ignore, and prioritize  
**Output:** A short skill curation brief for the Beer skill list - never code or file edits

## The 7-Step Sequence

Run in order. Do not skip or reorder steps unless the user explicitly waives analysis.

```text
1. Check whether analysis was waived
2. Read the target repo contract and Beer baseline
3. Map the target repo from real artifacts
4. Inventory candidate skills in the target repo
5. Compare candidates against current Beer skills
6. Validate externally only when candidate behavior depends on unfamiliar upstream tooling or official docs
7. Return the skill curation brief
```

## Step 1: Check Waiver

- Did the user explicitly say to skip repo analysis?
- If yes, note the waiver and move directly to the requested next step.
- If no, continue the full sequence.

Do not treat impatience or vague urgency as a waiver.
Do not edit Beer skills, docs, or manifests during `xia`; route approved changes to `beer:writing-beer-skills`.

## Step 2: Read the Target Repo Contract and Beer Baseline

Read when they exist in the target repo:

- `AGENTS.md`
- `README.md`
- skill catalogs, manifests, or registry files
- repo-local docs explaining skill structure, routing, or validation

Also inspect the Beer baseline:

- current Beer skills under `skills/`
- `docs/skill-inventory.json`
- relevant Beer pattern docs if overlap questions depend on structure

These files define what the target repo contains and what Beer already covers.

## Step 3: Map the Target Repo from Artifacts

Classify the target repo from evidence, not assumptions:

- pure skills repo
- mixed repo with skills plus scripts or plugins
- plugin marketplace or skill catalog
- agent framework repo with embedded skills
- custom repo that stores skill-like artifacts without a standard layout

Infer from real artifacts:

- skill directories and `SKILL.md` files
- catalogs, manifests, marketplace metadata
- helper scripts and validation commands
- plugin or MCP config files
- docs that define routing, dependencies, or usage

Capture a short repo ledger:

- skill layout and categories
- naming style
- common dependencies or tool expectations
- repo-specific validation or packaging patterns

If the repo has multiple skill formats, call that out explicitly.

## Step 4: Inventory Candidate Skills

Inspect the target repo for candidate skills.

For each serious candidate, capture:

- skill name
- trigger conditions
- main job or deliverable
- dependencies or tool assumptions
- whether the behavior appears generic enough for Beer or tightly bound to the source repo

Useful targets:

- directories containing `SKILL.md`
- skill catalogs or marketplace manifests
- helper references or templates that define the skill's operating model
- docs or examples showing when the skill is invoked

Do not claim a candidate is novel until the Beer baseline has been checked.

## Step 5: Compare Against Current Beer Skills

Compare each serious candidate against the current Beer skill set.

This step should answer:

- which Beer skill is the closest match
- whether the match is exact, partial, weak, or nonexistent
- whether Beer should add a new skill or update an existing one
- whether the candidate is too repo-specific to import directly
- whether the candidate belongs in `Now`, `Next`, `Later`, or `Ignore`

For each serious candidate, record:

- the closest Beer skill, or `none`
- one recommendation class
- one priority band
- one short Beer effect statement
- the Beer action implied by that class
- one short reason why the next-best class lost

Recommendation classes:

- `Adopt` - candidate should become a new Beer skill
- `Update` - candidate should change an existing Beer skill
- `Adapt` - some ideas are worth porting, but not the skill as-is
- `Ignore` - not useful for Beer, already covered, or too source-specific

Priority bands:

- `Now` - highest-value action for the current Beer backlog
- `Next` - strong follow-up after the top item or two
- `Later` - useful idea, but lower urgency or lower leverage
- `Ignore` - no current action should be taken

Use the Beer baseline as the default reference point. The target repo is a source of candidates, not a replacement baseline.
The expected reading shape is:

```text
source-repo skill -> closest Beer skill -> recommendation class -> priority band -> Beer effect -> why
```

## Step 6: Validate Externally Only When Needed

Look outward only when the target candidate depends on behavior not established by the repo evidence.

Use `deepwiki` as best-effort support when:

- the candidate skill appears to rely on an unfamiliar upstream framework or pattern
- the target repo docs are too thin to explain why the skill exists

Use `exa` or current search/browser capability when:

- a candidate skill depends on official docs behavior or current tool support
- the target repo appears to encode framework or API assumptions that should be checked

This step is optional and scoped. It is not generic inspiration hunting.

If Beer behavior and external docs disagree, treat Beer as the current local truth for Beer and call out the mismatch explicitly.

## Step 7: Return the Skill Curation Brief

Before any skill-writing work, return a concise brief using `references/research-brief-template.md`.

The brief must include:

- bottom line
- target repo snapshot
- Beer baseline summary
- candidate skill inventory
- overlap and gap analysis
- optional upstream or docs findings
- recommendation matrix
- priority ordering
- expected Beer effect
- risks, unknowns, and follow-up questions if needed
- confidence in the primary recommendation
- the next concrete step

Every non-trivial claim in the brief must be labeled as:

- `Local` for findings from this Beer repository
- `Upstream` for findings from the target repo or other public repositories
- `Docs` for findings from official documentation
- `Inference` for conclusions drawn from the evidence

The recommendation matrix is incomplete unless every serious candidate from the inventory appears there with:

- a recommendation class
- a priority band
- a `Closest Beer skill` value
- a Beer effect statement
- a tradeoff note explaining why the next-best alternative lost

The priority ordering is incomplete unless the brief makes clear:

- which candidate is the top immediate move
- which candidates are follow-ups
- which candidates should wait
- what Beer gains from acting on each priority band

## Depth Selection

| Mode | When | Coverage |
|------|------|----------|
| **Quick** | Small repo, obvious overlap | Steps 2-5 only, short recommendation set |
| **Standard** | Default | Full 7-step sequence |
| **Deep** | Large skills repo, messy overlap, external dependencies | Full 7-step + wider candidate coverage + risk analysis |

If unsure, use `Standard`.

## Integration

```text
User asks to analyze a repo that contains skills
    |
    v
xia repo analysis
    |
    v
Skill curation brief
    |
    v
User chooses targets
    |
    v
writing-beer-skills for selected additions or updates
```

`xia` is not a feature-planning stage. Its job ends at the curation brief.

## Done Criteria

This workflow is done when:

- the brief clearly states what the target repo contains
- the Beer baseline was compared explicitly
- each serious candidate has a recommendation class
- each serious candidate has a priority band
- each serious candidate maps to the closest Beer skill or `none`
- each serious candidate makes the Beer action obvious: create new, update existing, adapt selectively, or ignore
- the brief makes the Beer action order obvious: now, next, later, or ignore
- the brief makes the expected Beer effect obvious for the important candidates
- every non-trivial claim is labeled
- confidence is quantified
- the user has a clear next step

## Scope

### Best For

- external repos that contain skills or skill-like packages
- deciding whether Beer should adopt, update, or ignore outside skill ideas
- comparing another skill ecosystem to the current Beer catalog
- identifying missing Beer skills from a target repo inventory

### Not For

- feature planning for an application or service repo
- generic repo research that does not end in Beer skill curation
- tiny self-contained edits where the target skill is already chosen
- purely mechanical changes such as renames or formatting
- writing or editing the Beer skill itself after the recommendation is already clear

## Hard-Gate

Do not write or edit Beer skills until the curation brief is complete.

The only exception is when the user explicitly waives analysis and already named the exact Beer skill to create or update.

If two materially different recommendations remain plausible, finish the brief first and then ask one targeted question instead of guessing.

## Tool Roles

| Need | Primary path | Rule |
|---|---|---|
| Beer baseline truth | Local Beer files and inventory | This comes first and is never optional |
| Target repo truth | Target repo files, manifests, catalogs, docs | Inventory before judging overlap |
| Unfamiliar upstream behavior | `deepwiki` | Best-effort only; do not block if unavailable |
| Official tool behavior | `exa` | Use only when candidate skills depend on external docs truth |
| Final synthesis | Skill curation brief | Separate `Local`, `Upstream`, `Docs`, and `Inference` explicitly |

## Guardrails

- Do not guess what a target skill does from its name alone.
- Do not claim Beer is missing a skill until the current Beer skill list has been checked.
- Do not treat every target-repo skill as portable; many are repo-specific.
- Do not use external research unless the candidate skill actually depends on it.
- Do not blur Beer baseline findings, target repo findings, docs findings, and inference together.
- Do not start editing Beer skills before the curation brief is complete.
- Do not recommend adoption without saying why `Update`, `Adapt`, or `Ignore` lost.
- Do not return a generic repo summary without mapping serious candidates to Beer decisions.
- Do not recommend everything at the same urgency level; rank the likely actions.

## Red Flags

Stop and correct course immediately if you catch yourself doing any of these:

- assuming a skill is generic because the name sounds generic
- comparing against memory instead of the current Beer inventory
- recommending a new Beer skill before checking for an overlap
- jumping to docs research before the target repo and Beer baseline are clear
- treating the target repo as if it were automatically better than Beer
- collapsing `Local`, `Upstream`, `Docs`, and `Inference` into one blended narrative

## Quick Smell Test

If the brief does not clearly answer "what skills exist there, what Beer already has, and what Beer should do about each serious candidate," it is not done yet.
