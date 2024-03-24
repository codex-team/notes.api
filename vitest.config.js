import { defineConfig } from 'vitest/config';

/* eslint-disable @typescript-eslint/naming-convention */

export default defineConfig({
  test: {
    setupFiles: [ 'src/tests/utils/setup.ts' ],
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      reportOnFailure: true,
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@/': '/src/',
      '@infrastructure/': '/src/infrastructure/',
      '@presentation/': '/src/presentation/',
      '@lib/': '/src/lib/',
      '@domain/': '/src/domain/',
      '@repository/': '/src/repository/',
      '@tests/': '/src/tests/',
    },
  },
});
