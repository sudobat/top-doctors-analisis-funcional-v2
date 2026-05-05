/**
 * IDs y rutas de prueba para configuracion unificada.
 * Sobrescribe con variables de entorno en CI/staging.
 */
export const seeds = {
  /** Ruta relativa al baseURL de Backoffice Doctor */
  unifiedConfigPath:
    process.env.PLAYWRIGHT_UNIFIED_CONFIG_PATH ?? "",
  consultationIds: {
    primary: process.env.PLAYWRIGHT_CONSULTA_ID_PRIMARY ?? "",
    secondary: process.env.PLAYWRIGHT_CONSULTA_ID_SECONDARY ?? "",
  },
} as const;
