# Análisis funcional (borrador)

## 1. Encabezado
- **Iniciativa:** `RES-WAITLIST-Q3`
- **Nombre funcionalidad:** Lista de espera para reservas cuando un slot está completo
- **Canales en alcance:** Web y Call Center
- **Fuente de diseño:** Prototipo completo en Figma (referencia funcional y de UX)
- **Estado del documento:** Borrador para arranque de Desarrollo y QA

## 2. Objetivo de negocio
Permitir que un paciente interesado en un slot completo pueda apuntarse a una lista de espera y ser contactado o autoasignado cuando se libere disponibilidad, reduciendo pérdida de demanda y mejorando ocupación de agenda.

## 3. Problema actual
- Cuando un slot está completo, hoy el paciente no tiene una vía estructurada para manifestar interés.
- El call center resuelve de forma manual y heterogénea, con riesgo de errores y baja trazabilidad.
- Se pierden reservas potenciales al no capturar la intención de compra/reserva.

## 4. Objetivos operativos
- Capturar solicitudes de lista de espera en web y call center bajo las mismas reglas.
- Priorizar y gestionar solicitudes de forma trazable, justa y auditable.
- Notificar a los candidatos cuando aparece disponibilidad y registrar su respuesta.
- Permitir a operación monitorear conversión lista de espera -> reserva confirmada.

## 5. Alcance
### Incluido
- Alta en lista de espera desde web y call center.
- Gestión de estado de solicitud de lista de espera.
- Proceso de matching cuando un slot se libera.
- Notificación y ventana de aceptación.
- Conversión a reserva y cierre de solicitud.
- Reglas de prioridad y expiración.
- Trazabilidad completa para auditoría.

### Excluido (para esta entrega)
- Algoritmos avanzados de predicción de cancelaciones.
- Lista de espera multi-clínica simultánea con optimización global.
- Integración con canales de mensajería no definidos (ej. WhatsApp bidireccional) si no está ya disponible.
- Campañas de marketing asociadas.

## 6. Actores
- **Paciente web:** solicita entrar a lista de espera y confirma/rechaza cuando recibe opción.
- **Agente call center:** crea y gestiona solicitudes en nombre del paciente.
- **Sistema de reservas:** determina disponibilidad real, crea/actualiza reservas.
- **Backoffice/Operaciones:** consulta cola, métricas y resolución de incidencias.
- **QA/Soporte:** valida reglas y consistencia entre canales.

## 7. Definiciones clave
- **Slot completo:** franja horaria sin cupos disponibles para la combinación servicio/profesional/centro.
- **Solicitud waitlist:** registro de interés con preferencias y datos de contacto.
- **Elegible:** solicitud que cumple reglas para recibir propuesta cuando aparece un cupo.
- **Ventana de aceptación:** tiempo limitado para aceptar la propuesta antes de pasar al siguiente.
- **Expirada:** solicitud sin respuesta en ventana o fuera de vigencia.

## 8. Supuestos y decisiones base
- Existe identificador único de paciente o mecanismo de deduplicación confiable.
- El sistema de reservas emite eventos o permite polling de liberación de slots.
- Figma define componentes y textos finales de UI; este documento define la lógica.
- Se permite el mismo comportamiento funcional en ambos canales, con diferencias solo en UI y permisos.

## 9. Flujo funcional end-to-end
1. El paciente (web) o agente (call center) intenta reservar y detecta slot completo.
2. El sistema ofrece alta en lista de espera para ese contexto (servicio/profesional/fecha/rango).
3. Se registran preferencias mínimas y consentimiento de contacto.
4. La solicitud queda en estado `ACTIVA`.
5. Cuando se libera un slot compatible, el motor de matching evalúa solicitudes activas elegibles.
6. Se selecciona candidato según prioridad configurada.
7. Se envía propuesta de disponibilidad y se inicia ventana de aceptación.
8. Si acepta dentro de ventana: se crea reserva y solicitud pasa a `CONVERTIDA`.
9. Si rechaza/no responde: solicitud pasa a `RECHAZADA` o `EXPIRADA` según caso, y se continúa con siguiente candidato elegible.
10. Si no vuelve a haber disponibilidad dentro de vigencia: solicitud pasa a `CADUCADA`.

## 10. Requisitos funcionales detallados
### RF-01 Alta en lista de espera (web)
- Desde intento de reserva sin cupo, mostrar CTA de “Unirme a lista de espera”.
- Campos obligatorios mínimos:
  - Identificación paciente (si logueado, autocompletar).
  - Canal de contacto preferido (si aplica).
  - Consentimiento de contacto para esta gestión.
- Campos opcionales:
  - Rango horario alternativo.
  - Flexibilidad de profesional/centro (según política comercial).
- Validaciones:
  - Evitar duplicados activos idénticos por paciente y criterio principal.
  - Rechazar alta si faltan consentimientos requeridos.
- Resultado:
  - Crear solicitud con `source=WEB`.
  - Mostrar confirmación con número/ID de solicitud.

### RF-02 Alta en lista de espera (call center)
- Desde consola de agente, ante slot completo, habilitar creación de solicitud.
- Campos:
  - Identificación y verificación de paciente.
  - Preferencias capturadas por agente.
  - Motivo de creación opcional para auditoría.
- Validaciones:
  - Misma regla de deduplicación que web.
  - Registro de `agent_id` y timestamp.
- Resultado:
  - Crear solicitud con `source=CALL_CENTER`.
  - Confirmar al agente con estado inicial y prioridad calculada.

### RF-03 Estados de solicitud
Estados permitidos:
- `ACTIVA`: en cola y elegible potencial.
- `EN_PROPUESTA`: recibió opción, ventana abierta.
- `CONVERTIDA`: terminó en reserva confirmada.
- `RECHAZADA`: paciente declina propuesta.
- `EXPIRADA`: no respondió en ventana.
- `CADUCADA`: venció vigencia general de la solicitud.
- `CANCELADA`: anulada por paciente o agente autorizado.

Transiciones válidas:
- `ACTIVA -> EN_PROPUESTA`
- `EN_PROPUESTA -> CONVERTIDA | RECHAZADA | EXPIRADA`
- `ACTIVA -> CADUCADA | CANCELADA`
- `EXPIRADA -> ACTIVA` (solo si política permite reintento automático y dentro de vigencia)

### RF-04 Reglas de priorización
Orden recomendado (configurable):
1. Prioridad de negocio (ej. severidad, tipo paciente) si aplica.
2. Antigüedad de solicitud (`created_at` ascendente).
3. Compatibilidad estricta con preferencias.
4. Empate por canal no preferente (neutral entre web/call center).

Reglas:
- Debe existir trazabilidad de por qué una solicitud fue seleccionada o no.
- Cualquier bypass manual por operación debe requerir motivo obligatorio.

### RF-05 Matching de slot liberado
- Trigger:
  - Cancelación/reprogramación que libera cupo.
  - Ajuste de agenda que abre nuevo cupo.
- Criterios mínimos de compatibilidad:
  - Servicio obligatorio.
  - Profesional/centro según nivel de flexibilidad definido en solicitud.
  - Ventana temporal compatible.
- Comportamiento:
  - Seleccionar primer candidato elegible.
  - Bloquear temporalmente el slot durante ventana de aceptación (hold).
  - Si fallo técnico en notificación, aplicar reintento y no perder consistencia de estado.

### RF-06 Notificación y respuesta
- Canales de notificación: los definidos por plataforma (ej. email/SMS/call center callback).
- Contenido mínimo:
  - Slot propuesto (fecha/hora/profesional/centro).
  - Tiempo restante para aceptar.
  - Acción de aceptar/rechazar.
- Si acepta:
  - Confirmar reserva.
  - Cerrar solicitud como `CONVERTIDA`.
- Si rechaza:
  - Marcar `RECHAZADA`.
  - Continuar con siguiente elegible.
- Si no responde:
  - Al vencer ventana, marcar `EXPIRADA`.
  - Continuar con siguiente elegible.

### RF-07 Cancelación de solicitud
- Paciente o agente puede cancelar una solicitud `ACTIVA` o `EN_PROPUESTA` (si aún sin aceptación).
- Requiere motivo opcional para paciente y obligatorio para agente.
- Estado final: `CANCELADA`.

### RF-08 Gestión operativa y backoffice
- Vista de cola con filtros por:
  - Centro, servicio, profesional, estado, antigüedad, canal.
- Acciones permitidas por rol:
  - Consultar historial de eventos.
  - Forzar caducidad/cancelación con justificación.
  - Reenviar notificación (si política lo permite).
- Auditoría:
  - Log de cada transición de estado con actor, fecha y causa.

## 11. Reglas de negocio
- Una solicitud activa por paciente + criterio principal (configurable); duplicados deben consolidarse o bloquearse.
- Vigencia por defecto de solicitud: configurable (ej. 7/14/30 días).
- Ventana de aceptación por propuesta: configurable (ej. 15 minutos a 2 horas según tipo slot).
- No se debe sobreasignar un mismo slot a múltiples pacientes simultáneamente.
- Si una solicitud convierte a reserva, cualquier otra solicitud activa equivalente del paciente puede cerrarse automáticamente (regla configurable).

## 12. Datos y modelo lógico mínimo
Entidad `waitlist_request`:
- `id`
- `patient_id`
- `source` (`WEB`, `CALL_CENTER`)
- `service_id`
- `provider_id` (nullable si flexible)
- `location_id` (nullable si flexible)
- `preferred_time_window`
- `status`
- `priority_score` (opcional calculado)
- `created_at`, `updated_at`
- `expires_at`
- `consent_contact` (bool + timestamp)
- `created_by_agent_id` (nullable)

Entidad `waitlist_offer`:
- `id`
- `waitlist_request_id`
- `slot_id`
- `offered_at`
- `response_deadline`
- `status` (`PENDING`, `ACCEPTED`, `REJECTED`, `TIMED_OUT`)
- `notification_channel`
- `notification_delivery_status`

Entidad `waitlist_event_log`:
- `id`
- `waitlist_request_id`
- `event_type`
- `from_status`, `to_status`
- `actor_type` (`SYSTEM`, `PATIENT`, `AGENT`)
- `actor_id` (nullable)
- `reason_code`, `reason_text`
- `created_at`

## 13. Integraciones y dependencias
- **Sistema de agenda/reservas:** para detectar slots liberados y confirmar reserva.
- **Notificaciones:** para emitir propuestas y capturar entregabilidad.
- **Identidad/Pacientes:** para deduplicación y contacto.
- **Backoffice/CRM de call center:** para operación manual y visibilidad.

## 14. Consideraciones UX (alineación con Figma)
- En web, el CTA de lista de espera debe aparecer solo cuando no hay cupo.
- Mensajería clara sobre:
  - No garantía de disponibilidad.
  - Orden/prioridad según reglas.
  - Ventana de respuesta limitada.
- Estados visibles para usuario:
  - Solicitud recibida.
  - Propuesta enviada.
  - Confirmada / cerrada.
- En call center, interfaz debe minimizar carga operativa con autocompletados y validaciones en línea.

## 15. Casuística y manejo de errores
- **Error al crear solicitud:** informar al usuario/agente y no crear registros parciales.
- **Slot liberado pero reserva falla al confirmar:** liberar hold, registrar incidente y reintentar según política.
- **Notificación no entregada:** reintentos automáticos y fallback operativo (call center).
- **Paciente ya reservado en horario incompatible:** bloquear conversión y registrar causa.
- **Condición de carrera en alta simultánea:** garantizar idempotencia por clave funcional.

## 16. Requisitos no funcionales
- **Consistencia:** transiciones atómicas para evitar doble asignación.
- **Trazabilidad:** 100% de eventos con auditoría.
- **Rendimiento:** matching ejecutable en tiempo acotado ante volumen de cola.
- **Disponibilidad:** fallback operacional para call center ante caídas parciales.
- **Privacidad:** cumplimiento de políticas de datos y consentimiento de contacto.

## 17. Métricas operativas sugeridas
- Tasa de altas en lista de espera por canal.
- Tasa de conversión `ACTIVA -> CONVERTIDA`.
- Tiempo medio hasta primera propuesta.
- Ratio de expiración/no respuesta.
- % de propuestas con entregabilidad exitosa.
- Ocupación recuperada atribuible a waitlist.

## 18. Criterios de aceptación (UAT)
1. Dado un slot completo, cuando el usuario web solicita waitlist con datos válidos, entonces se crea solicitud `ACTIVA` y se confirma ID.
2. Dado un agente call center, cuando crea solicitud válida, entonces queda trazado `source=CALL_CENTER` y `agent_id`.
3. Dada una liberación de slot compatible, cuando hay solicitudes activas, entonces se genera propuesta para el primer elegible según prioridad.
4. Dada una propuesta vigente, cuando el paciente acepta en tiempo, entonces se crea reserva y solicitud queda `CONVERTIDA`.
5. Dada una propuesta sin respuesta hasta deadline, entonces solicitud/propuesta pasa a estado de expiración y se intenta siguiente elegible.
6. Dado un intento de duplicado activo, entonces el sistema bloquea o consolida según regla configurada.
7. Dada una acción manual de operación, entonces queda auditada con actor, timestamp y motivo.

## 19. Plan de pruebas QA (alto nivel)
- **Funcionales:**
  - Alta web/call center, validaciones y deduplicación.
  - Transiciones de estado válidas e inválidas.
  - Flujo completo con aceptación/rechazo/timeout.
- **Integración:**
  - Evento de slot liberado -> propuesta -> reserva.
  - Entregabilidad de notificaciones y reintentos.
- **Concurrencia:**
  - Múltiples solicitudes compitiendo por un slot.
  - Altas simultáneas de mismo paciente/criterio.
- **Regresión:**
  - No afectar flujo estándar de reserva cuando sí hay disponibilidad.

## 20. Riesgos y mitigaciones
- **Riesgo:** inconsistencia por eventos duplicados de liberación de slot.  
  **Mitigación:** procesamiento idempotente por `slot_id + timestamp + correlation_id`.
- **Riesgo:** baja tasa de respuesta a propuestas.  
  **Mitigación:** ventanas y plantillas optimizadas, fallback call center.
- **Riesgo:** carga operativa en picos.  
  **Mitigación:** priorización automática y tooling de backoffice con filtros robustos.

## 21. Pendientes para cierre de versión final
- Confirmar reglas exactas de prioridad con negocio/operación.
- Confirmar tiempos de vigencia y ventana de aceptación por tipo de servicio.
- Confirmar textos legales finales de consentimiento por canal.
- Confirmar estrategia de fallback cuando notificaciones fallen.
- Adjuntar referencias concretas de pantallas Figma por flujo.

---

### Resultado esperado de este borrador
Documento suficientemente detallado para que Desarrollo descomponga en historias técnicas y QA derive casos de prueba end-to-end para la iniciativa `RES-WAITLIST-Q3`, con consistencia entre web y call center.
