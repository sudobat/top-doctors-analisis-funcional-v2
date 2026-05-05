import { test as base } from "@playwright/test";
import { UnifiedConfigPage } from "../pages/unified-config.page";

/** Sesión: ver `playwright.config.ts` + `e2e/global-setup.ts` (PLAYWRIGHT_DOCTOR_*). */

export type BackofficeFixtures = {
  unifiedConfigPage: UnifiedConfigPage;
};

export const test = base.extend<BackofficeFixtures>({
  unifiedConfigPage: async ({ page }, use) => {
    await use(new UnifiedConfigPage(page));
  },
});

export { expect } from "@playwright/test";
