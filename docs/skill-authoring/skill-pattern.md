# Beer Skill Standard Pattern

> Single source of truth for authoring and reviewing skills inside the Beer ecosystem.
> Based on the open [Agent Skills specification](https://agentskills.io/specification) (Anthropic) with Beer-specific extensions for multi-phase workflows, dependency management, and bilingual support.

---

## 1. File and Directory Layout

Every skill lives in its own directory under the appropriate category:

```text
skills/<category>/<skill-name>/           # support + meta
skills/workflow/<family>/<skill-name>/    # workflow families
|-- SKILL.md                              # Required: frontmatter + body (target <2,500 words)
|-- scripts/                              # Optional: executable helpers (Node.js, Python, Bash)
|   `-- validate.mjs
|-- references/                           # Required: detailed docs loaded on demand
|   |-- quick-ref.md                      # One-page cheat sheet
|   |-- workflow.md                       # Full phase-by-phase instructions
|   |-- communication.md                  # Prompt/message templates
|   `-- <topic>.md                        # Additional reference files as needed
|-- examples/                             # Optional: runnable input/output examples
|   `-- example-output.md
`-- assets/                               # Optional: templates, images, diagrams
    `-- template.md
```

### Category rules

| Category | Path | Purpose |
|----------|------|---------|
| Workflow | `skills/workflow/feature/` | Day-to-day workflow skills, including repair and investigation support |
| Support | `skills/support/` | Utilities, helpers, and language guide |
| Meta | `skills/meta/` | Meta-skills for evolving Beer itself |

**Naming rule**: `skill-name` must match exactly the `name` field in frontmatter. Use lowercase, numbers, and hyphens only. Never use underscores.

### Capability and ownership rule

Beer separates capability from workflow control:

| Skill type | Primary job | Writing style |
|------------|-------------|---------------|
| Workflow skills | Sequence work, manage gates, mutate Beer state/artifacts, decide next route | Explicit gates, state contracts, stop criteria |
| Support skills | Maximize evidence, transformation, testing proof, language handling, or helper output | `Capability First` plus precise `Ownership Boundary` |
| Meta skills | Improve Beer itself through research, authoring, or curation | Strong output generation, with boundaries between curation and implementation |

Support/meta rules should not make the agent timid. They should say what the
skill is allowed to do aggressively, then define which workflow-owned artifacts
or decisions belong to the caller.

---

## 2. Frontmatter Standard

The frontmatter is YAML between `---` delimiters starting on line 1, with no blank lines before the opening `---`.

### Required fields

| Field | Rule |
|-------|------|
| `name` | Match directory name. Lowercase + hyphens. Max 64 chars. |
| `description` | Routing signal only. Third person only: "This skill should be used when...". Max 1024 chars. Include concrete trigger phrases. Do not include workflow summary, validation notes, or output promises here. |

### Beer-extended fields

| Field | Required | Format |
|-------|----------|--------|
| `license` | Recommended | SPDX identifier such as `PolyForm-Noncommercial-1.0.0` |
| `compatibility` | Recommended | List: `[claude-code, beer-ecosystem]` |
| `metadata` | Required | `version`, `ecosystem`, optional `author`, `tags`, and route metadata when useful |
| `metadata.version` | Required | SemVer string such as `"1.0.0"` |
| `metadata.ecosystem` | Required | Always `"beer"` |
| `metadata.tags` | Recommended | Prefix with `beer/<category>` such as `beer/workflow`, `beer/support`, or `beer/meta` |
| `metadata.inputs` | Recommended for workflow skills | Short string describing the main inputs or upstream artifacts |
| `metadata.outputs` | Recommended for workflow skills | Short string describing the owned artifact, decision, or state mutation |
| `metadata.upstream` | Recommended for workflow skills | Upstream route or skill, for example `"using-beer or context-intake"` |
| `metadata.downstream` | Recommended for workflow skills | Next route or skill, for example `"planning"` |
| `metadata.dependencies` | Required if skill uses external tools | Array of dependency objects |
| `allowed-tools` | Recommended | Smallest tool set that lets the skill fulfill its capability and ownership |
| `user-invocable` | Recommended | `true` or `false` for background-only skills |
| `disable-model-invocation` | Optional | `true` = user-only, `false` = auto-trigger allowed |
| `model` | Optional | Override model: `opus`, `sonnet`, `haiku`, `inherit` |
| `context` | Optional | `fork` to run in isolated subagent |
| `agent` | Optional | Subagent type when `context: fork` |

### Dependency format

```yaml
metadata:
  dependencies:
    - id: beads-cli
      kind: command
      command: bd
      missing_effect: degraded
```

### Full example

```yaml
---
name: planning
description: >
  This skill should be used when the user asks to "plan the implementation",
  "create a phase plan", "research and plan", or "ready to plan".
license: PolyForm-Noncommercial-1.0.0
compatibility:
  - claude-code
  - beer-ecosystem
metadata:
  version: "1.0.0"
  ecosystem: beer
  tags:
    - beer/workflow
    - workflow
  inputs: "Locked context plus repo evidence"
  outputs: "A phase plan and execution-ready artifacts"
  upstream: "exploring"
  downstream: "executing"
  dependencies:
    - id: beads-cli
      kind: command
      command: bd
      missing_effect: unavailable
    - id: gitnexus
      kind: mcp_server
      server_names: [gitnexus]
      missing_effect: degraded
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
user-invocable: true
disable-model-invocation: false
---
```

### Tool selection rules

Choose tools from capability, not habit:

| Skill shape | Typical tools | Notes |
|-------------|---------------|-------|
| Read-only helper or graph/research helper | `Read`, `Bash`, `Grep`, `Glob` | Add `Write/Edit` only if it produces requested artifacts. |
| Artifact-producing support skill | `Read`, `Write`, `Edit`, `Bash` | Use when the skill owns docs, reports, tests, cache files, or transformed artifacts. |
| Workflow skill that mutates Beer state/plans | `Read`, `Write`, `Edit`, `Bash` | Declare state contracts and human gates. |
| Swarm/orchestration skill | `Read`, `Write`, `Edit`, `Bash`, `TaskCreate`, `TaskUpdate`, `Agent` | Use only when the skill genuinely coordinates workers. |

Do not include `Agent`, `TaskCreate`, or `TaskUpdate` in templates by default.
Add them only to swarm/orchestration skills whose body explains worker
ownership, handoff format, and coordination gates.

---

## 3. Body Writing Rules

### Tone and person

| Context | Rule | Example |
|---------|------|---------|
| Frontmatter `description` | Third person routing only | "This skill should be used when..." |
| Body instructions | Imperative / infinitive | "Parse the file. Validate input before processing." |
| Never use second person | Avoid | "You should parse the file." |

### Required sections

1. One-sentence contract
2. At a Glance
3. 30-Second Version
4. Skill-type core section set
5. Key References

### Section selection by skill type

| Skill type | Required body emphasis |
|------------|------------------------|
| Workflow | `Core Workflow`, gates, state contracts, route metadata, validation path |
| Support helper | `Capability First`, `Ownership Boundary`, output contract |
| Support artifact producer | `Capability First`, artifact format, verification, safety filters |
| Meta curation | `Capability First`, evidence labels, recommendation/output format |
| Meta authoring | `Capability First`, authoring loop, validation stack, cleanup rules |

`Capability First` should state how the agent should use the skill powerfully.
`Ownership Boundary` should define what belongs to the caller, not restrict the
skill from gathering evidence or producing its owned output.

Use the matching template family instead of forcing every skill into one shape:

| Skill type | Starting template |
|------------|-------------------|
| Workflow | `workflow-skill-template.md` |
| Support | `support-skill-template.md` |
| Meta | `meta-skill-template.md` |

### Length limits

| Part | Target | Max |
|------|--------|-----|
| Full SKILL.md body | 1,500-2,000 words | 2,500 words |
| `references/quick-ref.md` | 1 page | 500 words |
| `references/workflow.md` | Unlimited | Move all detail here |

---

## 4. Progressive Disclosure

Beer follows the Agent Skills progressive disclosure model:

| Tier | Content | Size | Loaded |
|------|---------|------|--------|
| L1 Discovery | `name` + `description` | ~50-100 tokens per skill | Session startup |
| L2 Activation | Full `SKILL.md` body | 500-2,500 tokens | Skill triggered |
| L3 Execution | `references/*.md`, `scripts/*` | Unlimited | On demand |

Rule of thumb: if a section exceeds 300 words, consider moving it to `references/`.

---

## 5. Reference File Standards

### `references/quick-ref.md`

- One page, <= 500 words
- Tables and bullet lists only
- No long prose paragraphs

### `references/workflow.md`

- Full phase-by-phase instructions
- Can include long prose, examples, edge cases
- Must be explicitly linked from `SKILL.md`

### `references/communication.md`

- Prompt templates, message formats, notification text

### `references/<topic>.md`

- Specialized deep-dive topics
- Use descriptive kebab-case names

---

## 6. Script Standards

- Use repo-root `scripts/` for shared runtime behavior: CLI, state machinery, hooks, guards, onboarding, sync, install/update/uninstall, and anything multiple skills or the whole Beer bundle depends on.
- Use skill-local `scripts/` only for helpers that belong to one skill and would make less sense as shared runtime code.
- Do not create a `scripts/` folder in every skill just for symmetry. Only add it when the skill genuinely owns executable helpers.
- Must be executable or runnable via `node <script>` / `python <script>`
- Document usage in a comment block at the top of the file
- Prefer Node.js `.mjs` for consistency with Beer utilities

---

## 7. Validation Checklist

- [ ] Directory name matches `name` in frontmatter
- [ ] Frontmatter starts on line 1
- [ ] `description` is third person, includes trigger phrases, and stays routing-only
- [ ] `metadata.version` uses SemVer
- [ ] `metadata.tags` uses the right Beer category prefix
- [ ] If `metadata.inputs`, `outputs`, `upstream`, or `downstream` are present, they match the actual route and owned artifacts
- [ ] `references/quick-ref.md` exists
- [ ] `references/workflow.md` exists
- [ ] `references/communication.md` exists
- [ ] All referenced files exist
- [ ] SKILL.md body is under 2,500 words
- [ ] Body uses imperative tone, never second person
- [ ] If the skill has external deps, `metadata.dependencies` is populated
- [ ] `allowed-tools` matches the skill's ownership and does not include orchestration tools by default
- [ ] Support/meta skills include `Capability First` unless there is a clear reason not to
- [ ] Helper skills called by workflow skills define an `Ownership Boundary`
- [ ] Workflow skills define gates, state mutation authority, and validation handoff
- [ ] Behavior-changing workflow, routing, gate, or user-visible skill edits have semantic agent validation evidence, or the blocker is recorded explicitly as blocked/limited
- [ ] `license` is declared

---

## 8. Beer-Specific Conventions

### Session model references

When a skill needs to mention session shape, use the canonical axes:

```text
route: feature | small-fix
work_intent: delivery | repair | investigation
risk: normal | high
orchestration_strategy: single-worker | multi-worker
run_style: guided | go
```

### Human gates

If a skill introduces a human gate, document it in both:

- `SKILL.md`
- `references/workflow.md`

### State contracts

Skills that read or write `.beer/state.json` must declare expected `context_stage` values in `references/workflow.md`.

### Multilingual support

- Primary docs: English
- Mixed-language prompts: defer to the repo's central language-policy reference (Beer uses `prompt-leverage/references/language-policy.md`)
- Do not duplicate conflicting per-language policy across multiple skills

---

## Sources

- [Agent Skills Specification](https://agentskills.io/specification)
- [Anthropic Agent Skills Docs](https://docs.anthropic.com/en/agents-and-tools/agent-skills/overview)
- [Claude Code Best Practices 2026](https://vibecoderskit.ai/blog/claude-code-best-practices-in-2026-the-complete-developer-guide)
- [SKILL.md Frontmatter Reference](http://agentpatterns.ai/tool-engineering/skill-frontmatter-reference/)
