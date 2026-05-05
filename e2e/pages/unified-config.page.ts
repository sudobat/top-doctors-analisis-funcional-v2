import { expect, type Locator, type Page } from "@playwright/test";
import { seeds } from "../data/unified-config-seeds";

/**
 * Textos / patrones alineados al spec funcional (titulos de bloque, CTAs).
 * Respaldo: data-testid para DOM legacy o sin landmarks accesibles.
 */
export const labels = {
  blockConsulta: /consulta y agendas/i,
  blockServicios: /servicios de la consulta/i,
  blockResumen: /resumen y validaci[oó]n final/i,
  savePrimary: /guardar configuraci[oó]n/i,
  discard: /descartar cambios/i,
  /** Preferir textos de etiqueta; evitar match amplio en toda la pagina */
  consultationControl: /selector.*consulta|consulta seleccionada|elegir consulta/i,
  /** Estados derivados del header (spec matriz) */
  formStatus:
    /sin cambios|con cambios sin guardar|errores pendientes/i,
} as const;

/** Convención data-testid opcional (contrato con front cuando roles no bastan) */
export const testIds = {
  pageRoot: "unified-config-page",
  consultationSelect: "unified-config-consultation-select",
  blockConsulta: "unified-config-block-consulta",
  blockServicios: "unified-config-block-servicios",
  blockResumen: "unified-config-block-resumen",
  saveButton: "unified-config-save",
  discardButton: "unified-config-discard",
  globalErrors: "unified-config-global-errors",
  globalErrorLink: "unified-config-global-error-link",
  formStatusBadge: "unified-config-form-status",
  progressIndicator: "unified-config-progress",
  sidebarNav: "backoffice-sidebar",
  sidebarUnifiedNavItem: "unified-config-nav-item",
  firstAppointmentMarginDays: "unified-config-margen-primera-cita-dias",
  serviceNote: "unified-config-service-note-sample",
} as const;

export class UnifiedConfigPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Raíz útil de la vista: main landmark o testid */
  pageRoot(): Locator {
    return this.page.getByRole("main").or(this.page.getByTestId(testIds.pageRoot));
  }

  /** Selector de consulta: combobox/label común en formularios */
  consultationSelect(): Locator {
    return this.page
      .getByLabel(labels.consultationControl)
      .or(this.page.getByRole("combobox", { name: labels.consultationControl }))
      .or(this.page.getByTestId(testIds.consultationSelect));
  }

  blockConsulta(): Locator {
    return this.blockLandmark(labels.blockConsulta, testIds.blockConsulta);
  }

  blockServicios(): Locator {
    return this.blockLandmark(labels.blockServicios, testIds.blockServicios);
  }

  blockResumen(): Locator {
    return this.blockLandmark(labels.blockResumen, testIds.blockResumen);
  }

  /**
   * Intenta region/group accesible; si no, section que contiene el heading;
   * último recurso testid.
   */
  private blockLandmark(name: RegExp, testId: string): Locator {
    const heading = this.page.getByRole("heading", { name });
    return this.page
      .getByRole("region", { name })
      .or(this.page.getByRole("group", { name }))
      .or(this.page.locator("section").filter({ has: heading }))
      .or(this.page.getByTestId(testId));
  }

  saveButton(): Locator {
    return this.page
      .getByRole("button", { name: labels.savePrimary })
      .or(this.page.getByTestId(testIds.saveButton));
  }

  discardButton(): Locator {
    return this.page
      .getByRole("button", { name: labels.discard })
      .or(this.page.getByTestId(testIds.discardButton));
  }

  /** Lista/resumen global de errores (alert accesible o contenedor testid) */
  globalErrors(): Locator {
    return this.page
      .getByRole("alert")
      .or(this.page.getByRole("region", { name: /error(es)?|validaci[oó]n/i }))
      .or(this.page.getByTestId(testIds.globalErrors));
  }

  /** Enlaces dentro del resumen global o marcadores testid */
  globalErrorLinks(): Locator {
    return this.page
      .getByTestId(testIds.globalErrorLink)
      .or(this.globalErrors().getByRole("link"))
      .or(this.globalErrors().getByRole("button"));
  }

  /** Badge/texto de estado del formulario en cabecera */
  formStatusBadge(): Locator {
    return this.page
      .getByText(labels.formStatus)
      .or(this.page.getByRole("status").filter({ hasText: labels.formStatus }))
      .or(this.page.getByTestId(testIds.formStatusBadge));
  }

  progressIndicator(): Locator {
    return this.page
      .getByText(/\d+\s*\/\s*\d+|bloques?\s+completos?/i)
      .or(this.page.getByTestId(testIds.progressIndicator));
  }

  sidebar(): Locator {
    return this.page
      .getByRole("navigation", { name: /men[uú]|lateral|principal/i })
      .or(this.page.locator("aside"))
      .or(this.page.getByTestId(testIds.sidebarNav));
  }

  /** Entrada de menú hacia la pantalla unificada (nombre UX pendiente en spec) */
  sidebarUnifiedEntry(): Locator {
    return this.page
      .getByRole("link", {
        name: /configuraci[oó]n.*agendas|agendas.*citas|consultas y citas/i,
      })
      .or(this.page.getByTestId(testIds.sidebarUnifiedNavItem));
  }

  legacyServiciosLink(): Locator {
    return this.page.getByRole("link", { name: /^servicios$/i });
  }

  legacyConsultasAgendasLink(): Locator {
    return this.page.getByRole("link", {
      name: /consultas y agendas/i,
    });
  }

  /**
   * Margen primera cita (spec A4): por etiqueta / rol numérico antes que testid.
   */
  firstAppointmentMarginField(): Locator {
    return this.page
      .getByLabel(/margen.*primera(\s+cita)?|primera cita disponible/i)
      .or(this.page.getByRole("spinbutton", { name: /primera cita|margen primera/i }))
      .or(this.page.getByRole("textbox", { name: /margen.*primera/i }))
      .or(this.page.getByTestId(testIds.firstAppointmentMarginDays));
  }

  /**
   * Nota de servicio (spec B3): campo opcional texto largo.
   */
  serviceNoteField(): Locator {
    return this.page
      .getByRole("textbox", { name: /nota(\s+del)?\s+servicio|nota opcional/i })
      .or(this.page.getByLabel(/nota(\s+del)?\s+servicio/i))
      .or(this.page.getByTestId(testIds.serviceNote));
  }

  /** Botones Guardar que no sean el guardado final unificado */
  /** Solo dentro del shell unificado (evita falsos positivos en el resto del BO). */
  intermediateSaveButtons(): Locator {
    return this.page.getByTestId(testIds.pageRoot).getByRole("button", {
      name: /guardar(?! configuraci[oó]n)/i,
    });
  }

  intermediateSectionSaveByTestId(): Locator {
    return this.page
      .getByTestId(testIds.pageRoot)
      .locator('[data-testid^="unified-config-intermediate-save"]');
  }

  /** Campos opt-in por contrato testid (fallan en rojo hasta que existan en DOM). */
  marginFieldStrict(): Locator {
    return this.page.getByTestId(testIds.firstAppointmentMarginDays);
  }

  serviceNoteStrict(): Locator {
    return this.page.getByTestId(testIds.serviceNote);
  }

  /**
   * Contrato mínimo con front para esta épica: si falta cualquier testid, el test debe fallar.
   * Objetivo TDD E2E: **rojo** antes de implementar la pantalla, **verde** cuando esté desplegada.
   */
  async expectUnifiedUiContract(): Promise<void> {
    await expect(
      this.page.getByTestId(testIds.pageRoot),
      "Contrato E2E: falta [data-testid=unified-config-page] (¿URL equivocada o feature no desplegada?)"
    ).toBeVisible({ timeout: 20_000 });
    await expect(this.page.getByTestId(testIds.consultationSelect)).toBeVisible();
    await expect(this.page.getByTestId(testIds.blockConsulta)).toBeVisible();
    await expect(this.page.getByTestId(testIds.blockServicios)).toBeVisible();
    await expect(this.page.getByTestId(testIds.blockResumen)).toBeVisible();
    await expect(this.page.getByTestId(testIds.saveButton)).toBeVisible();
  }

  async gotoUnifiedConfig(): Promise<void> {
    const path = seeds.unifiedConfigPath;
    if (!path) {
      throw new Error(
        "Define PLAYWRIGHT_UNIFIED_CONFIG_PATH (ruta relativa bajo PLAYWRIGHT_BASE_URL)."
      );
    }
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  async blockVerticalOrder(): Promise<{ consulta: number; servicios: number; resumen: number }> {
    const consulta = await this.page.getByTestId(testIds.blockConsulta).boundingBox();
    const servicios = await this.page.getByTestId(testIds.blockServicios).boundingBox();
    const resumen = await this.page.getByTestId(testIds.blockResumen).boundingBox();
    if (!consulta || !servicios || !resumen) {
      throw new Error("No se pudo medir posicion de bloques A/B/C (boundingBox null)");
    }
    return {
      consulta: consulta.y,
      servicios: servicios.y,
      resumen: resumen.y,
    };
  }
}
