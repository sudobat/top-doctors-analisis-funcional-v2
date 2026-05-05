import * as fs from "fs";
import * as path from "path";
import type { Page } from "@playwright/test";
import { chromium, expect, type FullConfig } from "@playwright/test";

const authFile = path.join(__dirname, ".auth", "doctor.json");

/** Cookiebot / banners suelen vivir en el documento principal o en iframes. */
async function dismissCookieBanners(page: Page): Promise<void> {
  const mainCandidates = [
    page.getByRole("button", { name: /^Allow all$/i }),
    page.getByRole("button", { name: /aceptar todas las cookies/i }),
    page.getByRole("button", { name: /aceptar todo/i }),
    page.getByRole("button", { name: /^Deny$/i }),
  ];

  for (const loc of mainCandidates) {
    if ((await loc.count()) > 0 && (await loc.first().isVisible())) {
      await loc.first().click({ timeout: 8000 }).catch(() => {});
      return;
    }
  }

  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) {
      continue;
    }
    try {
      const btn = frame.getByRole("button", { name: /^Allow all$/i });
      if ((await btn.count()) > 0 && (await btn.first().isVisible())) {
        await btn.first().click({ timeout: 8000 });
        return;
      }
    } catch {
      /* iframe sin mismo-origin o sin árbol accesible */
    }
  }
}

/**
 * Login en navegador real y guarda storageState para reutilizar en tests.
 * Credenciales solo por variables de entorno (nunca en código ni en git).
 *
 * Top Doctors /login/: la pestaña por defecto es "Soy paciente"; para doctor hay que
 * elegir "Soy doctor" y entonces aparecen correo + contraseña + Iniciar sesión.
 */
export default async function globalSetup(_config: FullConfig): Promise<void> {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "");
  const email = process.env.PLAYWRIGHT_DOCTOR_EMAIL;
  const password = process.env.PLAYWRIGHT_DOCTOR_PASSWORD;

  if (!email || !password || !baseURL) {
    console.log(
      "[global-setup] Sin PLAYWRIGHT_DOCTOR_EMAIL / PLAYWRIGHT_DOCTOR_PASSWORD / PLAYWRIGHT_BASE_URL: no se genera sesión."
    );
    return;
  }

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    const loginUrl =
      process.env.PLAYWRIGHT_LOGIN_URL ??
      `${baseURL}${process.env.PLAYWRIGHT_LOGIN_PATH ?? "/login/"}`;

    await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });

    await dismissCookieBanners(page);

    const doctorTab = page.getByRole("tab", { name: /soy doctor/i });
    await doctorTab.waitFor({ state: "visible", timeout: 20_000 });
    await doctorTab.click();
    await expect(doctorTab).toHaveAttribute("aria-selected", "true", {
      timeout: 15_000,
    });

    const passwordBox = page.getByRole("textbox", { name: /contraseña/i });
    await passwordBox.waitFor({ state: "visible", timeout: 25_000 });

    await page
      .getByRole("textbox", { name: /correo electr[oó]nico/i })
      .fill(email);
    await passwordBox.fill(password);

    const submit = page.getByRole("button", {
      name: /^iniciar sesi[oó]n$/i,
    });
    await submit.waitFor({ state: "visible", timeout: 10_000 });
    await expect(submit).toBeEnabled({ timeout: 15_000 });
    await submit.click();

    await page.waitForURL(/backoffice|provider|dashboard|cuenta/i, {
      timeout: 60_000,
    });

    await context.storageState({ path: authFile });
    console.log(`[global-setup] Sesión guardada en ${authFile}`);
  } finally {
    await browser.close();
  }
}
