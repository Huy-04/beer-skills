import fs from "node:fs";
import path from "node:path";

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseScalar(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseInlineList(value) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return null;
  }
  const body = trimmed.slice(1, -1).trim();
  if (!body) {
    return [];
  }
  return body
    .split(",")
    .map((item) => parseScalar(item))
    .filter(Boolean);
}

export function formatPluginSkillName(skillName) {
  if (!skillName) {
    return skillName;
  }
  return skillName.includes(":") ? skillName : `beer:${skillName}`;
}

function parseSkillMetadata(frontmatter) {
  const lines = frontmatter.split(/\r?\n/);
  let inMetadata = false;
  let inDependencies = false;
  let dependenciesDeclared = false;
  const metadata = {};
  const dependencies = [];
  let current = null;

  for (const line of lines) {
    if (!inMetadata) {
      if (/^metadata:\s*$/.test(line)) {
        inMetadata = true;
      }
      continue;
    }

    if (!line.trim()) {
      continue;
    }

    if (/^[^\s]/.test(line)) {
      break;
    }

    const metadataFieldMatch = line.match(/^\s{2}([A-Za-z0-9_-]+):\s*(.*)$/);
    if (metadataFieldMatch) {
      const [, key, rawValue] = metadataFieldMatch;
      if (key === "dependencies") {
        dependenciesDeclared = true;
        const inlineList = parseInlineList(rawValue);
        if (inlineList !== null) {
          metadata.dependencies = inlineList;
          inDependencies = false;
          current = null;
          continue;
        }

        if (!rawValue.trim()) {
          metadata.dependencies = dependencies;
          inDependencies = true;
          current = null;
          continue;
        }
      }

      if (inDependencies) {
        inDependencies = false;
        current = null;
      }

      const inlineList = parseInlineList(rawValue);
      metadata[key] = inlineList ?? parseScalar(rawValue);
      continue;
    }

    if (!inDependencies) {
      continue;
    }

    const entryMatch = line.match(/^\s{4}-\s+id:\s*(.+)$/);
    if (entryMatch) {
      current = { id: parseScalar(entryMatch[1]) };
      dependencies.push(current);
      continue;
    }

    if (!current) {
      continue;
    }

    const fieldMatch = line.match(/^\s{6}([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!fieldMatch) {
      continue;
    }

    const [, key, rawValue] = fieldMatch;
    const inlineList = parseInlineList(rawValue);
    current[key] = inlineList ?? parseScalar(rawValue);
  }

  return {
    metadata,
    dependencies,
    dependencies_declared: dependenciesDeclared,
  };
}

export function parseSkillFile(skillFilePath) {
  const source = fs.readFileSync(skillFilePath, "utf8");
  const frontmatterMatch = source.match(FRONTMATTER_PATTERN);
  if (!frontmatterMatch) {
    return {
      skill_name: path.basename(path.dirname(skillFilePath)),
      skill_file: skillFilePath,
      metadata: {},
      dependencies: [],
      dependencies_declared: false,
    };
  }

  const frontmatter = frontmatterMatch[1];
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const skillName = nameMatch ? parseScalar(nameMatch[1]) : path.basename(path.dirname(skillFilePath));
  const parsedMetadata = parseSkillMetadata(frontmatter);

  return {
    skill_name: formatPluginSkillName(skillName),
    skill_file: skillFilePath,
    metadata: parsedMetadata.metadata,
    dependencies: parsedMetadata.dependencies_declared
      ? parsedMetadata.metadata.dependencies || []
      : [],
    dependencies_declared: parsedMetadata.dependencies_declared,
  };
}

export function listSkillDeclarationFiles(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) {
    return [];
  }

  const queue = [skillsRoot];
  const files = [];

  while (queue.length > 0) {
    const currentDir = queue.shift();
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        queue.push(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name === "SKILL.md") {
        files.push(entryPath);
      }
    }
  }

  return files;
}

export function resolveSkillsRoot(repoRoot, explicitSkillsRoot) {
  if (explicitSkillsRoot) {
    return path.resolve(explicitSkillsRoot);
  }

  const candidates = [
    path.join(repoRoot, "skills"),
    path.join(repoRoot, ".beer", "skills"),
    path.join(repoRoot, "plugins", "beer", "skills"),
  ];

  const existingCandidate = candidates.find((candidate) => fs.existsSync(candidate));
  return path.resolve(existingCandidate || candidates[0]);
}
