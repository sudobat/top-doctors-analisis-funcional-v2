## Verificacion de acceso backoffice

- Fecha: 2026-04-23
- Entorno: https://www.topdoctors.es
- Usuario probado: doctores@yopmail.com
- Password: [oculto]

### URLs verificadas

- https://www.topdoctors.es/login/
- https://www.topdoctors.es/backoffice-provider/office/
- https://www.topdoctors.es/backoffice-provider/profile/services/

### Resultado

- Se logra abrir la pantalla de login para doctores.
- Se repite el intento haciendo click primero en la pestana `Soy doctor`.
- En intento previo, la llamada `https://www.topdoctors.es/api/auth/login/provider` devolvia `403`.
- Tras reactivar el usuario, el login redirige correctamente a `https://www.topdoctors.es/backoffice-provider/schedule/appointment/list`.
- Se valida acceso directo a:
  - `https://www.topdoctors.es/backoffice-provider/office/`
  - `https://www.topdoctors.es/backoffice-provider/profile/services/`
- En una segunda validacion, ambas paginas cargan contenido funcional (no estan en blanco):
  - `office`: muestra secciones como "Datos de la consulta", "Tipo de pago", "Horarios de la consulta".
  - `services`: muestra listado de servicios, buscador y selector de consulta.
- Se realiza exploracion extendida de formularios sin guardar cambios:
  - `office`: entrada a modo edicion, interaccion con opciones de reservas/tipo de pago, recurrentes/solapamiento, y activacion de rango horario.
  - `office`: recarga posterior confirma retorno a estado bloqueado con boton `Editar` (sin persistencia accidental).
  - `services`: uso de buscador, apertura de selector de consultas y cambio de filtros visibles.
  - `services`: apertura de detalle de servicio activo y de servicio inactivo (`/new?...`) para comparar estados.
  - `services`: en servicio inactivo, switches de consulta aparecen no activos y `Guardar` deshabilitado.
- Se ejecuta prueba de guardado real en detalle de servicio activo:
  - Servicio probado: `Primera consulta Acupuntura` (`/profile/services/b1444648-a604-4dc9-ac85-cf3e84da95d1`).
  - Se verifica que el formulario permite guardar y permanecer en la misma pantalla de edicion.
  - Se fuerza cambio y se valida guardado; despues se revierte y se vuelve a guardar para restaurar estado base (IVA exento desactivado + valor `0`).
- Hallazgo relevante de UX/flujo:
  - En `office`, para la consulta probada, multiples controles no reaccionan al click y `Guardar` permanece deshabilitado; esto dificulta confirmar persistencia desde esa pantalla concreta.
  - En `services` el flujo de guardado es operativo y apropiado para validaciones funcionales de persistencia.
- Evidencias generadas:
  - `ficheros_adjuntos/evidencias-agendas-citas/login.har`
  - `ficheros_adjuntos/evidencias-agendas-citas/login-result.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-page.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/services-page.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-page-full-3.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/services-page-full-3.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-01-estado-inicial.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-02-modo-edicion.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-03-config-interacciones-sin-guardar.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-04-cancelar-edicion.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-05-recarga-post-cancel.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/services-01-estado-inicial.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/services-02-filtro-busqueda-podologia.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/services-03-desplegable-consultas.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/services-04-filtro-consulta-unica.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/services-05-lista-cargada-tras-espera.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-detail-01-inicial.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-detail-02-iva-y-consulta.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-detail-03-intento-switches-directos.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-detail-04-despliegue-consulta.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-detail-05-servicio-inactivo.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-detail-06-inactivo-abierto.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-detail-07-activar-consulta.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-detail-08-activar-consulta-switch-directo.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-save-01-baseline.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-save-02-change-pre-save.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-save-03-after-save.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-save-04-cambio-real-previo-guardar.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-save-05-despues-guardar-real.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-save-06-toggle-switch-directo.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/office-save-07-post-save-intento2.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-save-01-baseline-detalle-activo.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-save-02-iva-modificado-pre-save.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-save-03-iva-modificado-post-save.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-save-04-revert-toggle-exento-off.png`
  - `ficheros_adjuntos/evidencias-agendas-citas/service-save-05-revert-guardado.png`

### Nota

- Evidencia guardada para trazabilidad del analisis funcional.
