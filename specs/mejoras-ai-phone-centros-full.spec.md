# Mejoras del analisis funcional y flujo AI Phone Centros (Borrador)

## Descripcion funcional

### Metadatos

- Fecha de creacion: 2026-05-05
- Responsable negocio: Pendiente (Operaciones Centros)
- Responsable funcional: AI Assistant (borrador inicial)
- PO: Pendiente
- Responsable UX: Pendiente (Conversational Design)
- Prioridad (Q): Alta
- Tipo: Mejora
- Trimestre objetivo: Q2

### Descripcion general de la funcionalidad

El flujo actual de AI Phone para centros cubre el proceso principal de agendado (especialidad, doctor, cobertura, canal, servicio, precio, disponibilidad y captura de datos). Sin embargo, presenta oportunidades de mejora en dos capas: (1) la forma de analizar/documentar el flujo para reducir ambiguedad entre negocio, desarrollo y QA, y (2) el propio comportamiento conversacional para aumentar conversion y reducir derivaciones innecesarias a agente.

Esta propuesta define un TO-BE funcional con reglas explicitas, puntos de decision verificables y nuevas historias enfocadas en desambiguacion, resiliencia de voz, observabilidad y handoff controlado. El valor esperado es mejorar la tasa de cita confirmada, reducir abandonos, y aumentar trazabilidad operativa por sede/especialidad/cobertura.

### Prototipo funcional

- URL prototipo/diseno: Pendiente
- Referencias adicionales:
  - `ficheros_adjuntos/ai_pphone/AI_Phone_Centros_FULL_v2.drawio (1).pdf`
  - `specs/TD-Ejemplo análisis funcional.md`

### Relacion con epica/iniciativa

- Epica: Pendiente (AI Phone Centros - Optimizacion Conversacional)
- Tickets relacionados: Pendiente

## Historias funcionales

### Historia 1: Estandarizar analisis funcional con matriz de decisiones y estados

**Como** equipo de producto y tecnologia  
**Quiero** modelar el flujo AI Phone mediante matriz de decisiones, catalogo de intents y maquina de estados  
**Para** reducir ambiguedad funcional y acelerar desarrollo/QA sin reinterpretaciones

**Precondiciones**

- Existe una version base del flujo FULL de centros.
- Hay acceso a reglas de negocio de cobertura, servicios y derivacion.

**Descripcion**

- Se define una matriz de decisiones con entradas normalizadas: `intencion`, `especialidad`, `doctor`, `seguro`, `canal`, `servicio`, `preferencia_horaria`, `resultado_disponibilidad`.
- Cada decision debe explicitar: condicion, prioridad, accion del bot, mensaje al paciente, evento de tracking y fallback.
- Se crea una maquina de estados conversacional con estados terminales claros: `cita_propuesta`, `handoff_agente`, `abandono`, `cierre_exitoso`.
- Se agrega un diccionario de mensajes con identificador unico (`MSG_xxx`) para evitar variaciones no controladas entre canales/entornos.

**Criterios de aceptacion**

- [ ] Existe una matriz de decisiones completa que cubre happy path y rutas de excepcion del flujo FULL.
- [ ] Cada transicion de estado tiene precondicion, accion, postcondicion y evento de observabilidad asociado.
- [ ] QA puede construir casos de prueba end-to-end solo a partir del spec sin supuestos adicionales.

**Diagramas / UX UI**

- Diagramas requeridos: Flujo de estados, tabla de decisiones, secuencia integraciones.
- Interfaces/pantallas implicadas: Consola de configuracion de flujo, panel de logs conversacionales.
- Notas UX/UI: Mensajeria consistente, confirmaciones breves y lenguaje comprensible para paciente no tecnico.

### Historia 2: Mejorar desambiguacion y recuperacion en reconocimiento de voz

**Como** paciente que llama por telefono  
**Quiero** que el bot confirme y recupere cuando no entiende mi respuesta  
**Para** completar la reserva sin frustracion ni repeticiones excesivas

**Precondiciones**

- Motor ASR/NLU con score de confianza disponible.
- Bot puede detectar no-entendido y no-input.

**Descripcion**

- Antes de aplicar reglas de negocio criticas, el bot confirma entidades de baja confianza (especialidad, doctor, aseguradora) con estrategia de "confirmacion corta".
- Se establecen politicas de recuperacion por estado: maximo 2 repreguntas con reformulacion; a la tercera, handoff a agente con contexto.
- Se incorpora reconocimiento de sinonimos y variantes frecuentes (ej. "trauma" -> traumatologia; "Mapfre Salud" -> MAPFRE).
- Se permite cambiar de objetivo sin reiniciar la llamada completa (ej. pasar de "doctor concreto" a "cualquiera" durante la misma sesion).

**Criterios de aceptacion**

- [ ] Cuando el score de confianza este por debajo del umbral definido, el bot solicita confirmacion antes de avanzar.
- [ ] Tras 3 intentos fallidos en un mismo paso, se deriva a agente incluyendo resumen de contexto capturado.
- [ ] El flujo contempla no-input (silencio) y permite reintento con mensaje alternativo sin cortar llamada.

**Diagramas / UX UI**

- Diagramas requeridos: Flujo de recuperacion de errores, diagrama de estados de no-entendido/no-input.
- Interfaces/pantallas implicadas: Editor de intents/sinonimos, vista de transcripcion por llamada.
- Notas UX/UI: Prompts cortos, una pregunta por turno, evitar bloques largos de audio.

### Historia 3: Reordenar validaciones de cobertura para minimizar vueltas y abandono

**Como** paciente con seguro medico  
**Quiero** validar compatibilidad de cobertura de forma temprana y clara  
**Para** no recorrer pasos que finalmente no aplican

**Precondiciones**

- Existe catalogo de aseguradoras normalizado por centro.
- Integracion capaz de consultar doctores compatibles por especialidad + seguro.

**Descripcion**

- Se propone mover la validacion de cobertura inmediatamente despues de especialidad (antes de fijar doctor), con excepcion configurable por centro.
- El bot presenta opciones de doctor ya filtradas por cobertura cuando aplique, reduciendo rechazos posteriores de "doctor no compatible".
- Si no hay disponibilidad con seguro, el bot ofrece alternativas priorizadas: otro doctor compatible, otra fecha/sede, o privado.
- El paso de "consulta privada" se convierte en decision explicita con confirmacion y precio orientativo cuando este disponible.

**Criterios de aceptacion**

- [ ] Para llamadas con seguro identificado, el sistema filtra candidatos de doctor por compatibilidad antes de proponer asignacion.
- [ ] Cuando no existan doctores compatibles, se ofrecen al menos 2 alternativas antes de derivar a agente.
- [ ] El usuario debe confirmar expresamente el cambio a modalidad privada antes de continuar al agendado.

**Diagramas / UX UI**

- Diagramas requeridos: Tabla de decisiones cobertura->doctor, flujo alternativo sin compatibilidad.
- Interfaces/pantallas implicadas: Configuracion de aseguradoras por doctor/especialidad, monitor de conversion por cobertura.
- Notas UX/UI: Transparencia de por que una opcion no aplica, mensajes sin tecnicismos de aseguradora.

### Historia 4: Optimizar propuesta de cita y cierre con trazabilidad end-to-end

**Como** equipo de operaciones del centro  
**Quiero** que la propuesta de cita, consentimiento WhatsApp y cierre queden trazados de extremo a extremo  
**Para** medir conversion real y detectar cuellos de botella por paso

**Precondiciones**

- Integracion con disponibilidad (TD Connect) activa.
- Envio de formulario/confirmacion por WhatsApp habilitado.

**Descripcion**

- En lugar de una unica propuesta de cita, el bot ofrece hasta 3 opciones priorizadas (primera disponible + 2 alternativas de franja cuando existan).
- Si el paciente rechaza la propuesta, el bot pregunta una sola restriccion adicional (fecha o franja) y reconsulta.
- Antes del envio de WhatsApp se valida consentimiento explicito y numero destino, registrando el estado (`aceptado`, `rechazado`, `no_contactable`).
- Se instrumentan eventos de embudo por paso para panel operativo: `inicio_llamada`, `especialidad_ok`, `doctor_ok`, `cobertura_ok`, `slot_ofrecido`, `slot_aceptado`, `handoff`, `fin`.

**Criterios de aceptacion**

- [ ] El motor puede ofrecer multiples slots ordenados por prioridad configurada.
- [ ] Cada rechazo de slot dispara un reintento controlado con nueva preferencia y limite maximo configurable.
- [ ] El consentimiento de WhatsApp queda persistido y auditable junto con timestamp y numero de destino.

**Diagramas / UX UI**

- Diagramas requeridos: Embudo de conversion, secuencia propuesta/rechazo/reconsulta, modelo de eventos.
- Interfaces/pantallas implicadas: Dashboard de funnel AI Phone, historial de llamada en backoffice.
- Notas UX/UI: Cierre breve y claro; confirmar accion enviada ("formulario enviado") solo cuando exista acuse tecnico.

## Requisitos no funcionales

- Rendimiento: p95 < 1200 ms en consultas de disponibilidad y compatibilidad; tiempo total de resolucion objetivo < 4 min en happy path.
- Seguridad y privacidad: enmascarar datos personales en logs, consentimiento explicito para WhatsApp, trazabilidad de accesos y cambios de reglas.
- Disponibilidad: fallback a agente si servicios externos superan timeout de 5 s en 2 intentos consecutivos.
- Observabilidad: eventos por cada transicion critica, metricas de abandono por paso, alertas por picos de no-entendido y fallos de integracion.
- Compatibilidad: comportamiento consistente para centros multi-sede y variantes de catalogo medico/aseguradoras por sede.

## Supuestos, dependencias y riesgos

- Supuestos:
  - El centro dispone de datos de seguros y servicios actualizados por doctor.
  - TD Connect expone disponibilidad suficientemente granular para reintentos.
- Dependencias:
  - Equipo de integraciones (TD Connect/agenda).
  - Equipo de Conversational AI (ASR/NLU, prompts, telemetria).
- Riesgos:
  - Datos de cobertura desactualizados pueden degradar la confianza del paciente.
  - Exceso de confirmaciones en voz puede alargar la llamada y reducir conversion.

## Fuera de alcance

- Rediseño completo del modelo de pricing medico.
- Sustitucion del proveedor de telefonia o ASR actual.

## Dudas abiertas

- ¿Se prioriza siempre validar cobertura antes de doctor o debe ser configurable por centro/especialidad?
- ¿Cual es el umbral oficial de confianza ASR/NLU para confirmar entidades?
- ¿Que KPI de exito manda para esta iteracion: conversion a cita, AHT, o tasa de handoff?
- ¿Se requiere consentimiento diferenciado para WhatsApp transaccional vs promocional?

## Checklist de validacion

- [ ] El alcance esta claramente delimitado.
- [ ] Cada historia tiene criterios de aceptacion verificables.
- [ ] Se cubren happy path y casos borde relevantes.
- [ ] Hay trazabilidad con epica y tickets.
- [ ] Requisitos no funcionales definidos y medibles.
