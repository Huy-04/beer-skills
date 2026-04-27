# Skill Curation Brief Template

Use this template to structure the brief returned by `xia`.

```markdown
# Skill Curation Brief: [Title]

## Bottom Line
- Primary recommendation:
- Priority summary: `Now` | `Next` | `Later` | `Ignore`
- Why this is the strongest action:
- Confidence (0-100%):
- Next step:

## Target Repo Snapshot
- Repo type:
- Skill layout:
- Naming or category conventions:
- Relevant tooling, manifests, or catalogs:
- Detectable validation or packaging patterns:

## Beer Baseline Summary
- Current Beer skills most relevant to this analysis:
- Existing Beer coverage:
- Known overlap surfaces:
- Important Beer constraints or conventions:

## Candidate Skill Inventory
- Candidate:
  - Source path:
  - Trigger conditions:
  - Main job or deliverable:
  - Dependencies or tool assumptions:
  - Generic vs repo-specific:
  - Closest Beer skill or `none`:
  - Expected Beer effect:

## Evidence Ledger

Record the highest-signal evidence, not every artifact touched.

- `Local`:
- `Upstream`:
- `Docs`:
- `Inference`:

## Overlap and Gap Analysis
- Strong overlaps with Beer:
- Partial overlaps worth updating:
- New gaps worth filling:
- Candidates that should be ignored:

## Optional Upstream or Docs Findings
- External repos checked:
- Official docs checked:
- Behaviors that required external validation:
- Important caveats or mismatches:

## Decision Cards

### 1. [Candidate]

Decision: `Adopt` | `Update` | `Adapt` | `Ignore`
Priority: `Now` | `Next` | `Later` | `Ignore`
Closest Beer skill: `beer:<skill>` | `none`
Beer effect:

Evidence:
- `Local`:
- `Upstream`:
- `Docs`:
- `Inference`:

Why this class won:

Why the next-best alternative lost:

Recommended Beer change:
-

Do not leave serious candidates out of the decision cards.

## Priority Ordering
- `Now`: [candidate] - [Beer effect]
- `Next`: [candidate] - [Beer effect]
- `Later`: [candidate] - [Beer effect]
- `Ignore`: [candidate] - [why no action]

## Expected Beer Effect
- Immediate Beer gains if `Now` happens:
- Quality or workflow gains if `Next` happens:
- Longer-term gains if `Later` happens:

## Risks, Unknowns, And Follow-Up Questions
- Portability risks:
- Evidence gaps:
- Repo-specific assumptions:
- Follow-up questions for the user, if any:

## Source Pack
- Beer files read:
- Target repo files read:
- External repos or docs checked:

## Evidence Boundary
Label ambiguous claims clearly:
- `Local` for findings from this Beer repository
- `Upstream` for findings from the target repo or public repositories
- `Docs` for findings from official documentation
- `Inference` for conclusions drawn from the evidence
```
