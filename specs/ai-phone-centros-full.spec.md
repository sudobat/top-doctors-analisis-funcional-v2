# AI Phone Centros FULL

## Descripcion funcional

### Metadatos

- Fecha de creacion: 2026-05-05
- Responsable negocio:
- Responsable funcional:
- PO:
- Responsable UX:
- Prioridad (Q): Alta
- Tipo: Nueva funcionalidad
- Trimestre objetivo: Q2

### Descripcion general de la funcionalidad

AI Phone para Centros FULL permite gestionar llamadas entrantes a un DDI unico por sede para que un bot conversacional guie al paciente hasta la solicitud de cita. El objetivo es cerrar la reserva de forma autonoma, identificando especialidad y doctor de forma dinamica, validando cobertura (seguro o privado), proponiendo disponibilidad via TD Connect y finalizando con envio de formulario por WhatsApp. El alcance excluye modificacion/cancelacion de citas y telemedicina con agenda propia.

### Prototipo funcional

- URL prototipo/diseno:
- Referencias adicionales:
  - Enlace al diagrama de flujo AI Phone centros.drawio LIGHT
  - FULL AI_PHONE_FULL.drawio

### Relacion con epica/iniciativa

- Epica: AI_phone_centro
- Tickets relacionados:

## Historias funcionales

### Historia 1: Deteccion de intencion y derivacion inicial

**Como** paciente  
**Quiero** que el bot entienda si deseo agendar cita o hablar con una persona  
**Para** ser atendido rapidamente segun mi necesidad

**Precondiciones**

- La llamada entra por un DDI de sede valido.
- El sistema identifica la sede a partir del DDI.

**Descripcion**

- El bot inicia con: "Le informamos que ha contactado con [Centro]. ¿Desea agendar una cita?"
- Si la intencion es agendar, el flujo continua al bloque de recogida de informacion.
- Si el paciente pide hablar con una persona, se deriva directamente a la clinica.
- Si la intencion no se reconoce, se deriva a agente humano.

**Criterios de aceptacion**

- [ ] Dada una llamada entrante por DDI valido, cuando inicia la conversacion, entonces el bot reproduce el saludo de bienvenida con el nombre del centro.
- [ ] Dada una respuesta de intencion "agendar cita", cuando el bot la detecta, entonces avanza al Paso 1 (Especialidad).
- [ ] Dada una respuesta de "hablar con una persona", cuando el bot la detecta, entonces deriva la llamada a agente humano.
- [ ] Dada una intencion no reconocida en un paso, cuando se acumulan 2 fallos consecutivos de comprension en ese mismo paso, entonces el bot deriva a agente humano.
- [ ] Dada una intencion no reconocida en un paso, cuando se acumulan 2 fallos consecutivos de comprension en ese mismo paso, entonces el bot informa "No ofrecemos el servicio, le transfiero a un agente" y deriva a agente humano.

**Diagramas / UX UI**

- Diagramas requeridos: Flujo conversacional principal, flujo de derivacion a humano.
- Interfaces/pantallas implicadas: No aplica (canal voz + integraciones backend).
- Notas UX/UI: Confirmar tono consistente en mensajes informativos y transiciones.

### Historia 2: Recogida de datos clinicos y administrativos para elegibilidad de cita

**Como** paciente  
**Quiero** informar especialidad, doctor, cobertura, canal y servicio  
**Para** que el sistema determine correctamente la opcion de cita que corresponde

**Precondiciones**

- La intencion de agendar cita ya fue confirmada.
- El centro, doctores, servicios, coberturas y canales estan cargados en catalogo.

**Descripcion**

- Paso 1 Especialidad (condicional): se pregunta salvo que exista una sola especialidad.
- Paso 2 Doctor: se pregunta siempre si conoce nombre; si no coincide se ofrecen continuar con otro especialista o derivacion.
- Si paciente no conoce doctor, se asigna automaticamente doctor con menor carga de agenda para la especialidad.
- Paso 3 Cobertura: se pregunta siempre (seguro o privado), incluso en centros solo privados.
- Paso 3b Compania (condicional): se pide solo si responde "seguro" generico.
- Si seguro no compatible con doctor asignado, se ofrece continuar como privado o derivar a agente.
- Paso 4 Canal (condicional): presencial o telemedicina; si telemedicina, se envia URL por WhatsApp y finaliza llamada.
- Paso 5 Servicio (condicional): se muestra lista filtrada por cobertura; si solo hay uno, se omite pregunta.
- Paso 6 Precio (condicional): solo en privado; requiere confirmacion para continuar.

**Criterios de aceptacion**

- [ ] Dado un centro con una sola especialidad, cuando inicia el Paso 1, entonces el bot omite la pregunta y continua con especialidad preseleccionada.
- [ ] Dado que el paciente informa un doctor no disponible, cuando el bot lo valida, entonces informa no disponibilidad y ofrece continuar con otro especialista o derivar a agente.
- [ ] Dado que el paciente responde "seguro" sin compania, cuando el bot detecta ambiguedad, entonces activa Paso 3b y solicita compania.
- [ ] Dado seguro no compatible, cuando el paciente rechaza continuar como privado, entonces el bot ofrece derivacion a atencion al paciente y ejecuta traspaso si acepta.
- [ ] Dado canal telemedicina seleccionado, cuando se confirma canal, entonces el bot envia URL del perfil por WhatsApp y finaliza llamada sin agenda.
- [ ] Dado contexto de consulta privada, cuando se llega a precio, entonces el bot informa importe del servicio y solicita confirmacion explicita para continuar.

**Diagramas / UX UI**

- Diagramas requeridos: Flujo detallado por pasos 1-6, diagrama de decisiones de cobertura.
- Interfaces/pantallas implicadas: No aplica (canal voz + WhatsApp).
- Notas UX/UI: Mantener prompts claros para minimizar ambiguedad en respuestas de voz.

### Historia 3: Disponibilidad, confirmacion de cita y cierre conversacional

**Como** paciente  
**Quiero** recibir una propuesta de fecha y hora y finalizar la solicitud  
**Para** dejar mi cita tramitada en una sola llamada

**Precondiciones**

- Doctor y servicio ya estan definidos.
- La cobertura y condicion de precio (si aplica) ya quedaron resueltas.

**Descripcion**

- Paso 7 Preferencia horaria: el bot solicita preferencia (manana, tarde, fecha concreta).
- El bot consulta TD Connect con doctor ID y rango de preferencia.
- Si no hay hueco en la preferencia, ofrece primera fecha disponible general.
- El bot propone la primera cita disponible y solicita confirmacion.
- Si acepta, recoge datos del paciente para completar solicitud.
- Solicita permiso explicito para envio de formulario por WhatsApp al numero indicado.
- Si acepta permiso, envia formulario, confirma envio y pregunta si necesita algo mas.
- Si necesita algo mas, reinicia en Paso 1; si no, cierra llamada.

**Criterios de aceptacion**

- [ ] Dada una preferencia horaria valida, cuando se consulta disponibilidad, entonces el bot propone el primer slot disponible dentro del rango.
- [ ] Dada ausencia de slots en la preferencia solicitada, cuando no hay resultados, entonces el bot propone la primera fecha disponible general.
- [ ] Dada una propuesta de cita, cuando el paciente no acepta y pide otra fecha, entonces el bot solicita nueva preferencia y relanza consulta de disponibilidad.
- [ ] Dada aceptacion de cita, cuando finaliza recogida de datos, entonces el bot solicita consentimiento explicito para envio de formulario por WhatsApp.
- [ ] Dado consentimiento afirmativo, cuando se envia formulario, entonces el bot confirma envio y pregunta si puede ayudar en algo mas.
- [ ] Dado que el paciente indica que no necesita mas ayuda, cuando responde al cierre, entonces la llamada termina.
- [ ] Dada una cita aceptada, cuando el bot recoge datos del paciente, entonces solicita y registra nombre, apellido, fecha de nacimiento, sexo y consentimiento para envio de SMS/WhatsApp.

**Diagramas / UX UI**

- Diagramas requeridos: Flujo de disponibilidad y reintento de propuesta, flujo de cierre con bucle a inicio.
- Interfaces/pantallas implicadas: No aplica (canal voz + TD Connect + WhatsApp).
- Notas UX/UI: Confirmar mensajes de consentimiento y cierre con lenguaje legal/comercial validado.

## Requisitos no funcionales

- Rendimiento: La consulta de disponibilidad en TD Connect debe responder en <= 1 segundo.
- Seguridad y privacidad: Debe existir trazabilidad de datos recogidos del paciente y consentimiento explicito para envio por WhatsApp.
- Disponibilidad: Ante fallo de reconocimiento de intencion o bloqueo de flujo, el sistema debe permitir derivacion a agente humano.
- Observabilidad: Registrar eventos por cada paso (entrada, decision, salida, derivacion, error tecnico).
- Compatibilidad: Integracion operativa con DDI por sede, TD Connect y canal WhatsApp.

## Supuestos, dependencias y riesgos

- Supuestos:
  - Cada sede dispone de DDI propio y mapeo correcto sede-DDI.
  - Catalogos de especialidades, doctores, servicios, precios y coberturas estan disponibles y vigentes.
- Dependencias:
  - TD Connect para consulta de disponibilidad.
  - Servicio de mensajeria WhatsApp para envio de formulario y enlaces.
- Riesgos:
  - Inconsistencias de catalogo (doctor/servicio/cobertura/precio) pueden bloquear o degradar el flujo.
  - Errores de reconocimiento de voz pueden aumentar derivaciones a agente humano.

## Fuera de alcance

- Modificar citas existentes.
- Cancelar citas existentes.
- Telemedicina con flujo de agenda propio.

## Dudas abiertas

- Sin dudas abiertas al momento de esta version.

## Checklist de validacion

- [ ] El alcance esta claramente delimitado.
- [ ] Cada historia tiene criterios de aceptacion verificables.
- [ ] Se cubren happy path y casos borde relevantes.
- [ ] Hay trazabilidad con epica y tickets.
- [ ] Requisitos no funcionales definidos y medibles.
