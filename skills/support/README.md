# Support Skills

Support skills are invoked when the active workflow needs a focused utility pass
rather than another workflow family.

## Skills

| Skill | Purpose | Typical handoff |
|---|---|---|
| `graph-explore` | GitNexus-backed structural lookup and process tracing | return graph context to another Beer skill |
| `prompt-leverage` | Context-aware prompt upgrading with built-in language policy | return an execution-ready prompt |
| `codebase-knowledge` | Project-local stable-pattern cache | return knowledge-base context without replacing repo truth |
| `test-driven-development` | Fail-first proof for behavior changes | return RED/GREEN/REFACTOR evidence |
| `agent-docs-sync` | Agent guidance synchronization for `CLAUDE.md` and `AGENTS.md` | return a surgically merged context file |

## Relationship to Workflow

Support skills are not the public main route. They plug into workflow skills
when a more focused pass is needed.

## Related Docs

- [README](../../README.md)
- [Ecosystem Flow Overview](../../docs/ecosystem-flow-overview.md)
- [Workflow Skills](../workflow/README.md)
- [Meta Skills](../meta/README.md)
