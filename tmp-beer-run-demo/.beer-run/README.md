# .beer-run Template

This folder is the on-disk Beer workflow control surface for a host project.

## Expected Layout

- `state.json`
- `feature-metadata.json`
- `context/`
- `plans/`
- `reviews/`
- `closeout/`

## Suggested Templates

- `context/context.template.md`
- `plans/plan.template.md`
- `reviews/review.template.md`
- `closeout/closeout.template.md`
- `feature-metadata.template.json`

Commands should treat `state.json` as the primary workflow state and update it as phase ownership changes.
Artifacts should stay compact and phase-specific rather than becoming a generic project notebook.
