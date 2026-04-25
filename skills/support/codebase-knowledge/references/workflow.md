---
skill: codebase-knowledge
purpose: Detailed workflow for codebase analysis and knowledge base creation
version: "1.0"
---

# codebase-knowledge - Workflow Details

---

## Authority Rule

`.beer/knowledge-base/` is a project-local cache of source-linked observations. If it conflicts with the current repository source, source wins for immediate analysis. Mark the affected entry stale, then ask the user whether to update the knowledge base/docs or change code to match the documented pattern.

Default commit policy is `local-cache-by-default`: do not commit generated knowledge-base files unless the user or team explicitly wants shared repo knowledge.

If Git commit lookup is unavailable or blocked, degrade cleanly: set `generated_from_commit` to an explicit fallback such as `unknown-safe-directory-blocked` or `unknown-git-unavailable`, record the reason in metadata notes, and avoid pretending freshness checks are authoritative.

## Invocation Gate

Run `codebase-knowledge` only when at least one is true:

- the user explicitly asks to scan, analyze, build, or refresh the knowledge base
- `beer:compounding` identified a reusable pattern/convention/architecture shift and the user approved the knowledge-base refresh
- the user explicitly requests a subfolder or partial scan

Do not run this skill during normal feature work just because planning or
validation needs more context. Those skills should read source, GitNexus, locked
context, or existing knowledge-base entries instead of generating a new cache.

Think of this skill as a knowledge compiler: it consolidates stable project
knowledge into `.beer/knowledge-base/` after the workflow has already learned
something worth preserving.
If `.beer/knowledge-base/` does not exist yet, that only changes the initialization path. It does not widen the invocation gate.

When this skill is invoked from compounding's knowledge-base refresh handoff, do
not ask for another approval inside this skill. That handoff already covered
the refresh decision.

---

## Phase 0: Initialization

### Step 0.0: Check Optional Tooling

```bash
node scripts/commands/beer-preflight.mjs --json
```

If preflight is unavailable or reports degraded mode:
- Continue with local source scanning
- Use GitNexus only when available
- Mark metadata with `"mode": "manual"` when graph/tooling support is unavailable

---

### Step 0.1: Check Existing Knowledge Base

```powershell
if (Test-Path .beer/knowledge-base) { Get-ChildItem .beer/knowledge-base } else { "No existing knowledge base" }
if (Test-Path .beer/knowledge-base/00-metadata.json) { Get-Content .beer/knowledge-base/00-metadata.json } else { "No metadata" }
```

**If exists:**
- Read version, timestamp, stats
- Decide: Full refresh or incremental update?
- Archive old version if major changes detected

**If missing:**
- Create `.beer/knowledge-base/` directory structure
- Initialize with empty templates
- Record `"source_authority": "current repository source"` and `"commit_policy": "local-cache-by-default"` in metadata
- Treat missing KB as permission to create a baseline cache during this run, not as a reason to auto-scan unrelated requests.

You can bootstrap the folder structure and parseable JSON files with:

```bash
node skills/support/codebase-knowledge/scripts/init-knowledge-base.mjs \
  --output-root .beer/knowledge-base \
  --source-path <repo-or-subpath> \
  --generated-from-commit unknown-git-unavailable \
  --mode manual \
  --invocation-reason user-request
```

### Step 0.1b: If Scanning Only A Subfolder

If the requested scope is a subfolder instead of the whole repo:

- Record the exact subfolder in metadata `source_path`.
- Treat architecture and dependency claims as sub-scope claims unless supported by wider evidence.
- Do not overwrite a full-repo knowledge base with subfolder-only conclusions unless the user explicitly wants that scope change.
- Lower confidence when patterns appear only inside the scanned subfolder.
- Add a note that freshness and conventions may be incomplete outside the scanned path.
- Set metadata `scan_scope` to `partial` unless the source path is the repo root.

### Step 0.2: Create Directory Structure

```bash
# Unix/macOS
mkdir -p .beer/knowledge-base/{code-patterns,folder-structure,business-rules,architecture,dependencies,conventions,critical-sections}

# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path .beer/knowledge-base/code-patterns, .beer/knowledge-base/folder-structure, .beer/knowledge-base/business-rules, .beer/knowledge-base/architecture, .beer/knowledge-base/dependencies, .beer/knowledge-base/conventions, .beer/knowledge-base/critical-sections
```

---

## Phase 1: Analysis Lanes

Run analysis lanes sequentially by default using local source scans and GitNexus when available. Lanes are conceptual units, not tracked tasks or beads. Use subagents only when the user explicitly asks for parallel agent work.

### Command Style

Prefer `rg` because it works well across Windows, macOS, and Linux. Use `grep`, `find`, `head`, `tree`, or `jq` only as optional fallbacks when they are available in the target shell. On Windows, use the PowerShell forms already listed in this workflow or the Node.js fallback snippets in quick-ref.

### Lane 1: Code Patterns Analysis

**Approach:**
1. Search for common patterns (adapt globs for your language):
   ```bash
   rg -l "class .*Repository|Repository" src
   rg -l "Factory|create.*factory|builder|Builder" src
   rg -l "emit|on\\(|addListener|EventEmitter" src
   rg -l "Strategy|interface .*Strategy|trait .*Strategy" src
   ```

2. Use GitNexus (if available):
   ```yaml
   query:
     query: "Find repository pattern implementations"
     repo: "<repo-name>"
   ```

   ```yaml
   query:
     query: "Find factory or builder patterns"
     repo: "<repo-name>"
   ```

3. Document in `code-patterns/*.md`

**Output:**
- `code-patterns/repository-pattern.md`
- `code-patterns/service-layer.md`
- etc.

### Lane 2: Folder Structure Mapping

**Approach:**
1. Map directory tree:
   ```bash
   rg --files src

   # Windows (PowerShell)
   Get-ChildItem -Recurse -Directory src/ | Select-Object -First 50 FullName
   ```

2. Identify conventions:
   - `src/components/` -> React/Vue components?
   - `src/services/` -> Business logic?
   - `src/utils/` -> Helpers?
   - `__tests__/`, `*.test.ts` -> Testing patterns?

3. Check configuration files:
   ```bash
   rg --files -g "package.json" -g "tsconfig.json" -g ".eslintrc*" -g "vite.config.*" -g "pyproject.toml" -g "go.mod" -g "Cargo.toml"

   # Windows (PowerShell)
   Get-Item package.json, tsconfig.json, .eslintrc*, vite.config.*, pyproject.toml, go.mod, Cargo.toml -ErrorAction SilentlyContinue
   ```

**Output:**
- `folder-structure/conventions.md`
- `folder-structure/module-map.md`

### Lane 3: Business Rules Extraction

**Approach:**
1. Find validation logic (adapt for your language):
   ```bash
   rg -l "validate|Validation|schema|zod|joi|pydantic" src
   ```

2. Find domain constraints:
   ```bash
   rg -n "must|should|required|forbidden|only|throw|error|raise|if" src
   ```

3. Check types for domain rules:
   ```bash
   rg -n "type |interface |struct |class " src
   ```

**Output:**
- `business-rules/validation-rules.md`
- `business-rules/domain-constraints.md`

### Lane 4: Architecture Documentation

**Approach:**
1. Identify architecture pattern:
   - MVC? Layered? Microservices? Clean Architecture?
   
2. Map data flow:
   ```bash
   rg -n "import .*from|require\\(|from .* import|use " src
   ```

3. Find entry points:
   ```bash
   rg --files -g "index.ts" -g "app.ts" -g "main.ts" -g "__init__.py" -g "main.go"

   # Windows (PowerShell)
   Get-Item src/index.ts, src/app.ts, src/main.ts, src/__init__.py, main.go -ErrorAction SilentlyContinue
   ```

4. Use GitNexus for graph (if available):
   ```yaml
   query:
     query: "Find application entry points"
     repo: "<repo-name>"
   ```

   ```yaml
   query:
     query: "Find data flow patterns"
     repo: "<repo-name>"
   ```

**Output:**
- `architecture/layer-structure.md`
- `architecture/data-flow.md`
- `architecture/component-diagram.md`

### Lane 5: Dependency Analysis

**Approach:**
1. Analyze imports:
   ```bash
   rg -n "^import .*from|^from .* import|^import |^use " src
   ```

2. Find cross-module dependencies:
   ```bash
   rg -l "from .*components|components/" src/services
   rg -l "from .*services|services/" src/components
   ```

3. Check package manifest:
   ```bash
   node -e "const pkg=require('./package.json'); console.log(JSON.stringify({deps:pkg.dependencies,devDeps:pkg.devDependencies},null,2))"
   ```

**Output:**
- `dependencies/import-patterns.md`
- `dependencies/cross-module-graph.md`

### Lane 6: Conventions Identification

**Approach:**
1. Naming conventions:
   ```bash
   # Check file naming (adapt extensions)
   rg --files src/components
   rg --files src/services
   
   # Check function/class naming
   rg -n "^export class|^export function|^def |^func |^class " src
   ```

2. Error handling:
   ```bash
   rg -n "try|catch|throw|Error|except|raise|Result<|Either" src
   ```

3. Async patterns:
   ```bash
   rg -n "async|await|Promise|goroutine|chan |Task<" src
   ```

**Output:**
- `conventions/naming.md`
- `conventions/error-handling.md`
- `conventions/file-organization.md`

---

## Phase 2: Critical Sections (Depends on Phase 1)

### Lane 7: Critical Sections Identification

**Approach:**
1. Search for security-sensitive code (adapt extensions):
   ```bash
   rg -l "auth|Auth|password|token|jwt|session" src
   rg -l "payment|Payment|stripe|billing" src
   rg -l "permission|role|admin" src
   ```

2. Database/ORM critical files:
   ```bash
   rg -l "database|query|migration|schema|ORM|prisma|sqlalchemy" src
   ```

3. External API integrations:
   ```bash
   rg -l "axios|fetch|api|http|requests|httpx|net/http" src
   ```

**Output:**
- `critical-sections/auth-flows.md`
- `critical-sections/payment-processing.md`
- `critical-sections/database-operations.md`

---

## Phase 3: Synthesis

### Step 3.1: Merge Findings

Combine outputs from all lanes:
- Check for contradictions (e.g., mixed naming conventions)
- Identify dominant patterns
- Flag inconsistencies

### Step 3.2: Confidence Scoring

For each finding, assign confidence:
- **High**: Saw 5+ examples, consistent across codebase
- **Medium**: Saw 3-4 examples, some variation
- **Low**: Saw 1-2 examples, might be edge case

---

## Phase 4: Write Knowledge Base Files

Write only what the evidence supports.

- Create or update lane files under the correct subfolders.
- Add source evidence, confidence, applicability, and contradictions to each entry.
- Keep README lightweight; it is navigation, not a second schema definition.
- Use the existing examples instead of inventing a new output shape during the run:
  - `examples/example-output.md`
  - `examples/cache-conflict-resolution.md`

Do not dump speculative templates into the knowledge base just because a lane ran.
Prefer durable patterns and clarified conventions over transient implementation noise.

---

## Phase 5: Finalize Index and Metadata

Update these files before handoff:

- `.beer/knowledge-base/index.json`
- `.beer/knowledge-base/00-metadata.json`

Rules:

- Follow `references/index-schema.md` exactly for machine-readable fields.
- Write valid UTF-8 JSON that parses cleanly in Node.
- Record `generated_from_commit`, or an explicit `unknown-*` fallback plus the reason.
- Keep `source_authority = current repository source`.
- Set `scan_scope = partial` for subfolder scans.
- Record whether the run was `manual` or `gitnexus-assisted`.

---

## Phase 6: Post-Execution Freshness Policy

This skill does not run freshness checks on every normal feature request. Freshness review is a lazy follow-up owned by `beer:compounding` or by an explicit user refresh request.

Use this decision rule:

| Condition | Action |
|---|---|
| No previous metadata | No freshness claim; user can invoke scan later |
| `generated_from_commit` starts with `unknown-` | Freshness is non-authoritative; rescan only on explicit request or visible pattern drift |
| Commit unchanged | Knowledge base remains fresh |
| Commit changed but only local feature files shifted | Usually skip refresh |
| Commit changed and conventions/architecture/rules drifted | Trigger incremental or full refresh |

When `beer:compounding` owns freshness review, it may trigger this refresh after
task closeout while GitNexus repo re-index follows its own automatic path. This
skill still only owns the knowledge-base refresh work.

The exact staleness command stays in `references/quick-ref.md`.

---

## Handoff

Use the report shape from `references/communication.md` and include:

- output path
- invocation reason
- scan scope
- mode (`manual` or `gitnexus-assisted`)
- counts for key findings
- stale/conflicting entries, if any
- reminder that current source remains authoritative

Then return control to the calling workflow skill or end the direct user request with the cache refresh summary.
