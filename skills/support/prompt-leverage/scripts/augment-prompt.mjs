#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VALID_DEPTHS = ["Light", "Standard", "Deep"];

function usage() {
  return `Usage:
  node skills/support/prompt-leverage/scripts/augment-prompt.mjs [options] "prompt"

Options:
  --repo-root <path>     Repository root to scan. Defaults to current working directory.
  --depth <level>        light | standard | deep
  --prompt-only          Print only the contextual prompt, without the [UPGRADE] log
  --format json          Print structured JSON with log, prompt, context, depth, language data
  --help                 Show this help

Escape commands inside the prompt:
  /raw <request>         Skip upgrade and return the request unchanged
  /light <request>       Force Light depth
  /standard <request>    Force Standard depth
  /deep <request>        Force Deep depth

PowerShell note:
  Wrap prompts containing backticks in single quotes so preserved ids such as \`beer:planning\` survive shell parsing.`;
}

function isSkillId(value) {
  return /^(?:beer:)?[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/i.test(value);
}

function isPathLikeIdentifier(value) {
  return /[\\/]/.test(value) || /^[A-Za-z]:/.test(value) || /\.[A-Za-z0-9]+$/.test(value);
}

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    depth: null,
    promptOnly: false,
    format: "text",
    help: false,
    promptParts: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--prompt-only") {
      options.promptOnly = true;
    } else if (arg === "--repo-root") {
      options.repoRoot = argv[++index] ?? "";
    } else if (arg.startsWith("--repo-root=")) {
      options.repoRoot = arg.slice("--repo-root=".length);
    } else if (arg === "--depth" || arg === "--intensity") {
      options.depth = argv[++index] ?? "";
    } else if (arg.startsWith("--depth=")) {
      options.depth = arg.slice("--depth=".length);
    } else if (arg.startsWith("--intensity=")) {
      options.depth = arg.slice("--intensity=".length);
    } else if (arg === "--format") {
      options.format = argv[++index] ?? "";
    } else if (arg.startsWith("--format=")) {
      options.format = arg.slice("--format=".length);
    } else if (arg === "--task" || arg.startsWith("--task=")) {
      // Backward compatibility: task labels were part of the old keyword-based tool.
      // They are intentionally ignored in the contextual builder.
      if (arg === "--task") index += 1;
    } else {
      options.promptParts.push(arg);
    }
  }

  options.prompt = options.promptParts.join(" ");
  return options;
}

function normalizeDepth(depth) {
  if (!depth) return null;
  const match = VALID_DEPTHS.find((value) => value.toLowerCase() === depth.toLowerCase());
  if (!match) throw new Error(`Invalid depth "${depth}". Expected light, standard, or deep.`);
  return match;
}

function parseEscapeCommand(prompt) {
  const match = prompt.match(/^\/(raw|light|standard|deep)(?:\s+|$)([\s\S]*)$/i);
  if (!match) return { command: null, prompt };

  const command = match[1].toLowerCase();
  const strippedPrompt = match[2] ?? "";
  if (command === "raw") return { command, prompt: strippedPrompt, raw: true };

  return {
    command,
    prompt: strippedPrompt,
    forcedDepth: command[0].toUpperCase() + command.slice(1),
  };
}

function stripVietnameseDiacritics(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D");
}

function detectLanguage(prompt) {
  const hasVietnameseDiacritics = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(prompt);
  const hasCjkIdeographs = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/u.test(prompt);
  const lowered = prompt.toLowerCase();
  const romanizedSignals = ["tieng viet", "bang tieng viet", "giai thich", "kiem tra", "giu ", "sua ", "loi "];
  const hasRomanizedVietnamese = romanizedSignals.some((signal) => lowered.includes(signal));
  const hasEnglishSignals = /\b(the|and|with|for|review|fix|implement|explain|return|output|prompt)\b/i.test(prompt);

  if (hasCjkIdeographs) {
    return {
      inputLanguage: hasEnglishSignals ? "Mixed Chinese/English" : "Chinese",
      workingLanguage: "English",
      outputLanguage: "Chinese",
    };
  }

  if (hasVietnameseDiacritics || hasRomanizedVietnamese) {
    return {
      inputLanguage: hasEnglishSignals ? "Mixed Vietnamese/English" : "Vietnamese",
      workingLanguage: "English",
      outputLanguage: "Vietnamese",
    };
  }

  return {
    inputLanguage: "English",
    workingLanguage: "English",
    outputLanguage: "English",
  };
}

function detectLanguageStable(prompt) {
  const hasVietnameseLetters = /[\u0103\u00e2\u0111\u00ea\u00f4\u01a1\u01b0\u0102\u00c2\u0110\u00ca\u00d4\u01a0\u01af]/u.test(prompt);
  const hasVietnameseToneMarks = /[\u0300\u0301\u0303\u0309\u0323]/u.test(prompt.normalize("NFD"));
  const hasCjkIdeographs = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/u.test(prompt);
  const lowered = prompt.toLowerCase();
  const asciiLowered = stripVietnameseDiacritics(lowered);
  const romanizedSignals = [
    "tieng viet",
    "bang tieng viet",
    "giai thich",
    "kiem tra",
    "giu ",
    "sua ",
    "loi ",
    "toi ",
    "ban ",
    "tiep ",
    "phan tich",
  ];
  const hasRomanizedVietnamese = romanizedSignals.some((signal) => asciiLowered.includes(signal));
  const hasEnglishSignals = /\b(the|and|with|for|review|fix|implement|explain|return|output|prompt)\b/i.test(prompt);

  if (hasCjkIdeographs) {
    return {
      inputLanguage: hasEnglishSignals ? "Mixed Chinese/English" : "Chinese",
      workingLanguage: "English",
      outputLanguage: "Chinese",
    };
  }

  if (hasVietnameseLetters || hasVietnameseToneMarks || hasRomanizedVietnamese) {
    return {
      inputLanguage: hasEnglishSignals ? "Mixed Vietnamese/English" : "Vietnamese",
      workingLanguage: "English",
      outputLanguage: "Vietnamese",
    };
  }

  return {
    inputLanguage: "English",
    workingLanguage: "English",
    outputLanguage: "English",
  };
}

function inferDepth(prompt, context) {
  const lineCount = prompt.split(/\r?\n/).length;
  const hasExplicitTargets =
    context.preservedIdentifiers.paths.length > 0 ||
    context.preservedIdentifiers.skillIds.length > 0 ||
    context.preservedIdentifiers.beerArtifacts.length > 0 ||
    context.resolvedFiles.length > 0;
  const hasManyUnknowns = context.unknowns.length >= 2;

  if (lineCount > 8 || context.resolvedFiles.length >= 3 || hasManyUnknowns) return "Deep";
  if (hasExplicitTargets || prompt.length > 120) return "Standard";
  return "Light";
}

function readTextFile(filePath, maxChars = 6000) {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    return {
      ok: true,
      text: text.length > maxChars ? `${text.slice(0, maxChars)}\n...[truncated]` : text,
      truncated: text.length > maxChars,
    };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function safeRelative(repoRoot, filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

function resolveInsideRepo(repoRoot, candidate) {
  const cleaned = candidate.replace(/^@/, "").trim();
  if (!cleaned || cleaned.includes("\n")) return null;

  const absolute = path.isAbsolute(cleaned) ? path.normalize(cleaned) : path.resolve(repoRoot, cleaned);
  const relative = path.relative(repoRoot, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  if (!fileExists(absolute)) return null;

  return absolute;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractCodeFences(prompt) {
  const fences = [];
  const regex = /```[\s\S]*?```/g;
  let match;
  while ((match = regex.exec(prompt)) !== null) fences.push(match[0]);
  return fences;
}

function stripFencedCode(prompt) {
  return prompt.replace(/```[\s\S]*?```/g, " ");
}

function extractPreservedIdentifiers(prompt) {
  const withoutFences = stripFencedCode(prompt);
  const inlineCode = unique([...withoutFences.matchAll(/`([^`\r\n]+)`/g)].map((match) => match[1].trim()));
  const atMentions = unique([...withoutFences.matchAll(/@([A-Za-z0-9_./\\:-]+)/g)].map((match) => `@${match[1]}`));
  const skillIds = unique([...withoutFences.matchAll(/\b(?:beer:)?[a-z][a-z0-9-]*:[a-z][a-z0-9-]*\b/g)].map((match) => match[0]));
  const beerArtifacts = unique(
    [...withoutFences.matchAll(/\b(?:CONTEXT\.md|STATE\.md|AGENTS\.md|CLAUDE\.md|README\.md|phase-plan\.md|approach\.md|discovery\.md)\b/g)].map(
      (match) => match[0],
    ),
  );
  const pathLike = unique(
    [
      ...atMentions,
      ...inlineCode.filter((value) => isPathLikeIdentifier(value) && !isSkillId(value)),
      ...[...withoutFences.matchAll(/(?:[A-Za-z]:)?[A-Za-z0-9_.-]+(?:[\\/][A-Za-z0-9_.-]+)+(?:\.[A-Za-z0-9]+)?/g)].map(
        (match) => match[0],
      ),
      ...[...withoutFences.matchAll(/\b[A-Za-z0-9_.-]+\.(?:md|json|jsonc|toml|yaml|yml|js|mjs|ts|tsx|jsx|py|cs|vue|css|html)\b/g)].map(
        (match) => match[0],
      ),
    ]
      .map((value) => value.replace(/^@/, ""))
      .filter((value) => !isSkillId(value)),
  );
  const commandLines = unique(
    prompt
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^(npm|node|pnpm|yarn|dotnet|git|rg|python|py|npx|bun|cargo|go|java)\b/.test(line)),
  );

  return {
    codeFenceCount: extractCodeFences(prompt).length,
    inlineCode,
    atMentions,
    skillIds,
    beerArtifacts,
    paths: pathLike,
    commands: commandLines,
  };
}

function summarizeText(text, maxLines = 18) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
  return lines.slice(0, maxLines).join("\n");
}

function readRepoDoc(repoRoot, relativePath, reason) {
  const absolute = path.join(repoRoot, relativePath);
  if (!fileExists(absolute)) return null;
  const result = readTextFile(absolute, 5000);
  if (!result.ok) return null;
  return {
    path: relativePath,
    reason,
    truncated: result.truncated,
    excerpt: summarizeText(result.text),
  };
}

function collectPackageFacts(repoRoot) {
  const packagePath = path.join(repoRoot, "package.json");
  if (!fileExists(packagePath)) return null;
  const result = readTextFile(packagePath, 20000);
  if (!result.ok) return null;
  try {
    const parsed = JSON.parse(result.text);
    return {
      name: parsed.name ?? null,
      version: parsed.version ?? null,
      scripts: Object.keys(parsed.scripts ?? {}),
      dependencies: Object.keys(parsed.dependencies ?? {}),
      devDependencies: Object.keys(parsed.devDependencies ?? {}),
      peerDependencies: Object.keys(parsed.peerDependencies ?? {}),
    };
  } catch (error) {
    return { parseError: error.message };
  }
}

function collectBeerFacts(repoRoot) {
  const statePath = path.join(repoRoot, ".beer", "state.json");
  const stateMdPath = path.join(repoRoot, ".beer", "STATE.md");
  const facts = {};

  if (fileExists(statePath)) {
    const result = readTextFile(statePath, 12000);
    if (result.ok) {
      try {
        const parsed = JSON.parse(result.text);
        facts.state = {
          feature_slug: parsed.feature_slug ?? null,
          route: parsed.route ?? null,
          work_intent: parsed.work_intent ?? null,
          risk: parsed.risk ?? null,
          run_style: parsed.run_style ?? null,
          orchestration_strategy: parsed.orchestration_strategy ?? null,
          phase: parsed.phase ?? null,
          phase_number: parsed.phase_number ?? null,
          current_phase_name: parsed.current_phase_name ?? null,
          current_slice: parsed.current_slice ?? null,
          context_stage: parsed.context_stage ?? null,
          context_path: parsed.context_path ?? null,
          execution_target: parsed.execution_target ?? null,
          contract_verified: parsed.contract_verified ?? null,
          validation_status: parsed.validation_status ?? null,
          validator_status: parsed.validator_status ?? null,
          tdd_required: parsed.tdd_required ?? null,
          tdd_status: parsed.tdd_status ?? null,
          execution_evidence_path: parsed.execution_evidence_path ?? null,
          review_status: parsed.review_status ?? null,
          knowledge_base_refresh_status: parsed.knowledge_base_refresh_status ?? null,
          next_handoff: parsed.next_handoff ?? null,
        };
      } catch (error) {
        facts.state = { parseError: error.message };
      }
    }
  }

  if (fileExists(stateMdPath)) {
    const result = readTextFile(stateMdPath, 3000);
    if (result.ok) facts.stateMarkdownExcerpt = summarizeText(result.text, 12);
  }

  return Object.keys(facts).length > 0 ? facts : null;
}

function listSkillMetadata(repoRoot) {
  const skillsRoot = path.join(repoRoot, "skills");
  if (!fileExists(skillsRoot)) return [];
  const skills = [];

  for (const group of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    const groupPath = path.join(skillsRoot, group.name);
    for (const skillDir of fs.readdirSync(groupPath, { withFileTypes: true })) {
      if (!skillDir.isDirectory()) continue;
      const skillPath = path.join(groupPath, skillDir.name, "SKILL.md");
      if (!fileExists(skillPath)) continue;
      const result = readTextFile(skillPath, 1200);
      const nameMatch = result.ok ? result.text.match(/^name:\s*([^\r\n]+)/m) : null;
      skills.push({
        name: nameMatch ? nameMatch[1].trim().replace(/^["']|["']$/g, "") : skillDir.name,
        path: safeRelative(repoRoot, skillPath),
      });
    }
  }

  return skills;
}

function resolvePromptFiles(repoRoot, identifiers) {
  const candidates = unique([...identifiers.paths, ...identifiers.atMentions, ...identifiers.inlineCode]);
  const resolved = [];
  const unresolved = [];

  for (const candidate of candidates) {
    const absolute = resolveInsideRepo(repoRoot, candidate);
    if (!absolute) {
      if (candidate.includes("/") || candidate.includes("\\") || candidate.startsWith("@") || /\.[A-Za-z0-9]+$/.test(candidate)) {
        unresolved.push(candidate);
      }
      continue;
    }

    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) {
      resolved.push({
        mention: candidate,
        path: safeRelative(repoRoot, absolute),
        kind: "directory",
        entries: fs.readdirSync(absolute).slice(0, 20),
      });
    } else {
      const result = readTextFile(absolute, 5000);
      resolved.push({
        mention: candidate,
        path: safeRelative(repoRoot, absolute),
        kind: "file",
        truncated: result.ok ? result.truncated : false,
        excerpt: result.ok ? summarizeText(result.text, 18) : `Unable to read: ${result.error}`,
      });
    }
  }

  return { resolved, unresolved };
}

function resolveMentionedSkills(repoRoot, prompt, skillMetadata) {
  const lowered = prompt.toLowerCase();
  const matches = [];

  for (const skill of skillMetadata) {
    if (!lowered.includes(skill.name.toLowerCase())) continue;
    const absolute = path.join(repoRoot, skill.path);
    const result = readTextFile(absolute, 5000);
    matches.push({
      name: skill.name,
      path: skill.path,
      excerpt: result.ok ? summarizeText(result.text, 22) : `Unable to read: ${result.error}`,
    });
  }

  return matches;
}

function collectContext(repoRoot, prompt) {
  const absoluteRoot = path.resolve(repoRoot);
  const preservedIdentifiers = extractPreservedIdentifiers(prompt);
  const packageFacts = collectPackageFacts(absoluteRoot);
  const beerFacts = collectBeerFacts(absoluteRoot);
  const repoDocs = [
    readRepoDoc(absoluteRoot, "AGENTS.md", "agent operating instructions"),
    readRepoDoc(absoluteRoot, "CLAUDE.md", "Claude/agent operating instructions"),
    readRepoDoc(absoluteRoot, "README.md", "project overview"),
  ].filter(Boolean);
  const skillMetadata = listSkillMetadata(absoluteRoot);
  const mentionedSkills = resolveMentionedSkills(absoluteRoot, prompt, skillMetadata);
  const { resolved, unresolved } = resolvePromptFiles(absoluteRoot, preservedIdentifiers);
  const unresolvedAfterSkillResolution = unresolved.filter((candidate) => {
    const normalized = candidate.replaceAll("\\", "/").replace(/^@/, "");
    if (normalized === "SKILL.md" && mentionedSkills.length > 0) return false;
    return !mentionedSkills.some((skill) =>
      normalized === skill.path ||
      normalized === `${skill.name}/SKILL.md` ||
      normalized.endsWith(`/${skill.name}/SKILL.md`)
    );
  });
  const unknowns = [];

  if (unresolvedAfterSkillResolution.length > 0) {
    unknowns.push(`Mentioned file/path not found in repo: ${unresolvedAfterSkillResolution.join(", ")}`);
  }
  if (resolved.length === 0 && mentionedSkills.length === 0) unknowns.push("No explicit local file or skill target was resolved from the prompt.");
  if (!packageFacts && repoDocs.length === 0) unknowns.push("No common project overview files were found.");

  return {
    repoRoot: absoluteRoot,
    preservedIdentifiers,
    repoDocs,
    packageFacts,
    beerFacts,
    resolvedFiles: resolved,
    mentionedSkills,
    unknowns,
    contextPolicy: {
      generatedDocs: "not scanned by default; use only when explicitly referenced and treat as hints",
      sourceAuthority: "current source and approved Beer artifacts win over generated Docs",
      mutation: "read-only context collection; no Beer state, plan, code, or Docs mutation",
    },
    note: "This script collects context only. Semantic intent, route confirmation, and final prompt synthesis are handled by the downstream model/skill, not by keyword classification.",
  };
}

function chooseFence(text) {
  const matches = text.match(/`+/g) ?? [];
  const longest = matches.reduce((max, ticks) => Math.max(max, ticks.length), 0);
  return "`".repeat(Math.max(3, longest + 1));
}

function fenced(label, text) {
  const fence = chooseFence(text);
  return `${fence}${label}\n${text}\n${fence}`;
}

function bulletList(values, fallback = "None detected.") {
  if (!values || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function formatContextualPrompt(originalPrompt, context, depth, language) {
  const repoDocLines = context.repoDocs.map((doc) => `${doc.path}: ${doc.reason}${doc.truncated ? " (excerpt truncated)" : ""}`);
  const resolvedLines = [
    ...context.resolvedFiles.map((file) => `${file.path}: resolved from "${file.mention}" (${file.kind})`),
    ...context.mentionedSkills.map((skill) => `${skill.path}: mentioned skill "${skill.name}"`),
  ];
  const scriptLines = context.packageFacts?.scripts?.length
    ? context.packageFacts.scripts.slice(0, 12).map((script) => `npm script: ${script}`)
    : [];
  const unknownLines = context.unknowns.length ? context.unknowns : ["No critical unknowns detected by the context collector."];

  const contextPayload = {
    repoRoot: context.repoRoot,
    package: context.packageFacts,
    beer: context.beerFacts,
    preservedIdentifiers: context.preservedIdentifiers,
    repoDocs: context.repoDocs,
    resolvedFiles: context.resolvedFiles,
    mentionedSkills: context.mentionedSkills,
    unknowns: context.unknowns,
    contextPolicy: context.contextPolicy,
  };

  return `Contextual Prompt Builder Input

Original Request:
${fenced("text", originalPrompt)}

Known Context:
${bulletList(repoDocLines)}
${scriptLines.length ? `\nAvailable Commands:\n${bulletList(scriptLines)}` : ""}

Relevant Local Targets:
${bulletList(resolvedLines)}

Preserved Identifiers:
${fenced("json", JSON.stringify(context.preservedIdentifiers, null, 2))}

Context Payload:
${fenced("json", JSON.stringify(contextPayload, null, 2))}

Unknowns and Assumptions:
${bulletList(unknownLines)}

Context Source Authority:
- Generated Docs policy: ${context.contextPolicy.generatedDocs}.
- Source authority: ${context.contextPolicy.sourceAuthority}.
- Mutation policy: ${context.contextPolicy.mutation}.

Routing Safety:
- Use the Original Request and Context Payload together for downstream routing.
- Do not route solely on this upgraded prompt if it narrows or rephrases the user's intent.
- Keep the raw request visible in any handoff to beer:using-beer or another skill.
- Treat any suggested downstream route as advisory until the invoking owner confirms it.
- Do not mutate Beer state, write planning artifacts, edit code, or refresh generated Docs from this helper.

Synthesis Instructions:
- Build the final prompt from the original request plus the known context above.
- Do not classify the request by keyword. Infer intent from the full context and preserve uncertainty.
- Preserve all commands, paths, code blocks, skill IDs, Beer artifacts, and technical identifiers exactly.
- If any unknown is critical to safe execution, ask at most 3 targeted questions before producing the final execution prompt.
- If unknowns are not blocking, state assumptions explicitly and continue.
- Keep final response language: ${language.outputLanguage}.
- Depth target: ${depth}.

Final Prompt Shape:
- Context: known facts, relevant files/systems, constraints, and preserved identifiers.
- Objective: what the downstream agent should accomplish.
- Scope: what is in scope and out of scope.
- Execution Guidance: how to inspect, reason, and proceed.
- Verification: checks required before completion.
- Output Contract: final answer structure, tone, and language.
- Stop / Ask Criteria: when to stop and ask instead of guessing.`;
}

function build(rawPrompt, options = {}) {
  const trimmedPrompt = rawPrompt.trim();
  const escape = parseEscapeCommand(trimmedPrompt);
  const effectivePrompt = escape.prompt.trim();
  const language = detectLanguageStable(effectivePrompt);

  if (escape.raw) {
    return {
      upgraded: false,
      mode: "raw",
      depth: null,
      language,
      log: "[UPGRADE] Skipped by /raw. Original request preserved.",
      context: null,
      rawRequest: effectivePrompt,
      prompt: effectivePrompt,
    };
  }

  const context = collectContext(options.repoRoot ?? process.cwd(), effectivePrompt);
  const depth = escape.forcedDepth ?? normalizeDepth(options.depth) ?? inferDepth(effectivePrompt, context);
  const prompt = formatContextualPrompt(effectivePrompt, context, depth, language);
  const commandNote = escape.command ? ` Forced by /${escape.command}.` : "";
  const log = `[UPGRADE] Contextual prompt packet built. Depth: ${depth}. Input language: ${language.inputLanguage}. Final response language: ${language.outputLanguage}.${commandNote} Resolved ${context.resolvedFiles.length} file target(s) and ${context.mentionedSkills.length} skill target(s).`;

  return {
    upgraded: true,
    mode: "contextual",
    depth,
    language,
    log,
    context,
    rawRequest: effectivePrompt,
    prompt,
  };
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log(usage());
      return;
    }
    if (!options.prompt.trim()) throw new Error("Missing prompt argument.");
    if (!["text", "json"].includes(options.format)) throw new Error('Invalid --format. Expected "text" or "json".');

    const result = build(options.prompt, options);
    if (options.format === "json") {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (options.promptOnly) {
      console.log(result.prompt);
      return;
    }
    console.log(`${result.log}\n\n${result.prompt}`);
  } catch (error) {
    console.error(`augment-prompt: ${error.message}`);
    process.exitCode = 1;
  }
}

export {
  build,
  collectContext,
  detectLanguageStable as detectLanguage,
  extractPreservedIdentifiers,
  parseArgs,
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
