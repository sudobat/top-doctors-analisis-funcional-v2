# Analisis funcional borrador - Refinamiento de push duplicadas (Epic NOTI-88)

## 1) Contexto y problema

La funcionalidad actual de notificaciones push presenta envios duplicados para un mismo evento funcional. Esto genera:

- mala experiencia de usuario (fatiga por notificaciones repetidas),
- potencial desinstalacion o desactivacion de permisos push,
- ruido operativo para soporte y producto,
- dificultad para medir conversion real por notificacion.

No existe prototipo nuevo. El refinamiento se basa en:

- comportamiento observado en produccion,
- logs existentes de backend/proveedor push,
- alcance de la epic `NOTI-88`.

## 2) Objetivo del refinamiento

Reducir a cero los duplicados no intencionales de push para un mismo usuario + evento + ventana temporal definida, manteniendo la entrega legitima de notificaciones diferentes o reintentos tecnicos controlados.

## 3) Alcance

### Incluye

- Analisis y ajuste del flujo de envio push existente.
- Definicion de reglas de idempotencia/deduplicacion.
- Mejora de observabilidad extremo a extremo.
- Definicion de criterios de aceptacion automatizables por QA.

### No incluye

- Rediseno de contenido/copy de notificaciones.
- Cambio de proveedor push (si existe uno actual).
- Rediseno UX de permisos o centro de notificaciones en app.

## 4) Actores y sistemas impactados

- Backend de notificaciones.
- Cola o scheduler de eventos (si aplica).
- Integracion con proveedor push (FCM/APNS u otro).
- App cliente (solo para recepcion y trazabilidad, sin cambios funcionales mayores).
- QA automatizacion.
- Data/observabilidad (logs, metricas, alertas, dashboard).

## 5) Hipotesis funcionales de causa de duplicado

Estas hipotesis guian el refinamiento y deben validarse con logs:

1. **Reprocesamiento de eventos** por falta de marca de consumo/idempotencia.
2. **Reintentos tecnicos** sin clave de deduplicacion compartida.
3. **Multiples workers** procesando el mismo mensaje por condicion de carrera.
4. **Timeout de proveedor** con confirmacion tardia y nuevo envio.
5. **Duplicidad de tokens/dispositivos** no normalizada por usuario.
6. **Eventos origen duplicados** emitidos por modulo upstream.

## 6) Requisitos funcionales

### RF-01 Idempotencia por evento de negocio

El sistema debe construir una `dedup_key` deterministica por notificacion usando al menos:

- `user_id`
- `tipo_evento`
- `id_evento_origen` (o correlativo equivalente)
- `canal = push`

Si se recibe nuevamente la misma combinacion dentro de la ventana de control, no se debe reenviar push.

### RF-02 Ventana temporal de deduplicacion

Se define una ventana configurable (ejemplo inicial: 24h) para bloquear reenvio del mismo evento funcional. Fuera de la ventana, el envio puede ser valido segun reglas de negocio.

### RF-03 Manejo de reintentos tecnicos

Los reintentos por error transitorio deben reutilizar la misma `dedup_key` y el mismo `notification_id` logico para evitar doble entrega por reintento.

### RF-04 Estado de envio trazable

Cada intento debe persistir estado con transiciones minimas:

- `RECEIVED`
- `DEDUP_BLOCKED` (si aplica)
- `SENT_PROVIDER`
- `PROVIDER_ACK`
- `FAILED_RETRYABLE`
- `FAILED_FINAL`

### RF-05 Normalizacion de destinatario

Antes del envio, el sistema debe resolver el conjunto final de tokens/dispositivos activos evitando duplicados exactos del mismo token para el mismo usuario y evento.

### RF-06 Compatibilidad con eventos legitimos distintos

No debe bloquearse el envio de eventos diferentes al mismo usuario, aun cuando ocurran cercanos en el tiempo, si su `dedup_key` difiere.

## 7) Requisitos no funcionales y observabilidad

### RNF-01 Logging estructurado obligatorio

Agregar o estandarizar logs con campos minimos:

- `timestamp`
- `environment`
- `service`
- `trace_id`
- `event_id_origen`
- `notification_id`
- `dedup_key_hash` (hash, no valor plano si es sensible)
- `user_id_hash` o pseudonimo
- `provider`
- `status`
- `error_code` (cuando aplique)
- `retry_count`

### RNF-02 Metricas de salud

Exponer metricas por minuto/hora:

- total recibidas para envio push
- total bloqueadas por deduplicacion
- total enviadas al proveedor
- tasa de duplicado detectado
- tasa de error por proveedor
- p95 de latencia desde `RECEIVED` a `SENT_PROVIDER`

### RNF-03 Alertas operativas

Definir alertas minimas:

- aumento anomalo de `DEDUP_BLOCKED` sobre baseline esperado,
- incremento de errores retryables/finales,
- desviacion de latencia p95.

### RNF-04 Trazabilidad end-to-end

Cada push debe poder reconstruirse desde evento origen hasta respuesta de proveedor usando `trace_id` + `notification_id`.

## 8) Flujo funcional propuesto (alto nivel)

1. Llega evento de negocio candidato a push.
2. Se calcula `dedup_key` y se consulta almacenamiento de idempotencia.
3. Si ya existe envio valido en ventana: marcar `DEDUP_BLOCKED` y terminar.
4. Si no existe: registrar `RECEIVED`, resolver tokens y enviar a proveedor.
5. Persistir resultado (`SENT_PROVIDER`, `PROVIDER_ACK` o error).
6. Si hay error retryable, reintentar sin cambiar `dedup_key`.
7. Emitir logs y metricas en cada transicion.

## 9) Criterios de aceptacion (QA automatizable)

### CA-01 Bloqueo de duplicado exacto

**Dado** un evento push con `user_id`, `tipo_evento` e `id_evento_origen`  
**Cuando** se procesa dos veces dentro de la ventana de deduplicacion  
**Entonces** solo se realiza un envio a proveedor y el segundo queda en `DEDUP_BLOCKED`.

### CA-02 Permitir eventos distintos

**Dado** dos eventos con distinto `id_evento_origen` o `tipo_evento` para el mismo usuario  
**Cuando** se procesan en intervalo corto  
**Entonces** ambos pueden enviarse y quedan registrados con `notification_id` diferentes.

### CA-03 Reintento sin duplicar entrega

**Dado** un fallo transitorio del proveedor en el primer intento  
**Cuando** se ejecuta reintento automatico  
**Entonces** se conserva la misma `dedup_key` y no se generan dos entregas exitosas del mismo evento.

### CA-04 Concurrencia controlada

**Dado** procesamiento concurrente del mismo evento por multiples workers  
**Cuando** ocurre condicion de carrera  
**Entonces** solo un worker logra transicion a envio y los demas quedan bloqueados por idempotencia.

### CA-05 Logging completo

**Dado** cualquier procesamiento de push  
**Cuando** QA consulta logs  
**Entonces** encuentra todos los campos obligatorios definidos en RNF-01 y puede correlacionar `trace_id` y `notification_id`.

### CA-06 Metricas visibles

**Dado** ejecucion de pruebas de carga funcional  
**Cuando** se inspecciona observabilidad  
**Entonces** existen metricas de deduplicacion, envio, error y latencia actualizadas en dashboard.

## 10) Casos borde a validar

- Usuario con multiples dispositivos activos.
- Token invalido mezclado con tokens validos.
- Evento repetido fuera de ventana (debe permitir segun negocio).
- Replay de mensajes de cola tras reinicio de consumidor.
- Retraso de ACK del proveedor con timeout local.

## 11) Riesgos y mitigaciones

- **Riesgo:** falsa deduplicacion (bloquear notificacion legitima).  
  **Mitigacion:** definir correctamente composicion de `dedup_key` y pruebas con eventos parecidos.

- **Riesgo:** aumento de latencia por chequeo de idempotencia.  
  **Mitigacion:** almacenamiento de baja latencia e indices por clave.

- **Riesgo:** observabilidad incompleta al inicio.  
  **Mitigacion:** checklist de campos obligatorios y smoke test de telemetria en QA.

## 12) Dependencias

- Confirmar alcance funcional exacto de epic `NOTI-88`.
- Acceso a logs historicos para cuantificar baseline de duplicados.
- Alineacion con equipo de plataforma/infra para metricas y alertas.
- Alineacion con QA para contratos de pruebas automatizadas (API/integracion).

## 13) Definicion de listo (DoD) para este refinamiento

Se considera listo cuando:

1. Reglas de deduplicacion e idempotencia estan implementadas y activas.
2. Criterios CA-01 a CA-06 pasan en pipeline automatizado.
3. Dashboard y alertas minimas estan operativas.
4. Se evidencia reduccion de duplicados en entorno de prueba y/o produccion controlada frente al baseline.

## 14) Preguntas abiertas para siguiente iteracion

- Cual es la ventana exacta de deduplicacion por tipo de evento?
- Se requiere politica distinta por plataforma (iOS/Android)?
- El proveedor soporta idempotency-key nativa aprovechable?
- Que umbrales de alerta se aceptan inicialmente para ruido vs incidente?
