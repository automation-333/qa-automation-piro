// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const SITE_URL = 'https://piro-portfolio.netlify.app';
const API_URL = 'http://localhost:3000';

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // сайт анимирован (GSAP) - просим "меньше движения", чтобы тесты были стабильнее
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'ui', testDir: './tests/ui', testIgnore: /mobile/, use: { ...devices['Desktop Chrome'], baseURL: SITE_URL } },
    { name: 'mobile', testDir: './tests/ui', testMatch: /mobile/, use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, baseURL: SITE_URL } },
    { name: 'api', testDir: './tests/api', use: { baseURL: API_URL } },
  ],
  // mock-API поднимается автоматически перед тестами
  webServer: {
    command: 'node mock-api/server.js',
    url: `${API_URL}/health`,
    reuseExistingServer: !process.env.CI,
  },
});
