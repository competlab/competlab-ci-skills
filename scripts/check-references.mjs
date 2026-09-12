#!/usr/bin/env node
/**
 * check-references.mjs
 *
 * CONTRIBUTING.md mandates: "Every referenced file must exist (no reference
 * illusions)." This enforces it.
 *
 * For every markdown file in the repo it collects two kinds of reference:
 *
 *   1. Markdown links to relative paths — [text](path.md), [text](dir/).
 *      External URLs, mailto:, and bare #anchors are skipped.
 *   2. Inline-backtick tokens that look like repo paths — `TEMPLATE-briefing.md`,
 *      `skills/foo/SKILL.md`, `.claude-plugin/marketplace.json`.
 *
 * Each reference is resolved against three roots, and only counts as broken if
 * it resolves against none of them:
 *   - the repo root
 *   - the directory of the file that mentions it
 *   - skills/  (the shared docs live there and are referenced by bare name)
 *
 * Fenced code blocks are stripped before scanning: inside a fence, backticks
 * and brackets are literal text, not an inline code span or a link.
 *
 * The backtick heuristic is deliberately tight — a token only counts as a path
 * reference if it ends in .md / .json / .mjs / .yml, has no whitespace, and
 * carries no placeholder or glob syntax ({}, <>, *, ?).
 *
 * Zero dependencies. Node >= 18.
 *
 * Usage:
 *   node scripts/check-references.mjs
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, normalize, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SKIP_DIRS = new Set(['.git', 'node_modules']);
const PATH_EXTENSIONS = ['.md', '.json', '.mjs', '.yml'];

const toPosix = (p) => p.split('\\').join('/');

/** Every markdown file in the repo, excluding the skipped directories. */
function walkMarkdown(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkMarkdown(join(dir, entry.name), out);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md') && !SKIP_FILES.has(entry.name)) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

/**
 * Blank out fenced code blocks, keeping the line count intact so reported
 * line numbers still point at the right place in the original file.
 */
function blankFences(lines) {
  const out = [];
  let fence = null;
  for (const line of lines) {
    const m = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence === null && m) {
      fence = m[1][0];
      out.push('');
      continue;
    }
    if (fence !== null) {
      out.push('');
      if (m && m[1][0] === fence) fence = null;
      continue;
    }
    out.push(line);
  }
  return out;
}

/** Is this link target a repo-relative path worth resolving? */
function isRelativeLinkTarget(target) {
  if (!target) return false;
  if (target.includes('://')) return false;
  if (/^(?:https?|mailto|tel|data|ftp|javascript):/i.test(target)) return false;
  if (target.startsWith('#')) return false;
  if (target.startsWith('//')) return false;
  return true;
}

/** Is this backticked token shaped like a path reference into the repo? */
function isPathLikeToken(token) {
  if (!token) return false;
  if (/\s/.test(token)) return false;
  if (!PATH_EXTENSIONS.some((ext) => token.toLowerCase().endsWith(ext))) return false;
  if (token.includes('://')) return false;
  // Placeholders, globs and code fragments are not repo paths.
  if (/[{}<>*?|()[\]"'`$=!@#%^&;,]/.test(token)) return false;
  if (token.startsWith('-')) return false;
  return true;
}

/** Strip a trailing #anchor or ?query from a link target. */
function stripSuffix(target) {
  return target.replace(/[#?].*$/, '');
}

/** Try the three resolution roots. Returns true if any of them exists. */

/** Skill folder names, used to resolve `references/...` paths carried inside each skill. */
let _skillDirs = null;
function skillDirs() {
  if (_skillDirs) return _skillDirs;
  const dir = resolve(REPO_ROOT, 'skills');
  _skillDirs = existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];
  return _skillDirs;
}

/**
 * A changelog names files that existed when that version shipped. Requiring them to
 * exist forever would mean rewriting history to keep CI green, so it is not checked.
 */
const SKIP_FILES = new Set(['CHANGELOG.md']);

/** Generic mentions of a filename, not references to a particular file. */
const GENERIC = new Set(['SKILL.md', 'README.md', 'LICENSE', 'package.json']);


/** existsSync, but case-sensitive on every platform. */
function existsExact(candidate) {
  // Walk every segment from the repo root. Checking only the basename leaves the
  // directory names case-insensitive, so `References/x.md` passed on Windows.
  const rel = relative(REPO_ROOT, candidate);
  if (rel.startsWith('..')) return false;
  const parts = rel.split(sep).filter(Boolean);
  let dir = REPO_ROOT;
  for (const part of parts) {
    try {
      if (!readdirSync(dir).includes(part)) return false;
    } catch {
      return false;
    }
    dir = resolve(dir, part);
  }
  return true;
}

function resolves(ref, fileDir) {
  if (GENERIC.has(ref)) return true;
  const cleaned = ref.replace(/^\.\//, '').replace(/^\//, '');
  // A file inside a skill folder resolves against its OWN folder only. Letting it
  // resolve against any skill's folder hides the case that matters: a skill shipped
  // without the reference doc its body tells the agent to read, which is exactly what
  // `npx skills add --skill <one>` installs.
  const insideSkill = normalize(fileDir).startsWith(normalize(resolve(REPO_ROOT, 'skills')));
  const candidates = [
    resolve(REPO_ROOT, cleaned),
    resolve(fileDir, ref),
    resolve(REPO_ROOT, 'skills', cleaned),
    // Prose at the repo root may name a path every skill carries a copy of.
    ...(insideSkill ? [] : skillDirs().map((d) => resolve(REPO_ROOT, 'skills', d, cleaned))),
  ];
  const wantsDir = ref.endsWith('/');
  for (const candidate of candidates) {
    // Never let a `../..` reference escape the repo and match something outside.
    if (!normalize(candidate).startsWith(normalize(REPO_ROOT))) continue;
    if (!existsSync(candidate)) continue;
    // existsSync is case-insensitive on Windows and macOS. GitHub Actions and most
    // users' machines are not, so compare the real directory entry: a reference that
    // only differs in case is broken for them and must fail here too.
    if (!existsExact(candidate)) continue;
    if (wantsDir && !statSync(candidate).isDirectory()) continue;
    return true;
  }
  return false;
}

function collectReferences(lines) {
  /** @type {{line: number, ref: string, kind: string}[]} */
  const refs = [];
  const scannable = blankFences(lines);

  scannable.forEach((line, i) => {
    const lineNo = i + 1;

    // 1. markdown links — [text](target) / [text](target "title")
    for (const m of line.matchAll(/\[[^\]\n]*\]\(\s*([^)\s]+)(?:\s+"[^"\n]*")?\s*\)/g)) {
      const target = stripSuffix(m[1]);
      if (!isRelativeLinkTarget(target)) continue;
      refs.push({ line: lineNo, ref: target, kind: 'link' });
    }

    // 2. inline backtick tokens that look like repo paths
    for (const m of line.matchAll(/`([^`\n]+)`/g)) {
      const token = m[1].trim();
      if (!isPathLikeToken(token)) continue;
      refs.push({ line: lineNo, ref: token, kind: 'backtick' });
    }
  });

  return refs;
}

function main() {
  const files = walkMarkdown(REPO_ROOT).sort();

  let checked = 0;
  let broken = 0;
  const byFile = new Map();

  for (const file of files) {
    const rel = toPosix(relative(REPO_ROOT, file));
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    const refs = collectReferences(lines);
    const fileDir = dirname(file);

    for (const ref of refs) {
      checked++;
      if (resolves(ref.ref, fileDir)) continue;
      broken++;
      if (!byFile.has(rel)) byFile.set(rel, []);
      byFile.get(rel).push(ref);
    }
  }

  console.log('reference check');
  console.log('===============');
  console.log('');
  console.log(
    `${files.length} markdown file(s), ${checked} repo-path reference(s) resolved against ` +
      'repo root / file dir / skills/',
  );
  console.log('');

  if (broken === 0) {
    console.log('PASS — every referenced file exists.');
    return;
  }

  for (const [rel, refs] of [...byFile.entries()].sort()) {
    console.log(rel);
    for (const r of refs) {
      console.log(`  ${rel}:${r.line}  UNRESOLVED  ${r.ref}   [${r.kind}]`);
    }
    console.log('');
  }

  console.log('---------------');
  console.log(`${broken} unresolved reference(s) across ${byFile.size} file(s)`);
  console.error('');
  console.error('FAIL: CONTRIBUTING.md requires every referenced file to exist.');
  process.exit(1);
}

main();
