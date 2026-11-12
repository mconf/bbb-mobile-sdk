import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
    // Testing Library unmounts after each test only when `afterEach` is a global, and
    // this config does not turn globals on.
    setupFiles: ['test/setup.ts'],
  },
});
