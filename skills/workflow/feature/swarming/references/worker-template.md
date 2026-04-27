---
skill: swarming
purpose: Minimal worker bootstrap contract
version: "1.0"
---

# swarming Worker Bootstrap

Each worker should receive:

- feature slug
- active slice name
- assigned work item or bead
- route artifact path
- implementation pattern to follow
- evidence files to open before coding
- exact source facts to re-check before coding
- verification target
- TDD disposition expectation: `complete`, `waived: <reason>`, or `not-required`
- assigned model profile
- locked decisions to honor
- verification expectation
- reporting channel back to the coordinator

Each worker result should report:

- assigned work item
- route artifact used
- implementation pattern followed
- source facts re-checked
- files changed
- verification run
- TDD disposition
- deviations from the approved artifact, if any
- blocker summary, if any

The bootstrap must not include:

- unrelated session history
- speculative future phases
- extra work outside the approved slice
- a pattern name without evidence files and source facts to verify
