import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
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
