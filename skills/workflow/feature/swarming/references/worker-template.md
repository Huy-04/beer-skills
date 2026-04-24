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
- locked decisions to honor
- verification expectation
- reporting channel back to the coordinator

The bootstrap must not include:

- unrelated session history
- speculative future phases
- extra work outside the approved slice
