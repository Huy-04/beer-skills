import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  collectMcpSources,
  defaultCommandProbe,
  formatPluginSkillName,
  listSkillDeclarationFiles,
  parseSkillFile,
  probeDependency,
  resolveSkillsRoot,
} from "../beer-dependencies/core.mjs";

export {
  collectMcpSources,
  defaultCommandProbe,
  formatPluginSkillName,
  listSkillDeclarationFiles,
  parseSkillFile,
  probeDependency,
  resolveSkillsRoot,
} from "../beer-dependencies/core.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);

function summarizeSkillStatus(probedDependencies) {
  const missing = probedDependencies.filter((dependency) => !dependency.available);
  if (missing.length === 0) {
    return "available";
  }
  const unavailable = missing.some((dependency) => dependency.missing_effect === "unavailable");
  return unavailable ? "unavailable" : "degraded";
}

function aggregateMissingDependencies(skills) {
  const byKey = new Map();

  for (const skill of skills) {
    for (const dependency of skill.missing_dependencies) {
      const target =
        Array.isArray(dependency.target) && dependency.target.length > 0
          ? dependency.target.join(",")
          : String(dependency.target ?? "");
      const key = `${dependency.id}|${dependency.kind}|${target}`;

      if (!byKey.has(key)) {
        byKey.set(key, {
          id: dependency.id,
          kind: dependency.kind,
          target: dependency.target,
          required_by: [],
          missing_effects: [],
        });
      }

      const aggregate = byKey.get(key);
      aggregate.required_by.push(skill.skill_name);
      if (!aggregate.missing_effects.includes(dependency.missing_effect)) {
        aggregate.missing_effects.push(dependency.missing_effect);
      }
    }
  }

  return [...byKey.values()].sort((left, right) => left.id.localeCompare(right.id));
}

export function collectBeerSkillDependencies(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const skillsRoot = resolveSkillsRoot(repoRoot, options.skillsRoot);
  const files = listSkillDeclarationFiles(skillsRoot);

  const declarations = [];
  for (const filePath of files) {
    const parsed = parseSkillFile(filePath);
    if (!parsed) {
      continue;
    }

    declarations.push({
      ...parsed,
      skill_file: path.relative(repoRoot, parsed.skill_file),
    });
  }

  return declarations.sort((left, right) => left.skill_name.localeCompare(right.skill_name));
}

function getCoverageStatus(declaration) {
  if (declaration.dependencies_declared && declaration.dependencies.length === 0) {
    return "dependency_free";
  }
  if (declaration.dependencies.length > 0) {
    return "declared_dependencies";
  }
  return "uncovered";
}

function buildSkillCatalog(declarations) {
  const catalog = new Set();

  for (const declaration of declarations) {
    const skillName = declaration.skill_name || "";
    if (!skillName) {
      continue;
    }

    catalog.add(skillName);
    if (skillName.startsWith("beer:")) {
      catalog.add(skillName.slice("beer:".length));
    }
  }

  return catalog;
}

export function buildBeerDependencyReport(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const skillsRoot = resolveSkillsRoot(repoRoot, options.skillsRoot);
  const declarations = collectBeerSkillDependencies({ repoRoot, skillsRoot });
  const commandProbe = options.commandProbe || defaultCommandProbe;
  const skillCatalog = buildSkillCatalog(declarations);
  const mcpSources = collectMcpSources({
    repoRoot,
    skillsRoot,
    globalCodexConfigPath: options.globalCodexConfigPath,
  });

  const skills = declarations.map((declaration) => {
    const coverageStatus = getCoverageStatus(declaration);
    const dependencies = declaration.dependencies.map((dependency) =>
      probeDependency(dependency, {
        commandProbe,
        mcpSources,
        skillCatalog,
      }),
    );
    const status = coverageStatus === "uncovered" ? "uncovered" : summarizeSkillStatus(dependencies);
    const missingDependencies = dependencies.filter((dependency) => !dependency.available);
    return {
      skill_name: declaration.skill_name,
      skill_file: declaration.skill_file,
      coverage_status: coverageStatus,
      status,
      dependencies,
      missing_dependencies: missingDependencies,
    };
  });

  const missingDependencies = aggregateMissingDependencies(skills);
  const uncoveredSkills = skills
    .filter((skill) => skill.coverage_status === "uncovered")
    .map((skill) => ({
      skill_name: skill.skill_name,
      skill_file: skill.skill_file,
    }));
  const summary = {
    skills_total: skills.length,
    skills_covered: skills.filter((skill) => skill.coverage_status !== "uncovered").length,
    skills_with_declared_dependencies: skills.filter(
      (skill) => skill.coverage_status === "declared_dependencies",
    ).length,
    skills_dependency_free: skills.filter((skill) => skill.coverage_status === "dependency_free")
      .length,
    skills_uncovered: uncoveredSkills.length,
    skills_available: skills.filter((skill) => skill.status === "available").length,
    skills_degraded: skills.filter((skill) => skill.status === "degraded").length,
    skills_unavailable: skills.filter((skill) => skill.status === "unavailable").length,
    declared_dependencies: skills.reduce((count, skill) => count + skill.dependencies.length, 0),
    missing_dependencies: missingDependencies.length,
  };

  return {
    checked_at: new Date().toISOString(),
    summary,
    skills,
    uncovered_skills: uncoveredSkills,
    missing_dependencies: missingDependencies,
    mcp_sources: mcpSources.map((source) => ({
      key: source.key,
      type: source.type,
      path: path.relative(repoRoot, source.path),
      server_names: source.server_names,
      exists: fs.existsSync(source.path),
    })),
  };
}

export function renderBeerDependencyReport(report) {
  const lines = [
    "Beer Dependency Report",
    `Checked: ${report.checked_at}`,
    "",
    "Summary:",
    `- Skills found: ${report.summary.skills_total}`,
    `- Covered: ${report.summary.skills_covered}`,
    `- Available: ${report.summary.skills_available}`,
    `- Degraded: ${report.summary.skills_degraded}`,
    `- Unavailable: ${report.summary.skills_unavailable}`,
    `- Uncovered: ${report.summary.skills_uncovered}`,
    `- Missing dependency groups: ${report.summary.missing_dependencies}`,
  ];

  if (report.uncovered_skills.length > 0) {
    lines.push("", "Uncovered skills:");
    for (const skill of report.uncovered_skills) {
      lines.push(`- ${skill.skill_name} (${skill.skill_file})`);
    }
  }

  if (report.missing_dependencies.length > 0) {
    lines.push("", "Missing dependencies:");
    for (const dependency of report.missing_dependencies) {
      const target = Array.isArray(dependency.target)
        ? dependency.target.join(", ")
        : String(dependency.target ?? "");
      lines.push(
        `- ${dependency.id} [${dependency.kind}] -> ${target} (required by: ${dependency.required_by.join(", ")})`,
      );
    }
  }

  const degradedOrUnavailable = report.skills.filter(
    (skill) => skill.status === "degraded" || skill.status === "unavailable",
  );
  if (degradedOrUnavailable.length > 0) {
    lines.push("", "Skills needing attention:");
    for (const skill of degradedOrUnavailable) {
      const missing = skill.missing_dependencies.map((dependency) => dependency.id).join(", ");
      lines.push(`- ${skill.skill_name}: ${skill.status} (${missing})`);
    }
  }

  return lines.join("\n");
}

function parseCliArgs(argv) {
  const args = {
    json: false,
    repoRoot: undefined,
    skillsRoot: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") {
      args.json = true;
      continue;
    }
    if (arg === "--repo-root") {
      args.repoRoot = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--repo-root=")) {
      args.repoRoot = arg.slice("--repo-root=".length);
      continue;
    }
    if (arg === "--skills-root") {
      args.skillsRoot = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--skills-root=")) {
      args.skillsRoot = arg.slice("--skills-root=".length);
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write([
        "Usage: beer-dependencies.mjs [--repo-root <path>] [--skills-root <path>] [--json]",
        "",
        "Reports dependency coverage and availability for Beer skills.",
      ].join("\n"));
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  const report = buildBeerDependencyReport({
    repoRoot: args.repoRoot,
    skillsRoot: args.skillsRoot,
  });

  process.stdout.write(
    args.json
      ? `${JSON.stringify(report, null, 2)}\n`
      : `${renderBeerDependencyReport(report)}\n`,
  );
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
