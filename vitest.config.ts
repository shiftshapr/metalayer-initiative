import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname),
  test: {
    include: ['presence/tests/**/*.test.ts'],
    environment: 'happy-dom',
    globals: true,
    reporters: ['default'],
    watch: false
  },
  resolve: {
    alias: {
      '@presence': path.resolve(__dirname, 'presence/src')
    }
  }
});







