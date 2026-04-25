import readline from "node:readline/promises";

import { buildBeerPreflightReport } from "../commands/beer-preflight.mjs";
import { applyRepo, resolveRepoRoot as resolveOnboardRepoRoot } from "../commands/onboard-beer.mjs";
import { installBeads, installGitNexus } from "./toolchain.mjs";
import { syncProjectSkills } from "./install.mjs";

async function askYesNo(rl, question) {
  const answer = (await rl.question(question)).trim().toLowerCase();
  return answer === "y" || answer === "yes";
}

function renderInitResult(result) {
  const lines = [
    "Beer CLI Init",
    `Repo: ${result.repo_root}`,
    `Onboarding: ${result.onboarding.status}`,
  ];

  if (result.skill_install) {
    lines.push(`Skills: ${result.skill_install.skills.length} skill(s) installed`);
    for (const skill of result.skill_install.skills) {
      lines.push(`  ${skill.status === "created" ? "+" : "~"} ${skill.name}`);
    }
  }

  if (result.tool_install) {
    lines.push(`Tool install: ${result.tool_install.status}`);
    for (const step of result.tool_install.steps || []) {
      lines.push(`- ${step.id}: ${step.status}`);
      if (step.reason) {
        lines.push(`  Reason: ${step.reason}`);
      }
      if (step.status !== "completed" && step.installer_command) {
        lines.push(`  Command: ${step.installer_command}`);
      }
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

export async function runInit(args) {
  const repoRoot = resolveOnboardRepoRoot(args.repoRoot);
  const onboarding = applyRepo(repoRoot);
  const skillInstall = syncProjectSkills(repoRoot);
  let preflight = buildBeerPreflightReport(repoRoot);
  let toolInstall = null;
  const gitNexusAlreadyInstalled = Boolean(preflight.available_tools.gitnexus);

  if (!args.json && process.stdin.isTTY && process.stdout.isTTY) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      const wantInstall = await askYesNo(
        rl,
        "\nInstall the full Beer toolchain now? This includes GitNexus. [y/n]: ",
      );
      if (wantInstall) {
        const gitNexusResult = installGitNexus({
          alreadyInstalled: gitNexusAlreadyInstalled,
        });
        const beadsResult = installBeads();
        toolInstall = {
          status:
            ["completed", "skipped"].includes(gitNexusResult.status) &&
              ["completed", "skipped"].includes(beadsResult.status)
              ? "completed"
              : "failed",
          steps: [gitNexusResult, beadsResult],
        };
        preflight = buildBeerPreflightReport(repoRoot);
      }
    } finally {
      rl.close();
    }
  }

  const payload = {
    repo_root: repoRoot,
    onboarding,
    skill_install: skillInstall,
    tool_install: toolInstall,
    preflight,
  };

  process.stdout.write(
    args.json ? `${JSON.stringify(payload, null, 2)}\n` : `${renderInitResult(payload)}\n`,
  );

  if (toolInstall && toolInstall.status === "failed") {
    return 1;
  }

  return 0;
}
