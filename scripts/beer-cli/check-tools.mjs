import { buildBeerPreflightReport } from "../commands/beer-preflight.mjs";
import { resolveRepoRoot as resolveOnboardRepoRoot } from "../commands/onboard-beer.mjs";

function renderCheckToolsReport(result) {
  const lines = [
    "Beer Tool Check",
    `Repo: ${result.repo_root}`,
    "",
    "Installed tools:",
  ];

  const tools = result.preflight.available_tools;
  const installed = [];
  const missing = [];

  if (tools.bd) installed.push("bd");
  else missing.push("bd");

  if (tools.gitnexus) installed.push("GitNexus MCP");
  else missing.push("GitNexus MCP");

  if (tools.gitnexus_index) installed.push("GitNexus index");
  else missing.push("GitNexus index");

  for (const tool of installed) {
    lines.push(`  ${tool}: OK`);
  }

  if (missing.length > 0) {
    lines.push("");
    lines.push("Missing tools:");
    for (const tool of missing) {
      lines.push(`  ${tool}: NO`);
    }
  }

  lines.push("");
  lines.push(`Workflow: ${result.preflight.workflow_status}`);
  lines.push(`Recommended orchestration: ${result.preflight.recommended_orchestration_strategy}`);

  return lines.join("\n");
}

export async function runCheckTools(args) {
  const repoRoot = resolveOnboardRepoRoot(args.repoRoot);
  const preflight = buildBeerPreflightReport(repoRoot);
  const payload = {
    repo_root: repoRoot,
    preflight,
  };

  process.stdout.write(
    args.json ? `${JSON.stringify(payload, null, 2)}\n` : `${renderCheckToolsReport(payload)}\n`,
  );

  return preflight.workflow_status === "ready" ? 0 : 1;
}
