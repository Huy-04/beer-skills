---
skill: strategy-shaping
purpose: Quick trigger, evidence, and handoff checklist for pre-workflow strategy
version: "1.0"
---

# strategy-shaping - Quick Reference

## Trigger

Use this skill when the user is still deciding:

- what direction to take;
- whether a solution is overkill;
- which approach is simpler or safer;
- how to optimize a feature before coding;
- whether to build now or defer parts of the idea.

## Do Not Trigger

Route elsewhere when:

- the task is already clear enough to execute through Beer: `beer:context-intake`;
- the user asks why something fails: `beer:debugging`;
- the user asks for generated project docs: `beer:codebase-knowledge`;
- the user asks to change Beer skills: `beer:writing-beer-skills`.

## Evidence Ladder

Use evidence only as deep as the decision needs:

1. User goal and constraints.
2. Local repo files, docs, tests, and patterns.
3. Existing generated `Docs/`, if present.
4. GitNexus, if configured and indexed.
5. Optional free MCP sources, if already configured:
   - DeepWiki or GitMCP for public repo comparison.
   - Context7 for framework/library docs.
   - Filesystem MCP for allowed local folders.
   - Fetch MCP for explicit URLs.

Missing optional MCPs are skipped, not installed.

## Output Checklist

The brief should include:

- goal;
- recommended direction;
- why that direction fits;
- options considered;
- scope boundary for now/later/not-this-task;
- evidence used and skipped;
- handoff seed to `beer:context-intake`.

## Handoff Phrase

```text
Strategy shaped. If you choose this direction, invoke `beer:context-intake`
with the strategy brief as seed context.
```

## State Rule

No `.beer/state.json` mutation. No gate approval. No code edits.
