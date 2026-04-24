---
name: xia
description: Skill repo analysis quick reference
version: "1.0.0"
---

# xia - Quick Reference

## Depth Selection

| Mode | When | Steps |
|------|------|-------|
| **Quick** | Small repo, obvious overlap | Beer baseline -> Candidate inventory -> Recommendation |
| **Standard** | Default | Baseline -> Target repo map -> Inventory -> Compare -> Brief |
| **Deep** | Large or messy skills repo | Standard + wider candidate coverage + external validation |

## Research Sequence

```text
1. Check if analysis waived
2. Read target repo contract and Beer baseline
3. Map target repo from artifacts
4. Inventory candidate skills
5. Compare against Beer skills
6. Validate externally only when needed
7. Return skill curation brief
```

## Evidence Labels

| Label | Source |
|-------|--------|
| `Local` | This Beer repository |
| `Upstream` | Target repo or public GitHub repositories |
| `Docs` | Official documentation |
| `Inference` | Conclusions from evidence |

**Never blend these.**

## Tool Priority

| Need | Primary | Fallback |
|------|---------|----------|
| Beer baseline | Local Beer files | - |
| Target repo truth | Target repo files | - |
| Unfamiliar upstream pattern | deepwiki | Direct GitHub |
| Official tool behavior | exa | Web search |

## Quick Commands

```bash
# Find skills in a target repo
rg --files <target-repo> -g "SKILL.md"

# Inspect Beer baseline
rg --files skills -g "SKILL.md"

# Find skill names in catalogs or manifests
rg -n "name:|description:|SKILL.md|skill" <target-repo>

# Check Beer inventory
Get-Content docs/skill-inventory.json
```

## Recommendation Classes

1. **Adopt**
2. **Update**
3. **Adapt**
4. **Ignore**

## Priority Bands

1. **Now**
2. **Next**
3. **Later**
4. **Ignore**

## Expected Output Shape

```text
source-repo skill -> closest Beer skill -> Adopt | Update | Adapt | Ignore -> Now | Next | Later | Ignore -> Beer effect -> one-line reason
```

If `Closest Beer skill` is unclear, write `none` explicitly instead of leaving the comparison implicit.

## Hard-Gate Check

```markdown
[ ] Brief complete?
[ ] Compared target repo against current Beer skills?
[ ] Labeled all claims (Local/Upstream/Docs/Inference)?
[ ] Assigned a recommendation class to each serious candidate?
[ ] Assigned a priority band to each serious candidate?
[ ] Named the closest Beer skill or `none` for each serious candidate?
[ ] Stated the Beer effect for each serious candidate?
[ ] Otherwise -> Do NOT edit Beer skills yet
```

## Red Flags

| Smell | Fix |
|-------|-----|
| "This skill sounds useful" | Read the skill files that prove it |
| "Beer does not have this" | Check Beer inventory first |
| Generic adoption advice | Compare exact overlap and repo-specific constraints |
| Missing closest Beer skill | Write the closest Beer skill or `none` explicitly |
| Generic repo summary only | Turn it into Beer curation decisions per serious candidate |
| Everything marked urgent | Rank by Beer leverage and immediate value |
| Priority with no payoff stated | Add the Beer effect in one short line |
| Starting to edit Beer skills | Complete brief first |
| Blended evidence | Separate labels explicitly |

## Brief Required Sections

```markdown
1. Bottom line
2. Target repo snapshot
3. Beer baseline summary
4. Candidate skill inventory
5. Overlap and gap analysis
6. Upstream/docs findings (if needed)
7. Recommendation matrix
8. Priority ordering
9. Expected Beer effect
10. Risks/unknowns
11. Confidence level
12. Next step
```

## Recommendation Matrix Completeness

- [ ] Every serious candidate from the inventory appears in the matrix
- [ ] Each row has `Adopt`, `Update`, `Adapt`, or `Ignore`
- [ ] Each row has `Now`, `Next`, `Later`, or `Ignore`
- [ ] Each row names the closest Beer skill or `none`
- [ ] Each row states the Beer effect
- [ ] Each row explains why the next-best alternative lost
