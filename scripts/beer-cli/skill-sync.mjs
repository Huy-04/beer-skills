import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTMATTER_PATTERN = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const MANAGED_BLOCK_START = "<!-- beer-agent-guidelines:start -->";
const MANAGED_BLOCK_END = "<!-- beer-agent-guidelines:end -->";
const MANAGED_BLOCK_PATTERN = new RegExp(
  `${MANAGED_BLOCK_START}[\\s\\S]*?${MANAGED_BLOCK_END}\\s*`,
  "m",
);

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const INSTALL_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..");
const PACKAGED_SKILLS_ROOT = path.join(INSTALL_ROOT, "skills");
const AGENT_GUIDELINES_REFERENCE_ROOT = path.join(
  PACKAGED_SKILLS_ROOT,
  "support",
  "beer-agent-guidelines",
  "references",
);

const GUIDELINE_FILES = [
  {
    fileName: "CLAUDE.md",
    templatePath: path.join(AGENT_GUIDELINES_REFERENCE_ROOT, "claude-template.md"),
  },
  {
    fileName: "AGENTS.md",
    templatePath: path.join(AGENT_GUIDELINES_REFERENCE_ROOT, "agents-template.md"),
  },
];

const SKILL_INSTALL_TARGETS = [
  {
    id: "claude",
    label: "Claude Code",
    relativeDir: path.join(".claude", "skills"),
  },
  {
    id: "codex",
    label: "Codex",
    relativeDir: path.join(".agents", "skills"),
  },
];

const CLAUDE_SETTINGS_FILE = path.join(".claude", "settings.json");
const CODEX_CONFIG_FILE = path.join(".codex", "config.toml");
const CODEX_HOOKS_FILE = path.join(".codex", "hooks.json");
const CODEX_HOOKS_FEATURE_START = "# beer-codex-hooks:start";
const CODEX_HOOKS_FEATURE_END = "# beer-codex-hooks:end";
const CODEX_HOOKS_FEATURE_PATTERN =
  /# beer-codex-hooks:start([^\r\n]*)\r?\n[\s\S]*?# beer-codex-hooks:end\s*\r?\n?/m;
const MANAGED_BEER_HOOK_COMMAND_PATTERN = /[\\\/]+\.beer[\\\/]+scripts[\\\/]+hooks[\\\/]+beer-[^"']+\.mjs["']?$/;

const BEER_HOOK_SPECS = [
  {
    eventName: "PreToolUse",
    matcher: "Edit|MultiEdit|Write",
    hook: {
      type: "command",
      command: "node \"$CLAUDE_PROJECT_DIR/.beer/scripts/hooks/beer-pre-edit-hook.mjs\"",
      timeout: 30,
    },
  },
  {
    eventName: "Stop",
    hook: {
      type: "command",
      command: "node \"$CLAUDE_PROJECT_DIR/.beer/scripts/hooks/beer-closeout-hook.mjs\"",
      timeout: 30,
    },
  },
];

function buildCodexHookSpecs(repoRoot) {
  const hookRoot = path.join(repoRoot, ".beer", "scripts", "hooks");
  return [
    {
      eventName: "PreToolUse",
      matcher: "Edit|Write",
      hook: {
        type: "command",
        command: `node "${path.join(hookRoot, "beer-pre-edit-hook.mjs")}"`,
        timeout: 30,
        statusMessage: "Checking Beer flow lock",
      },
    },
    {
      eventName: "Stop",
      hook: {
        type: "command",
        command: `node "${path.join(hookRoot, "beer-closeout-hook.mjs")}"`,
        timeout: 30,
        statusMessage: "Checking Beer closeout guard",
      },
    },
  ];
}

function copyDirRecursive(source, target) {
  const entries = fs.readdirSync(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyDirRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function findSkillDirectories(root) {
  const skills = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      if (fs.existsSync(path.join(fullPath, "SKILL.md"))) {
        skills.push({
          name: entry.name,
          sourcePath: fullPath,
        });
      } else {
        walk(fullPath);
      }
    }
  }

  walk(root);
  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

function stripFrontmatter(markdownText) {
  return markdownText.replace(FRONTMATTER_PATTERN, "").trim();
}

function buildManagedBlock(templateText) {
  return [
    MANAGED_BLOCK_START,
    stripFrontmatter(templateText),
    MANAGED_BLOCK_END,
  ].join("\n");
}

function upsertManagedBlock(existingText, blockText) {
  const trimmedExisting = existingText.trim();
  if (!trimmedExisting) {
    return {
      content: `${blockText}\n`,
      block_status: "created",
      file_status: "created",
    };
  }

  if (MANAGED_BLOCK_PATTERN.test(existingText)) {
    const replaced = existingText.replace(MANAGED_BLOCK_PATTERN, `${blockText}\n`);
    return {
      content: replaced.endsWith("\n") ? replaced : `${replaced}\n`,
      block_status: "replaced",
      file_status: "updated",
    };
  }

  const separator = existingText.endsWith("\n") ? "\n" : "\n\n";
  return {
    content: `${existingText}${separator}${blockText}\n`,
    block_status: "added",
    file_status: "updated",
  };
}

function removeManagedBlock(existingText) {
  if (!MANAGED_BLOCK_PATTERN.test(existingText)) {
    return {
      changed: false,
      content: existingText,
    };
  }

  const withoutBlock = existingText.replace(MANAGED_BLOCK_PATTERN, "").trim();
  return {
    changed: true,
    content: withoutBlock ? `${withoutBlock}\n` : "",
  };
}

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeHookGroups(value) {
  return Array.isArray(value)
    ? value.filter((group) => group && typeof group === "object" && !Array.isArray(group))
    : [];
}

function normalizeHookHandlers(value) {
  return Array.isArray(value)
    ? value.filter((hook) => hook && typeof hook === "object" && !Array.isArray(hook))
    : [];
}

function isManagedBeerHook(handler) {
  if (!handler || typeof handler !== "object" || Array.isArray(handler)) {
    return false;
  }

  return typeof handler.command === "string" &&
    MANAGED_BEER_HOOK_COMMAND_PATTERN.test(handler.command);
}

function isManagedBeerCodexHook(handler) {
  if (!handler || typeof handler !== "object" || Array.isArray(handler)) {
    return false;
  }

  return typeof handler.command === "string" &&
    MANAGED_BEER_HOOK_COMMAND_PATTERN.test(handler.command);
}

function stripManagedBeerHooks(settings) {
  const hooks = settings.hooks && typeof settings.hooks === "object" && !Array.isArray(settings.hooks)
    ? settings.hooks
    : {};
  const nextHooks = {};

  for (const [eventName, groupsValue] of Object.entries(hooks)) {
    const nextGroups = [];
    for (const group of normalizeHookGroups(groupsValue)) {
      const nextHandlers = normalizeHookHandlers(group.hooks).filter((handler) => !isManagedBeerHook(handler));
      if (nextHandlers.length > 0) {
        nextGroups.push({
          ...group,
          hooks: nextHandlers,
        });
      }
    }
    if (nextGroups.length > 0) {
      nextHooks[eventName] = nextGroups;
    }
  }

  const nextSettings = { ...settings };
  if (Object.keys(nextHooks).length > 0) {
    nextSettings.hooks = nextHooks;
  } else {
    delete nextSettings.hooks;
  }
  return nextSettings;
}

function upsertManagedBeerHooks(settings) {
  const base = stripManagedBeerHooks(settings);
  const nextHooks = base.hooks && typeof base.hooks === "object" && !Array.isArray(base.hooks)
    ? { ...base.hooks }
    : {};

  for (const spec of BEER_HOOK_SPECS) {
    const groups = normalizeHookGroups(nextHooks[spec.eventName]);
    groups.push({
      ...(spec.matcher ? { matcher: spec.matcher } : {}),
      hooks: [{ ...spec.hook }],
    });
    nextHooks[spec.eventName] = groups;
  }

  return {
    ...base,
    hooks: nextHooks,
  };
}

function stripManagedBeerCodexHooks(settings) {
  const hooks = settings.hooks && typeof settings.hooks === "object" && !Array.isArray(settings.hooks)
    ? settings.hooks
    : {};
  const nextHooks = {};

  for (const [eventName, groupsValue] of Object.entries(hooks)) {
    const nextGroups = [];
    for (const group of normalizeHookGroups(groupsValue)) {
      const nextHandlers = normalizeHookHandlers(group.hooks).filter((handler) => !isManagedBeerCodexHook(handler));
      if (nextHandlers.length > 0) {
        nextGroups.push({
          ...group,
          hooks: nextHandlers,
        });
      }
    }
    if (nextGroups.length > 0) {
      nextHooks[eventName] = nextGroups;
    }
  }

  const nextSettings = { ...settings };
  if (Object.keys(nextHooks).length > 0) {
    nextSettings.hooks = nextHooks;
  } else {
    delete nextSettings.hooks;
  }
  return nextSettings;
}

function upsertManagedBeerCodexHooks(settings, repoRoot) {
  const base = stripManagedBeerCodexHooks(settings);
  const nextHooks = base.hooks && typeof base.hooks === "object" && !Array.isArray(base.hooks)
    ? { ...base.hooks }
    : {};

  for (const spec of buildCodexHookSpecs(repoRoot)) {
    const groups = normalizeHookGroups(nextHooks[spec.eventName]);
    groups.push({
      ...(spec.matcher ? { matcher: spec.matcher } : {}),
      hooks: [{ ...spec.hook }],
    });
    nextHooks[spec.eventName] = groups;
  }

  return {
    ...base,
    hooks: nextHooks,
  };
}

function writeJsonFile(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function parseManagedCodexFeatureMetadata(metaText = "") {
  const metadata = {};
  for (const part of String(metaText).trim().split(/\s+/).filter(Boolean)) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }
    const key = part.slice(0, separatorIndex);
    const value = part.slice(separatorIndex + 1);
    metadata[key] = value;
  }
  return metadata;
}

function stripManagedCodexFeatureBlock(existingText, options = {}) {
  const match = existingText.match(CODEX_HOOKS_FEATURE_PATTERN);
  if (!match) {
    return {
      changed: false,
      content: existingText,
    };
  }

  const metadata = parseManagedCodexFeatureMetadata(match[1]);
  const restorePrevious = options.restorePrevious &&
    metadata.mode === "replace" &&
    ["true", "false"].includes(metadata.previous);
  const replacement = restorePrevious ? `codex_hooks = ${metadata.previous}\n` : "";
  const nextContent = existingText.replace(match[0], replacement);
  return {
    changed: true,
    content: nextContent,
    metadata,
  };
}

function findFeaturesSectionRange(configText) {
  const tableMatch = configText.match(/^\[features\]\s*$/m);
  if (!tableMatch || typeof tableMatch.index !== "number") {
    return null;
  }

  const tableStart = tableMatch.index;
  const lineBreakIndex = configText.indexOf("\n", tableStart);
  const contentStart = lineBreakIndex === -1 ? configText.length : lineBreakIndex + 1;
  const nextTableMatch = configText.slice(contentStart).match(/^\[[^\]]+\]\s*$/m);
  const sectionEnd = nextTableMatch && typeof nextTableMatch.index === "number"
    ? contentStart + nextTableMatch.index
    : configText.length;

  return {
    start: tableStart,
    contentStart,
    end: sectionEnd,
    sectionText: configText.slice(tableStart, sectionEnd),
  };
}

function buildManagedCodexFeatureBlock(mode, previousValue = "") {
  const metaParts = [`mode=${mode}`];
  if (mode === "replace" && previousValue) {
    metaParts.push(`previous=${previousValue}`);
  }

  return [
    `${CODEX_HOOKS_FEATURE_START} ${metaParts.join(" ")}`.trim(),
    "codex_hooks = true",
    CODEX_HOOKS_FEATURE_END,
  ].join("\n");
}

function upsertManagedCodexConfigText(existingText) {
  const withoutManaged = stripManagedCodexFeatureBlock(existingText).content;
  const featuresRange = findFeaturesSectionRange(withoutManaged);

  if (!featuresRange) {
    const block = [
      `${CODEX_HOOKS_FEATURE_START} mode=standalone`,
      "[features]",
      "codex_hooks = true",
      CODEX_HOOKS_FEATURE_END,
    ].join("\n");
    const prefix = withoutManaged.trim() ? `${withoutManaged.trim()}\n\n` : "";
    return {
      content: `${prefix}${block}\n`,
      status: existingText.trim() ? "updated" : "created",
    };
  }

  const sectionText = featuresRange.sectionText;
  const codexHooksMatch = sectionText.match(/(^|\n)([ \t]*)codex_hooks\s*=\s*(true|false)\s*(?=\r?\n|$)/);
  let updatedSection = sectionText;

  if (codexHooksMatch && typeof codexHooksMatch.index === "number") {
    const indent = codexHooksMatch[2] || "";
    const previousValue = codexHooksMatch[3];
    const replacement = [
      `${indent}${CODEX_HOOKS_FEATURE_START} mode=replace previous=${previousValue}`,
      `${indent}codex_hooks = true`,
      `${indent}${CODEX_HOOKS_FEATURE_END}`,
    ].join("\n");
    updatedSection =
      sectionText.slice(0, codexHooksMatch.index + (codexHooksMatch[1] ? 1 : 0)) +
      replacement +
      sectionText.slice(codexHooksMatch.index + codexHooksMatch[0].length);
  } else {
    const insertion = `${buildManagedCodexFeatureBlock("inline")}\n`;
    updatedSection =
      sectionText.slice(0, featuresRange.contentStart - featuresRange.start) +
      insertion +
      sectionText.slice(featuresRange.contentStart - featuresRange.start);
  }

  const nextContent =
    withoutManaged.slice(0, featuresRange.start) +
    updatedSection +
    withoutManaged.slice(featuresRange.end);
  return {
    content: nextContent.endsWith("\n") ? nextContent : `${nextContent}\n`,
    status: existingText.trim() ? "updated" : "created",
  };
}

function isBeerSkillDirectory(skillDir) {
  const skillPath = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(skillPath)) {
    return false;
  }

  const source = fs.readFileSync(skillPath, "utf8");
  return /\becosystem:\s*["']?beer["']?\b/.test(source);
}

export function removeInstalledBeerSkills(repoRoot) {
  const removed = new Set();
  const targets = [];

  for (const target of SKILL_INSTALL_TARGETS) {
    const targetDir = path.join(repoRoot, target.relativeDir);
    const targetRemoved = [];

    if (fs.existsSync(targetDir)) {
      const entries = fs.readdirSync(targetDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const skillDir = path.join(targetDir, entry.name);
        if (!isBeerSkillDirectory(skillDir)) {
          continue;
        }

        fs.rmSync(skillDir, { recursive: true, force: true });
        targetRemoved.push(entry.name);
        removed.add(entry.name);
      }
    }

    targets.push({
      id: target.id,
      label: target.label,
      path: targetDir,
      removed: targetRemoved.sort(),
    });
  }

  return {
    removed: [...removed].sort(),
    targets,
  };
}

export function syncAgentGuidelinesFiles(repoRoot) {
  const files = [];

  for (const fileSpec of GUIDELINE_FILES) {
    const targetPath = path.join(repoRoot, fileSpec.fileName);
    const templateText = fs.readFileSync(fileSpec.templatePath, "utf8");
    const blockText = buildManagedBlock(templateText);
    const existingText = fs.existsSync(targetPath)
      ? fs.readFileSync(targetPath, "utf8")
      : "";

    const next = upsertManagedBlock(existingText, blockText);
    fs.writeFileSync(targetPath, next.content, "utf8");

    files.push({
      name: fileSpec.fileName,
      path: targetPath,
      status: next.file_status,
      block_status: next.block_status,
    });
  }

  return { files };
}

export function removeManagedAgentGuidelines(repoRoot) {
  const files = [];

  for (const fileSpec of GUIDELINE_FILES) {
    const targetPath = path.join(repoRoot, fileSpec.fileName);
    if (!fs.existsSync(targetPath)) {
      files.push({
        name: fileSpec.fileName,
        status: "missing",
      });
      continue;
    }

    const existingText = fs.readFileSync(targetPath, "utf8");
    const next = removeManagedBlock(existingText);
    if (!next.changed) {
      files.push({
        name: fileSpec.fileName,
        status: "unchanged",
      });
      continue;
    }

    if (next.content) {
      fs.writeFileSync(targetPath, next.content, "utf8");
      files.push({
        name: fileSpec.fileName,
        status: "updated",
      });
      continue;
    }

    fs.rmSync(targetPath, { force: true });
    files.push({
      name: fileSpec.fileName,
      status: "removed",
    });
  }

  return { files };
}

export function syncClaudeHookSettings(repoRoot) {
  const settingsPath = path.join(repoRoot, CLAUDE_SETTINGS_FILE);
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });

  const existing = readJsonFile(settingsPath);
  const next = upsertManagedBeerHooks(existing);
  const existed = fs.existsSync(settingsPath);
  writeJsonFile(settingsPath, next);

  return {
    path: settingsPath,
    status: existed ? "updated" : "created",
    hooks_installed: BEER_HOOK_SPECS.map((spec) => spec.eventName),
  };
}

export function removeManagedClaudeHookSettings(repoRoot) {
  const settingsPath = path.join(repoRoot, CLAUDE_SETTINGS_FILE);
  if (!fs.existsSync(settingsPath)) {
    return {
      path: settingsPath,
      status: "missing",
    };
  }

  const existing = readJsonFile(settingsPath);
  const next = stripManagedBeerHooks(existing);
  if (JSON.stringify(next) === JSON.stringify(existing)) {
    return {
      path: settingsPath,
      status: "unchanged",
    };
  }

  if (Object.keys(next).length === 0) {
    fs.rmSync(settingsPath, { force: true });
    return {
      path: settingsPath,
      status: "removed",
    };
  }

  writeJsonFile(settingsPath, next);
  return {
    path: settingsPath,
    status: "updated",
  };
}

export function syncCodexHookSettings(repoRoot) {
  const hooksPath = path.join(repoRoot, CODEX_HOOKS_FILE);
  fs.mkdirSync(path.dirname(hooksPath), { recursive: true });

  const existing = readJsonFile(hooksPath);
  const next = upsertManagedBeerCodexHooks(existing, repoRoot);
  const existed = fs.existsSync(hooksPath);
  writeJsonFile(hooksPath, next);

  return {
    path: hooksPath,
    status: existed ? "updated" : "created",
    hooks_installed: buildCodexHookSpecs(repoRoot).map((spec) => spec.eventName),
  };
}

export function removeManagedCodexHookSettings(repoRoot) {
  const hooksPath = path.join(repoRoot, CODEX_HOOKS_FILE);
  if (!fs.existsSync(hooksPath)) {
    return {
      path: hooksPath,
      status: "missing",
    };
  }

  const existing = readJsonFile(hooksPath);
  const next = stripManagedBeerCodexHooks(existing);
  if (JSON.stringify(next) === JSON.stringify(existing)) {
    return {
      path: hooksPath,
      status: "unchanged",
    };
  }

  if (Object.keys(next).length === 0) {
    fs.rmSync(hooksPath, { force: true });
    return {
      path: hooksPath,
      status: "removed",
    };
  }

  writeJsonFile(hooksPath, next);
  return {
    path: hooksPath,
    status: "updated",
  };
}

export function syncCodexConfig(repoRoot) {
  const configPath = path.join(repoRoot, CODEX_CONFIG_FILE);
  fs.mkdirSync(path.dirname(configPath), { recursive: true });

  const existingText = fs.existsSync(configPath)
    ? fs.readFileSync(configPath, "utf8")
    : "";
  const next = upsertManagedCodexConfigText(existingText);
  fs.writeFileSync(configPath, next.content, "utf8");

  return {
    path: configPath,
    status: next.status,
  };
}

export function removeManagedCodexConfig(repoRoot) {
  const configPath = path.join(repoRoot, CODEX_CONFIG_FILE);
  if (!fs.existsSync(configPath)) {
    return {
      path: configPath,
      status: "missing",
    };
  }

  const existingText = fs.readFileSync(configPath, "utf8");
  const next = stripManagedCodexFeatureBlock(existingText, { restorePrevious: true });
  if (!next.changed) {
    return {
      path: configPath,
      status: "unchanged",
    };
  }

  const trimmed = next.content.trim();
  if (!trimmed) {
    fs.rmSync(configPath, { force: true });
    return {
      path: configPath,
      status: "removed",
    };
  }

  fs.writeFileSync(configPath, `${trimmed}\n`, "utf8");
  return {
    path: configPath,
    status: "updated",
  };
}

export function syncProjectSkills(repoRoot) {
  const cleanup = removeInstalledBeerSkills(repoRoot);
  const skillDirs = findSkillDirectories(PACKAGED_SKILLS_ROOT);
  const targets = [];
  const aggregateStatuses = new Map();

  for (const target of SKILL_INSTALL_TARGETS) {
    const targetDir = path.join(repoRoot, target.relativeDir);
    fs.mkdirSync(targetDir, { recursive: true });

    const removedTarget = cleanup.targets.find((item) => item.id === target.id);
    const previouslyInstalled = new Set(removedTarget?.removed || []);
    const installedSkills = [];

    for (const skill of skillDirs) {
      const targetSkillDir = path.join(targetDir, skill.name);
      fs.mkdirSync(targetSkillDir, { recursive: true });
      copyDirRecursive(skill.sourcePath, targetSkillDir);

      const status = previouslyInstalled.has(skill.name) ? "updated" : "created";
      installedSkills.push({
        name: skill.name,
        status,
      });

      const previousAggregate = aggregateStatuses.get(skill.name);
      if (!previousAggregate || status === "updated") {
        aggregateStatuses.set(skill.name, status);
      }
    }

    targets.push({
      id: target.id,
      label: target.label,
      path: targetDir,
      removed_skills: removedTarget?.removed || [],
      skills: installedSkills,
    });
  }

  return {
    path: path.join(repoRoot, ".claude", "skills"),
    targets,
    removed_skills: cleanup.removed,
    skills: skillDirs.map((skill) => ({
      name: skill.name,
      status: aggregateStatuses.get(skill.name) || "created",
    })),
    instruction_sync: syncAgentGuidelinesFiles(repoRoot),
    hook_sync: {
      claude: syncClaudeHookSettings(repoRoot),
      codex: syncCodexHookSettings(repoRoot),
      codex_config: syncCodexConfig(repoRoot),
    },
  };
}
