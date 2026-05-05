# Mejoras de analisis y flujo de trabajo AI Phone Centros

## Descripcion funcional

### Metadatos

- Fecha de creacion: 2026-05-05
- Responsable negocio: Pendiente
- Responsable funcional: AI Assistant
- PO: Pendiente
- Responsable UX: Pendiente
- Prioridad (Q): Alta
- Tipo: Mejora
- Trimestre objetivo: Q2

### Descripcion general de la funcionalidad

El flujo actual de `AI Phone Centros` se define como mejora sobre un proceso existente (AS-IS -> TO-BE). El analisis rapido del estado actual detecta tres fugas principales: abandono o desvio temprano al inicio de llamada, perdida en el momento de propuesta de cita por falta de informacion (especialmente precio), y baja finalizacion del formulario tras el envio por WhatsApp.

Baseline actual reportado:
- Redireccion a agente: 50% de llamadas.
- Envio de WhatsApp: 15% de llamadas.
- Citas creadas: 8% de llamadas.
- Cierre sin avance (hungup/cierre de llamada): 35% de llamadas.

Objetivo de negocio: simplificar la experiencia para aumentar conversion en embudo completo, eliminando bucles, errores y faltantes de informacion.

Objetivos objetivo a 8 semanas (todos los centros):
- WhatsApp enviado: 15% -> 30%.
- Cita creada: 8% -> 15%.
- Redireccion a agente: 50% -> menor que 35%.
- Hungups: reduccion minima del 30% relativo.

### Prototipo funcional

- URL prototipo/diseno: Diagrama base `AI_Phone_Centros_FULL_v2.drawio (1).pdf`
- Referencias adicionales:
  - `specs/TD-Ejemplo análisis funcional.md`
  - Pendiente: dashboards de conversion, abandono y transferencias

### Relacion con epica/iniciativa

- Epica: AI-PHONE-CENTROS-OPTIMIZACION-FLUJO
- Tickets relacionados: Pendiente

## Historias funcionales

### Historia 1: Entrada guiada sin bucles y reconduccion inteligente

**Como** paciente que llama al centro
**Quiero** poder resolver una duda breve sin perder el proceso de reserva
**Para** no frustrarme y seguir hasta la propuesta de cita

**Precondiciones**

- Existe motor ASR/NLU con confianza por intento.
- Existe catalogo de FAQs cortas permitidas (precio orientativo, seguros, ubicacion, telemedicina).

**Descripcion**

- Introducir capa de triage inicial con deteccion de intencion por confianza (`alta`, `media`, `baja`).
- Permitir un unico desvio fuera de flujo al inicio para responder una duda breve.
- Tras responder ese desvio, aplicar reconduccion obligatoria: "Si te parece, te ayudo a reservar ahora en menos de 2 minutos".
- Si aparece segundo desvio consecutivo o baja confianza en 2 intentos, ofrecer dos opciones explicitas: continuar reserva o hablar con agente.
- Mantener contexto de slots ya capturados para no repetir preguntas y evitar bucles.
- Definir maximo de repreguntas por bloque (2) para controlar duracion y frustracion.

**Criterios de aceptacion**

- [ ] El bot permite maximo 1 desvio fuera de flujo al inicio y luego reconduce sin reiniciar el flujo.
- [ ] Si hay 2 desvios consecutivos o 2 intentos de baja confianza, el bot ofrece continuar o agente sin bucle adicional.
- [ ] El bot no repite una pregunta ya contestada salvo rectificacion explicita del paciente.
- [ ] El payload de derivacion incluye resumen de contexto (intencion, especialidad, cobertura, ultimo punto de abandono).

**Diagramas / UX UI**

- Diagramas requeridos: Flujo de intencion con estados de confianza y fallback.
- Interfaces/pantallas implicadas: Consola de supervision de llamadas, vista de handoff.
- Notas UX/UI: Copys cortos, confirmaciones binarias y tono empatico al reintentar.

### Historia 2: Propuesta de cita clara con transparencia de precio

**Como** paciente en fase de eleccion de cita
**Quiero** recibir informacion suficiente antes de confirmar
**Para** reducir dudas, rechazos y desvio a agente

**Precondiciones**

- Integracion con disponibilidad de agenda por doctor y servicio.
- Matriz doctor-seguro-servicio actualizada.
- Precio disponible para modalidad privada y contexto de cobertura.

**Descripcion**

- Mantener estrategia de alternativas en cascada: misma opcion con otra fecha, otro doctor compatible, privado, agente.
- Antes de solicitar confirmacion de la cita, comunicar siempre informacion minima: doctor, modalidad, fecha/hora, cobertura aplicada y precio cuando corresponda.
- En casos de seguro, comunicar de forma explicita cuando existe copago, acto no cubierto o condicion economica relevante.
- Limitar propuestas por turno (maximo 2) para evitar friccion; al segundo rechazo, ofrecer agente.
- Evitar anunciar doctor autoasignado hasta confirmar viabilidad final.

**Criterios de aceptacion**

- [ ] El bot comunica siempre los datos minimos de la cita antes de pedir confirmacion final.
- [ ] Si aplica seguro, el bot informa cualquier condicion economica relevante antes de avanzar.
- [ ] Ante indisponibilidad, el bot ofrece al menos una alternativa automatica antes de derivar.
- [ ] Si el paciente rechaza 2 alternativas consecutivas, se ofrece derivacion asistida sin reinicio de flujo.

**Diagramas / UX UI**

- Diagramas requeridos: Arbol de decision de alternativas y reglas de prioridad.
- Interfaces/pantallas implicadas: Motor de reglas de asignacion, panel de configuracion por centro.
- Notas UX/UI: Mensajeria transparente de motivo ("sin disponibilidad", "incompatibilidad de seguro").

### Historia 3: Cierre con WhatsApp optimizado y mayor completion

**Como** paciente que acepta continuar por WhatsApp
**Quiero** recibir un mensaje claro, accionable y con recordatorio
**Para** completar el formulario y finalizar la reserva

**Precondiciones**

- Canal WhatsApp operativo para formulario/confirmacion.
- Sistema de mensajeria con soporte de reintento y recordatorio programado.
- Sistema de eventos centralizado (analytics + auditoria).

**Descripcion**

- Estandarizar consentimiento explicito para envio de WhatsApp y tratamiento de datos.
- Enviar WhatsApp con estructura unica: resumen de cita + enlace + CTA unico de finalizacion.
- Si no completa formulario, enviar recordatorio automatico a los 15 minutos.
- Si falla envio, ejecutar reintento tecnico y registrar resultado.
- Mantener "segunda oportunidad" antes del cierre de llamada para evitar hungup por duda final.
- Definir tablero operacional por centro con KPIs de embudo (llamada -> WhatsApp -> formulario completo -> cita creada).

**Criterios de aceptacion**

- [ ] Ningun formulario se envia sin consentimiento explicito registrado.
- [ ] El WhatsApp contiene resumen de cita, enlace y CTA unico en todos los centros.
- [ ] Si no hay completion en 15 minutos, se envia recordatorio automatico exactamente una vez.
- [ ] Toda llamada finaliza con estado tipificado (`cita_confirmada`, `derivada`, `abandono`, `sin_match`).

**Diagramas / UX UI**

- Diagramas requeridos: Secuencia de cierre y manejo de errores de notificacion.
- Interfaces/pantallas implicadas: Dashboard de operacion, vista de detalle de llamada.
- Notas UX/UI: Copy de consentimiento claro y legalmente entendible.

## Requisitos no funcionales

- Rendimiento: latencia p95 por turno <= 2.5 s y tiempo medio de llamada objetivo <= 4 min en reservas completadas.
- Seguridad y privacidad: consentimiento trazable para WhatsApp y minimizacion de datos en derivacion a agente.
- Disponibilidad: fallback controlado si agenda o mensajeria no responden en ventana configurada.
- Observabilidad: eventos obligatorios en cada etapa y dashboard unico para todos los centros.
- Compatibilidad: comportamiento funcional homogeno en todos los centros desde primer despliegue.

## Supuestos, dependencias y riesgos

- Supuestos:
  - No existen restricciones legales u operativas adicionales reportadas para esta fase.
  - La calidad ASR/NLU actual permite aplicar reconduccion con maximo 2 repreguntas.
- Dependencias:
  - TD Connect (agenda/disponibilidad por doctor).
  - Plataforma de WhatsApp con soporte de recordatorio a los 15 minutos.
- Riesgos:
  - Si falta precio/cobertura en tiempo real, puede mantenerse abandono en la fase de propuesta.
  - Si el copy de WhatsApp no es suficientemente claro, la completion puede no mejorar pese al recordatorio.

## Fuera de alcance

- Rediseño completo del motor NLU.
- Cobro o pago dentro de la llamada.
- Reagendado/cancelacion post-reserva.

## Dudas abiertas

- Confirmar fuente unica de verdad para medir hungup en todos los centros.
- Confirmar contenido exacto del resumen de cita en WhatsApp por especialidad.

## Checklist de validacion

- [ ] El alcance esta claramente delimitado.
- [ ] Cada historia tiene criterios de aceptacion verificables.
- [ ] Se cubren happy path y casos borde relevantes.
- [ ] Hay trazabilidad con epica y tickets.
- [ ] Requisitos no funcionales definidos y medibles.
