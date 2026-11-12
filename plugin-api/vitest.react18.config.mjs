import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';
import base from './vitest.config.ts';

// Runs the tests against React 18.2, the lowest React in the peer range. React 18.2 is
// installed in test/react18; `npm run test:react18` installs it first.
const path = (relative) => fileURLToPath(new URL(relative, import.meta.url));
const react18 = path('./test/react18/node_modules/');

export default defineConfig({
  resolve: {
    alias: [
      { find: /^(react|react-dom)(\/.*)?$/, replacement: `${react18}$1$2` },
      // Testing Library's CommonJS build would load this folder's React 19 with `require`.
      // Its ES module build imports React through the alias above.
      {
        find: /^@testing-library\/react$/,
        replacement: path('./node_modules/@testing-library/react/dist/@testing-library/react.esm.js'),
      },
    ],
  },
  test: {
    ...base.test,
    name: 'react-18',
    exclude: configDefaults.exclude,
  },
});
