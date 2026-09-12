#!/usr/bin/env node
/**
 * check-facts.mjs
 *
 * A stale-claim tripwire. Some numbers in this repo were true in July 2026 and
 * are false now — the dimension count, the engine list, the tool count. Prose
 * drifts quietly, so CI holds the line.
 *
 * Add a rule by appending to RULES below: a `pattern` to forbid and a `message`
 * naming the correct value. Optional `context` narrows a rule to lines that
 * also match one of the given regexes (used for the MCP endpoint rule, where
 * the docs URL is fine in prose and wrong only when used as a server URL).
 *
 * Opt out of a single line with a trailing `<!-- facts-ok -->` comment.
 *
 * Zero dependencies. Node >= 18.
 *
 * Usage:
 *   node scripts/check-facts.mjs
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The rule table. One entry per stale claim.
 * @type {{id: string, pattern: RegExp, message: string, context?: RegExp[]}[]}
 */
export const RULES = [
  {
    id: 'dimension-count',
    pattern: /\b(?:5|five)[ -]dimension/gi,
    message:
      'CompetLab has 6 monitored dimensions (AI Visibility, AI Sources, Positioning, ' +
      'Pricing Intelligence, Content Intelligence, Tech & Trust Profile).',
  },
  {
    id: 'engine-list',
    pattern: /(?:ChatGPT,\s*Claude,?\s+and\s+Gemini|OpenAI,\s*Claude,\s*Gemini)/gi,
    message:
      'AI Visibility queries 5 engines: ChatGPT, Claude, Gemini, Perplexity, Google AI Overviews.',
  },
  {
    id: 'provider-count',
    pattern: /(?:\b(?:3|three)\s+LLM\s+providers\b|\b2[ -]of[ -]3\b)/gi,
    message: 'There are 5 engines, not 3.',
  },
  {
    id: 'mcp-tool-count',
    pattern: /\b33\s+(?:MCP\s+)?tools\b/gi,
    message: 'The MCP server exposes 38 tools.',
  },
  {
    id: 'sdk-method-count',
    pattern: /\b34[ -]method/gi,
    message: 'Verify the SDK method count before asserting it.',
  },
  {
    id: 'queries-per-check',
    pattern: /(?:\b9\s+total\s+AI\s+queries\b|\b3\s*prompts\s*[x\u00d7]\s*3\b)/gi,
    message: 'A check is 3 prompts x 5 engines = 15 answers.',
  },
  {
    id: 'mcp-endpoint',
    pattern: /competlab\.com\/developers\/mcp/gi,
    // Only wrong when the line presents it as a server endpoint; as a link to
    // the docs page it is correct.
    context: [/--transport/, /"url"/, /mcpServers/, /server URL/i],
    message:
      'The endpoint is https://mcp.competlab.com/mcp ; competlab.com/developers/mcp is the docs page.',
  },
  {
    id: 'internal-names',
    pattern: /\b(?:Itrinity|Sequenzy)\b/gi,
    message: 'Internal name must not appear in a public repo.',
  },
  {
    id: 'provenance-signalling',
    pattern: /banked from real-world validation/gi,
    message: 'Provenance signalling; remove.',
  },
];

const SKIP_DIRS = new Set(['.git', 'node_modules']);
const EXTRA_FILES = ['.claude-plugin/marketplace.json'];
// Accepts a bare marker or one carrying a reason: <!-- facts-ok: historical entry -->
const OPT_OUT_RE = /facts-ok/;

const toPosix = (p) => p.split('\\').join('/');

function walkMarkdown(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkMarkdown(join(dir, entry.name), out);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

function main() {
  const files = walkMarkdown(REPO_ROOT);
  for (const extra of EXTRA_FILES) {
    const p = join(REPO_ROOT, extra);
    if (existsSync(p)) files.push(p);
  }
  files.sort();

  /** @type {Map<string, {line: number, rule: typeof RULES[number], match: string}[]>} */
  const hitsByFile = new Map();
  let total = 0;
  const perRule = new Map(RULES.map((r) => [r.id, 0]));

  for (const file of files) {
    const rel = toPosix(relative(REPO_ROOT, file));
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);

    lines.forEach((line, i) => {
      if (line.match(OPT_OUT_RE)) return;
      for (const rule of RULES) {
        if (rule.context && !rule.context.some((c) => c.test(line))) continue;
        rule.pattern.lastIndex = 0;
        for (const m of line.matchAll(rule.pattern)) {
          total++;
          perRule.set(rule.id, perRule.get(rule.id) + 1);
          if (!hitsByFile.has(rel)) hitsByFile.set(rel, []);
          hitsByFile.get(rel).push({ line: i + 1, rule, match: m[0] });
        }
      }
    });
  }

  console.log('stale-fact check');
  console.log('================');
  console.log('');
  console.log(`${files.length} file(s) scanned against ${RULES.length} rule(s)`);
  console.log('');

  if (total === 0) {
    console.log('PASS — no stale claims found.');
    return;
  }

  for (const [rel, hits] of [...hitsByFile.entries()].sort()) {
    console.log(rel);
    for (const h of hits) {
      console.log(`  ${rel}:${h.line}  [${h.rule.id}]  "${h.match}"`);
      console.log(`      -> ${h.rule.message}`);
    }
    console.log('');
  }

  console.log('----------------');
  console.log('hits by rule:');
  for (const rule of RULES) {
    const n = perRule.get(rule.id);
    if (n > 0) console.log(`  ${String(n).padStart(3)}  ${rule.id}`);
  }
  console.log(`${total} stale claim(s) across ${hitsByFile.size} file(s)`);
  console.error('');
  console.error('FAIL: stale claims found. Fix the text, or mark the line with <!-- facts-ok -->.');
  process.exit(1);
}

main();
