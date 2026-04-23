# Lista de espera para reservas en slots completos

## Descripcion funcional

### Metadatos

- Fecha de creacion: 2026-04-23
- Responsable negocio: Operaciones de Reservas y Call Center (por confirmar nombre)
- Responsable funcional: Producto Digital - Analisis Funcional (por confirmar nombre)
- PO: Por definir
- Responsable UX: Equipo UX Growth/Bookings (por confirmar nombre)
- Prioridad (Q): Alta
- Tipo: Nueva funcionalidad
- Trimestre objetivo: Q3

### Descripcion general de la funcionalidad

Se define una funcionalidad nueva de lista de espera para reservas cuando un slot no tiene capacidad disponible. El objetivo de negocio es capturar demanda no atendida en el momento de intento de reserva y convertirla en reservas efectivas cuando se liberen cupos, evitando fuga de usuarios y llamadas repetitivas al call center. El alcance incluye dos canales operativos: web (autoservicio paciente) y call center (alta asistida por agente), con reglas unificadas de prioridad, elegibilidad y vencimiento. Se espera mejorar tasa de conversion de intentos fallidos por slot completo, reducir abandono, y dar trazabilidad end-to-end a estados de espera, notificaciones y adjudicacion de vacantes.

### Prototipo funcional

- URL prototipo/diseno: Prototipo Figma completo de la iniciativa RES-WAITLIST-Q3 (URL exacta pendiente de incorporacion)
- Referencias adicionales:
  - Iniciativa de producto: RES-WAITLIST-Q3
  - Flujos UX de reserva actual (AS-IS) y variantes web/call center (documentos internos, enlaces pendientes)

### Relacion con epica/iniciativa

- Epica: RES-WAITLIST-Q3
- Tickets relacionados: RES-WAITLIST-101, RES-WAITLIST-102, RES-WAITLIST-103 (IDs finales por confirmar en Jira)

## Historias funcionales

### Historia 1: Alta en lista de espera desde web cuando el slot esta completo

**Como** paciente que intenta reservar online  
**Quiero** poder apuntarme a una lista de espera cuando no hay cupo en un slot  
**Para** recibir una oportunidad automatica de reserva si se libera disponibilidad

**Precondiciones**

- El usuario esta autenticado en web o completa identificacion minima (segun politica vigente de reserva).
- El slot seleccionado se encuentra en estado "Completo" al momento de confirmar reserva.
- El centro/especialidad/profesional permite lista de espera activa para ese tipo de cita.
- Existe consentimiento para contacto por al menos un canal de notificacion habilitado.

**Descripcion**

- En la pantalla de disponibilidad, cuando el slot esta completo, se muestra CTA "Unirme a lista de espera" con texto de expectativa (sin garantizar turno).
- Al accionar el CTA, se abre modal/form con datos precargados (paciente, centro, especialidad, profesional, franja deseada) y campos editables definidos por UX:
  - Telefono de contacto (obligatorio, formato E.164 o formato local normalizado).
  - Email (condicional segun canal de notificacion elegido; validacion RFC basica).
  - Preferencia horaria (manana/tarde/indistinto) y rango de fechas (maximo N dias).
  - Motivo de consulta (opcional, longitud maxima configurable).
  - Consentimiento de aviso y tratamiento de datos (checkbox obligatorio si no existe consentimiento vigente).
- Reglas de negocio de alta:
  - No se permite doble alta activa para el mismo paciente + slot objetivo (o clave funcional equivalente: centro+profesional+fecha+franja).
  - Si existe alta previa activa para misma clave funcional, se muestra estado actual y se evita duplicado.
  - Se limita cantidad de esperas activas por paciente (umbral configurable, por defecto 3).
  - Se calcula timestamp de prioridad por orden de entrada (FIFO) dentro de la misma clave funcional, salvo reglas de prioridad comercial/sanitaria futuras (fuera de alcance en esta version).
- Estados y transiciones iniciales:
  - Creacion en estado `EN_ESPERA`.
  - Si falla persistencia o validacion de negocio, no se crea registro y se muestra mensaje accionable.
  - Si alta exitosa, estado permanece `EN_ESPERA` y se confirma con identificador de solicitud.
- Casos borde y errores:
  - Slot deja de estar completo antes de confirmar alta: el sistema ofrece redirigir a reserva directa.
  - Datos de contacto invalidos: bloqueo de envio con errores inline por campo.
  - Timeout o error tecnico: mensaje de reintento y log de fallo con correlation_id.
  - Usuario sin permisos de reserva para dependiente/tercero: bloquear alta y mostrar causa.

**Criterios de aceptacion**

- [ ] Dado un slot completo y lista de espera habilitada, cuando el paciente pulsa "Unirme a lista de espera", entonces visualiza formulario con datos del slot y validaciones definidas.
- [ ] Dado que ya existe una espera activa para la misma clave funcional, cuando el paciente intenta una nueva alta, entonces el sistema impide duplicado y muestra estado de la solicitud existente.
- [ ] Dado que el paciente completa datos validos y acepta consentimiento requerido, cuando confirma alta, entonces se crea solicitud en estado `EN_ESPERA` con timestamp y canal de origen `WEB`.
- [ ] Dado que un campo obligatorio es invalido o vacio, cuando el paciente confirma, entonces no se crea solicitud y se muestran errores por campo sin perder datos ya ingresados.
- [ ] Dado que el slot se libera antes del alta final, cuando el paciente intenta unirse, entonces el sistema informa disponibilidad y habilita flujo de reserva directa.
- [ ] Dado un error tecnico en persistencia, cuando falla el alta, entonces el paciente recibe mensaje de reintento y el sistema registra evento de error trazable.

**Diagramas / UX UI**

- Diagramas requeridos: Flujo web de alta (happy path + duplicado + error tecnico), diagrama de estados de solicitud de espera, secuencia API front-back de creacion de espera.
- Interfaces/pantallas implicadas: Calendario/listado de slots, modal de lista de espera, pantalla de confirmacion, componente de mensajes de error/estado.
- Notas UX/UI: Debe explicitarse tiempo estimado no garantizado, orden de prioridad, y politica de expiracion; mensajes deben diferenciar "lista de espera creada" vs "reserva confirmada".

### Historia 2: Alta y gestion de lista de espera desde call center

**Como** agente de call center  
**Quiero** registrar y consultar solicitudes de lista de espera en nombre del paciente  
**Para** ofrecer continuidad operativa cuando no hay cupo y reducir reprocesos en llamadas

**Precondiciones**

- El agente inicia sesion en herramienta de call center con rol habilitado para operaciones de espera.
- Existe ficha de paciente identificada o se completa alta minima de paciente segun normativa.
- El slot consultado por el agente esta completo y la configuracion permite lista de espera.
- El agente dispone de script operativo aprobado para comunicar condiciones de la lista de espera.

**Descripcion**

- En el flujo de agenda asistida, al detectar slot completo, se habilita accion "Crear espera".
- El formulario en backoffice incluye:
  - Datos de paciente (lectura/edicion segun permisos).
  - Canal preferido de contacto (telefono, SMS, email, llamada saliente).
  - Ventana de disponibilidad del paciente (dias/horas aceptables).
  - Nivel de urgencia operativa (campo informativo interno, sin alterar FIFO en MVP).
  - Observaciones internas del agente (no visibles para paciente).
- Reglas de negocio para canal call center:
  - Se aplican mismas reglas de duplicidad y limite de esperas activas que web.
  - Se registra `origin_channel = CALL_CENTER` y `agent_id`.
  - Todo alta/modificacion/cancelacion genera trazabilidad de auditoria (quien, cuando, que cambia).
  - El agente puede cancelar una espera a solicitud del paciente con motivo obligatorio de cancelacion.
- Consulta y seguimiento:
  - El agente puede listar esperas activas por paciente y ver estado (`EN_ESPERA`, `NOTIFICADA`, `EXPIRADA`, `ASIGNADA`, `CANCELADA`).
  - Se muestra posicion relativa solo si esta habilitada por negocio; de lo contrario, se muestra rango aproximado.
  - El agente puede actualizar datos de contacto mientras estado sea `EN_ESPERA`.
- Casos borde y errores:
  - Paciente con datos incompletos para contacto: bloqueo de alta hasta completar minimo requerido.
  - Edicion concurrente por otro agente: control de version optimista y mensaje de "registro actualizado".
  - Intento de cancelar espera ya asignada: bloqueo y guia de accion alternativa.

**Criterios de aceptacion**

- [ ] Dado un agente con permisos y un slot completo, cuando selecciona "Crear espera", entonces puede registrar solicitud con canal `CALL_CENTER` y datos minimos requeridos.
- [ ] Dado que ya existe espera activa equivalente, cuando el agente intenta crear otra, entonces el sistema impide duplicado y muestra la solicitud existente.
- [ ] Dado que el agente cancela por pedido del paciente, cuando confirma motivo obligatorio, entonces el estado pasa a `CANCELADA` y queda auditoria completa.
- [ ] Dado un intento de edicion concurrente, cuando un agente guarda sobre version desactualizada, entonces recibe aviso de conflicto y opcion de recargar datos.
- [ ] Dado un paciente sin telefono ni email valido, cuando el agente intenta guardar alta, entonces se bloquea operacion y se informa campo faltante.
- [ ] Dado una consulta de estado por paciente, cuando el agente abre detalle, entonces visualiza historico de eventos y ultimo intento de notificacion.

**Diagramas / UX UI**

- Diagramas requeridos: Flujo operativo call center punta a punta, secuencia de auditoria de cambios, matriz de permisos por rol.
- Interfaces/pantallas implicadas: Agenda asistida, formulario de alta de espera, listado de esperas por paciente, vista detalle con timeline de eventos.
- Notas UX/UI: Minimizar clicks en llamada activa, autocompletar desde ficha de paciente, y usar mensajes estandarizados para lectura en script del agente.

### Historia 3: Asignacion de vacantes, notificacion y conversion de espera a reserva

**Como** sistema de reservas  
**Quiero** adjudicar automaticamente vacantes liberadas a pacientes en espera y gestionar notificaciones con vencimiento  
**Para** maximizar ocupacion de agenda y convertir demanda retenida en reservas confirmadas

**Precondiciones**

- Existen solicitudes en estado `EN_ESPERA` para la clave funcional del slot que se libera.
- Se detecta evento de liberacion de cupo (cancelacion, ampliacion o ajuste de agenda).
- Hay mecanismo de notificacion activo y plantillas aprobadas por canal.
- Existe timeout configurado para respuesta del paciente (por ejemplo, 30 minutos en horario operativo).

**Descripcion**

- Disparador:
  - Ante liberacion de un slot, un worker/proceso de asignacion busca candidatos elegibles en estado `EN_ESPERA`, ordenados por prioridad temporal.
  - Se excluyen solicitudes vencidas, canceladas o con datos de contacto invalidos.
- Logica de adjudicacion:
  - Se selecciona primer candidato elegible y se emite oferta de turno (estado `NOTIFICADA`).
  - Se inicia contador de expiracion de oferta (TTL configurable).
  - Si el paciente acepta dentro del TTL por canal habilitado, se confirma reserva y estado pasa a `ASIGNADA`.
  - Si rechaza o vence TTL sin respuesta, estado pasa a `EXPIRADA` para esa oferta y se itera con siguiente candidato.
  - Se limita cantidad de reintentos por solicitud (parametrizable) para evitar loops.
- Reglas de negocio complementarias:
  - Una solicitud no puede terminar en `ASIGNADA` mas de una vez.
  - Al confirmar reserva, se cierran automaticamente otras esperas equivalentes del mismo paciente segun politica configurada.
  - Las notificaciones deben incluir identificador de oferta, deadline exacto y accion de aceptar/rechazar.
  - Si no hay candidatos elegibles, el slot vuelve a inventario general.
- Observabilidad y trazabilidad:
  - Eventos minimos: `waitlist_created`, `waitlist_notified`, `waitlist_offer_expired`, `waitlist_offer_accepted`, `waitlist_offer_rejected`, `waitlist_cancelled`, `waitlist_booking_confirmed`.
  - Logs estructurados con `waitlist_id`, `slot_id`, `patient_id`, `origin_channel`, `correlation_id`.
  - Alertas por tasa anomala de expiraciones y fallos de notificacion por canal.
- Casos borde y recuperacion:
  - Doble liberacion simultanea del mismo slot: lock transaccional para evitar doble asignacion.
  - Falla de proveedor de notificaciones: reintento con backoff y fallback de canal si aplica.
  - Aceptacion recibida fuera de TTL: rechazar conversion y ofrecer alternativas disponibles.

**Criterios de aceptacion**

- [ ] Dado un slot liberado con solicitudes elegibles, cuando corre el proceso de adjudicacion, entonces se notifica al primer candidato por prioridad y su estado pasa a `NOTIFICADA`.
- [ ] Dado una oferta notificada, cuando el paciente acepta dentro del TTL, entonces se crea reserva confirmada y la solicitud cambia a `ASIGNADA`.
- [ ] Dado una oferta sin respuesta hasta TTL, cuando expira el plazo, entonces la solicitud se marca como `EXPIRADA` para esa oferta y se intenta con el siguiente candidato.
- [ ] Dado un rechazo explicito del paciente, cuando se registra rechazo, entonces el sistema continua con el siguiente candidato sin bloquear el slot.
- [ ] Dado fallo temporal del proveedor de notificaciones, cuando ocurre error, entonces se ejecuta politica de reintento y se registra evento de error con trazabilidad completa.
- [ ] Dado que no existen candidatos elegibles, cuando se libera un slot, entonces el cupo retorna a disponibilidad general sin quedar retenido.

**Diagramas / UX UI**

- Diagramas requeridos: Diagrama de estados completo de waitlist, secuencia de adjudicacion automatica con TTL, flujo de notificaciones multicanal.
- Interfaces/pantallas implicadas: Bandeja operativa de adjudicaciones, detalle de solicitud y timeline, componentes de confirmacion/rechazo de oferta.
- Notas UX/UI: Mensajeria clara sobre limite temporal de respuesta y resultado final; evitar ambiguedad entre "oferta recibida" y "reserva confirmada".

## Requisitos no funcionales

- Rendimiento: Alta web/call center <= 2.0 s p95; consulta de estado <= 1.5 s p95; proceso de adjudicacion dispara en <= 60 s desde liberacion de slot; soporte inicial de 5k solicitudes activas concurrentes con crecimiento trimestral del 30%.
- Seguridad y privacidad: Control RBAC por canal y rol; enmascarado de datos sensibles en backoffice segun perfil; auditoria inmutable de acciones de agente; cumplimiento de normativa de proteccion de datos y consentimiento de comunicaciones.
- Disponibilidad: Si motor de adjudicacion cae, cola de eventos se reprocesa al recuperar servicio sin perdida; estrategia idempotente para evitar dobles asignaciones; degradacion controlada permitiendo alta en espera aunque notificaciones esten temporalmente degradadas.
- Observabilidad: Dashboard con conversion de espera->reserva, tiempo medio en espera, tasa de expiracion, tasa de error por canal; alertas operativas por backlog de cola, fallos de proveedor y latencia de adjudicacion; trazas distribuidas con correlation_id.
- Compatibilidad: Web responsive en ultimas 2 versiones de Chrome/Edge/Safari/Firefox; backoffice call center optimizado para Chrome corporativo; comportamiento consistente en desktop y mobile web para alta/consulta basica.

## Supuestos, dependencias y riesgos

- Supuestos:
  - El prototipo Figma cubre estados principales, mensajes y variaciones por canal web/call center.
  - La plataforma actual de reservas expone eventos de liberacion de slot en tiempo util para activar adjudicacion.
  - Existe proveedor de notificaciones multicanal ya integrado (SMS/email/voz) o en fase final de integracion.
- Dependencias:
  - Equipo UX para entrega de especificaciones finales de componentes, microcopy y casos de error.
  - Equipo de Plataforma de Reservas para eventos de disponibilidad, API de creacion de reserva y locks de concurrencia.
  - Equipo de Integraciones/Comms para plantillas, SLA y fallback de notificaciones.
  - Equipo de QA para definicion de matriz de pruebas E2E multicanal y datos de prueba.
- Riesgos:
  - Ambiguedad en politica de prioridad (FIFO puro vs reglas de negocio) puede generar conflictos operativos y reclamos.
  - Fallos intermitentes de notificaciones pueden reducir conversion y provocar expiraciones falsas.
  - Definicion incompleta de expiracion/ventanas horarias puede causar sobreasignacion o perdida de cupos.
  - Duplicidad de solicitudes por divergencia de reglas entre web y call center si no se centraliza validacion.

## Fuera de alcance

- Modelo avanzado de scoring/priorizacion con IA o reglas clinicas complejas para ordenar lista de espera.
- Integracion con canales externos de mensajeria no corporativos (por ejemplo, WhatsApp no oficial) en esta fase.
- Replanificacion automatica de citas ya confirmadas para optimizar agenda.
- Portal de autogestion historica completa de waitlist para paciente con analitica avanzada.

## Dudas abiertas

- Cual es la URL final del prototipo Figma y que version se considera baseline congelada para desarrollo?
- Cual es la definicion final de clave funcional para evitar duplicados (slot exacto vs franja vs profesional+especialidad)?
- Se adopta FIFO estricto en MVP o se aplican excepciones de prioridad de negocio/salud desde primera release?
- Cual es el TTL objetivo por tipo de canal (web, SMS, llamada) y se diferencia por horario operativo/nocturno?
- Se debe mostrar posicion exacta en lista al paciente/agente o solo estado cualitativo para evitar friccion?
- Que politica aplica para cerrar automaticamente otras esperas activas del mismo paciente al confirmar una reserva?
- Cuales son los textos legales definitivos de consentimiento y retencion de datos para lista de espera?
- Que SLAs de proveedor de notificaciones se comprometen para no degradar conversion en horarios pico?
- Se requieren reportes regulatorios o auditorias adicionales para acciones de agentes del call center?
- Cuales tickets Jira oficiales reemplazan los IDs propuestos RES-WAITLIST-101/102/103 para trazabilidad real?

## Checklist de validacion

- [x] El alcance esta claramente delimitado.
- [x] Cada historia tiene criterios de aceptacion verificables.
- [x] Se cubren happy path y casos borde relevantes.
- [x] Hay trazabilidad con epica y tickets.
- [x] Requisitos no funcionales definidos y medibles.
