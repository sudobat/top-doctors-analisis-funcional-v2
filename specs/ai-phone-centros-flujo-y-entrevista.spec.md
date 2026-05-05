# AI Phone Centros - Flujo y entrevista funcional consolidada

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

Este documento consolida, en una unica pieza, todo lo definido en la entrevista funcional: objetivos de negocio, respuestas clave del stakeholder, reglas operativas del flujo AI Phone y especificacion del flujo conversacional y tecnico.

El objetivo es tener una referencia clara para producto, operaciones, QA y desarrollo sin ambiguedades.

### Prototipo funcional

- URL prototipo/diseno: `ficheros_adjuntos/ai_pphone/AI_Phone_Centros_FULL_v2.drawio (1).pdf`
- Referencias adicionales:
  - `specs/mejoras-ai-phone-centros.spec.md`
  - `specs/mejoras-ai-phone-centros-full.spec.md`

### Relacion con epica/iniciativa

- Epica: AI-PHONE-CENTROS-OPTIMIZACION-FLUJO
- Tickets relacionados: Pendiente

## Resumen de entrevista (preguntas y decisiones)

### Contexto y tipo

- Decision: se trata como **mejora** de flujo existente (AS-IS -> TO-BE).

### Objetivo de negocio

- Aumentar envios de WhatsApp.
- Aumentar creacion de citas.
- Reducir redirecciones a agente.
- Reducir hungups/cierres tempranos.

### Baseline actual reportado

- Redireccion a agente: 50%.
- WhatsApp enviado: 15%.
- Cita creada: 8%.
- Resto cierra llamada: 35%.

### Bloqueos principales detectados

- Inicio de llamada: pacientes se frustran cuando preguntan fuera de flujo.
- Propuesta de cita: abandono por falta de informacion suficiente (ej. precio).
- Post-WhatsApp: aproximadamente la mitad no completa formulario.

### Decisiones cerradas en entrevista

- Regla anti-desvio: permitir 1 desvio fuera de flujo al inicio.
- Reconduccion obligatoria tras ese desvio.
- Segundo desvio consecutivo: ofrecer elegir entre continuar reserva o agente.
- Transparencia economica: informar precio/condiciones antes de confirmacion.
- Optimizar WhatsApp: resumen + enlace + CTA unico.
- Recordatorio: 1 recordatorio automatico a los 15 minutos sin completion.
- Alcance de despliegue: todos los centros desde inicio.
- Restricciones no negociables: no reportadas en esta fase.

### Objetivos TO-BE acordados (8 semanas)

- WhatsApp enviado: 15% -> 30%.
- Cita creada: 8% -> 15%.
- Redireccion a agente: 50% -> menor que 35%.
- Hungups: reduccion minima del 30% relativo.

## Flujo conversacional por escrito (version clara)

### 1) Bienvenida

- Bot identifica centro por DDI.
- Mensaje: saluda y propone iniciar reserva.

### 2) Gestion de desvio inicial (anti-frustracion)

- Se permite maximo 1 pregunta fuera de flujo (seguro, ubicacion, precio orientativo).
- Se responde de forma breve.
- Se reconduce con frase fija de continuidad.
- Si hay segundo desvio o no entendimiento repetido, se ofrece: seguir reserva o agente.

### 3) Especialidad

- Si el centro solo tiene una especialidad, se omite pregunta.
- Si no existe especialidad solicitada, se ofrece agente.

### 4) Doctor

- Si paciente indica doctor disponible, se mantiene.
- Si no disponible, se ofrecen alternativas (misma opcion otro horario / otro doctor compatible).
- Si no sabe doctor, autoasignacion controlada.

### 5) Cobertura (seguro o privado)

- Confirmar modalidad: seguro vs privado.
- Si seguro, validar compania y compatibilidad.
- Si no compatible, ofrecer alternativas antes de derivar.

### 6) Canal

- Preguntar presencial o telemedicina cuando aplique.
- Si no hay telemedicina, omitir pregunta.

### 7) Servicio

- Si hay un solo servicio, omitir.
- Si hay varios, guiar seleccion.

### 8) Propuesta de cita con informacion completa

Antes de pedir confirmacion final, comunicar siempre:

- Doctor.
- Fecha y hora.
- Modalidad.
- Cobertura aplicada.
- Precio o condicion economica relevante.

Maximo 2 propuestas. Si no encaja, ofrecer agente.

### 9) Datos del paciente

- Capturar datos minimos para continuar.

### 10) Consentimiento WhatsApp

- Solicitar autorizacion explicita para enviar formulario.

### 11) Envio WhatsApp optimizado

- Enviar mensaje con resumen de cita + enlace + CTA unico.
- Si no completa en 15 minutos, enviar 1 recordatorio automatico.

### 12) Cierre

- Preguntar si necesita algo mas.
- Si si, volver al inicio controlado.
- Si no, fin de llamada.

### 13) Trazabilidad

- Toda llamada termina tipificada:
  - `cita_confirmada`
  - `derivada`
  - `abandono`
  - `sin_match`

## Flujo tecnico en nodos y condiciones (implementable)

### Nodos

- `N0_START`: entrada llamada + identificacion de centro por DDI.
- `N1_WELCOME`: saludo inicial.
- `N2_INTENT_GATE`: deteccion intencion y control de desvio.
- `N2A_OFFFLOW_REPLY`: respuesta breve fuera de flujo + reconduccion.
- `N2B_CHOOSE_CONTINUE_OR_AGENT`: decision seguir o agente.
- `N3_SPECIALTY`: captura/validacion especialidad.
- `N4_DOCTOR`: captura doctor o autoasignacion.
- `N4A_ALTERNATIVES`: alternativas cuando no hay match directo.
- `N5_COVERAGE`: seguro/privado y validaciones.
- `N6_CHANNEL`: presencial/telemedicina.
- `N7_SERVICE`: seleccion servicio.
- `N8_SLOT_PREFERENCE`: preferencia horaria y busqueda de slot.
- `N9_APPOINTMENT_SUMMARY`: resumen completo antes de confirmar.
- `N10_PATIENT_DATA`: captura de datos minimos.
- `N11_WHATSAPP_CONSENT`: consentimiento explicito.
- `N12_SEND_WHATSAPP`: envio y control de errores.
- `N13_CLOSING`: cierre y segunda oportunidad.
- `N14_WHATSAPP_REMINDER`: recordatorio asincrono a 15 min.
- `N99_HANDOFF_AGENT`: transferencia con resumen.
- `N100_END_NO_BOOKING`: fin sin reserva.
- `N101_END_OK`: fin exitoso o WhatsApp enviado pendiente.

### Reglas criticas de transicion

- `N2_INTENT_GATE`:
  - Si intencion clara -> `N3_SPECIALTY`.
  - Si desvio y `offflow_count=0` -> `N2A_OFFFLOW_REPLY`.
  - Si desvio y `offflow_count>=1` -> `N2B_CHOOSE_CONTINUE_OR_AGENT`.
  - Si baja comprension repetida -> `N2B_CHOOSE_CONTINUE_OR_AGENT`.
- Propuestas de cita/alternativas con `proposal_count` maximo 2.
- Tras 2 rechazos consecutivos, ofrecer agente.
- Sin consentimiento WhatsApp, no se envia formulario.

### Variables minimas

- `offflow_count`
- `fallback_count`
- `proposal_count`
- `intent_confidence`
- `specialty`
- `doctor_id`
- `coverage_type`
- `insurance_name`
- `service_id`
- `channel`
- `slot_selected`
- `price_info`
- `whatsapp_consent`
- `whatsapp_sent`
- `form_completed`
- `end_status`

## Historias funcionales

### Historia 1: Entrada guiada sin bucles

**Como** paciente
**Quiero** resolver una duda breve sin perder la reserva
**Para** no frustrarme ni abandonar

**Precondiciones**

- Catalogo de FAQs breves definido.
- NLU con confianza por intento.

**Descripcion**

- Permitir maximo un desvio al inicio.
- Reconduccion obligatoria tras respuesta breve.
- Segundo desvio o baja comprension repetida: opcion seguir o agente.
- Evitar repeticion de preguntas ya respondidas.

**Criterios de aceptacion**

- [ ] Maximo 1 desvio fuera de flujo antes de reconducir.
- [ ] En segundo desvio, ofrecer elegir entre continuar o agente.
- [ ] No se repite una pregunta ya respondida salvo rectificacion.

**Diagramas / UX UI**

- Diagramas requeridos: flujo de intencion y fallback.
- Interfaces/pantallas implicadas: vista de conversacion y handoff.
- Notas UX/UI: mensajes cortos y claros.

### Historia 2: Confirmacion de cita con informacion completa

**Como** paciente
**Quiero** ver condiciones de la cita antes de confirmar
**Para** tomar decision informada y evitar abandono

**Precondiciones**

- Disponibilidad de agenda actualizada.
- Cobertura y precio accesibles en flujo.

**Descripcion**

- Comunicar antes de confirmar: doctor, fecha/hora, modalidad, cobertura y precio/condicion economica.
- Mantener maximo 2 propuestas de cita.
- Tras segundo rechazo, ofrecer agente.

**Criterios de aceptacion**

- [ ] Siempre se informa paquete minimo de datos antes de confirmar.
- [ ] Si aplica condicion economica, se informa antes de avanzar.
- [ ] No se superan 2 propuestas sin ofrecer agente.

**Diagramas / UX UI**

- Diagramas requeridos: decision de propuesta/alternativas.
- Interfaces/pantallas implicadas: modulo de propuesta de slot.
- Notas UX/UI: transparencia y claridad economica.

### Historia 3: WhatsApp con mayor completion

**Como** paciente
**Quiero** recibir un mensaje claro y accionable
**Para** completar formulario y cerrar la reserva

**Precondiciones**

- Integracion WhatsApp activa.
- Scheduler para recordatorio a 15 minutos.

**Descripcion**

- Solicitar consentimiento explicito.
- Enviar WhatsApp con resumen + enlace + CTA unico.
- Lanzar 1 recordatorio si no hay completion a 15 minutos.

**Criterios de aceptacion**

- [ ] No se envia formulario sin consentimiento explicito.
- [ ] Todos los mensajes siguen la misma plantilla (resumen + link + CTA).
- [ ] Se envia 1 recordatorio a 15 minutos si no completa.

**Diagramas / UX UI**

- Diagramas requeridos: secuencia de envio y recordatorio.
- Interfaces/pantallas implicadas: modulo de mensajeria y tracking.
- Notas UX/UI: texto directo y accion unica.

## Requisitos no funcionales

- Rendimiento: p95 de respuesta por turno <= 2.5 s.
- Operacion: tiempo medio de llamada objetivo <= 4 min en reservas completadas.
- Seguridad y privacidad: consentimiento trazable y minimizacion de datos en handoff.
- Disponibilidad: fallback controlado ante fallo de agenda o mensajeria.
- Observabilidad: eventos en todo el embudo y dashboard unico multi-centro.

## Supuestos, dependencias y riesgos

- Supuestos:
  - Sin restricciones no negociables adicionales en esta fase.
  - Datos de agenda/cobertura suficientemente actualizados.
- Dependencias:
  - TD Connect (agenda y disponibilidad).
  - Plataforma WhatsApp con recordatorio programable.
- Riesgos:
  - Falta de datos de precio/cobertura en tiempo real.
  - Copy de WhatsApp no suficientemente claro para subir completion.

## Fuera de alcance

- Rediseño completo de motor NLU.
- Cobro dentro de llamada.
- Reagendado/cancelacion post-reserva.

## Dudas abiertas

- Fuente unica oficial para medir `hungup` en todos los centros.
- Plantilla final de WhatsApp por especialidad.

## Checklist de validacion

- [ ] Alcance delimitado y comprensible.
- [ ] Reglas anti-bucle definidas y verificables.
- [ ] Criterios de aceptacion comprobables por QA.
- [ ] Trazabilidad de embudo y estados de cierre definida.
- [ ] Objetivos a 8 semanas documentados.
