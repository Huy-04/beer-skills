import { buildBeerPreflightReport } from "../commands/beer-preflight.mjs";
import { applyRepo, checkRepo, resolveRepoRoot as resolveOnboardRepoRoot } from "../commands/onboard-beer.mjs";

function renderRefreshResult(result) {
  const lines = [
    "Beer CLI Refresh",
    `Repo: ${result.repo_root}`,
    `Before: ${result.before.status}`,
    `Refresh: ${result.onboarding.status}`,
  ];

  if (result.before.actions?.length) {
    lines.push("Managed actions:");
    for (const action of result.before.actions) {
      lines.push(`- ${action}`);
    }
  }

  lines.push("");
  lines.push("Preflight:");
  lines.push(`- recommended mode: ${result.preflight.recommended_mode}`);
  lines.push(`- bd: ${result.preflight.available_tools.bd ? "OK" : "NO"}`);
  lines.push(`- GitNexus MCP: ${result.preflight.available_tools.gitnexus ? "OK" : "NO"}`);
  lines.push(`- GitNexus index: ${result.preflight.available_tools.gitnexus_index ? "OK" : "NO"}`);

  return lines.join("\n");
}

export async function runRefresh(args) {
  const repoRoot = resolveOnboardRepoRoot(args.repoRoot);
  const before = checkRepo(repoRoot);
  const onboarding = applyRepo(repoRoot);
  const preflight = buildBeerPreflightReport(repoRoot);
  const payload = {
    repo_root: repoRoot,
    before,
    onboarding,
    preflight,
  };

  process.stdout.write(
    args.json ? `${JSON.stringify(payload, null, 2)}\n` : `${renderRefreshResult(payload)}\n`,
  );

  return 0;
}
