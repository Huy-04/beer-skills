---
name: writing-beer-skills
description: Fast checklist for producing a clean Beer skill package
version: "1.0.0"
---

# writing-beer-skills - Quick Reference

## Minimal Artifact Set

| Item | Requirement |
|---|---|
| `SKILL.md` | Required |
| `references/workflow.md` | Required |
| `references/communication.md` | Required |
| `references/quick-ref.md` | Required |
| Extra files | Add only when the skill explicitly needs them |

## Internal Method Checklist

- [ ] Chose pressure depth: `full RED`, `focused RED`, or `mechanical waiver`
- [ ] Used `full RED` for new skills, broad behavior changes, route/ownership rewrites, dependency changes, and pattern/template/checklist changes
- [ ] Used `focused RED` for narrow behavior edits to an existing skill
- [ ] Treated pattern/template/checklist/example edits as behavior-changing when they changed authoring decisions
- [ ] If pressure coverage was skipped, the handoff says the edit was mechanical-only and behavior was unchanged
- [ ] If a behavior-changing edit happened before pressure coverage, recorded the lapse and ran retroactive coverage before handoff
- [ ] Captured useful shortcuts or rationalizations before finalizing wording
- [ ] Added at least one change-specific scenario targeting the exact rule or behavior changed
- [ ] Used at least two pressures in the change-specific scenario
- [ ] Captured real-run evidence for `full RED`, or labeled the evidence as `focused/manual`
- [ ] For workflow, routing, gate, or user-visible behavior changes, ran semantic agent validation or recorded the blocker as blocked/limited
- [ ] Tightened wording after pressure-testing

## Final Package Checklist

- [ ] `name` matches the folder exactly
- [ ] `description` contains trigger conditions only
- [ ] Final files match `docs/skill-authoring/skill-pattern.md`
- [ ] References point only to real files
- [ ] Optional files remain only when the skill truly needs them
- [ ] Temporary scenario, instruction, and refactor artifacts were removed before handoff

## Validation Commands

| Command | Purpose |
|---|---|
| `node scripts/maintenance/check-markdown-links.mjs skills/<category>/<skill-name>` | Link validation |
| `node scripts/maintenance/sync-skills.mjs --dry-run` | Skill inventory and sync validation |

## Semantic Agent Validation

- [ ] Required for workflow, routing, gate, or user-visible skill behavior changes
- [ ] One affected route is enough only for a narrow trigger or wording change
- [ ] Representative route cases are required when route tables, defaults, gates, or shared workflow behavior changed
- [ ] Prompt or task shape is recorded
- [ ] Selected route or skill is recorded
- [ ] Files read, artifacts created, edits made, or skipped edits are recorded
- [ ] Verification commands or manual checks are recorded
- [ ] Violations, overreach, skipped gates, and cleanup status are recorded
- [ ] Command tests are not reported as a substitute
- [ ] Blocked semantic validation is labeled blocked/limited, not pass

## Manual Semantic Check

- [ ] `description` is routing-only, third person, and includes trigger phrases
- [ ] `metadata.tags` uses `beer/<category>` style tags
- [ ] `metadata.inputs`, `outputs`, `upstream`, and `downstream` match the actual route and owned artifacts when present
- [ ] `metadata.dependencies` matches actual external tools
- [ ] Body section order and tone match `docs/skill-authoring/skill-pattern.md`
- [ ] Validation report or handoff includes concrete evidence for reviewed items

## Minimum Handoff Evidence

- [ ] Include pressure depth: `full RED`, `focused RED`, or `mechanical waiver`
- [ ] If pressure coverage ran, include a minimal pressure report
- [ ] If pressure coverage was waived, include the mechanical-only justification
- [ ] If semantic agent validation was required, include executed evidence or blocked/limited status
- [ ] Include manual review evidence with line refs, field values, or file-level observations

## Fast Smell Test

- workflow summary appears in `description`
- temporary authoring artifacts remain in the final directory
- references point to missing files
- repo-native checks passed but no manual semantic review was shown
- manual review says `pass` but gives no evidence
- pressure coverage ran but no report was included
- `full RED` outcomes are hypothetical instead of coming from a real run
- `focused RED` evidence is not labeled as focused/manual
- workflow or routing behavior changed but only command tests were reported
