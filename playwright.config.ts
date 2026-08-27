import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/find-a-match",
    reuseExistingServer: !process.env.CI,
    env: {
      SOLAS_PRACTITIONER_E2E: "1",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.test",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-e2e-publishable-key",
    },
  },
});
