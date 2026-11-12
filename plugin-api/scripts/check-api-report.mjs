// Checks the API reports in etc/ and the version rule that goes with them.
//
//   node scripts/check-api-report.mjs            check (run `npm run build` first: it reads dist/)
//   node scripts/check-api-report.mjs --update   rewrite the reports from the build
//
// The check fails when:
//   1. HOST_API_VERSION in src/version.ts differs from the version in package.json, or
//      the version is not a semver version;
//   2. a report in etc/ differs from what the build produces, or API Extractor reports
//      an error or a warning;
//   3. the version is lower than at the merge-base with the base branch;
//   4. a report differs from the merge-base, and the version does not have a higher
//      major.minor than both the version at the merge-base and the version at the tip of
//      the base branch, apart from the pre-release case below.
//
// Pre-releases of one version may change the API among themselves and in the release. So
// in rule 4, a version also passes against a pre-release when it is higher in semver
// order and has the same major.minor.patch: 0.2.0-beta.2 and 0.2.0 both pass after
// 0.2.0-beta.1, but 0.2.1, a higher patch, does not.
//
// Rule 4 also reads the tip. Two branches can start from one merge-base and raise the
// version to the same value. Once the first one merges, the check fails on the second,
// but only when it runs again against a freshly fetched base.
//
// --update rewrites both reports. It fails only on an API Extractor error or on rule 1;
// a warning does not fail it, as with API Extractor's own --local.
//
// The base branch is `origin/mobile-plugins/trunk`; set API_BASE_REF to use another ref.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import semver from 'semver';

const require = createRequire(import.meta.url);
const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

const root = fileURLToPath(new URL('..', import.meta.url));
const update = process.argv.includes('--update');
const baseRef = process.env.API_BASE_REF || 'origin/mobile-plugins/trunk';
const configs = ['api-extractor.json', 'api-extractor.testing.json'];

const fail = (message) => {
  console.error(`${update ? 'api:update' : 'api:check'} FAILED: ${message}`);
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
// semver.valid also accepts a leading "v" or "=", which a package version must not have.
const checkVersion = (version, where) => {
  if (typeof version !== 'string' || !/^\d/.test(version) || semver.valid(version) === null) {
    fail(`the version "${version}" in ${where} is not a semver version`);
  }
  return version;
};
// Rule 4 for one of the two base versions.
const mayChangeApiAfter = (version, other) => {
  if (!semver.gt(version, other)) return false;
  if (semver.major(version) !== semver.major(other)) return true;
  if (semver.minor(version) !== semver.minor(other)) return true;
  return semver.prerelease(other) !== null && semver.patch(version) === semver.patch(other);
};

// 1. One version, in two places.
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const { HOST_API_VERSION: constant } = await import(new URL('../dist/version.js', import.meta.url));
if (constant !== version) {
  fail(`HOST_API_VERSION is ${constant} in src/version.ts, but package.json has ${version}`);
}
checkVersion(version, 'package.json');

// 2. The committed reports match the build, and API Extractor has nothing to report.
// API Extractor logs a changed report as a warning; rule 2 checks apiReportChanged instead.
const REPORT_CHANGED = new Set([
  'console-api-report-not-copied', 'console-api-report-copied', 'console-api-report-created',
]);
const failures = [];
configs.forEach((config) => {
  let errors = 0;
  let warnings = 0;
  const result = Extractor.invoke(ExtractorConfig.loadFileAndPrepare(join(root, config)), {
    localBuild: update,
    messageCallback: (message) => {
      if (REPORT_CHANGED.has(message.messageId)) return;
      if (message.logLevel === 'error') errors += 1;
      if (message.logLevel === 'warning') warnings += 1;
    },
  });
  if (!update && result.apiReportChanged) {
    failures.push(`the report of ${config} differs from the build. Run "npm run api:update", `
      + 'review the diff and raise the minor version.');
  }
  if (errors > 0 || (!update && warnings > 0)) {
    failures.push(`API Extractor reported ${errors} error(s) and ${warnings} warning(s) for `
      + `${config} (see above). Fix them${update ? '' : ' and run the check again'}.`);
  }
});
if (failures.length > 0) fail(failures.join('\n  '));
if (update) {
  console.log('api:update: reports rewritten in etc/. If they changed, raise the minor version.');
  process.exit(0);
}

// 3 and 4. The version against the merge-base and the tip of the base branch.
if (tryGit('rev-parse', '--verify', '--quiet', `${baseRef}^{commit}`) === null) {
  fail(`cannot find the base "${baseRef}". Fetch it, or set API_BASE_REF to another ref.`);
}
const base = tryGit('merge-base', 'HEAD', baseRef);
if (base === null) {
  fail(`cannot find a merge-base of HEAD and "${baseRef}". In a shallow clone, deepen the `
    + 'history (git fetch --unshallow).');
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
checkVersion(baseVersion, `package.json at the base ${base.slice(0, 8)}`);
if (semver.lt(version, baseVersion)) {
  fail(`the version is ${version}, lower than ${baseVersion} at the base ${base.slice(0, 8)}.`);
}
const changed = [
  ...git('diff', '--name-only', base, '--', 'etc').split('\n'),
  ...git('ls-files', '--others', '--exclude-standard', '--', 'etc').split('\n'),
].filter((file) => file.endsWith('.api.md'));

if (changed.length > 0) {
  const floors = tipVersion === null
    ? [baseVersion]
    : [baseVersion, checkVersion(tipVersion, `package.json at "${baseRef}"`)];
  if (!floors.every((floor) => mayChangeApiAfter(version, floor))) {
    fail(`the API report changed (${[...new Set(changed)].join(', ')}) but the version is `
      + `${version}; the base ${base.slice(0, 8)} has ${baseVersion} and "${baseRef}" has `
      + `${tipVersion ?? 'no package'}. Raise the minor (or major) version above both, in `
      + 'package.json and src/version.ts.');
  }
}
console.log(changed.length > 0
  ? `api:check OK: the API report changed and the version went from ${baseVersion} to ${version}.`
  : `api:check OK: the API report is unchanged since the base ${base.slice(0, 8)} (version ${version}).`);
