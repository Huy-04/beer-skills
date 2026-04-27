import { buildBeerPreflightReport } from "../commands/beer-preflight.mjs";
import { applyRepo, checkRepo, resolveRepoRoot as resolveOnboardRepoRoot } from "../commands/onboard-beer.mjs";
import { syncProjectSkills } from "./skill-sync.mjs";

function renderUpdateResult(result) {
  const lines = [
    "Beer Project Update",
    `Repo: ${result.repo_root}`,
    `Before: ${result.before.status}`,
    `Update: ${result.onboarding.status}`,
    "Project CLI: .beer/bin/beer.mjs",
  ];

  if (result.skill_install) {
    lines.push(`Skills synced: ${result.skill_install.skills.length}`);
    if (result.skill_install.removed_skills?.length) {
      lines.push(`Removed old Beer skills: ${result.skill_install.removed_skills.length}`);
    }
    for (const target of result.skill_install.targets || []) {
      lines.push(`- ${target.label}: ${target.skills.length} skill(s)`);
    }
    for (const file of result.skill_install.instruction_sync?.files || []) {
      lines.push(`- ${file.name}: ${file.status}/${file.block_status}`);
    }
    if (result.skill_install.hook_sync) {
      lines.push(`- Claude hooks: ${result.skill_install.hook_sync.claude.status}`);
      lines.push(`- Codex hooks: ${result.skill_install.hook_sync.codex.status}`);
      lines.push(`- Codex config: ${result.skill_install.hook_sync.codex_config.status}`);
    }
  }

  lines.push("");
  lines.push("Preflight:");
  lines.push(`- workflow: ${result.preflight.workflow_status}`);
  lines.push(`- recommended orchestration: ${result.preflight.recommended_orchestration_strategy}`);
  lines.push(`- bd: ${result.preflight.available_tools.bd ? "OK" : "NO"}`);
  lines.push(`- GitNexus MCP: ${result.preflight.available_tools.gitnexus ? "OK" : "NO"}`);
  lines.push(`- GitNexus index: ${result.preflight.available_tools.gitnexus_index ? "OK" : "NO"}`);

  return lines.join("\n");
}

export async function runUpdate(args) {
  const repoRoot = resolveOnboardRepoRoot(args.repoRoot);
  const before = checkRepo(repoRoot);
  const onboarding = applyRepo(repoRoot);
  const skillInstall = syncProjectSkills(repoRoot);
  const preflight = buildBeerPreflightReport(repoRoot);
  const payload = {
    repo_root: repoRoot,
    before,
    onboarding,
    skill_install: skillInstall,
    preflight,
  };

  process.stdout.write(
    args.json ? `${JSON.stringify(payload, null, 2)}\n` : `${renderUpdateResult(payload)}\n`,
  );

  return 0;
}
