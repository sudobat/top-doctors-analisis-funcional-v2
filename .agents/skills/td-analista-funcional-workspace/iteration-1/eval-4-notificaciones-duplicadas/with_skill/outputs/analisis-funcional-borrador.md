# Refinamiento de notificaciones push para eliminar envios duplicados

## Descripcion funcional

### Metadatos

- Fecha de creacion: 2026-04-23
- Responsable negocio: [Por definir - Equipo de Producto Growth/Engagement]
- Responsable funcional: [Por definir - Analisis Funcional]
- PO: [Por definir]
- Responsable UX: [Por definir]
- Prioridad (Q): Alta
- Tipo: Mejora
- Trimestre objetivo: Q2

### Descripcion general de la funcionalidad

La funcionalidad actual de notificaciones push presenta envios duplicados para una misma notificacion funcional, lo que genera ruido al usuario final, potencial aumento de desinstalaciones y perdida de confianza en el canal. El objetivo de negocio es asegurar un unico envio efectivo por evento notificable y por destinatario dentro de una ventana de deduplicacion definida, manteniendo trazabilidad completa para diagnostico.  

Esta mejora refina el flujo existente (AS-IS) sin introducir un rediseño de producto visible: se incorpora control de idempotencia en la generacion y despacho, reglas explicitas de prioridad entre disparadores, manejo de reintentos sin duplicacion y observabilidad extremo a extremo (eventos, logs estructurados, metricas y alertas). El alcance incluye motor de notificaciones push, colas/reintentos asociados, persistencia de claves de deduplicacion y criterios verificables para automatizacion de QA.

### Prototipo funcional

- URL prototipo/diseno: No aplica (sin prototipo nuevo para esta mejora).
- Referencias adicionales:
  - Epic: NOTI-88 (refinamiento y correccion de duplicados en push).
  - Logs operativos actuales con evidencia de envios duplicados (fuente a confirmar por plataforma/entorno).

### Relacion con epica/iniciativa

- Epica: NOTI-88
- Tickets relacionados: [NOTI-88-1 Analisis AS-IS], [NOTI-88-2 Idempotencia], [NOTI-88-3 Observabilidad], [NOTI-88-4 QA automatizado]

## Historias funcionales

### Historia 1: Deduplicacion funcional por destinatario y evento

**Como** sistema de notificaciones push  
**Quiero** validar una clave de deduplicacion antes de encolar o enviar una push  
**Para** evitar que el mismo usuario reciba notificaciones repetidas por un mismo evento funcional

**Precondiciones**

- Existe un identificador de usuario destino resoluble y valido para push.
- El evento de negocio que dispara la push expone un identificador estable (event_id u homologo) y timestamp.

**Descripcion**

- AS-IS: el flujo actual permite multiples disparos equivalentes (por reintentos, replay de eventos o condiciones concurrentes), y cada disparo puede terminar en un envio push al mismo destinatario.
- TO-BE: antes de encolar, el sistema construye `dedupe_key` deterministica con combinacion de `canal=push + plantilla/tipo_notificacion + destinatario + evento_origen + ventana_tiempo`.
- Si la `dedupe_key` no existe en estado activo de ventana, se registra y el envio continua. Si ya existe, el intento queda en estado `suprimido_por_duplicado`.
- La deduplicacion debe ejecutarse en operacion atomica para evitar condiciones de carrera entre workers/procesos concurrentes.
- La ventana de deduplicacion es parametrizable por tipo de notificacion (valor por defecto inicial propuesto: 24 horas para notificaciones transaccionales no repetibles; parametrizacion final pendiente de negocio).
- Las transiciones de estado minimas por intento: `generado -> validado_dedupe -> encolado -> enviado` o `generado -> validado_dedupe -> suprimido_por_duplicado`.
- En caso de supresion, no se llama al proveedor push y se emite evento de observabilidad con causa.

**Criterios de aceptacion**

- [ ] Dado un mismo `destinatario + tipo_notificacion + evento_origen` recibido dos veces dentro de la ventana, cuando se procesa el segundo intento, entonces el sistema lo marca `suprimido_por_duplicado` y no genera segundo envio al proveedor.
- [ ] Dado dos intentos concurrentes con la misma `dedupe_key`, cuando ambos compiten por registrar la clave, entonces solo uno avanza a `encolado` y el otro queda suprimido.
- [ ] Dado un intento fuera de la ventana de deduplicacion, cuando se procesa, entonces el envio se permite y queda trazado como nuevo ciclo de notificacion.
- [ ] Dado un tipo de notificacion con ventana especifica configurada, cuando se evalua la deduplicacion, entonces se aplica ese valor y no el valor por defecto.
- [ ] Dado un intento suprimido, cuando QA consulta los logs estructurados, entonces encuentra `dedupe_key`, `motivo_suplicion=duplicado`, `notification_type`, `user_id` y `trace_id`.

**Diagramas / UX UI**

- Diagramas requeridos: Diagrama de secuencia (disparador -> dedupe -> cola -> proveedor) y diagrama de estados de intento de notificacion.
- Interfaces/pantallas implicadas: Consola interna de monitoreo de notificaciones (si existe), panel de logs/observabilidad.
- Notas UX/UI: No hay cambios en UI de usuario final; si existe backoffice, incluir etiqueta visible "Suprimida por duplicado" para soporte.

### Historia 2: Reintentos y recuperacion sin reenvio duplicado

**Como** equipo de plataforma de notificaciones  
**Quiero** separar tecnicamente fallo de entrega de duplicacion funcional  
**Para** permitir reintentos seguros sin enviar push repetidas al usuario

**Precondiciones**

- Existe estrategia de reintentos para fallos transitorios de proveedor (timeouts, 5xx, throttling).
- El estado de cada intento de push se persiste con identificador unico de mensaje interno.

**Descripcion**

- El flujo TO-BE distingue dos niveles: `intento_logico_notificacion` (unico por dedupe_key) y `intentos_tecnicos_de_entrega` (reintentos al proveedor para el mismo intento logico).
- Si el envio al proveedor falla con error transitorio, se reintenta sobre el mismo `intento_logico_notificacion`, sin crear nuevo evento funcional ni nueva `dedupe_key`.
- Si el proveedor confirma entrega/aceptacion, cualquier reintento posterior queda bloqueado por estado terminal `entregado` o `aceptado_por_proveedor`.
- Se define matriz de errores: transitorios (reintentar), permanentes (fallar sin reintento), funcionales (suprimir).
- Para prevenir duplicados por reprocesamiento de cola, cada mensaje de worker incluye `message_id` idempotente y validacion contra estado persistido antes de ejecutar envio.
- Estados y transiciones sugeridas: `encolado -> enviando -> entregado` o `encolado -> enviando -> fallo_transitorio -> reintentando -> entregado/fallo_permanente`.

**Criterios de aceptacion**

- [ ] Dado un fallo transitorio del proveedor en el primer intento tecnico, cuando se ejecuta reintento, entonces se conserva el mismo `intento_logico_notificacion` y no se crea una nueva notificacion funcional.
- [ ] Dado un mensaje de cola redeliverado tras haberse marcado como `entregado`, cuando el worker lo procesa, entonces detecta estado terminal y no ejecuta un nuevo envio al proveedor.
- [ ] Dado un fallo permanente clasificado (por ejemplo token invalido), cuando se procesa, entonces el intento termina en `fallo_permanente` sin reintentos adicionales.
- [ ] Dado un flujo con N reintentos tecnicos, cuando QA inspecciona trazas, entonces todos los reintentos referencian el mismo `dedupe_key` y el mismo `logical_notification_id`.
- [ ] Dado una recuperacion de servicio tras caida parcial, cuando se reanuda el consumo de cola, entonces no se incrementa la tasa de duplicados por encima del umbral definido (objetivo: 0 duplicados funcionales).

**Diagramas / UX UI**

- Diagramas requeridos: Diagrama de estados de retry y secuencia de reprocesamiento de cola.
- Interfaces/pantallas implicadas: Tablero operativo/alertas y vista de detalle de notificacion en herramientas internas.
- Notas UX/UI: Documentar codigos de estado legibles para soporte y QA (por ejemplo `DUP_SUPPRESSED`, `RETRYING_TRANSIENT`, `FAILED_PERMANENT`).

### Historia 3: Observabilidad y criterios auditables para QA automatizado

**Como** equipo de QA y observabilidad  
**Quiero** contar con telemetria y contratos de datos consistentes del flujo push  
**Para** detectar duplicados rapidamente y automatizar validaciones de no-regresion

**Precondiciones**

- La plataforma dispone de sistema centralizado de logs y metricas (stack por confirmar).
- Se puede correlacionar cada intento con `trace_id` o `correlation_id`.

**Descripcion**

- Se instrumentan eventos de dominio minimos: `push_notification_generated`, `push_dedupe_checked`, `push_enqueued`, `push_sent_provider`, `push_suppressed_duplicate`, `push_delivery_result`.
- Cada evento/log debe incluir al menos: `timestamp`, `environment`, `notification_type`, `user_id_hash/o identificador permitido`, `event_origin_id`, `dedupe_key`, `logical_notification_id`, `delivery_attempt`, `result_status`, `error_code` (si aplica), `trace_id`.
- Se definen metricas de control:
- `push_duplicate_suppression_count` (conteo absoluto).
- `push_duplicate_rate` = suprimidas_duplicado / generadas.
- `push_send_success_rate` por tipo de notificacion.
- `push_retry_count` y distribucion de reintentos.
- `p95_end_to_end_latency` (generacion a resultado final).
- Se definen alertas operativas:
- Alerta critica si `push_duplicate_rate` supera umbral acordado en ventana de 15 min.
- Alerta warning si falta emision de `push_dedupe_checked` en mas de X% de intentos.
- Alerta de calidad de datos si >Y% de eventos llegan sin `dedupe_key` o `trace_id`.
- Para QA automatizado, se establece set de pruebas E2E/API con datos controlados que validan no duplicacion, trazabilidad completa y consistencia de estados.

**Criterios de aceptacion**

- [ ] Dado un envio exitoso sin duplicados, cuando se consulta la traza completa, entonces existen todos los eventos obligatorios en orden logico y con claves de correlacion consistentes.
- [ ] Dado un caso de duplicado suprimido, cuando QA ejecuta la prueba automatizada, entonces valida 1 envio al proveedor y 1 evento `push_suppressed_duplicate` con `dedupe_key` correcta.
- [ ] Dado un fallo transitorio con reintento, cuando finaliza el flujo, entonces la observabilidad muestra multiples `delivery_attempt` para el mismo `logical_notification_id`.
- [ ] Dado un despliegue de nueva version del refinamiento, cuando se ejecuta suite de regresion automatizada, entonces todos los escenarios criticos (happy path, duplicado, concurrencia, redelivery) pasan.
- [ ] Dado una degradacion de deduplicacion simulada en entorno de pruebas, cuando la tasa de duplicados supera el umbral, entonces se dispara la alerta definida y queda registrada.

**Diagramas / UX UI**

- Diagramas requeridos: Mapa de eventos de observabilidad, matriz de cobertura QA automatizada y diagrama de correlacion de IDs.
- Interfaces/pantallas implicadas: Dashboard de metricas push, explorador de logs, panel de alertas, pipeline de QA automatizado.
- Notas UX/UI: Si existe dashboard interno, estandarizar nomenclatura de estados y filtros por `notification_type`, `result_status` y rango temporal.

## Requisitos no funcionales

- Rendimiento: Evaluacion de deduplicacion con latencia p95 <= 50 ms por intento; throughput objetivo alineado al pico actual +30%; p95 end-to-end de envio dentro del SLA vigente de notificaciones (valor exacto pendiente de confirmacion).
- Seguridad y privacidad: No registrar contenido sensible de mensaje en texto plano; enmascarar o hashear identificadores personales cuando aplique; trazabilidad auditable de decisiones de supresion y envio.
- Disponibilidad: En caso de caida parcial de proveedor o cola, reanudar proceso sin duplicar envios; persistencia de estado idempotente y recuperacion consistente tras reinicio de workers.
- Observabilidad: Cobertura del 100% de intentos con `dedupe_key` y `trace_id`; dashboard con metricas de duplicados/reintentos/exito; alertas configuradas con runbook operativo asociado.
- Compatibilidad: Sin cambios en experiencia de usuario final; compatibilidad con versiones actuales de app cliente y proveedores push existentes (FCM/APNs u homologo en uso).

## Supuestos, dependencias y riesgos

- Supuestos:
  - El evento origen de negocio permite construir una clave estable para deduplicacion.
  - El equipo de plataforma puede introducir almacenamiento/indice idempotente con garantias atomicas.
- Dependencias:
  - Equipo Backend/Plataforma de notificaciones para logica de dedupe y retries.
  - Equipo Data/Observabilidad para dashboards, metricas, alertas y retencion de logs.
- Riesgos:
  - Riesgo de falsos positivos de duplicado si la dedupe_key se define con granularidad incorrecta.
  - Riesgo de brecha de trazabilidad si sistemas legacy no propagan `trace_id` en todo el flujo.

## Fuera de alcance

- Rediseño de copy, segmentacion de campañas o estrategia de contenido de notificaciones.
- Implementacion de nuevos canales (email, SMS, in-app) no relacionados con push existente.

## Dudas abiertas

- Cual es la definicion funcional exacta de "duplicado" por cada tipo de notificacion en NOTI-88 (misma plantilla, mismo evento, misma ventana, otros criterios)?
- Cual es la ventana de deduplicacion final por categoria de push y si requiere excepciones por negocio?
- Donde residen los logs fuente que evidencian duplicados (entorno, periodo, formato) para cerrar baseline de metrica inicial?
- Cuales son los umbrales finales de alerta (`duplicate_rate`, faltantes de campos obligatorios) acordados por SRE/Plataforma?
- Se requiere visibilidad de estado de supresion en herramientas de soporte no tecnicas (backoffice/product support)?
- Cuales son los tickets reales hijos de NOTI-88 que reemplazaran los IDs provisionales usados en este borrador?

## Checklist de validacion

- [ ] El alcance esta claramente delimitado.
- [ ] Cada historia tiene criterios de aceptacion verificables.
- [ ] Se cubren happy path y casos borde relevantes.
- [ ] Hay trazabilidad con epica y tickets.
- [ ] Requisitos no funcionales definidos y medibles.
