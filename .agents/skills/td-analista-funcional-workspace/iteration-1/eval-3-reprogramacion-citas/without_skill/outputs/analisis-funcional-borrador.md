# Análisis funcional (borrador)  
## Reprogramación autónoma de citas médicas por parte del paciente

## 1) Contexto y objetivo
Se requiere diseñar desde cero una funcionalidad que permita al paciente reprogramar su propia cita médica sin intervención manual obligatoria de soporte, respetando:

- Restricción legal de trazabilidad completa de cambios.
- Restricción operativa de ventana máxima: solo se puede reprogramar hasta 72 horas antes de la cita original.
- Convivencia de tres actores principales: paciente, soporte y médico.
- Existencia de un prototipo navegable como referencia de UX, aún no considerado especificación cerrada.

Objetivo de negocio:
- Reducir fricción y tiempos de gestión para pacientes.
- Disminuir carga operativa de soporte.
- Mantener control clínico y legal sobre los cambios de agenda.

Objetivo funcional:
- Habilitar un flujo seguro, auditable y comprensible para reprogramar citas, con validaciones de tiempo, disponibilidad y estado de cita.

---

## 2) Alcance funcional
Incluye:
- Consulta de detalle de cita y elegibilidad para reprogramación.
- Búsqueda y selección de nuevos slots disponibles con el mismo médico (MVP) y potencialmente mismo servicio/especialidad.
- Confirmación de reprogramación por parte del paciente.
- Notificación automática a paciente, médico y soporte.
- Registro de auditoría (quién, cuándo, qué cambió, motivo, canal).
- Vista operativa para soporte con historial de cambios.

Fuera de alcance inicial (MVP):
- Reprogramación con cambio de médico por preferencia del paciente (puede evaluarse Fase 2).
- Flujos de prepago, penalizaciones o devoluciones avanzadas.
- Reprogramación masiva por contingencias (ej. baja del médico).
- Integraciones complejas de terceros no críticas para lanzar MVP.

---

## 3) Actores y necesidades
### Paciente
Necesita:
- Saber si su cita puede reprogramarse.
- Encontrar horarios alternativos claros y rápidos.
- Confirmar cambio con certeza y recibir comprobante.
- Entender por qué no puede reprogramar (si aplica).

### Soporte
Necesita:
- Visibilidad de reprogramaciones realizadas por pacientes.
- Historial trazable para resolver reclamos.
- Capacidad de intervenir manualmente en excepciones.

### Médico
Necesita:
- Agenda actualizada en tiempo casi real.
- Notificación del cambio con contexto mínimo.
- Reducción de no-shows y reorganización ordenada de agenda.

---

## 4) Reglas de negocio
1. **Ventana de reprogramación**: solo permitida si faltan más de 72 horas para la fecha/hora de la cita.
2. **Bloqueo por proximidad**: si faltan 72 horas o menos, el paciente no puede reprogramar autónomamente y se deriva a soporte (si la política lo permite).
3. **Estados elegibles de cita**: solo citas en estado programada/confirmada (definir catálogo final de estados del dominio).
4. **Estados no elegibles**: cancelada, ya realizada, en curso, no-show o bloqueada administrativamente.
5. **Integridad de agenda**: el nuevo slot debe validarse como disponible en el momento de confirmar (double-check anti-colisión).
6. **Idempotencia funcional**: doble clic o reintentos no deben crear múltiples reprogramaciones.
7. **Trazabilidad obligatoria**: toda reprogramación debe guardar evento auditable no editable.
8. **Notificación obligatoria**: paciente y médico deben recibir confirmación; soporte recibe registro operativo.
9. **Motivo de cambio**: capturar motivo opcional en MVP (recomendado), obligatorio en fases reguladas si legal/compliance lo exige.
10. **Política de límites** (opcional MVP): número máximo de reprogramaciones por cita/paciente en un período.

---

## 5) Requisitos funcionales
### RF-01 Elegibilidad de reprogramación
El sistema debe mostrar si la cita es reprogramable y el motivo cuando no lo sea.

### RF-02 Consulta de slots alternativos
El sistema debe listar slots válidos en función de agenda del médico/servicio y restricciones de negocio.

### RF-03 Confirmación de nueva cita
El paciente debe confirmar explícitamente la selección del nuevo horario antes de ejecutar el cambio.

### RF-04 Actualización transaccional
La reprogramación debe ocurrir de forma atómica: liberar cita antigua y reservar nueva, sin estados inconsistentes visibles.

### RF-05 Registro de auditoría
El sistema debe almacenar bitácora con:
- ID cita original y nueva fecha/hora.
- Actor que ejecuta (paciente autenticado).
- Timestamp UTC y zona local de referencia.
- Canal (web/app/soporte).
- Estado previo y posterior.
- Motivo (si informado).

### RF-06 Notificaciones
Tras éxito, enviar confirmaciones y dejar evidencia de entrega/intento en logs.

### RF-07 Derivación a soporte
Si no cumple la ventana de 72h u otra regla crítica, mostrar vía de contacto con soporte y causa de bloqueo.

### RF-08 Vista operativa para soporte
Permitir a soporte consultar historial de reprogramaciones por paciente y por cita.

---

## 6) Requisitos no funcionales (NFR)
- **NFR-01 Seguridad**: solo el paciente titular (o autorizado) puede reprogramar su cita.
- **NFR-02 Trazabilidad legal**: logs inmutables, con retención según política legal aplicable.
- **NFR-03 Consistencia**: evitar dobles reservas bajo concurrencia.
- **NFR-04 Disponibilidad**: funcionalidad accesible dentro del SLA del canal digital.
- **NFR-05 Rendimiento**: tiempos de respuesta adecuados en búsqueda de slots y confirmación.
- **NFR-06 Observabilidad**: métricas de éxito/error/abandono y alertas por fallos.
- **NFR-07 UX y accesibilidad**: mensajes claros, errores accionables y cumplimiento básico de accesibilidad.

---

## 7) Flujo funcional E2E (MVP)
1. Paciente ingresa a detalle de su cita.
2. Sistema evalúa elegibilidad (estado + ventana >72h).
3. Si no elegible, muestra causa y opción de soporte.
4. Si elegible, paciente abre selector de nuevos horarios.
5. Sistema muestra slots disponibles.
6. Paciente elige slot y confirma.
7. Sistema revalida disponibilidad y reglas justo antes de aplicar.
8. Sistema ejecuta reprogramación de forma atómica.
9. Sistema registra auditoría inmutable.
10. Sistema dispara notificaciones a actores.
11. Paciente visualiza comprobante de reprogramación.

---

## 8) Manejo de errores y excepciones
- Slot tomado durante confirmación: informar conflicto y pedir nueva selección.
- Pérdida de elegibilidad por cruce de 72h durante el flujo: bloquear y derivar a soporte.
- Fallo parcial en notificación: reintentos automáticos y registro de incidencia sin deshacer reprogramación confirmada.
- Sesión expirada/no autenticado: solicitar autenticación y proteger operación.
- Integración de agenda caída: mensaje de indisponibilidad temporal y evento de monitoreo.

---

## 9) Trazabilidad y cumplimiento (enfoque legal/operativo)
Registro mínimo por evento de reprogramación:
- Identificador único de evento.
- Identificador de paciente y cita.
- Fecha/hora anterior y nueva.
- Fecha/hora de ejecución en UTC.
- Actor iniciador y método de autenticación.
- Resultado (éxito/rechazo), código de motivo y detalle.
- Evidencia de notificaciones.

Controles sugeridos:
- Logs append-only.
- Reloj de servidor como fuente oficial de tiempo.
- Política de retención y acceso por rol.
- Capacidad de exportación para auditoría interna/externa.

---

## 10) Casos de uso clave
### CU-01 Reprogramación exitosa por paciente
Precondiciones:
- Paciente autenticado.
- Cita en estado elegible.
- Falta más de 72h.

Resultado:
- Cita reprogramada.
- Auditoría y notificaciones emitidas.

### CU-02 Reprogramación rechazada por ventana de 72h
Precondiciones:
- Cita con 72h o menos restantes.

Resultado:
- No se permite cambio autónomo.
- Se informa motivo y canal de soporte.

### CU-03 Reprogramación rechazada por conflicto de agenda
Precondiciones:
- Slot deja de estar disponible en confirmación.

Resultado:
- No se aplica cambio.
- Se solicita elegir nuevo slot.

---

## 11) Criterios de aceptación (borrador)
1. Si faltan más de 72h y la cita está elegible, el paciente puede completar la reprogramación end-to-end.
2. Si faltan 72h o menos, el sistema bloquea la reprogramación autónoma y muestra motivo.
3. Cada reprogramación exitosa genera un registro auditable completo.
4. Paciente y médico reciben confirmación tras cambio exitoso.
5. En caso de conflicto de slot, el sistema no deja estado inconsistente ni doble reserva.
6. Soporte puede consultar historial de reprogramaciones para una cita/paciente.

---

## 12) Métricas funcionales sugeridas
- Tasa de reprogramación autónoma exitosa.
- Tasa de bloqueos por regla 72h.
- Tasa de conflictos de disponibilidad en confirmación.
- Tiempo medio de completar reprogramación.
- Derivaciones a soporte por no elegibilidad.
- Reclamos/incidencias post-reprogramación.

---

## 13) Riesgos y mitigaciones
- **Riesgo legal de trazabilidad insuficiente** -> diseñar auditoría desde MVP, validar con compliance.
- **Riesgo de mala UX en reglas restrictivas** -> mensajes claros y alternativa de soporte inmediata.
- **Riesgo de inconsistencia de agenda** -> confirmación transaccional e idempotencia.
- **Riesgo de saturación de soporte por bloqueos** -> monitorizar bloqueos y revisar política.

---

## 14) Supuestos y decisiones pendientes
Supuestos:
- El paciente ya dispone de autenticación válida en canal digital.
- Existe fuente de disponibilidad de agenda en tiempo real o casi real.
- Se puede notificar por al menos un canal confiable (email/push/SMS).

Pendientes a validar con negocio/legal/operaciones:
- Definición exacta de “72h” (horas corridas vs hábiles).
- Si hay excepciones médicas justificadas.
- Si el motivo de reprogramación es obligatorio por regulación.
- Límite de cantidad de reprogramaciones por cita/paciente.
- Necesidad de aprobación del médico en algunos escenarios.

---

## 15) Propuesta de roadmap de implementación
### Fase 1 (MVP)
- Flujo paciente con regla 72h.
- Reprogramación con mismo médico.
- Auditoría básica inmutable.
- Notificaciones esenciales.
- Vista de soporte en modo consulta.

### Fase 2
- Políticas avanzadas (límites, excepciones).
- Mejoras de UX y mensajes dinámicos.
- Reportería operativa y compliance ampliada.
- Escenarios con cambio de médico bajo reglas definidas.
