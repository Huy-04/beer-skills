import { buildBeerPreflightReport } from "../commands/beer-preflight.mjs";
import { applyRepo, resolveRepoRoot as resolveOnboardRepoRoot } from "../commands/onboard-beer.mjs";
import { syncProjectSkills } from "./skill-sync.mjs";
import { installBeads, installGitNexus } from "./toolchain.mjs";

const INSTALLERS = {
  beads: installBeads,
  gitnexus: installGitNexus,
};

function renderInstallResult(result) {
  const lines = ["Beer Tool Install"];

  if (result.status === "completed") {
    lines.push(`${result.id}: installed`);
  } else if (result.status === "skipped") {
    lines.push(`${result.id}: skipped`);
    lines.push(`  Reason: ${result.reason}`);
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
    const repoRoot = resolveOnboardRepoRoot(args.repoRoot);
    applyRepo(repoRoot);
    const result = syncProjectSkills(repoRoot);

    const lines = ["Beer Project Install"];
    lines.push(`Target: ${repoRoot}`);
    lines.push("Project CLI: .beer/bin/beer.mjs");
    if (result.removed_skills.length) {
      lines.push(`Removed Beer skills before sync: ${result.removed_skills.length}`);
    }
    lines.push(`Installed ${result.skills.length} skill(s):`);
    for (const target of result.targets || []) {
      lines.push(`  ${target.label}: ${target.path}`);
    }
    lines.push("Repo instructions:");
    for (const file of result.instruction_sync.files) {
      lines.push(`  ${file.status === "created" ? "+" : "~"} ${file.name} (${file.block_status})`);
    }
    if (result.hook_sync) {
      lines.push(`Claude hooks: ${result.hook_sync.claude.status}`);
      lines.push(`Codex hooks: ${result.hook_sync.codex.status}`);
      lines.push(`Codex config: ${result.hook_sync.codex_config.status}`);
    }
    process.stdout.write(lines.join("\n") + "\n");
    return 0;
  }

  const installer = INSTALLERS[tool];
  if (!installer) {
    process.stdout.write(`Unknown tool: ${tool}\n`);
    process.stdout.write("Available tools: beads, gitnexus\n");
    process.stdout.write("Or run 'node .beer/bin/beer.mjs install' to install Beer into the current project.\n");
    return 1;
  }

  const preflight = buildBeerPreflightReport(resolveOnboardRepoRoot(args.repoRoot));
  const result = installer({
    dryRun: args.dryRunTools,
    alreadyInstalled: tool === "gitnexus" ? Boolean(preflight.available_tools.gitnexus) : false,
  });
  process.stdout.write(`${renderInstallResult(result)}\n`);

  return ["completed", "skipped"].includes(result.status) ? 0 : 1;
}
