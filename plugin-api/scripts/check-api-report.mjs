// Checks the API reports in etc/ and the version rule that goes with them.
//
//   node scripts/check-api-report.mjs            check (run `npm run build` first: it reads dist/)
//   node scripts/check-api-report.mjs --update   rewrite the reports from the build
//
// The check fails when:
//   1. HOST_API_VERSION in src/version.ts differs from the version in package.json;
//   2. a report in etc/ differs from what the build produces;
//   3. a report differs from the merge-base with the base branch and the minor (or major)
//      version is not higher than both at that merge-base and at the tip of the base
//      branch. A branch checked again after another one merged at its version then fails.
//
// The base branch is `origin/mobile-plugins/trunk`; set API_BASE_REF to use another ref.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const update = process.argv.includes('--update');
const baseRef = process.env.API_BASE_REF || 'origin/mobile-plugins/trunk';
const configs = ['api-extractor.json', 'api-extractor.testing.json'];
const extractor = fileURLToPath(
  new URL('../node_modules/@microsoft/api-extractor/bin/api-extractor', import.meta.url),
);

const fail = (message) => {
  console.error(`api:check FAILED: ${message}`);
  process.exit(1);
};
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const tryGit = (...args) => {
  try {
    return execFileSync('git', args, {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
};
const parseVersion = (version) => {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) fail(`"${version}" is not a semver version`);
  return match.slice(1).map(Number);
};

// 1. One version, in two places.
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const { HOST_API_VERSION: constant } = await import(new URL('../dist/version.js', import.meta.url));
if (constant !== version) {
  fail(`HOST_API_VERSION is ${constant} in src/version.ts, but package.json has ${version}`);
}

// 2. The committed reports match the build.
configs.forEach((config) => {
  const args = [extractor, 'run', '--config', config, ...(update ? ['--local'] : [])];
  const { status } = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (status !== 0) {
    fail(`the report of ${config} differs from the build. Run "npm run api:update", `
      + 'review the diff and raise the minor version.');
  }
});
if (update) {
  console.log('api:update: reports rewritten in etc/. If they changed, raise the minor version.');
  process.exit(0);
}

// 3. A report change needs a higher minor version than the base branch has, at the
// merge-base and at its tip.
const base = tryGit('merge-base', 'HEAD', baseRef);
if (base === null) {
  fail(`cannot find the base "${baseRef}". Fetch it, or set API_BASE_REF to another ref.`);
}
const prefix = git('rev-parse', '--show-prefix');
const readVersion = (ref) => {
  const text = tryGit('show', `${ref}:${prefix}package.json`);
  return text === null ? null : JSON.parse(text).version;
};
const baseVersion = readVersion(base);
const tipVersion = readVersion(baseRef);
if (baseVersion === null) {
  if (tipVersion !== null) {
    fail(`the package is new on this branch, but "${baseRef}" already has it at version `
      + `${tipVersion}. Rebase onto "${baseRef}".`);
  }
  console.log(`api:check OK: the package is new on this branch (version ${version}, base ${base.slice(0, 8)}).`);
  process.exit(0);
}
const changed = [
  ...git('diff', '--name-only', base, '--', 'etc').split('\n'),
  ...git('ls-files', '--others', '--exclude-standard', '--', 'etc').split('\n'),
].filter((file) => file.endsWith('.api.md'));
const [major, minor] = parseVersion(version);
const bumpedOver = (other) => {
  const [otherMajor, otherMinor] = parseVersion(other);
  return major > otherMajor || (major === otherMajor && minor > otherMinor);
};
const floors = tipVersion === null ? [baseVersion] : [baseVersion, tipVersion];

if (changed.length > 0 && !floors.every(bumpedOver)) {
  fail(`the API report changed (${[...new Set(changed)].join(', ')}) but the version is `
    + `${version}; the base ${base.slice(0, 8)} has ${baseVersion} and "${baseRef}" has `
    + `${tipVersion ?? 'no package'}. Raise the minor version above both, in package.json `
    + 'and src/version.ts.');
}
console.log(changed.length > 0
  ? `api:check OK: the API report changed and the version went from ${baseVersion} to ${version}.`
  : `api:check OK: the API report is unchanged since the base ${base.slice(0, 8)} (version ${version}).`);
