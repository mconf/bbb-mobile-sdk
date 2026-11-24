import { fileURLToPath } from 'node:url';
import { normalizePath, transformWithOxc, type Plugin } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';

const folder = (relative: string): string => (
  normalizePath(fileURLToPath(new URL(relative, import.meta.url)))
);
const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const appHostFiles = new RegExp(
  `^(${escape(folder('../src/plugins/'))}|${escape(folder('./test/sdk-host/'))}).*\\.[cm]?tsx?$`,
);

// vite looks up a tsconfig.json for each file it compiles. For these files that
// lookup loads the app's tsconfig.json, which extends expo's, and this folder's CI
// job does not install expo. So vite's own TypeScript step skips them, and this
// plugin compiles them without a tsconfig.
const appHostWithoutTsconfig: Plugin = {
  name: 'app-host-without-tsconfig',
  enforce: 'pre',
  async transform(code, id) {
    if (!appHostFiles.test(id.split('?')[0] ?? id)) return null;
    const { code: js, map } = await transformWithOxc(code, id, { lang: 'ts', tsconfig: false });
    return { code: js, map };
  },
};

export default defineConfig({
  plugins: [appHostWithoutTsconfig],
  oxc: { exclude: [appHostFiles] },
  // test/sdk-host imports the app's host code from ../src/plugins. In CI only this
  // folder's packages are installed, so the contract resolves to this folder's
  // source, and React and semver to this folder's copies.
  resolve: {
    alias: [
      { find: /^@mconf\/bbb-mobile-plugin-api$/, replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)) },
      { find: /^semver$/, replacement: fileURLToPath(new URL('./node_modules/semver/', import.meta.url)) },
    ],
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
    // test/react18 holds the check that `npm run test:react18` runs on React 18.2.
    exclude: [...configDefaults.exclude, 'test/react18/**'],
    // Testing Library unmounts after each test only when `afterEach` is a global, and
    // this config does not turn globals on.
    setupFiles: ['test/setup.ts'],
  },
});
