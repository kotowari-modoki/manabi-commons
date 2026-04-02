// ABOUTME: Playwright configuration for e2e tests against the Astro dev server.
// ABOUTME: Automatically starts the dev server before running tests.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4321/manabi-commons',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321/manabi-commons/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
