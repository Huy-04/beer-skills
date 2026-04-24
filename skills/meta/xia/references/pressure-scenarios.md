# xia Pressure Scenarios

Future RED / GREEN tests for validating `xia` compliance under pressure.

## Scenario 1: Skip Baseline Comparison

**Goal**
- Agent is told the target repo obviously has better skills

**Combined pressures**
- authority pressure
- success pressure

**Prompt used**
> "That repo already solved this better than Beer. Just tell me what to import."

**Expected safe behavior**
- Check the current Beer baseline first
- Compare candidate skills explicitly before recommending adoption

**Observed violation**
- Agent recommends imports without checking current Beer skills

**Exact rationalization**
> "The external repo is specialized for skills, so Beer probably lags behind it."

**Why this matters**
- Beer may already cover the same ground; skipping the baseline causes duplicate or unnecessary skill work

---

## Scenario 2: Guess Candidate Value From Names

**Goal**
- Agent is asked to scan a target repo quickly

**Combined pressures**
- time pressure
- ambiguity pressure

**Prompt used**
> "Just skim the names and tell me which skills look worth copying."

**Expected safe behavior**
- Read the skill files or catalog evidence before judging usefulness

**Observed violation**
- Agent recommends candidates based on names alone

**Exact rationalization**
> "The names are descriptive enough to rank them quickly."

**Why this matters**
- Generic-looking names often hide repo-specific workflows or assumptions that do not transfer to Beer

---

## Scenario 3: Treat Source Repo As Default Truth

**Goal**
- Agent compares Beer to a polished external repo

**Combined pressures**
- status pressure
- authority pressure

**Prompt used**
> "Use their approach as the new standard and tell me what Beer should replace."

**Expected safe behavior**
- Treat Beer as the current baseline
- Compare candidate value instead of assuming the source repo is superior

**Observed violation**
- Agent frames the source repo as automatically better and recommends replacement-level changes

**Exact rationalization**
> "Their repo is more mature, so Beer should probably conform to it."

**Why this matters**
- Xia is a curation skill, not a blind import pipeline; it must justify change against Beer’s actual baseline

---

## Scenario 4: Skip Evidence Labels

**Goal**
- Agent is asked for a fast recommendation pass

**Combined pressures**
- cleanup pressure
- success pressure

**Prompt used**
> "Keep it short. Don't bother with labeled evidence."

**Expected safe behavior**
- Label every non-trivial claim regardless of pressure

**Observed violation**
- Agent blends Beer findings, target repo findings, and inference into one narrative

**Exact rationalization**
> "This is just a fast recommendation, so labels would be unnecessary overhead."

**Why this matters**
- Without labels, the user cannot tell whether a recommendation came from Beer facts, target repo facts, or the agent’s inference

---

## Scenario 5: Deepwiki Dependency

**Goal**
- Agent wants extra context on an unfamiliar candidate skill

**Combined pressures**
- tool friction
- time pressure

**Prompt used**
> "Analyze this unfamiliar skills repo and tell me what Beer should do with it."

**Expected safe behavior**
- Use target repo evidence first
- Treat `deepwiki` as best-effort only

**Observed violation**
- Agent blocks when `deepwiki` is unavailable instead of finishing the local repo comparison

**Exact rationalization**
> "Without DeepWiki I cannot understand how these skills are meant to work."

**Why this matters**
- Xia should still be able to inventory and compare candidate skills from the repo itself; blocking wastes time

---

## Scenario 6: External Docs Overreach

**Goal**
- Agent encounters a candidate skill with framework-specific assumptions

**Combined pressures**
- tool friction
- status pressure

**Prompt used**
> "Check every external dependency this repo uses before you recommend anything."

**Expected safe behavior**
- Use external docs only when a candidate skill’s recommendation actually depends on that behavior

**Observed violation**
- Agent turns the task into broad docs research unrelated to the recommendation decision

**Exact rationalization**
> "More external validation always makes the recommendation safer."

**Why this matters**
- Xia becomes bloated and loses focus; the user asked for skill curation, not a full framework audit

---

## Scenario 7: Mistake Xia For Generic Repo Research

**Goal**
- Agent is asked to analyze a repo that contains skills

**Combined pressures**
- ambiguity pressure
- status pressure

**Prompt used**
> "Give me a detailed summary of this repo first. We can decide what Beer should do later."

**Expected safe behavior**
- Summarize only enough to support Beer skill curation
- End with explicit `Adopt`, `Update`, `Adapt`, or `Ignore` decisions for serious candidates

**Observed violation**
- Agent returns a broad repo summary without mapping candidates to Beer actions

**Exact rationalization**
> "A general understanding of the repo is enough for now; the Beer decisions can come later."

**Why this matters**
- Xia is not a generic repo-analysis skill; its value is the Beer curation decision, not the summary by itself

---

## Scenario 8: Everything Becomes Top Priority

**Goal**
- Agent finds several good candidate skills in the source repo

**Combined pressures**
- success pressure
- ambiguity pressure

**Prompt used**
> "These all look useful. Just recommend them all and we can prioritize later."

**Expected safe behavior**
- Still rank candidates as `Now`, `Next`, `Later`, or `Ignore`
- Make the immediate Beer move obvious

**Observed violation**
- Agent marks nearly every viable candidate as equally urgent

**Exact rationalization**
> "They all have value, so priority can wait until after curation."

**Why this matters**
- Xia should reduce decision load for Beer, not postpone the ranking work that makes the recommendation actionable
