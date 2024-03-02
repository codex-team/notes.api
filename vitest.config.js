import { defineConfig } from 'vitest/config';

/* eslint-disable @typescript-eslint/naming-convention */

export default defineConfig({
  test: {
    setupFiles: [ 'src/tests/utils/setup.ts' ],
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      reportOnFailure: true,
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
