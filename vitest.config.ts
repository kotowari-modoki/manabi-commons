// ABOUTME: Vitest configuration for unit testing pure logic functions.
// ABOUTME: Uses jsdom environment to provide localStorage in tests.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
