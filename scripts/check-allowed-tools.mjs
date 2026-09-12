#!/usr/bin/env node
/**
 * check-allowed-tools.mjs
 *
 * Every skill declares the tools it may use in its `allowed-tools` frontmatter
 * field. A skill body that tells the agent to call a tool it never declared
 * stalls at runtime behind a permission wall — so a mismatch is a real defect,
 * not a style nit.
 *
 *   ERROR  the body invokes a tool that `allowed-tools` does not declare
 *   WARN   `allowed-tools` declares a tool the body never mentions
 *
 * Deliberate scanning choices:
 *   - Fenced code blocks COUNT. A skill telling the agent to run something
 *     inside a ```bash block still needs the permission.
 *   - The frontmatter itself does NOT count as an invocation; only the body
 *     below the closing `---` is scanned.
 *   - Bare tool names match on word boundaries, so `Read` inside `Reading` or
 *     `already_Read` is not a hit.
 *
 * Zero dependencies. Node >= 18.
 *
 * Usage:
 *   node scripts/check-allowed-tools.mjs [--warnings-as-errors]
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(REPO_ROOT, 'skills');

const WARNINGS_AS_ERRORS = process.argv.slice(2).includes('--warnings-as-errors');

/** Bare (non-MCP) tool names an agent can be told to call. */
const BARE_TOOLS = [
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'Bash',
  'WebSearch',
  'WebFetch',
  'Task',
  'NotebookEdit',
];

/**
 * CompetLab MCP tool names. Skill bodies naturally write `get_briefing` in prose rather
 * than `mcp__competlab__get_briefing`, so a bare mention of any of these counts as an
 * invocation of the qualified tool. Without this the check reports a skill as not using
 * the very tools it is built around.
 */
const COMPETLAB_TOOLS = [
  'list_projects', 'get_project', 'list_competitors', 'get_competitor',
  'list_alerts', 'list_schedules',
  'get_tech_trust_dashboard', 'get_tech_trust_history', 'get_tech_trust_run_detail',
  'get_content_dashboard', 'get_content_history', 'get_content_run_detail', 'get_content_changelog',
  'get_positioning_dashboard', 'get_positioning_history', 'get_positioning_run_detail',
  'get_pricing_dashboard', 'get_pricing_history', 'get_pricing_run_detail',
  'get_ai_visibility_dashboard', 'get_ai_visibility_history', 'get_ai_visibility_check_detail',
  'get_ai_visibility_trend',
  'get_ai_sources_dashboard', 'get_ai_sources_history', 'get_ai_sources_check_detail',
  'get_briefing', 'get_briefing_history', 'get_briefing_edition',
  'check_ai_crawlers', 'check_sitemap', 'fetch_url',
  'start_agent_adoption_scan', 'get_agent_adoption_scan',
  'start_tech_stack_scan', 'get_tech_stack_scan',
  'start_trust_signals_scan', 'get_trust_signals_scan',
];

const MCP_TOOL_RE = /mcp__[a-z0-9_]+__[a-z0-9_]+/g;
const BARE_TOOL_RE = new RegExp(String.raw`\b(?:${BARE_TOOLS.join('|')})\b`, 'g');
// Longest-first so `get_briefing_history` is not swallowed by `get_briefing`.
const COMPETLAB_BARE_RE = new RegExp(
  String.raw`\b(?:${[...COMPETLAB_TOOLS].sort((a, b) => b.length - a.length).join('|')})\b`,
  'g',
);

const toPosix = (p) => p.split('\\').join('/');

/** Split a SKILL.md into its frontmatter lines and its body lines. */
function splitFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] === undefined || lines[0].trim() !== '---') {
    return { frontmatter: [], body: lines, bodyStartLine: 1, hasFrontmatter: false };
  }
  for (let i = 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === '---' || t === '...') {
      return {
        frontmatter: lines.slice(1, i),
        body: lines.slice(i + 1),
        bodyStartLine: i + 2, // 1-based line number of the first body line
        hasFrontmatter: true,
      };
    }
  }
  // Unterminated frontmatter: whole file is frontmatter, body empty.
  return {
    frontmatter: lines.slice(1),
    body: [],
    bodyStartLine: lines.length + 1,
    hasFrontmatter: true,
  };
}

/**
 * Pull the `allowed-tools` value out of frontmatter without a YAML library.
 * Handles inline space-separated, an inline flow list `[a, b]`, a block scalar
 * (`|` / `>`), and a block sequence of `- item` lines. A missing field is an
 * empty list.
 */
function parseAllowedTools(fmLines) {
  const idx = fmLines.findIndex((l) => /^allowed-tools\s*:/.test(l));
  if (idx === -1) return { declared: [], present: false };

  let raw = fmLines[idx].replace(/^allowed-tools\s*:/, '').trim();
  const items = [];

  // Block scalar or empty inline value: consume the indented continuation.
  if (raw === '' || /^[|>][-+]?\d*$/.test(raw)) {
    raw = '';
    for (let i = idx + 1; i < fmLines.length; i++) {
      const line = fmLines[i];
      if (line.trim() === '') continue;
      if (!/^\s/.test(line)) break; // a new top-level key
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) items.push(trimmed.slice(2).trim());
      else raw += ' ' + trimmed;
    }
  }

  raw = raw.trim();
  if (/^\[.*\]$/.test(raw)) raw = raw.slice(1, -1).replace(/,/g, ' ');
  raw = raw.replace(/^["']|["']$/g, '');

  for (const token of raw.split(/[\s,]+/)) {
    if (token) items.push(token);
  }

  const declared = [
    ...new Set(items.map((t) => t.replace(/^["']|["']$/g, '')).filter(Boolean)),
  ];
  return { declared, present: true };
}

/** Find every tool invocation in the body, keeping the lines it appeared on. */
function scanBody(bodyLines, bodyStartLine) {
  /** @type {Map<string, number[]>} */
  const found = new Map();
  const record = (tool, lineNo) => {
    if (!found.has(tool)) found.set(tool, []);
    const lines = found.get(tool);
    if (!lines.includes(lineNo)) lines.push(lineNo);
  };

  bodyLines.forEach((line, i) => {
    const lineNo = bodyStartLine + i;
    for (const m of line.matchAll(MCP_TOOL_RE)) record(m[0], lineNo);
    for (const m of line.matchAll(BARE_TOOL_RE)) record(m[0], lineNo);
    // A bare CompetLab tool name in prose is an invocation of the qualified tool.
    for (const m of line.matchAll(COMPETLAB_BARE_RE)) record(`mcp__competlab__${m[0]}`, lineNo);
  });

  return found;
}

function formatLines(lineNos) {
  const head = lineNos.slice(0, 3).join(', ');
  const more = lineNos.length > 3 ? ` (+${lineNos.length - 3} more)` : '';
  return `line${lineNos.length > 1 ? 's' : ''} ${head}${more}`;
}

function main() {
  if (!existsSync(SKILLS_DIR)) {
    console.error(`FATAL: no skills/ directory at ${SKILLS_DIR}`);
    process.exit(1);
  }

  const skillDirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let errorCount = 0;
  let warnCount = 0;
  let skillCount = 0;
  const failingSkills = [];

  console.log('allowed-tools check');
  console.log('===================');
  console.log('');

  for (const name of skillDirs) {
    const file = join(SKILLS_DIR, name, 'SKILL.md');
    if (!existsSync(file)) continue;
    skillCount++;

    const rel = toPosix(relative(REPO_ROOT, file));
    const text = readFileSync(file, 'utf8');
    const { frontmatter, body, bodyStartLine, hasFrontmatter } = splitFrontmatter(text);
    const { declared, present } = parseAllowedTools(frontmatter);
    const declaredSet = new Set(declared);
    const invoked = scanBody(body, bodyStartLine);

    const undeclared = [...invoked.keys()].filter((t) => !declaredSet.has(t)).sort();
    const unused = declared.filter((t) => !invoked.has(t)).sort();

    console.log(rel);
    if (!hasFrontmatter) {
      errorCount++;
      failingSkills.push(rel);
      console.log('  ERROR  no YAML frontmatter block');
    }
    if (!present) console.log('  note   no `allowed-tools` field — treated as an empty list');
    console.log(`  declared: ${declared.length}   invoked in body: ${invoked.size}`);

    if (undeclared.length > 0 && !failingSkills.includes(rel)) failingSkills.push(rel);
    for (const tool of undeclared) {
      errorCount++;
      console.log(
        `  ERROR  invokes ${tool} — not in allowed-tools (${formatLines(invoked.get(tool))})`,
      );
    }
    for (const tool of unused) {
      warnCount++;
      console.log(`  WARN   declares ${tool} — body never mentions it`);
    }
    if (undeclared.length === 0 && unused.length === 0 && hasFrontmatter) console.log('  OK');
    console.log('');
  }

  console.log('-------------------');
  console.log(`${skillCount} skills checked — ${errorCount} error(s), ${warnCount} warning(s)`);
  if (failingSkills.length > 0) {
    console.log(`skills with errors: ${failingSkills.join(', ')}`);
  }

  if (errorCount > 0) {
    console.error('');
    console.error('FAIL: a skill invokes a tool it does not declare in allowed-tools.');
    process.exit(1);
  }
  if (warnCount > 0 && WARNINGS_AS_ERRORS) {
    console.error('');
    console.error('FAIL: warnings promoted to errors by --warnings-as-errors.');
    process.exit(1);
  }
  console.log('PASS');
}

main();
