# CREATION-LOG Template

```markdown
---
skill_name: <skill-name>
date: YYYY-MM-DD
author: <name or team>
status: draft | validated | needs-more-testing
---

# CREATION-LOG: <skill-name>

## Source Material

- Existing Beer files read:
- External references consulted:
- Key extraction decisions:

## Pressure Coverage

- Pressure depth: full RED | focused RED | mechanical waiver
- Behavior-changing edit made before pressure coverage: yes | no
- If yes, retroactive coverage completed before handoff: yes | no

### Scenario 1: <name>
- Combined pressures:
- Expected safe behavior:
- Observed violation:
- Exact rationalization:
- Why it matters:

### Scenario 2: <name>
- Combined pressures:
- Expected safe behavior:
- Observed violation:
- Exact rationalization:
- Why it matters:

### Scenario 3: <name>
- Combined pressures:
- Expected safe behavior:
- Observed violation:
- Exact rationalization:
- Why it matters:

## INSTRUCTION GREEN: Skill Changes

- Rules added because of observed failures:
- References added:
- Validation tooling used:
- Why the current wording is minimal but sufficient:

## PATTERN REFACTOR: Loopholes Closed

- New rationalizations found after first pass:
- Specific wording changes made:
- Red flags added:
- Rationalization-table changes:

## Validation Results

- `node scripts/maintenance/check-markdown-links.mjs`:
- `node scripts/maintenance/sync-skills.mjs --dry-run`:
- Semantic agent validation: executed | blocked | limited | not required
  - Prompt:
  - Expected route or skill:
  - Observed route or skill:
  - Evidence:
  - Cleanup:
  - Final behavior status: proven | limited | blocked
- Additional repo-local checks:

## Final Judgment

- Bulletproof enough to ship? yes | no
- Remaining weaknesses:
- Recommended next pressure scenario:
```
