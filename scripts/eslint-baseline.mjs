// Checks the ESLint problems against eslint-baseline.json, which may only go down.
//
//   node scripts/eslint-baseline.mjs            check
//   node scripts/eslint-baseline.mjs --update   rewrite the baseline from the current problems
//
// The baseline counts the problems of each file per rule. The check fails when:
//   1. a file does not parse (parse errors are never baselined);
//   2. a file has more problems of a rule than the baseline allows, or problems of a rule
//      the baseline does not list for it. Fix them; do not raise the baseline. Counts, not
//      single problems, are compared: fixing one problem and adding another of the same
//      rule in the same file passes;
//   3. a file has fewer problems of a rule than the baseline lists. Run --update and commit
//      the baseline, so that the fixed problems cannot come back;
//   4. the baseline lists more problems of a rule for a file than the baseline of the base
//      branch, following renames. Git sees a rename only above 50% similarity: a file
//      moved and rewritten below that is compared as a new file.
//
// Only files tracked by git are linted, so editor backups and scratch files do not count;
// the check names the untracked files it skips.
// --update fails only on rule 1.
//
// The base branch is `origin/mobile-plugins/trunk`; set LINT_BASE_REF to use another ref.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { ESLint } = require('eslint');

const root = fileURLToPath(new URL('..', import.meta.url));
const BASELINE = 'eslint-baseline.json';
const EXTENSIONS = ['.js', '.ts', '.tsx'];
const update = process.argv.includes('--update');
const baseRef = process.env.LINT_BASE_REF || 'origin/mobile-plugins/trunk';
const name = update ? 'lint:baseline --update' : 'lint:baseline';

let notes = [];
const fail = (messages) => {
  console.error(`${name} FAILED:\n  ${messages.join('\n  ')}`);
  notes.forEach((note) => console.error(note));
  process.exit(1);
};
const git = (...args) => execFileSync('git', args, {
  cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
});
const tryGit = (...args) => {
  try {
    return execFileSync('git', args, {
      cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
};

// Counts as { file: { rule: n } }, and helpers over them.
const count = (counts, file, rule) => counts[file]?.[rule] ?? 0;
const entries = (counts) => Object.entries(counts)
  .flatMap(([file, rules]) => Object.entries(rules).map(([rule, n]) => [file, rule, n]));
const total = (counts) => entries(counts).reduce((sum, [, , n]) => sum + n, 0);
const sortKeys = (object, map = (value) => value) => Object.fromEntries(
  Object.keys(object).sort().map((key) => [key, map(object[key])]),
);
const serialize = (counts) => `${JSON.stringify(sortKeys(counts, (rules) => sortKeys(rules)), null, 2)}\n`;

// Lint the tracked files that ESLint does not ignore.
const eslint = new ESLint({ cwd: root });
const lintable = async (...args) => {
  const candidates = git('ls-files', '-z', ...args).split('\0')
    .filter((file) => EXTENSIONS.some((extension) => file.endsWith(extension)))
    .filter((file) => existsSync(join(root, file)));
  const ignored = await Promise.all(
    candidates.map((file) => eslint.isPathIgnored(join(root, file))),
  );
  return candidates.filter((file, i) => !ignored[i]);
};
const files = await lintable();
const untracked = await lintable('--others', '--exclude-standard');
const results = await eslint.lintFiles(files.map((file) => join(root, file)));
const untrackedNote = untracked.length === 0 ? [] : [
  `note: ${untracked.length} untracked file(s) not linted; "git add" them to lint them: `
    + `${untracked.slice(0, 5).join(', ')}${untracked.length > 5 ? ', ...' : ''}`,
];

const current = {};
const found = {};
const parseErrors = [];
results.forEach(({ filePath, messages }) => {
  const file = relative(root, filePath).split(sep).join('/');
  messages.forEach(({ fatal, ruleId, line, column, message }) => {
    const at = `${file}:${line}:${column}`;
    if (fatal) {
      parseErrors.push(`${at} ${message}`);
      return;
    }
    const rule = ruleId ?? '(no rule)';
    current[file] ??= {};
    current[file][rule] = count(current, file, rule) + 1;
    (found[`${file}\0${rule}`] ??= []).push(`${at} ${rule}: ${message}`);
  });
});

notes = untrackedNote;

// 1. Parse errors.
if (parseErrors.length > 0) {
  fail(['these files do not parse; fix them:', ...parseErrors.map((error) => `  ${error}`)]);
}
const summary = `${total(current)} problem(s) in ${Object.keys(current).length} file(s) `
  + `(${files.length} file(s) linted)`;
if (update) {
  writeFileSync(join(root, BASELINE), serialize(current));
  console.log(`${name}: ${BASELINE} rewritten: ${summary}.`);
  notes.forEach((note) => console.log(note));
  process.exit(0);
}

// 2 and 3. The problems against the baseline.
if (!existsSync(join(root, BASELINE))) {
  fail([`${BASELINE} is missing. Run "npm run lint:baseline -- --update".`]);
}
const baseline = JSON.parse(readFileSync(join(root, BASELINE), 'utf8'));
const failures = [];
const above = entries(current).filter(([file, rule, n]) => n > count(baseline, file, rule));
if (above.length > 0) {
  failures.push('more problems than the baseline; fix the new ones (the baseline is never '
    + 'raised for them):');
  above.forEach(([file, rule, n]) => {
    failures.push(`  ${file} ${rule}: ${n}, the baseline allows ${count(baseline, file, rule)}`);
    found[`${file}\0${rule}`].forEach((problem) => failures.push(`    ${problem}`));
  });
}
const below = entries(baseline).filter(([file, rule, n]) => n > count(current, file, rule));
if (below.length > 0) {
  failures.push('fewer problems than the baseline; run "npm run lint:baseline -- --update" '
    + `and commit ${BASELINE}:`);
  below.forEach(([file, rule, n]) => {
    failures.push(`  ${file} ${rule}: ${count(current, file, rule)}, the baseline lists ${n}`);
  });
}

// 4. The baseline against the base branch.
if (tryGit('rev-parse', '--verify', '--quiet', `${baseRef}^{commit}`) === null) {
  fail([...failures,
    `cannot find the base "${baseRef}". Fetch it, or set LINT_BASE_REF to another ref.`]);
}
const baseText = tryGit('show', `${baseRef}:${BASELINE}`);
let baseNote = `the base "${baseRef}" has no ${BASELINE} yet`;
if (baseText !== null) {
  const renamed = {};
  const fields = git('diff', '-M', '--name-status', '--diff-filter=R', '-z', baseRef)
    .split('\0');
  for (let i = 0; i + 2 < fields.length; i += 3) renamed[fields[i + 1]] = fields[i + 2];
  const base = {};
  Object.entries(JSON.parse(baseText)).forEach(([file, rules]) => {
    base[renamed[file] ?? file] = rules;
  });
  const raised = entries(baseline).filter(([file, rule, n]) => n > count(base, file, rule));
  if (raised.length > 0) {
    failures.push(`${BASELINE} lists more problems than at "${baseRef}"; it may only go down `
      + `(if "${baseRef}" went down since this branch started, rebase onto it; if a file was `
      + 'moved and rewritten, git may not see the rename: move it in a pull request of its '
      + 'own first, or keep it above 50% similarity):');
    raised.forEach(([file, rule, n]) => {
      failures.push(`  ${file} ${rule}: ${n}, "${baseRef}" lists ${count(base, file, rule)}`);
    });
  }
  baseNote = `not above "${baseRef}" (${total(base)})`;
}
if (failures.length > 0) fail(failures);
console.log(`${name} OK: ${summary}, as in ${BASELINE}; ${baseNote}.`);
notes.forEach((note) => console.log(note));
