import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['api-tests/**/*.test.js', 'security/**/*.test.js', 'hero/**/*.test.js'],
    exclude: ['e2e/**', 'load/**', 'mobile/**'],
    setupFiles: ['./api-tests/setup.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './reports/coverage',
      include: ['api-tests/**'],
    },
    reporters: ['verbose', 'json'],
    outputFile: './reports/api-results.json',
  },
});
