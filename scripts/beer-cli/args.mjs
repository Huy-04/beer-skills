export function parseCliArgs(argv) {
  const args = {
    command: "help",
    subcommand: "",
    approval: "",
    repoRoot: undefined,
    apply: false,
    json: false,
    route: undefined,
    request: "",
    risk: undefined,
    runStyle: undefined,
    gate: undefined,
    role: undefined,
    taskKind: undefined,
    tool: undefined,
    yes: false,
    dryRunTools: false,
    global: false,
    all: false,
    paths: [],
    trivial: false,
    knowledgeBase: "",
  };

  const remaining = [...argv];
  const first = remaining.shift();
  if (first && !first.startsWith("-")) {
      args.command = first;
    }
  if (args.command === "claude" && remaining.length > 0 && !remaining[0].startsWith("-")) {
    args.subcommand = remaining.shift();
  }
  if (args.command === "approve" && remaining.length > 0 && !remaining[0].startsWith("-")) {
    args.approval = remaining.shift();
  }
  if ((args.command === "install" || args.command === "flow-guard") && remaining.length > 0 && !remaining[0].startsWith("-")) {
    args.tool = remaining.shift();
  }
  for (let index = 0; index < remaining.length; index += 1) {
    const arg = remaining[index];
    if (arg === "--repo-root") {
      args.repoRoot = remaining[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--repo-root=")) {
      args.repoRoot = arg.slice("--repo-root=".length);
      continue;
    }
    if (arg === "--json") {
      args.json = true;
      continue;
    }
    if (arg === "--apply") {
      args.apply = true;
      continue;
    }
    if (arg === "--route") {
      args.route = remaining[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--route=")) {
      args.route = arg.slice("--route=".length);
      continue;
    }
    if (arg === "--yes" || arg === "-y") {
      args.yes = true;
      continue;
    }
    if (arg === "--dry-run-tools") {
      args.dryRunTools = true;
      continue;
    }
    if (arg === "--path") {
      args.paths.push(remaining[index + 1] || "");
      index += 1;
      continue;
    }
    if (arg.startsWith("--path=")) {
      args.paths.push(arg.slice("--path=".length));
      continue;
    }
    if (arg === "--trivial") {
      args.trivial = true;
      continue;
    }
    if (arg === "--knowledge-base") {
      args.knowledgeBase = remaining[index + 1] || "";
      index += 1;
      continue;
    }
    if (arg.startsWith("--knowledge-base=")) {
      args.knowledgeBase = arg.slice("--knowledge-base=".length);
      continue;
    }
    if (arg === "--global") {
      args.global = true;
      continue;
    }
    if (arg === "--all") {
      args.all = true;
      continue;
    }
    if (arg === "--request") {
      args.request = remaining[index + 1] || "";
      index += 1;
      continue;
    }
    if (arg.startsWith("--request=")) {
      args.request = arg.slice("--request=".length);
      continue;
    }
    if (arg === "--risk") {
      args.risk = remaining[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--risk=")) {
      args.risk = arg.slice("--risk=".length);
      continue;
    }
    if (arg === "--run-style") {
      args.runStyle = remaining[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--run-style=")) {
      args.runStyle = arg.slice("--run-style=".length);
      continue;
    }
    if (arg === "--gate") {
      args.gate = remaining[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--gate=")) {
      args.gate = arg.slice("--gate=".length);
      continue;
    }
    if (arg === "--role") {
      args.role = remaining[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--role=")) {
      args.role = arg.slice("--role=".length);
      continue;
    }
    if (arg === "--task-kind") {
      args.taskKind = remaining[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--task-kind=")) {
      args.taskKind = arg.slice("--task-kind=".length);
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      args.command = "help";
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}
