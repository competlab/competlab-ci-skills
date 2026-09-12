#!/usr/bin/env node
/**
 * Copy the shared reference docs into every skill's `references/` folder.
 *
 * Why copies and not one shared file: a skill has to be installable on its own.
 * `npx skills add --skill <name>` copies exactly one skill folder, so anything a skill
 * reads at runtime has to live inside it. The canonical text is in `shared/`; these are
 * generated copies, and `--check` fails CI if they have drifted.
 *
 *   node scripts/sync-shared.mjs          write the copies
 *   node scripts/sync-shared.mjs --check  verify without writing (CI)
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHARED_DIR = join(REPO_ROOT, 'shared');
const SKILLS_DIR = join(REPO_ROOT, 'skills');
const CHECK_ONLY = process.argv.slice(2).includes('--check');

/** canonical file in shared/ -> filename it gets inside each skill's references/ */
const DOCS = {
  'READING-THE-DATA.md': 'reading-the-data.md',
  'PLATFORM.md': 'platform.md',
};

const BANNER = (source) =>
  `<!-- Generated from ${source} by scripts/sync-shared.mjs. Edit the original, then run \`npm run sync:shared\`. -->\n\n`;

const toPosix = (p) => p.split('\\').join('/');

const skills = existsSync(SKILLS_DIR)
  ? readdirSync(SKILLS_DIR).filter((n) => statSync(join(SKILLS_DIR, n)).isDirectory())
  : [];

if (skills.length === 0) {
  console.error('No skill folders found under skills/.');
  process.exit(1);
}

let written = 0;
let drifted = 0;
const driftList = [];

for (const [sourceName, targetName] of Object.entries(DOCS)) {
  const sourcePath = join(SHARED_DIR, sourceName);
  if (!existsSync(sourcePath)) {
    console.error(`Missing canonical doc: shared/${sourceName}`);
    process.exit(1);
  }
  // The copies sit beside each other under their lowercase names, so rewrite the
  // cross-references too. Without this the links resolve only on a case-insensitive
  // filesystem and break for everyone on Linux and macOS.
  let text = readFileSync(sourcePath, 'utf8');
  for (const [from, to] of Object.entries(DOCS)) {
    text = text.split(from).join(to);
  }
  const expected = BANNER(`shared/${sourceName}`) + text;

  for (const skill of skills) {
    const refsDir = join(SKILLS_DIR, skill, 'references');
    const targetPath = join(refsDir, targetName);
    const rel = toPosix(relative(REPO_ROOT, targetPath));

    const current = existsSync(targetPath) ? readFileSync(targetPath, 'utf8') : null;
    if (current === expected) continue;

    if (CHECK_ONLY) {
      drifted++;
      driftList.push(`${rel} — ${current === null ? 'missing' : 'out of date'}`);
      continue;
    }
    if (!existsSync(refsDir)) mkdirSync(refsDir, { recursive: true });
    writeFileSync(targetPath, expected);
    written++;
    console.log(`  wrote ${rel}`);
  }
}

if (CHECK_ONLY) {
  if (drifted > 0) {
    console.error('shared-docs check');
    console.error('=================');
    for (const line of driftList) console.error(`  ${line}`);
    console.error('');
    console.error(`FAIL: ${drifted} generated copy/copies differ from shared/. Run \`npm run sync:shared\`.`);
    process.exit(1);
  }
  console.log(`shared-docs check: OK — ${skills.length} skills carry current copies.`);
  process.exit(0);
}

console.log(`\nsync-shared: ${written} file(s) written across ${skills.length} skill(s).`);
