# Research Note: TDD for Skills

Beer treats skill authoring as a test-driven discipline:

- `RED`: prove how the agent fails without the skill or current wording
- `GREEN`: add only the wording needed to stop the observed failure
- `REFACTOR`: tighten loopholes exposed by new rationalizations

This file is a lightweight repo-local note for `beer:writing-beer-skills`. It
is not a general literature review and should stay short unless Beer gains
specific examples or evidence that materially improve skill-authoring work.

## Working Summary

- Skills are executable instructions, so they need behavior-oriented validation rather than style-only review.
- Pressure tests matter more than academic Q&A because agents often comply in principle but rationalize under delivery pressure.
- The useful artifact from `RED` is the exact rationalization text, not a vague summary like "the model ignored the rule".
- The useful artifact from `REFACTOR` is the wording change that removes that rationalization path with the least extra complexity.

## Beer-Specific Implications

- Do not add hypothetical rules before you see the failure pattern.
- Do not trust a skill edit that never passed at least one failing baseline and one passing rerun.
- Prefer repo-native validation steps that any Beer maintainer can run from this repository.

## Local Validation Stack

- `quick_validate.py` from the system `skill-creator` skill for structural validation
- `node scripts/check-markdown-links.mjs` for repo-local markdown link checks
- `node scripts/sync-skills.mjs --dry-run` for repo-local skill inventory sanity checks

## Maintenance Rule

Keep this note as background context only. If Beer later needs formal examples,
measured findings, or sharper guidance, add only evidence that changes actual
skill-authoring decisions in this repo.
