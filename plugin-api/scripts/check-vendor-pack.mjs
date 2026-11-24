// Checks that ../vendor holds this package exactly as `npm pack` makes it now.
//
//   node scripts/check-vendor-pack.mjs            check
//   node scripts/check-vendor-pack.mjs --update   replace the tarball in ../vendor
//
// The app installs the contract from that tarball as a dev dependency. A `file:` link to
// this folder would bring a second React. Host apps install the same tarball themselves.
// README.md, "Embedding the SDK in an app", says why the app lists the contract as a
// peer dependency.
// `npm pack` is reproducible, so a tarball that differs from a fresh pack is stale.
//
// The check also compares the root lockfile's integrity hash with the tarball. A plain
// `npm install` keeps the old hash when only the tarball changes. `npm ci` then installs
// the copy cached under that hash, or fails with EINTEGRITY when it is not cached. So
// after --update, the root installs the tarball by its path.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import semver from 'semver';

const root = fileURLToPath(new URL('..', import.meta.url));
const vendor = join(root, '..', 'vendor');
const update = process.argv.includes('--update');
const relock = (filename) => `npm install --save-dev --save-exact ./vendor/${filename}`;

const out = mkdtempSync(join(tmpdir(), 'contract-pack-'));
try {
  const [{ filename, version }] = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--pack-destination', out], { cwd: root, encoding: 'utf8' }),
  );
  const packed = readFileSync(join(out, filename));
  const others = readdirSync(vendor).filter((f) => f.startsWith('mconf-bbb-mobile-plugin-api-') && f !== filename);

  if (update) {
    copyFileSync(join(out, filename), join(vendor, filename));
    others.forEach((f) => rmSync(join(vendor, f)));
    console.log(`vendor/${filename} updated. At the repository root, run: ${relock(filename)}`);
  } else {
    const problems = [];
    let committed = null;
    try {
      committed = readFileSync(join(vendor, filename));
    } catch {
      problems.push(`vendor/${filename} is missing`);
    }
    if (committed && !committed.equals(packed)) problems.push(`vendor/${filename} differs from a fresh npm pack`);
    others.forEach((f) => problems.push(`vendor/${f} is an older pack`));
    const rootPackage = JSON.parse(readFileSync(join(root, '..', 'package.json'), 'utf8'));
    const wanted = `file:vendor/${filename}`;
    if (rootPackage.devDependencies?.['@mconf/bbb-mobile-plugin-api'] !== wanted) {
      problems.push(`the root package.json does not have ${wanted} as a dev dependency`);
    }
    if (rootPackage.dependencies?.['@mconf/bbb-mobile-plugin-api']) {
      problems.push('the root package.json lists the contract as a dependency; host apps could not install the app');
    }
    const peer = rootPackage.peerDependencies?.['@mconf/bbb-mobile-plugin-api'];
    if (!peer || !semver.satisfies(version, peer)) {
      problems.push(`the root package.json's peer range for the contract (${peer}) does not include ${version}`);
    }
    const lock = JSON.parse(readFileSync(join(root, '..', 'package-lock.json'), 'utf8'));
    const locked = lock.packages?.['node_modules/@mconf/bbb-mobile-plugin-api'];
    const integrity = `sha512-${createHash('sha512').update(packed).digest('base64')}`;
    if (locked?.resolved !== wanted || locked?.integrity !== integrity) {
      problems.push('the root package-lock.json does not lock the tarball as packed');
    }
    if (problems.length) {
      problems.forEach((p) => console.error(p));
      console.error(`Run \`npm run vendor:update\` here, then at the repository root: ${relock(filename)}`);
      process.exitCode = 1;
    } else {
      console.log(`vendor/${filename} matches a fresh npm pack.`);
    }
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}
