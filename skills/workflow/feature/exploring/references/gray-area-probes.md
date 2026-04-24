# Gray-Area Probes by Domain Type

Use these probes during `beer:exploring` to find decisions that would otherwise force planning to guess.

Pick only the probes that are genuinely undecided for the current feature.

## SEE

For UI, dashboards, layouts, forms, or visual presentation.

- What is the primary layout: list, card grid, table, timeline, or something else?
- How dense should the information be?
- What happens on mobile or narrow screens?
- What should the empty, loading, and error states look like?
- Is interaction read-only or editable?
- Are changes immediate or explicitly saved?
- How are destructive actions confirmed?
- How are sorting, filtering, and pagination exposed?

## CALL

For APIs, CLIs, webhooks, service interfaces, or caller-facing contracts.

- What is the input shape?
- What should success return?
- Is the result synchronous or async?
- Who is allowed to call this?
- What auth mechanism is expected?
- What failure modes need explicit responses?
- Is idempotency required?
- Are side effects suppressible or previewable?

## RUN

For jobs, scripts, services, or pipelines.

- What triggers the work?
- Can multiple runs happen in parallel?
- What is the expected runtime?
- Where does output go?
- How should progress be reported?
- What happens on partial failure?
- Is retry behavior required?
- Is there a dry-run mode?

## READ

For documentation, emails, reports, notifications, or changelog-style output.

- Who is the audience?
- What structure should the content follow?
- How much context should be explained?
- What tone is expected?
- Which sections are required?
- Are examples or snippets needed?
- Is the content evergreen or release-specific?

## ORGANIZE

For data models, file layouts, naming conventions, schemas, or taxonomies.

- What is the main grouping dimension?
- How many nesting levels are appropriate?
- What naming convention applies?
- How are conflicts or collisions resolved?
- How are edge cases handled?
- Does this require migration from an older structure?

## Cross-Cutting Probes

- What is explicitly out of scope?
- Which adjacent systems does this touch but not own?
- Is there an existing pattern this should follow?
- Has a related decision already been made elsewhere?
- Who consumes the output of this feature?
