import { buildBeerPreflightReport } from "../commands/beer-preflight.mjs";
import { resolveRepoRoot as resolveOnboardRepoRoot } from "../commands/onboard-beer.mjs";
import { installBeads, installGitNexus } from "./toolchain.mjs";

const INSTALLERS = {
  beads: installBeads,
  gitnexus: installGitNexus,
};

function renderInstallResult(result) {
  const lines = ["Beer Tool Install"];

  if (result.status === "completed") {
    lines.push(`${result.id}: installed`);
  } else if (result.status === "manual_required") {
    lines.push(`${result.id}: manual required`);
    lines.push(`  Command: ${result.installer_command}`);
    lines.push(`  Reason: ${result.reason}`);
  } else if (result.status === "failed") {
    lines.push(`${result.id}: failed`);
    lines.push(`  Reason: ${result.reason}`);
  } else if (result.status === "dry_run") {
    lines.push(`${result.id}: dry run`);
    lines.push(`  Command: ${result.installer_command}`);
  } else {
    lines.push(`${result.id}: unknown status (${result.status})`);
  }

  return lines.join("\n");
}

export async function runInstall(args) {
  const tool = args.tool;
  if (!tool) {
    process.stdout.write("Usage: beer-skills install <tool>\n");
    process.stdout.write("Available tools: beads, gitnexus\n");
    return 1;
  }

  const installer = INSTALLERS[tool];
  if (!installer) {
    process.stdout.write(`Unknown tool: ${tool}\n`);
    process.stdout.write("Available tools: beads, gitnexus\n");
    return 1;
  }

  const result = installer({ dryRun: args.dryRunTools });
  process.stdout.write(`${renderInstallResult(result)}\n`);

  return result.status === "completed" ? 0 : 1;
}
