import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    ui: false,
    setupFiles: ['__tests__/setup.ts']
  }
});
