import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildIndex,
  buildMetadata,
  buildReadme,
  initializeKnowledgeBase,
  parseArgs,
  scanRepository,
} from "../skills/support/codebase-knowledge/scripts/init-knowledge-base.mjs";

function writeFile(root, relativePath, content) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, "utf8");
}

function createSkillRepoFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "beer-kb-scan-"));

  writeFile(root, "package.json", JSON.stringify({
    name: "fixture-skill-repo",
    version: "1.0.0",
    bin: {
      beer: "./scripts/commands/beer-cli.mjs",
    },
  }, null, 2));
  writeFile(root, "scripts/commands/beer-cli.mjs", "export function main() {}\n");
  writeFile(root, "scripts/commands/onboard-beer.mjs", "export function onboard() {}\n");
  writeFile(root, "scripts/commands/beer-status.mjs", "export function status() {}\n");
  writeFile(root, "docs/seed-context-contract.md", "State file: `.beer/state.json`\nGate file: `.beer/HANDOFF.json`\n");
  writeFile(root, "docs/ecosystem-flow-overview.md", "# Flow Overview\n");
  writeFile(root, "test/beer-status.test.mjs", "export {};\n");
  writeFile(root, "skills/workflow/feature/using-beer/SKILL.md", "---\nname: using-beer\ndescription: This skill should be used when the user asks to start.\n---\n");
  writeFile(root, "skills/workflow/feature/planning/SKILL.md", "---\nname: planning\ndescription: This skill should be used when the user asks to plan.\n---\n");
  writeFile(root, "skills/workflow/feature/executing/SKILL.md", "---\nname: executing\ndescription: This skill should be used when the user asks to execute.\n---\n");
  writeFile(root, "skills/support/codebase-knowledge/SKILL.md", "---\nname: codebase-knowledge\ndescription: This skill should be used when the user asks to scan.\n---\n");
  writeFile(root, "skills/workflow/feature/using-beer/references/workflow.md", "# Workflow\n");
  writeFile(root, "skills/workflow/feature/planning/references/workflow.md", "# Planning Workflow\n");
  writeFile(root, "skills/workflow/feature/executing/references/workflow.md", "# Executing Workflow\n");
  writeFile(root, "skills/support/codebase-knowledge/references/quick-ref.md", "# Quick Ref\n");

  return root;
}

function createGraphEvidenceFile(root) {
  const evidencePath = path.join(root, "gitnexus-evidence.json");
  fs.writeFileSync(evidencePath, JSON.stringify({
    repo_shape: "GitNexus-shaped workflow repository",
    dominant_patterns: [
      {
        name: "Graph-backed workflow routing",
        confidence: "high",
        areas: ["critical-flows", "boundaries"],
        summary: "GitNexus found workflow routing as the dominant repo-wide seam.",
        key_files: [
          "scripts/commands/beer-cli.mjs",
          "skills/workflow/feature/using-beer/SKILL.md",
        ],
        tags: ["workflow", "graph"],
      },
    ],
    docs: [
      {
        area: "critical-flows",
        kind: "critical-flow",
        title: "Graph Routed Workflow",
        file: "critical-flows/graph-routed-workflow.md",
        confidence: "high",
        summary: "Graph evidence says workflow routing is the highest-blast-radius flow.",
        tags: ["workflow", "graph", "routing"],
        key_files: [
          "scripts/commands/beer-cli.mjs",
          "skills/workflow/feature/using-beer/SKILL.md",
        ],
        what_this_is: "A graph-promoted workflow routing flow.",
        why_it_exists_here: "GitNexus identified command routing and workflow handoff as the dominant seam.",
        how_to_follow: [
          "Start from the command entrypoint.",
          "Trace the workflow handoff skill before changing route ownership.",
        ],
        common_variants: [
          "Some routes stay in command handlers while others move into workflow skills.",
        ],
        do_not_do: [
          "Do not rewrite workflow routing without checking graph evidence.",
        ],
        risk_when_changing: "High. This flow coordinates public entrypoints and workflow ownership.",
        confidence_reason: "GitNexus promoted this flow from repeated command and skill routing evidence.",
      },
    ],
    task_index: {
      "change workflow routing": [
        "CriticalFlows/graph-routed-workflow.md",
      ],
    },
    search_index: {
      "workflow routing": [
        "CriticalFlows/graph-routed-workflow.md",
      ],
    },
    critical_files: [
      "scripts/commands/beer-cli.mjs",
    ],
    notes: [
      "GitNexus evidence imported during pre-scan.",
    ],
  }, null, 2));
  return evidencePath;
}

function createFullStackFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "beer-kb-fullstack-"));

  writeFile(root, "package.json", JSON.stringify({
    name: "fixture-fullstack-repo",
    version: "1.0.0",
  }, null, 2));
  writeFile(root, "server/routes/users.ts", "router.get('/users', listUsers);\n");
  writeFile(root, "server/services/user-service.ts", "export async function listUsers() {}\n");
  writeFile(root, "server/middleware/auth.ts", "export function auth() {}\n");
  writeFile(root, "web/pages/index.tsx", "export default function Home() { return <div />; }\n");
  writeFile(root, "web/components/UserList.tsx", "export function UserList() { return <div />; }\n");
  writeFile(root, "web/lib/api.ts", "export async function fetchUsers() { return fetch('/api/users'); }\n");
  writeFile(root, "web/app/layout.tsx", "export default function Layout({ children }) { return children; }\n");

  return root;
}

function createMinimalFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "beer-kb-minimal-"));

  writeFile(root, "package.json", JSON.stringify({
    name: "fixture-minimal-repo",
    version: "1.0.0",
  }, null, 2));
  writeFile(root, "src/index.js", "export const value = 1;\n");

  return root;
}

function createNoCodeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "beer-kb-no-code-"));

  writeFile(root, "package.json", JSON.stringify({
    name: "fixture-no-code-repo",
    version: "1.0.0",
  }, null, 2));
  writeFile(root, "README.md", "# No Code Fixture\n");
  writeFile(root, "docs/notes.md", "No source code yet.\n");

  return root;
}

function createLayeredBackendFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "beer-kb-layered-"));

  writeFile(root, "package.json", JSON.stringify({
    name: "fixture-layered-backend",
    version: "1.0.0",
  }, null, 2));
  writeFile(root, "src/Api/Controllers/OrdersController.cs", "public sealed class OrdersController {}\n");
  writeFile(root, "src/Application/Orders/CreateOrderHandler.cs", "public sealed class CreateOrderHandler {}\n");
  writeFile(root, "src/Domain/Orders/Order.cs", "public sealed class Order {}\n");
  writeFile(root, "src/Infrastructure/Persistence/OrderRepository.cs", "public sealed class OrderRepository {}\n");

  return root;
}

test("scanRepository builds a real scan contract for skill and command repos", () => {
  const repoRoot = createSkillRepoFixture();
  const scan = scanRepository({
    outputRoot: path.join(repoRoot, "Docs"),
    sourcePath: repoRoot,
    resolvedSourcePath: repoRoot,
    generatedFromCommit: "unknown-git-unavailable",
    mode: "manual",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "not-used",
    filesScanned: 0,
    note: [],
  });

  const metadata = buildMetadata({
    outputRoot: path.join(repoRoot, "Docs"),
    sourcePath: repoRoot,
    resolvedSourcePath: repoRoot,
    generatedFromCommit: "unknown-git-unavailable",
    mode: "manual",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "not-used",
    filesScanned: 0,
    note: [],
  }, scan);
  const index = buildIndex(scan);
  const readme = buildReadme({
    sourcePath: repoRoot,
    invocationReason: "user-request",
    scanScope: "full",
  }, scan);

  assert.deepEqual(scan.discoveryLanes, [
    "architecture-and-conventions",
    "backend",
    "frontend",
    "boundaries",
    "critical-flows",
  ]);
  assert.equal(metadata.discovery.pre_scan, "real-repo-scan");
  assert.equal(metadata.discovery.execution, "parallel-child-agents");
  assert.equal(metadata.discovery.synthesis, "single-writer");
  assert.equal(metadata.stats.discovery_lanes, 5);
  assert.ok(scan.docEntries.some((entry) => entry.file === "Architecture/system-overview.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "Flows/repo-flow.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "Conventions/implementation-rules.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "CriticalFlows/cli-entrypoints-and-onboarding.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "CriticalFlows/workflow-routing.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "Boundaries/command-entrypoints-and-state.md"));
  assert.match(readme, /one-pass real scan -> child-agent lane fan-out -> single-writer synthesis/);
  assert.doesNotMatch(readme, /Fill this section/);
  assert.ok(index.entries.every((entry) => scan.docEntries.some((docEntry) => docEntry.file === entry.file)));
  assert.ok(index.task_index["change workflow skill"]);
  assert.ok(Array.isArray(index.task_index["change workflow skill"].docs));
  const architectureDoc = scan.docEntries.find((entry) => entry.file === "Architecture/system-overview.md");
  assert.ok(architectureDoc);
  assert.match(architectureDoc.content, /## Source Evidence/);
  assert.match(architectureDoc.content, /## Representative Snippet/);
  assert.match(architectureDoc.content, /## Verification Targets/);
  assert.match(architectureDoc.content, /scripts\/commands\/beer-cli\.mjs|package\.json/);
});

test("scanRepository writes a default flow doc when source code exists even without promoted patterns", () => {
  const repoRoot = createMinimalFixture();
  const scan = scanRepository({
    outputRoot: path.join(repoRoot, "Docs"),
    sourcePath: repoRoot,
    resolvedSourcePath: repoRoot,
    generatedFromCommit: "unknown-git-unavailable",
    mode: "manual",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "not-used",
    filesScanned: 0,
    note: [],
  });

  const index = buildIndex(scan);

  assert.ok(scan.docEntries.some((entry) => entry.file === "Flows/repo-flow.md"));
  assert.equal(scan.docEntries.some((entry) => entry.file.includes("/patterns/")), false);
  assert.ok(index.flows["repo-flow"]);
  assert.ok(index.task_index["understand repo flow"]);
});

test("scanRepository skips flow docs when no source code exists", () => {
  const repoRoot = createNoCodeFixture();
  const scan = scanRepository({
    outputRoot: path.join(repoRoot, "Docs"),
    sourcePath: repoRoot,
    resolvedSourcePath: repoRoot,
    generatedFromCommit: "unknown-git-unavailable",
    mode: "manual",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "not-used",
    filesScanned: 0,
    note: [],
  });

  const index = buildIndex(scan);

  assert.equal(scan.docEntries.some((entry) => entry.file === "Flows/repo-flow.md"), false);
  assert.deepEqual(index.flows, {});
  assert.equal(Boolean(index.task_index["understand repo flow"]), false);
});

test("parseArgs resolves default Docs beside the target repo, not the Beer package cwd", () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "beer-kb-target-root-"));
  fs.mkdirSync(path.join(repoRoot, ".beer"), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, "src", "feature"), { recursive: true });

  const parsed = parseArgs(["--source-path", path.join(repoRoot, "src", "feature")]);

  assert.equal(parsed.resolvedSourcePath, path.join(repoRoot, "src", "feature"));
  assert.equal(parsed.outputRoot, path.join(repoRoot, "Docs"));
});

test("scanRepository ignores generated Beer runtime and Docs output folders", () => {
  const repoRoot = createSkillRepoFixture();
  writeFile(repoRoot, ".beer/skills/generated/SKILL.md", "---\nname: generated\n---\n");
  writeFile(repoRoot, "Docs/stale-generated-doc.md", "# Stale\n");

  const scan = scanRepository({
    outputRoot: path.join(repoRoot, "Docs"),
    sourcePath: repoRoot,
    resolvedSourcePath: repoRoot,
    generatedFromCommit: "unknown-git-unavailable",
    mode: "manual",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "not-used",
    filesScanned: 0,
    note: [],
  });

  assert.equal(scan.files.some((file) => file.startsWith(".beer/")), false);
  assert.equal(scan.files.some((file) => file.startsWith("Docs/")), false);
});

test("scanRepository promotes backend, frontend, and boundary docs only when evidence exists", () => {
  const repoRoot = createFullStackFixture();
  const scan = scanRepository({
    outputRoot: path.join(repoRoot, "Docs"),
    sourcePath: repoRoot,
    resolvedSourcePath: repoRoot,
    generatedFromCommit: "unknown-git-unavailable",
    mode: "manual",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "not-used",
    filesScanned: 0,
    note: [],
  });

  assert.ok(scan.docEntries.some((entry) => entry.file === "Backend/request-lifecycle.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "Frontend/app-structure-and-api-access.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "Boundaries/frontend-backend-proxy.md"));
});

test("scanRepository uses patterns folders only when the repo shape justifies them", () => {
  const repoRoot = createLayeredBackendFixture();
  const scan = scanRepository({
    outputRoot: path.join(repoRoot, "Docs"),
    sourcePath: repoRoot,
    resolvedSourcePath: repoRoot,
    generatedFromCommit: "unknown-git-unavailable",
    mode: "manual",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "not-used",
    filesScanned: 0,
    note: [],
  });

  const backendDoc = scan.docEntries.find((entry) => entry.role === "backend-request-lifecycle");

  assert.ok(backendDoc);
  assert.equal(backendDoc.file, "Backend/patterns/request-lifecycle.md");
  assert.equal(backendDoc.architectureStyle, "layered-backend");
  assert.equal(scan.docPlan.some((plan) => plan.architectureStyle === "layered-backend"), true);
});

test("initializeKnowledgeBase writes only docs that the scan actually generated", () => {
  const repoRoot = createSkillRepoFixture();
  const outputRoot = path.join(repoRoot, "Docs");

  const scan = initializeKnowledgeBase({
    outputRoot,
    sourcePath: repoRoot,
    resolvedSourcePath: repoRoot,
    generatedFromCommit: "unknown-git-unavailable",
    mode: "manual",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "not-used",
    filesScanned: 0,
    note: [],
  });

  const metadata = JSON.parse(fs.readFileSync(path.join(outputRoot, "00-metadata.json"), "utf8"));
  const index = JSON.parse(fs.readFileSync(path.join(outputRoot, "index.json"), "utf8"));
  const readme = fs.readFileSync(path.join(outputRoot, "README.md"), "utf8");

  assert.equal(metadata.discovery.pre_scan, "real-repo-scan");
  assert.equal(metadata.discovery.execution, "parallel-child-agents");
  assert.equal(metadata.discovery.synthesis, "single-writer");
  assert.match(readme, /## Generated Docs/);
  assert.match(readme, /## Flow Map/);

  for (const entry of scan.docEntries) {
    assert.equal(fs.existsSync(path.join(outputRoot, entry.file)), true, `missing ${entry.file}`);
  }

  for (const [task, entry] of Object.entries(index.task_index)) {
    assert.ok(task.length > 0);
    assert.ok(Array.isArray(entry.docs));
    for (const file of entry.docs) {
      assert.equal(fs.existsSync(path.join(outputRoot, file)), true, `missing task target ${file}`);
    }
  }

  for (const entry of index.entries) {
    assert.equal(fs.existsSync(path.join(outputRoot, entry.file)), true, `missing index target ${entry.file}`);
  }

  const commandFlowDoc = fs.readFileSync(path.join(outputRoot, "CriticalFlows", "cli-entrypoints-and-onboarding.md"), "utf8");
  const repoFlowDoc = fs.readFileSync(path.join(outputRoot, "Flows", "repo-flow.md"), "utf8");
  assert.match(repoFlowDoc, /# Repository Flow Map/);
  assert.match(repoFlowDoc, /## Flow Diagram/);
  assert.match(repoFlowDoc, /```mermaid\nflowchart TD/);
  assert.match(repoFlowDoc, /## Source Evidence/);
  assert.match(commandFlowDoc, /## Source Evidence/);
  assert.match(commandFlowDoc, /## Representative Snippet/);
  assert.match(commandFlowDoc, /## Verification Targets/);
  assert.match(commandFlowDoc, /scripts\/commands\/beer-cli\.mjs/);
  assert.match(commandFlowDoc, /export function main|Representative snippet from/);
  assert.equal(fs.existsSync(path.join(outputRoot, "Backend", "patterns")), false);
  assert.equal(fs.existsSync(path.join(outputRoot, "Frontend", "patterns")), false);
});

test("initializeKnowledgeBase prefers GitNexus evidence when provided and still uses local snippets", () => {
  const repoRoot = createSkillRepoFixture();
  const evidencePath = createGraphEvidenceFile(repoRoot);
  const outputRoot = path.join(repoRoot, "Docs");

  initializeKnowledgeBase({
    outputRoot,
    sourcePath: repoRoot,
    resolvedSourcePath: repoRoot,
    gitnexusEvidence: evidencePath,
    generatedFromCommit: "unknown-git-unavailable",
    mode: "manual",
    invocationReason: "user-request",
    scanScope: "full",
    gitnexusStatus: "available",
    filesScanned: 0,
    note: [],
  });

  const metadata = JSON.parse(fs.readFileSync(path.join(outputRoot, "00-metadata.json"), "utf8"));
  const index = JSON.parse(fs.readFileSync(path.join(outputRoot, "index.json"), "utf8"));
  const graphDoc = fs.readFileSync(path.join(outputRoot, "CriticalFlows", "graph-routed-workflow.md"), "utf8");
  const readme = fs.readFileSync(path.join(outputRoot, "README.md"), "utf8");

  assert.equal(metadata.mode, "gitnexus-assisted");
  assert.equal(metadata.discovery.evidence_priority, "gitnexus-first");
  assert.equal(index.conventions.discovery_execution, "parallel-child-agents");
  assert.equal(index.conventions.evidence_priority, "gitnexus-first");
  assert.ok(index.entries.some((entry) => entry.file === "CriticalFlows/graph-routed-workflow.md"));
  assert.ok(index.task_index["change workflow routing"]);
  assert.match(graphDoc, /## Source Evidence/);
  assert.match(graphDoc, /## Representative Snippet/);
  assert.match(graphDoc, /## Verification Targets/);
  assert.match(graphDoc, /scripts\/commands\/beer-cli\.mjs/);
  assert.match(graphDoc, /export function main/);
  assert.match(readme, /Evidence priority: `GitNexus-first with local confirmation`/);
});
