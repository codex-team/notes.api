import { defineConfig } from 'vitest/config';

/* eslint-disable @typescript-eslint/naming-convention */

export default defineConfig({
  test: {
    globals: true
  },
  resolve: {
    alias: {
      '@/': '/src/',
      '@infrastructure/': '/src/infrastructure/',
      '@presentation/': '/src/presentation/',
      '@lib/': '/src/lib/',
      '@domain/': '/src/domain/',
      '@repository/': '/src/repository/',
    },
  },
});
