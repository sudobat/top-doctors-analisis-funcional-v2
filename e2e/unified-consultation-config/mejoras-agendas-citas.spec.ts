import { testIds } from "../pages/unified-config.page";
import { expect, test } from "../fixtures/backoffice-doctor-auth";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "";
const unifiedPath = process.env.PLAYWRIGHT_UNIFIED_CONFIG_PATH ?? "";
const e2eReady = Boolean(baseURL && unifiedPath);

const describeSuite = e2eReady ? test.describe : test.describe.skip;

describeSuite(
  "Mejoras configuracion agendas y citas [definir PLAYWRIGHT_BASE_URL + PLAYWRIGHT_UNIFIED_CONFIG_PATH]",
  () => {
    test.beforeEach(async ({ unifiedConfigPage }) => {
      await unifiedConfigPage.gotoUnifiedConfig();
      await unifiedConfigPage.expectUnifiedUiContract();
    });

    test.describe("E2E-UCFG-001 — Entrada directa al formulario unificado (H1)", () => {
      test("revalida raíz de página y selector de consulta por contrato testid", async ({
        unifiedConfigPage,
      }) => {
        await expect(
          unifiedConfigPage.page.getByTestId(testIds.pageRoot)
        ).toBeVisible();
        await expect(
          unifiedConfigPage.page.getByTestId(testIds.consultationSelect)
        ).toBeVisible();
      });
    });

    test.describe("E2E-UCFG-002 — Smoke bloques A, B y C (H1)", () => {
      test("bloques A/B/C y CTA principal visibles (contrato testid)", async ({
        unifiedConfigPage,
      }) => {
        await expect(
          unifiedConfigPage.page.getByTestId(testIds.blockConsulta)
        ).toBeVisible();
        await expect(
          unifiedConfigPage.page.getByTestId(testIds.blockServicios)
        ).toBeVisible();
        await expect(
          unifiedConfigPage.page.getByTestId(testIds.blockResumen)
        ).toBeVisible();
        await expect(
          unifiedConfigPage.page.getByTestId(testIds.saveButton)
        ).toBeVisible();
      });
    });

    test.describe("E2E-UCFG-003 — Sin guardados intermedios obligatorios (H1)", () => {
      test("dentro del shell no hay guardados parciales semanticos ni testids intermedios", async ({
        unifiedConfigPage,
      }) => {
        await expect(unifiedConfigPage.intermediateSaveButtons()).toHaveCount(0);
        await expect(
          unifiedConfigPage.intermediateSectionSaveByTestId()
        ).toHaveCount(0);
      });
    });

    test.describe("E2E-UCFG-004 — Orden A → B → C (H1)", () => {
      test("bloques aparecen en orden vertical esperado (testids)", async ({
        unifiedConfigPage,
      }) => {
        const { consulta, servicios, resumen } =
          await unifiedConfigPage.blockVerticalOrder();
        expect(consulta).toBeLessThan(servicios);
        expect(servicios).toBeLessThan(resumen);
      });
    });

    test.describe("E2E-UCFG-005 — Menu lateral acceso unificado (H1)", () => {
      test("sidebar BO expone entrada unificada y sin enlaces legacy triviales", async ({
        unifiedConfigPage,
      }) => {
        await expect(
          unifiedConfigPage.page.getByTestId(testIds.sidebarNav)
        ).toBeVisible();
        await expect(
          unifiedConfigPage.page.getByTestId(testIds.sidebarUnifiedNavItem)
        ).toBeVisible();
        await expect(unifiedConfigPage.legacyServiciosLink()).toHaveCount(0);
        await expect(unifiedConfigPage.legacyConsultasAgendasLink()).toHaveCount(
          0
        );
      });
    });

    test.describe("E2E-UCFG-006 — Cambios no persisten sin guardado final (H2)", () => {
      test("recarga sin guardar revierte edicion local", async ({
        page,
        unifiedConfigPage,
      }) => {
        const note = unifiedConfigPage.serviceNoteStrict();
        await expect(note).toBeVisible();

        const before = await note.inputValue().catch(() => "");
        const marker = `pw-${Date.now()}`;
        await note.fill(`${before}${marker}`);

        page.once("dialog", async (d) => {
          expect(d.type()).toBe("beforeunload");
          await d.accept();
        });
        await page.reload({ waitUntil: "domcontentloaded" });

        await unifiedConfigPage.expectUnifiedUiContract();
        const noteAfter = unifiedConfigPage.serviceNoteStrict();
        const after = await noteAfter.inputValue().catch(() => "");
        expect(after).not.toContain(marker);
      });
    });

    test.describe("E2E-UCFG-007 — Guardado bloqueado + errores globales (H2/H6)", () => {
      test("con invalidacion conocida muestra lista superior y bloquea persistencia", async ({
        unifiedConfigPage,
      }) => {
        const margin = unifiedConfigPage.marginFieldStrict();
        await expect(margin).toBeVisible();

        await margin.fill("9999");
        await unifiedConfigPage.saveButton().click();

        await expect(unifiedConfigPage.globalErrors()).toBeVisible();
        await expect(unifiedConfigPage.saveButton()).toBeDisabled();
      });
    });

    test.describe("E2E-UCFG-008 — Enlaces del resumen: scroll y foco (H2/H7)", () => {
      test("primer enlace global enfoca campo asociado", async ({
        unifiedConfigPage,
      }) => {
        const margin = unifiedConfigPage.marginFieldStrict();
        await expect(margin).toBeVisible();

        await margin.fill("9999");
        await unifiedConfigPage.saveButton().click();
        await expect(unifiedConfigPage.globalErrors()).toBeVisible();

        const link = unifiedConfigPage.globalErrorLinks().first();
        await expect(link).toBeVisible();
        await link.click();

        await expect(margin).toBeFocused();
      });
    });

    test.describe("E2E-UCFG-009 / 025 — Happy path guardado y estado (H2/H6)", () => {
      test("guardado exitoso muestra feedback y estado sin cambios pendientes", async ({
        page,
        unifiedConfigPage,
      }) => {
        const margin = unifiedConfigPage.marginFieldStrict();
        await expect(margin).toBeVisible();

        await margin.fill("5");
        await unifiedConfigPage.saveButton().click();

        const toastOrBanner = page.getByText(
          /guardad|configuraci[oó]n actualizada|guardado correctamente/i
        );
        const badge = unifiedConfigPage.formStatusBadge();
        await expect(toastOrBanner.or(badge)).toBeVisible({ timeout: 20_000 });
        if ((await badge.count()) > 0) {
          await expect(badge).toContainText(/sin cambios/i);
        }
      });
    });

    test.describe("E2E-UCFG-010 — Salida con cambios sin guardar (H3/H7)", () => {
      test("beforeunload o modal al abandonar con cambios", async ({
        page,
        unifiedConfigPage,
      }) => {
        const margin = unifiedConfigPage.marginFieldStrict();
        await expect(margin).toBeVisible();

        await margin.fill("7");

        let sawBeforeUnload = false;
        page.once("dialog", async (d) => {
          if (d.type() === "beforeunload") {
            sawBeforeUnload = true;
            await d.dismiss();
          }
        });

        await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded" }).catch(() => {});
        if (!sawBeforeUnload) {
          const modal = page.getByRole("dialog");
          await expect(modal).toBeVisible({ timeout: 3000 });
        }
      });
    });

    test.describe("E2E-UCFG-011 — Cambio de consulta bloqueado con cambios (H3)", () => {
      test("selector bloqueado o muestra mensaje si hay cambios sin guardar", async ({
        unifiedConfigPage,
      }) => {
        const sel = unifiedConfigPage.page.getByTestId(testIds.consultationSelect);
        const margin = unifiedConfigPage.marginFieldStrict();
        await expect(margin).toBeVisible();

        await margin.fill("8");
        const disabled = await sel.isDisabled().catch(() => true);
        if (!disabled) {
          await sel.click().catch(() => {});
          await expect(
            unifiedConfigPage.page.getByText(/guardar la configuraci/i)
          ).toBeVisible({ timeout: 5000 });
        } else {
          await expect(sel).toBeDisabled();
        }
      });
    });

    test.describe("E2E-UCFG-023 — Bloque resumen tiempo real (H6)", () => {
      test("bloque resumen visible y reacciona a error en bloque A", async ({
        unifiedConfigPage,
      }) => {
        const margin = unifiedConfigPage.marginFieldStrict();
        await expect(margin).toBeVisible();

        await expect(
          unifiedConfigPage.page.getByTestId(testIds.blockResumen)
        ).toBeVisible();
        await margin.fill("10000");
        await unifiedConfigPage.saveButton().click();
        await expect(unifiedConfigPage.globalErrors()).toBeVisible();
      });
    });

    test.describe("E2E-UCFG-029 — Fallo recuperable guardado (RNF)", () => {
      test("500 en endpoint de guardado muestra error recuperable", async ({
        page,
        unifiedConfigPage,
      }) => {
        const saveGlob = process.env.PLAYWRIGHT_SAVE_URL_GLOB;
        if (!saveGlob) {
          throw new Error(
            "Define PLAYWRIGHT_SAVE_URL_GLOB para ejecutar E2E-UCFG-029 (ej. **/api/**/guardado**)"
          );
        }

        await page.route(saveGlob, async (route) => {
          if (route.request().method() !== "POST") {
            await route.continue();
            return;
          }
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ error: "forced_failure" }),
          });
        });

        await unifiedConfigPage.marginFieldStrict().fill("3");

        await unifiedConfigPage.saveButton().click();
        await expect(
          page.getByText(/error|reintent|int[eé]ntalo|no se ha podido/i)
        ).toBeVisible({ timeout: 15_000 });

        await page.unroute(saveGlob);
      });
    });

    test.describe("E2E-UCFG-030 — Descartar cambios con confirmacion (H6)", () => {
      test("descartar pide confirmacion cuando hay cambios", async ({
        unifiedConfigPage,
      }) => {
        const discard = unifiedConfigPage.page.getByTestId(testIds.discardButton);
        await expect(discard).toBeVisible();

        const margin = unifiedConfigPage.marginFieldStrict();
        await expect(margin).toBeVisible();
        await margin.fill("9");

        unifiedConfigPage.page.once("dialog", async (d) => {
          expect(d.type()).toBe("confirm");
          await d.dismiss();
        });
        await discard.click();
      });
    });
  }
);
