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
        "critical-flows/graph-routed-workflow.md",
      ],
    },
    search_index: {
      "workflow routing": [
        "critical-flows/graph-routed-workflow.md",
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

test("scanRepository builds a real scan contract for skill and command repos", () => {
  const repoRoot = createSkillRepoFixture();
  const scan = scanRepository({
    outputRoot: path.join(repoRoot, ".beer", "knowledge-base"),
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
    outputRoot: path.join(repoRoot, ".beer", "knowledge-base"),
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
  assert.ok(scan.docEntries.some((entry) => entry.file === "architecture/system-overview.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "conventions/implementation-rules.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "critical-flows/cli-entrypoints-and-onboarding.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "critical-flows/workflow-routing.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "boundaries/command-entrypoints-and-state.md"));
  assert.match(readme, /one-pass real scan -> child-agent lane fan-out -> single-writer synthesis/);
  assert.doesNotMatch(readme, /Fill this section/);
  assert.ok(index.entries.every((entry) => scan.docEntries.some((docEntry) => docEntry.file === entry.file)));
  assert.ok(index.task_index["change workflow skill"]);
  assert.ok(Array.isArray(index.task_index["change workflow skill"].docs));
  const architectureDoc = scan.docEntries.find((entry) => entry.file === "architecture/system-overview.md");
  assert.ok(architectureDoc);
  assert.match(architectureDoc.content, /## Source Evidence/);
  assert.match(architectureDoc.content, /## Representative Snippet/);
  assert.match(architectureDoc.content, /## Verification Targets/);
  assert.match(architectureDoc.content, /scripts\/commands\/beer-cli\.mjs|package\.json/);
});

test("scanRepository promotes backend, frontend, and boundary docs only when evidence exists", () => {
  const repoRoot = createFullStackFixture();
  const scan = scanRepository({
    outputRoot: path.join(repoRoot, ".beer", "knowledge-base"),
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

  assert.ok(scan.docEntries.some((entry) => entry.file === "backend/request-lifecycle.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "frontend/app-structure-and-api-access.md"));
  assert.ok(scan.docEntries.some((entry) => entry.file === "boundaries/frontend-backend-proxy.md"));
});

test("initializeKnowledgeBase writes only docs that the scan actually generated", () => {
  const repoRoot = createSkillRepoFixture();
  const outputRoot = path.join(repoRoot, ".beer", "knowledge-base");

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

  const commandFlowDoc = fs.readFileSync(path.join(outputRoot, "critical-flows", "cli-entrypoints-and-onboarding.md"), "utf8");
  assert.match(commandFlowDoc, /## Source Evidence/);
  assert.match(commandFlowDoc, /## Representative Snippet/);
  assert.match(commandFlowDoc, /## Verification Targets/);
  assert.match(commandFlowDoc, /scripts\/commands\/beer-cli\.mjs/);
  assert.match(commandFlowDoc, /export function main|Representative snippet from/);
});

test("initializeKnowledgeBase prefers GitNexus evidence when provided and still uses local snippets", () => {
  const repoRoot = createSkillRepoFixture();
  const evidencePath = createGraphEvidenceFile(repoRoot);
  const outputRoot = path.join(repoRoot, ".beer", "knowledge-base");

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
  const graphDoc = fs.readFileSync(path.join(outputRoot, "critical-flows", "graph-routed-workflow.md"), "utf8");
  const readme = fs.readFileSync(path.join(outputRoot, "README.md"), "utf8");

  assert.equal(metadata.mode, "gitnexus-assisted");
  assert.equal(metadata.discovery.evidence_priority, "gitnexus-first");
  assert.equal(index.conventions.discovery_execution, "parallel-child-agents");
  assert.equal(index.conventions.evidence_priority, "gitnexus-first");
  assert.ok(index.entries.some((entry) => entry.file === "critical-flows/graph-routed-workflow.md"));
  assert.ok(index.task_index["change workflow routing"]);
  assert.match(graphDoc, /## Source Evidence/);
  assert.match(graphDoc, /## Representative Snippet/);
  assert.match(graphDoc, /## Verification Targets/);
  assert.match(graphDoc, /scripts\/commands\/beer-cli\.mjs/);
  assert.match(graphDoc, /export function main/);
  assert.match(readme, /Evidence priority: `GitNexus-first with local confirmation`/);
});
