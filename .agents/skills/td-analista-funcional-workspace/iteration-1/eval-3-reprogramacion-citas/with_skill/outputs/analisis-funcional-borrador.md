# Reprogramacion autonoma de citas medicas por parte del paciente

## Descripcion funcional

### Metadatos

- Fecha de creacion: 2026-04-23
- Responsable negocio: Pendiente de definicion (Operaciones Clinicas)
- Responsable funcional: Pendiente de definicion (Producto Digital)
- PO: Pendiente de asignacion
- Responsable UX: Pendiente de asignacion
- Prioridad (Q): Alta
- Tipo: Nueva funcionalidad
- Trimestre objetivo: Q3

### Descripcion general de la funcionalidad

La plataforma necesita permitir que el paciente reprogramme su cita medica sin intervencion manual en los casos elegibles, reduciendo carga operativa de soporte y tiempo de espera del paciente. El problema actual es la gestion reactiva por canales de soporte, con baja trazabilidad extremo a extremo y riesgo de incumplimiento cuando el cambio ocurre fuera de politicas definidas.  
El objetivo de negocio es habilitar un flujo autoservicio con reglas explicitas (incluyendo ventana maxima de 72 horas antes de la cita), decisiones automatizadas, trazabilidad legal completa y notificaciones sincronizadas para paciente, medico y soporte. El valor esperado es disminuir tickets de reprogramacion, bajar no-shows por friccion de cambio y aumentar cumplimiento regulatorio de auditoria.  
El alcance principal cubre: seleccion de una nueva franja, validaciones de elegibilidad, confirmacion con evidencia de aceptacion, actualizacion transaccional de agenda, comunicacion multiactor y registro auditable de cada evento/decision.

### Prototipo funcional

- URL prototipo/diseno: Prototipo navegable disponible (URL pendiente de compartir)
- Referencias adicionales:
  - Politica de cambios de cita y trazabilidad legal (documento pendiente)
  - Flujos AS-IS de soporte y agenda medica (documento pendiente)

### Relacion con epica/iniciativa

- Epica: EP-REPROG-AUTONOMA-CITAS
- Tickets relacionados: PEND-REPROG-001, PEND-REPROG-002, PEND-REPROG-003

## Historias funcionales

### Historia 1: Reprogramacion autonoma por paciente dentro de politica

**Como** paciente con una cita confirmada  
**Quiero** reprogramar mi cita desde el canal digital sin contactar a soporte  
**Para** moverla a una franja disponible que me acomode sin perder continuidad asistencial

**Precondiciones**

- El paciente tiene sesion autenticada y una cita en estado `Confirmada`.
- La cita esta a mas de 72 horas del inicio programado (comparacion contra zona horaria oficial de la clinica).
- No existe una solicitud de reprogramacion en estado `En proceso` para la misma cita.
- El paciente no supera el limite de reprogramaciones permitido por politica (valor configurable por negocio).

**Descripcion**

- El sistema muestra la accion `Reprogramar cita` unicamente si la cita es elegible por reglas temporales y de estado.
- Al iniciar el flujo, el sistema captura snapshot legal: ID de cita original, paciente, timestamp UTC, zona horaria, canal origen, version de politica vigente y hash de la sesion.
- El paciente visualiza slots disponibles filtrados por especialidad, medico asignado (si aplica), sede/modalidad y ventanas operativas del centro.
- Regla de prioridad: validaciones bloqueantes se ejecutan en orden `estado de cita` -> `ventana 72h` -> `cupo disponible` -> `limite de reprogramaciones`; al fallar una regla, se interrumpe el flujo y se informa motivo especifico.
- Al seleccionar nuevo horario, el backend realiza una reserva temporal del slot (TTL configurable, p. ej. 5 minutos) para evitar sobreasignacion.
- El paciente debe confirmar explicitamente la reprogramacion; la confirmacion almacena consentimiento operativo (texto legal mostrado + timestamp + canal).
- Transiciones de estado:
  - `Confirmada` -> `ReprogramacionPendienteConfirmacion` (inicio flujo y slot temporal).
  - `ReprogramacionPendienteConfirmacion` -> `Reprogramada` (confirmacion exitosa y commit transaccional).
  - `ReprogramacionPendienteConfirmacion` -> `Confirmada` (timeout/cancelacion/colision de cupo).
- Manejo de errores:
  - Si el slot deja de estar disponible antes del commit, se revierte reserva temporal y se solicita nueva seleccion.
  - Si falla la actualizacion de agenda del medico, no se cierra la operacion; se retorna error controlado y se conserva cita original.
  - Si hay caida de servicio externo de agenda, el sistema responde con estado recuperable y registra incidente para soporte.
- El resultado final presenta comprobante con cita anterior, cita nueva, motivo (si aplica), numero de operacion y sello de tiempo auditable.

**Criterios de aceptacion**

- [ ] Dada una cita a 73 horas del inicio, cuando el paciente accede al detalle, entonces ve la accion `Reprogramar cita` habilitada.
- [ ] Dada una cita a 72 horas o menos del inicio, cuando el paciente intenta reprogramar por UI o API, entonces la operacion se bloquea con mensaje `No se puede reprogramar dentro de las 72 horas previas`.
- [ ] Dado que dos pacientes intentan tomar el mismo slot, cuando uno confirma primero, entonces el segundo recibe error de disponibilidad y mantiene su cita original sin inconsistencias.
- [ ] Dado que el paciente confirma una reprogramacion valida, cuando finaliza la transaccion, entonces la cita original queda cerrada como reemplazada y la nueva queda `Confirmada` con trazabilidad completa.
- [ ] Dado que expira el TTL de reserva temporal, cuando el paciente intenta confirmar fuera de tiempo, entonces el sistema solicita nueva seleccion de horario y no altera la cita vigente.

**Diagramas / UX UI**

- Diagramas requeridos: Flujo principal de reprogramacion, diagrama de estados de cita, secuencia UI-API-Agenda, matriz de validaciones.
- Interfaces/pantallas implicadas: Mis citas (detalle), modal/pantalla selector de horario, pantalla de confirmacion legal, comprobante de reprogramacion.
- Notas UX/UI: Mostrar countdown de reserva temporal, mensajes de error accionables por regla, copy legal visible previo a confirmar, resumen comparativo `antes/despues` para reducir errores.

### Historia 2: Sincronizacion y notificacion a medico y paciente tras reprogramacion

**Como** medico y paciente afectados por una reprogramacion  
**Quiero** recibir confirmaciones y agenda actualizada de forma consistente  
**Para** evitar confusiones operativas y ausencias por informacion desactualizada

**Precondiciones**

- Existe una reprogramacion en estado `Reprogramada` confirmada transaccionalmente.
- Los canales de notificacion (push, email, SMS) estan configurados segun preferencias y consentimiento del paciente.
- El medico tiene calendario sincronizado con el sistema de agenda clinica.

**Descripcion**

- Tras commit exitoso, el sistema dispara eventos de dominio `appointment.rescheduled` con IDs correlacionables para auditoria.
- Se generan notificaciones al paciente con detalle de nueva cita, resumen de cambio y canal de soporte para incidencias.
- Se genera notificacion al medico (y opcionalmente a secretaria medica) con slot liberado y nuevo slot asignado.
- Regla de consistencia: ninguna notificacion de exito se emite hasta confirmar persistencia de nueva cita y liberacion de slot anterior.
- Si un canal falla (ej. proveedor SMS), el sistema reintenta segun politica exponencial y marca estado parcial, sin revertir la reprogramacion ya confirmada.
- Estado de notificacion por actor:
  - `PendienteEnvio` -> `Enviada` (ack proveedor).
  - `PendienteEnvio` -> `ErrorReintentable` (timeout/transitorio).
  - `ErrorReintentable` -> `EscaladoSoporte` (agotados reintentos).
- En caso de conflicto de sincronizacion con calendario medico externo, se registra alerta operativa y tarea para soporte, preservando la fuente de verdad interna.
- El paciente puede consultar historial de comunicaciones de su ultima reprogramacion desde el detalle de cita.

**Criterios de aceptacion**

- [ ] Dada una reprogramacion confirmada, cuando se procesa el evento, entonces paciente y medico reciben notificacion de exito con la misma fecha/hora de la nueva cita.
- [ ] Dada una falla transitoria del proveedor SMS, cuando ocurren hasta N reintentos configurados, entonces el estado queda `Enviada` si algun intento prospera.
- [ ] Dado que todos los reintentos de un canal fallan, cuando se supera el umbral, entonces se crea registro `EscaladoSoporte` con identificador de incidente.
- [ ] Dada una reprogramacion confirmada, cuando se consulta auditoria, entonces existe correlacion entre evento de cambio de cita y eventos de notificacion por actor/canal.
- [ ] Dado un conflicto de sync con calendario externo del medico, cuando se detecta divergencia, entonces la cita interna permanece valida y se levanta alerta sin perder trazabilidad.

**Diagramas / UX UI**

- Diagramas requeridos: Secuencia post-confirmacion (orquestacion de eventos), flujo de reintentos por canal, diagrama de integraciones de agenda.
- Interfaces/pantallas implicadas: Detalle de cita reprogramada (paciente), bandeja/agenda del medico, consola interna de estados de notificacion.
- Notas UX/UI: Confirmacion inmediata en UI aun si notificacion asincrona sigue en progreso; etiqueta de estado de comunicacion (`Enviada`, `En proceso`, `Incidencia`).

### Historia 3: Gestion por soporte de excepciones y trazabilidad legal de reprogramaciones

**Como** agente de soporte  
**Quiero** consultar, auditar y gestionar excepciones de reprogramacion  
**Para** resolver incidencias sin romper cumplimiento legal ni integridad de agenda

**Precondiciones**

- El agente de soporte tiene rol autorizado `SoporteReprogramaciones` con permisos de solo lectura o accion segun perfil.
- Existen registros de auditoria generados por los flujos de reprogramacion y notificacion.
- La organizacion tiene definida politica de retencion de logs y evidencias legales.

**Descripcion**

- Soporte dispone de vista de trazabilidad por operacion con linea temporal: intento, validaciones aplicadas, decisiones, cambios de estado, actor ejecutor y resultado.
- Cada registro de auditoria incluye: ID operacion, ID cita original/nueva, actor (`paciente`, `sistema`, `soporte`), timestamp UTC, IP/huella de dispositivo (cuando legalmente permitido), motivo de fallo y version de reglas.
- El sistema distingue acciones permitidas a soporte:
  - Consulta y exportacion de evidencia.
  - Reenvio manual de notificacion fallida.
  - Apertura de caso de excepcion para evaluacion clinica/operativa.
- Regla de compliance: soporte no puede forzar reprogramacion autonoma dentro de las 72 horas mediante este flujo; debe derivar a circuito excepcional separado y auditado.
- Cualquier accion manual de soporte requiere motivo obligatorio y queda firmada con usuario interno, fecha/hora y before/after del dato afectado.
- Manejo de errores y casos borde:
  - Si falta evidencia parcial por caida temporal de logging, se marca registro `Incompleto` y se dispara alerta de cumplimiento.
  - Si hay discrepancia entre historial de cita y auditoria, se bloquea cierre de caso hasta reconciliacion.
  - Si un usuario sin permisos intenta acceder, se rechaza con `403` y evento de seguridad.
- Estados de caso de soporte para incidencias de reprogramacion:
  - `Abierto` -> `EnInvestigacion` -> `Resuelto`.
  - `EnInvestigacion` -> `EscaladoLegal` cuando hay potencial incumplimiento normativo.

**Criterios de aceptacion**

- [ ] Dada una operacion de reprogramacion, cuando soporte abre el detalle, entonces visualiza linea temporal completa con actor, timestamp y resultado de cada paso.
- [ ] Dado un intento de accion manual sin motivo, cuando soporte intenta guardar, entonces el sistema bloquea la accion y exige justificacion obligatoria.
- [ ] Dado un agente sin permiso `SoporteReprogramaciones`, cuando intenta acceder al modulo, entonces recibe `403` y queda evento de seguridad registrado.
- [ ] Dado un caso con evidencia incompleta, cuando soporte intenta cerrarlo, entonces el sistema exige reconciliacion o escalado previo.
- [ ] Dado un intento de cambiar cita dentro de 72 horas desde modulo de soporte autonoma, cuando se ejecuta, entonces se bloquea y se redirige al circuito excepcional auditado.

**Diagramas / UX UI**

- Diagramas requeridos: Modelo de auditoria (entidades/campos), flujo de gestion de incidencias de soporte, matriz de permisos por rol.
- Interfaces/pantallas implicadas: Consola de soporte (busqueda y detalle), panel de auditoria, formulario de reenvio/escalado.
- Notas UX/UI: Resaltar visualmente violaciones de regla 72h, filtros por estado/actor/canal, exportacion de evidencia con marcas de integridad.

## Requisitos no funcionales

- Rendimiento: Validacion de elegibilidad <= 500 ms p95; carga de slots <= 2 s p95; confirmacion transaccional <= 3 s p95; soporte de 200 reprogramaciones concurrentes por minuto sin degradacion critica.
- Seguridad y privacidad: Control de acceso por RBAC; cifrado en transito y reposo; minimizacion de datos personales en logs; trazabilidad inmutable de acciones; cumplimiento de politica legal de auditoria y retencion.
- Disponibilidad: Flujo de consulta de elegibilidad con objetivo 99.9%; degradacion controlada ante caida de proveedor externo (agenda/notificaciones) preservando consistencia de cita; reintentos idempotentes para operaciones asincronas.
- Observabilidad: Eventos obligatorios (`reschedule.initiated`, `reschedule.validation_failed`, `reschedule.confirmed`, `reschedule.failed`, `notification.sent`, `notification.failed`, `support.case_escalated`), logs estructurados con correlation_id, metricas de exito/error y alertas por umbral de fallos.
- Compatibilidad: Web responsive (ultimas 2 versiones de Chrome, Safari, Firefox, Edge), app movil nativa soportada por API comun, timezone handling consistente para sedes multi-region.

## Supuestos, dependencias y riesgos

- Supuestos:
  - El prototipo navegable representa el flujo TO-BE principal y no solo concepto visual.
  - Existe un motor de agenda con operaciones atomicas para liberar y asignar slots.
  - La regla de 72 horas aplica a todas las especialidades salvo excepciones que negocio definira explicitamente.
- Dependencias:
  - Equipo Legal/Compliance para validacion de campos de trazabilidad y retencion de evidencias.
  - Equipo de Integraciones/Agenda para sincronizacion con calendario del medico y manejo de colisiones.
  - Equipo de Notificaciones para plantillas, proveedores y politicas de reintento por canal.
- Riesgos:
  - Ambiguedad legal sobre datos obligatorios de auditoria puede retrasar go-live.
  - Diferencias de zona horaria entre paciente y sede pueden provocar bloqueos/permitidos incorrectos cerca del limite de 72h.
  - Fallos de integracion de agenda externa pueden generar divergencia temporal en la vista del medico.

## Fuera de alcance

- Redefinicion de politica de cancelaciones y devoluciones economicas asociadas a la cita.
- Reprogramacion masiva por contingencias del centro (cierres, huelgas, indisponibilidad general del medico).
- Gestion completa del circuito excepcional clinico dentro de 72h (se contempla solo derivacion y trazabilidad de handoff).

## Dudas abiertas

- Cual es la URL/version oficial del prototipo navegable y que escenarios cubre exactamente (happy path, errores, soporte)?
- La ventana de 72h se calcula sobre hora local de sede, hora del paciente o UTC normalizado con regla de negocio fija?
- Existen excepciones por especialidad/urgencia que permitan reprogramar dentro de 72h y bajo que autorizacion?
- Cuantas reprogramaciones maximas por cita o por paciente se permiten en una ventana temporal determinada?
- Que campos exactos exige Legal para trazabilidad (IP, device_id, consentimiento textual, hash de evidencia) y por cuanto tiempo deben conservarse?
- Se requiere doble confirmacion del medico en algunos tipos de consulta antes de consolidar la nueva franja?
- Cual sera el mecanismo oficial de identificacion de tickets (Jira real) para trazabilidad epica-historias-QA?

## Checklist de validacion

- [x] El alcance esta claramente delimitado.
- [x] Cada historia tiene criterios de aceptacion verificables.
- [x] Se cubren happy path y casos borde relevantes.
- [ ] Hay trazabilidad con epica y tickets.
- [x] Requisitos no funcionales definidos y medibles.
