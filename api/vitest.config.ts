import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec,e2e-spec}.?(c|m)[jt]s?(x)'],
    reporters: ['verbose'],
    testTimeout: 120000,
    coverage: {
      enabled: true,
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      provider: 'v8',
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ] as never,
});
