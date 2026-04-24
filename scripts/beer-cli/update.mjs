import {
  buildBeerSelfUpdateCommand,
  resolveCommand,
  runToolchainCommand,
} from "./toolchain.mjs";

function renderUpdateResult(result) {
  const lines = ["Beer CLI Update"];

  if (result.status === "completed") {
    lines.push("beer-skills: updated");
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
    process.stdout.write(`${renderUpdateResult({ id: "beer-skills", status: "completed" })}\n`);
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
