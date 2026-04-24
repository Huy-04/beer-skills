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
    - beer/meta
  dependencies: []
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
user-invocable: true
disable-model-invocation: false
---

# Skill Title

One-sentence contract: what this meta skill improves inside Beer and when.

## At a Glance

| | |
|---|---|
| **Use when** | [Trigger conditions] |
| **Needs** | [Target behavior, evidence, dependencies] |
| **Produces** | [Package, recommendation set, research brief, or updated Beer artifact] |
| **Next** | [Next skill or user handoff] |

## 30-Second Version

1. **Map the Beer-side target**: Short action description.
2. **Run the minimum evidence or authoring loop**: Short action description.
3. **Produce the owned output**: Short action description.
4. **Validate or pressure-test it**: Short action description.
5. **Clean up and hand off**: Short action description.

## Capability First

- [What this skill should do aggressively and well.]
- [What evidence, authoring quality, or curation quality it should maximize.]
- [How it should avoid timid or purely advisory output when asked to act.]

## Core Workflow

### Phase 1: [Name]

[Concise description or pointer to `references/workflow.md`.]

### Phase 2: [Name]

[Concise description or pointer to `references/workflow.md`.]

### Phase 3: [Name]

[Concise description or pointer to `references/workflow.md`.]

## Validation and Cleanup

- [What must be validated before handoff.]
- [What temporary artifacts must be removed or retained explicitly.]
- [What evidence should be included in the final handoff.]

## Key References

- `references/workflow.md` - workflow detail
- `references/quick-ref.md` - quick reference
- `references/communication.md` - communication templates
