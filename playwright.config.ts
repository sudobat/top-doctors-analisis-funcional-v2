import * as path from "path";
import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

loadEnv({ path: path.resolve(__dirname, ".env"), quiet: true });

const baseURL = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "";

/** Sesión generada por `e2e/global-setup.ts` cuando hay credenciales en env */
const authStatePath = path.join(__dirname, "e2e", ".auth", "doctor.json");

const useAutoLogin =
  !process.env.PLAYWRIGHT_SKIP_GLOBAL_SETUP &&
  Boolean(
    process.env.PLAYWRIGHT_DOCTOR_EMAIL &&
      process.env.PLAYWRIGHT_DOCTOR_PASSWORD &&
      baseURL
  );

const storageState =
  process.env.PLAYWRIGHT_STORAGE_STATE?.trim() ||
  (useAutoLogin ? authStatePath : undefined);

export default defineConfig({
  testDir: "./e2e",
  globalSetup: useAutoLogin
    ? path.join(__dirname, "e2e", "global-setup.ts")
    : undefined,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: baseURL || undefined,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ...(storageState ? { storageState } : {}),
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
