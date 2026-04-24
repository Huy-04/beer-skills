---
name: skill-name
description: >
  This skill should be used when the user asks to "trigger phrase 1",
  "trigger phrase 2", or "trigger phrase 3".
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  author: ""
  tags:
    - beer/support
  dependencies: []
allowed-tools:
  - Read
user-invocable: true
disable-model-invocation: false
---

# Skill Title

One-sentence contract: what focused capability this support skill provides.

## At a Glance

| | |
|---|---|
| **Use when** | [Trigger conditions] |
| **Needs** | [Inputs, evidence, dependencies] |
| **Produces** | [Output, report, transformed artifact, or proof] |
| **Next** | [Calling workflow skill or user handoff] |

## 30-Second Version

1. **Load the right inputs**: Short action description.
2. **Do the focused capability pass**: Short action description.
3. **Produce the owned output**: Short action description.
4. **Verify the output**: Short action description.
5. **Return control cleanly**: Short action description.

## Capability First

- [What this skill should do aggressively and well.]
- [What evidence, transformation, or proof it should maximize.]
- [How it should avoid shallow output.]

## Ownership Boundary

- [What this skill owns.]
- [What the calling workflow skill owns.]
- [Which artifacts this skill may read, write, or return without taking over the workflow.]

## Core Workflow

### Phase 1: [Name]

[Concise description or pointer to `references/workflow.md`.]

### Phase 2: [Name]

[Concise description or pointer to `references/workflow.md`.]

## Key References

- `references/workflow.md` - workflow detail
- `references/quick-ref.md` - quick reference
- `references/communication.md` - communication templates
