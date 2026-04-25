import readline from "node:readline/promises";

import { removeRepo, resolveRepoRoot as resolveOnboardRepoRoot } from "../commands/onboard-beer.mjs";

async function confirmRemoval(repoRoot, args) {
  if (args.yes) {
    return true;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("beer uninstall requires --yes in non-interactive mode.");
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = (await rl.question(`Remove Beer from ${repoRoot}? This deletes .beer/. [y/n]: `))
      .trim()
      .toLowerCase();
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}

function renderUninstallResult(result) {
  const lines = [
    "Beer CLI Uninstall",
    `Repo: ${result.repo_root}`,
  ];

    if (result.status === "removed") {
    lines.push("Status: removed");
    lines.push("Removed: .beer");
    if (result.removed_skills?.length) {
      lines.push(`Removed skills: ${result.removed_skills.length}`);
      for (const name of result.removed_skills) {
        lines.push(`  - ${name}`);
      }
    }
    for (const target of result.removed_skill_targets || []) {
      if (target.removed.length > 0) {
        lines.push(`Removed from ${target.label}: ${target.removed.length}`);
      }
    }
    const changedGuidelines = result.removed_guidelines?.filter(
      (file) => file.status === "removed" || file.status === "updated",
    ) || [];
    if (changedGuidelines.length) {
      lines.push("Updated repo instructions:");
      for (const file of changedGuidelines) {
        lines.push(`  - ${file.name}: ${file.status}`);
      }
    }
    if (["removed", "updated"].includes(result.removed_hooks?.status)) {
      lines.push(`Claude hooks: ${result.removed_hooks.status}`);
    }
    if (["removed", "updated"].includes(result.removed_codex_hooks?.status)) {
      lines.push(`Codex hooks: ${result.removed_codex_hooks.status}`);
    }
    if (["removed", "updated"].includes(result.removed_codex_config?.status)) {
      lines.push(`Codex config: ${result.removed_codex_config.status}`);
    }
  } else if (result.status === "not_installed") {
    lines.push("Status: not installed");
    lines.push("Nothing to remove.");
  } else if (result.status === "cancelled") {
    lines.push("Status: cancelled");
    lines.push("Nothing changed.");
  }

  return lines.join("\n");
}

export async function runUninstall(args) {
  const repoRoot = resolveOnboardRepoRoot(args.repoRoot);

  let confirmed;
  try {
    confirmed = await confirmRemoval(repoRoot, args);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }

  const payload = confirmed
    ? removeRepo(repoRoot)
    : {
        repo_root: repoRoot,
        removed: false,
        status: "cancelled",
        managed_root: ".beer",
      };

  process.stdout.write(
    args.json ? `${JSON.stringify(payload, null, 2)}\n` : `${renderUninstallResult(payload)}\n`,
  );

  return payload.status === "cancelled" ? 1 : 0;
}
