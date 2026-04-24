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
    - beer/workflow
  inputs: "[Main inputs or upstream artifacts]"
  outputs: "[Owned artifact, decision, or state update]"
  upstream: "[Upstream route or skill]"
  downstream: "[Next route or skill]"
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

One-sentence contract: what this workflow skill locks, decides, or produces.

## At a Glance

| | |
|---|---|
| **Use when** | [Trigger conditions] |
| **Needs** | [Required inputs, route state, dependencies] |
| **Produces** | [Owned artifact or route decision] |
| **Next** | [Next skill or handoff target] |

## 30-Second Version

1. **Qualify the route**: Short action description.
2. **Gather the minimum required context**: Short action description.
3. **Run the core workflow gates**: Short action description.
4. **Write the owned artifact or state**: Short action description.
5. **Hand off cleanly**: Short action description.

## Core Workflow

### Phase 1: [Name]

[Concise description or pointer to `references/workflow.md`.]

### Phase 2: [Name]

[Concise description or pointer to `references/workflow.md`.]

### Phase 3: [Name]

[Concise description or pointer to `references/workflow.md`.]

## Hard Rules

- [Non-negotiable routing or safety rule.]
- [State authority or artifact ownership rule.]
- [Validation or handoff rule.]

## State Contract

- [Which state file or artifact is authoritative.]
- [Which fields this skill may mutate.]
- [What downstream skills may assume after completion.]

## Key References

- `references/workflow.md` - workflow detail
- `references/quick-ref.md` - quick reference
- `references/communication.md` - communication templates
