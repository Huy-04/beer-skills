import {
  buildBeerSelfUpdateCommand,
  resolveCommand,
  runToolchainCommand,
} from "./toolchain.mjs";
import { resolveRepoRoot as resolveOnboardRepoRoot } from "../commands/onboard-beer.mjs";
import { syncProjectSkills } from "./skill-sync.mjs";

function renderUpdateResult(result) {
  const lines = ["Beer CLI Update"];

  if (result.status === "completed") {
    lines.push("beer-skills: updated");
    if (result.skill_install) {
      lines.push(`repo sync: ${result.skill_install.skills.length} skill(s) refreshed`);
      if (result.skill_install.removed_skills?.length) {
        lines.push(`  removed old Beer skills: ${result.skill_install.removed_skills.length}`);
      }
      for (const target of result.skill_install.targets || []) {
        lines.push(`  ${target.label}: ${target.skills.length} skill(s)`);
      }
      for (const file of result.skill_install.instruction_sync?.files || []) {
        lines.push(`  ${file.name}: ${file.status}/${file.block_status}`);
      }
      if (result.skill_install.hook_sync) {
        lines.push(`  Claude hooks: ${result.skill_install.hook_sync.claude.status}`);
        lines.push(`  Codex hooks: ${result.skill_install.hook_sync.codex.status}`);
        lines.push(`  Codex config: ${result.skill_install.hook_sync.codex_config.status}`);
      }
    }
  } else if (result.status === "manual_required" || result.status === "dry_run") {
    lines.push(`beer-skills: ${result.status === "dry_run" ? "dry run" : "manual required"}`);
    lines.push(`  Command: ${result.installer_command}`);
    if (result.reason) {
      lines.push(`  Reason: ${result.reason}`);
    }
  } else {
    lines.push("beer-skills: failed");
    if (result.reason) {
      lines.push(`  Reason: ${result.reason}`);
    }
  }

  return lines.join("\n");
}

export async function runUpdate(args) {
  const npmPath = resolveCommand("npm");
  const updateCommand = buildBeerSelfUpdateCommand();
  const repoRoot = resolveOnboardRepoRoot(args.repoRoot);

  if (!npmPath) {
    const result = {
      id: "beer-skills",
      status: "manual_required",
      installer_command: updateCommand,
      reason: "Beer update requires npm on PATH.",
    };
    process.stdout.write(`${renderUpdateResult(result)}\n`);
    return 1;
  }

  try {
    runToolchainCommand(npmPath, ["install", "-g", "github:Huy-04/beer-skills"]);
    const skillInstall = syncProjectSkills(repoRoot);
    process.stdout.write(
      `${renderUpdateResult({ id: "beer-skills", status: "completed", skill_install: skillInstall })}\n`,
    );
    return 0;
  } catch (error) {
    const result = {
      id: "beer-skills",
      status: "failed",
      installer_command: updateCommand,
      reason: error instanceof Error ? error.message : String(error),
    };
    process.stdout.write(`${renderUpdateResult(result)}\n`);
    return 1;
  }
}
