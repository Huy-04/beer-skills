---
name: xia
description: Skill curation brief communication standards and templates
version: "1.0.0"
---

# xia - Communication Standards

## Writing Guidelines

### Do

- Label every non-trivial claim with `Local`, `Upstream`, `Docs`, or `Inference`
- Keep the brief concise; recommendation quality matters more than volume
- Quantify confidence as a percentage
- Explain why the chosen recommendation class beats the next-best alternative
- Call out when a candidate skill is too source-repo-specific to import directly
- Write recommendations so the user can scan them as `source candidate -> closest Beer skill -> class -> priority -> Beer effect -> reason`

### Do Not

- Blur evidence labels into a blended narrative
- Skip the Bottom Line
- Skip the overlap comparison against current Beer skills
- Recommend adoption without explaining why `Update`, `Adapt`, or `Ignore` lost
- Leave the confidence level ambiguous
- Return a generic repo summary without Beer-skill decisions

## Handoff Templates

### Skill curation result

```markdown
Skill repo analysis complete: [topic]
Brief: [path]
Primary recommendation: [Adopt | Update | Adapt | Ignore]
Priority summary: [Now | Next | Later | Ignore]
Beer effect: [what Beer gains if this recommendation is acted on]
Confidence: [0-100%]
Recommendation matrix complete: yes | no

Next: Review the recommendation matrix and choose which Beer skills to create, update, adapt, or leave alone.
```

### Writing handoff

```markdown
Skill repo analysis complete: [topic]
Brief: [path]
Chosen action: [Adopt | Update | Adapt]
Priority band: [Now | Next | Later]
Beer skill target: [beer:<category>/<skill-name>]
Rationale: [why this target won]
Closest Beer skill for the source candidate: [beer:<category>/<skill-name> | none]
Expected Beer effect: [what this change should improve in Beer]

Next: Invoke `beer:writing-beer-skills` for the chosen Beer skill work.
```

## Confidence Levels

| Level | Indicator | Recommendation |
|-------|-----------|----------------|
| **High** | Strong overlap analysis, clear winner | Clear recommendation |
| **Medium** | Trade-offs balanced | Conditional recommendation |
| **Low** | Gaps or unresolved ambiguity | More repo analysis needed |

## Red Flags

| Issue | Action |
|-------|--------|
| No Bottom Line | Add it first |
| Missing evidence labels | Separate `Local`, `Upstream`, `Docs`, `Inference` |
| No Beer baseline comparison | Add explicit overlap analysis |
| Candidate missing from matrix | Add the candidate with class + closest Beer skill |
| No priority ordering | Rank candidates as `Now`, `Next`, `Later`, or `Ignore` |
| No Beer effect stated | Add one short payoff line per serious candidate |
| No confidence percentage | Quantify before handing off |
| Recommendation without tradeoff analysis | Explain why the next-best alternative lost |
