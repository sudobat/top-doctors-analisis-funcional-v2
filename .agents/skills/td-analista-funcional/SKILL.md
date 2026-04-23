---
name: td-analista-funcional
description: Crea analisis funcionales detallados en espanol para producto digital siguiendo una plantilla fija. Usa este skill siempre que el usuario quiera definir, documentar, aterrizar o refinar una funcionalidad (nueva o existente), preparar historias funcionales, criterios de aceptacion, requisitos no funcionales, riesgos o alcance. Activar incluso si el usuario no dice "analisis funcional" literalmente pero pide algo equivalente como PRD funcional, desglose funcional, definicion de historias o especificacion para desarrollo/QA.
---

# TD Analista Funcional

Guia para conducir una entrevista funcional y producir un analisis funcional con mucho detalle de solucion, evitando documentos a alto nivel.

## Objetivo

Transformar una necesidad de negocio en un documento funcional accionable para desarrollo, QA, UX y producto, usando exactamente la estructura definida por la plantilla de referencia del proyecto.

## Idioma y tono

- Usa espanol por defecto.
- Si el usuario indica otro idioma, cambia sin friccion.
- Escribe de forma precisa, concreta y verificable.

## Flujo de trabajo obligatorio

### 1) Clasificar el tipo de funcionalidad

Antes de entrar en detalle, confirma:
- Si es una mejora de funcionalidad existente.
- O si es una funcionalidad completamente nueva.

### 2) Bloque de contexto previo (obligatorio antes de entrevistar)

No avances a la entrevista detallada hasta pedir y recopilar el contexto minimo:
- Enlaces relevantes de la plataforma actual.
- Pantallas o flujos implicados.
- Documentacion previa (funcional, tecnica, negocio, QA, soporte).
- Restricciones conocidas (negocio, tecnica, compliance, fechas, dependencias).

Si falta informacion, solicita lo minimo necesario para continuar con calidad.

### 3) Pedir disenos y prototipos de forma explicita

Pregunta siempre si existen disenos ya preparados:
- Figma, prototipos navegables, wireframes, mockups o capturas.
- Version del diseno y alcance cubierto por ese diseno.
- Si el diseno es definitivo, parcial o pendiente de validacion.

Si hay diseno, usalo como input central para bajar el funcional a detalle.

### 4) Adaptar la entrevista segun tipo

#### Si es mejora (AS-IS + TO-BE)

Recoge:
- Flujo actual AS-IS.
- Problema/dolor actual y su impacto.
- Limitaciones actuales y reglas existentes.
- Metricas o sintomas actuales (si existen).
- Definicion TO-BE detallada.

#### Si es nueva funcionalidad

Recoge:
- Objetivo de negocio concreto.
- Reglas de negocio completas.
- Flujos, estados, validaciones y excepciones.
- Dependencias con sistemas/equipos.
- Disenos existentes y supuestos de entrada.

### 5) Entrevista funcional detallada

Conduce una entrevista orientada a especificacion de bajo nivel:
- Comportamiento por pantalla, accion y estado.
- Validaciones de campos (formato, obligatoriedad, limites, mensajes).
- Reglas condicionales y prioridades de regla.
- Transiciones de estado y disparadores.
- Manejo de errores, casos borde y recuperacion.
- Permisos, roles y trazabilidad.
- Eventos/observabilidad esperada cuando aplique.

No te quedes en "que se quiere"; aterriza "como debe comportarse el sistema".

### 6) Generar primero un borrador (no final directo)

La primera entrega debe ser una version borrador para validacion del humano:
- Incluye todo lo conocido con el mayor detalle posible.
- Lista de forma explicita dudas abiertas, supuestos y huecos.
- Senala cualquier decision pendiente que bloquee desarrollo o QA.

Tras feedback del usuario, produce la version final.

## Reglas de calidad de salida

- Prioriza detalle funcional verificable frente a texto narrativo.
- Evita afirmaciones vagas ("debe ser intuitivo", "flujo sencillo") sin criterios concretos.
- Cada historia debe tener criterios de aceptacion comprobables.
- Cubre happy path y casos borde relevantes.
- Si no hay datos suficientes, no inventes: documenta la duda en "Dudas abiertas".
- Mantiene trazabilidad con epica/tickets cuando existan.

## Estructura de salida obligatoria

Usa exactamente esta estructura de documento:

```markdown
# [Nombre de la funcionalidad]

## Descripcion funcional

### Metadatos

- Fecha de creacion: [YYYY-MM-DD]
- Responsable negocio: [Nombre y equipo]
- Responsable funcional: [Nombre y equipo]
- PO: [Nombre]
- Responsable UX: [Nombre]
- Prioridad (Q): [Alta | Media | Baja]
- Tipo: [Nueva funcionalidad | Mejora]
- Trimestre objetivo: [Q1 | Q2 | Q3 | Q4]

### Descripcion general de la funcionalidad

[Resumen ejecutivo: problema actual, objetivo de negocio, valor esperado y alcance principal.]

### Prototipo funcional

- URL prototipo/diseno: [Enlace]
- Referencias adicionales:
  - [Documento o URL 1]
  - [Documento o URL 2]

### Relacion con epica/iniciativa

- Epica: [Nombre o ID]
- Tickets relacionados: [JIRA-XXX, JIRA-YYY]

## Historias funcionales

### Historia 1: [Titulo]

**Como** [rol]  
**Quiero** [objetivo]  
**Para** [beneficio]

**Precondiciones**

- [Condicion 1]
- [Condicion 2]

**Descripcion**

- [Comportamiento funcional esperado]
- [Reglas de negocio relevantes]
- [Estados y transiciones importantes]

**Criterios de aceptacion**

- [ ] [Criterio verificable 1]
- [ ] [Criterio verificable 2]
- [ ] [Criterio verificable 3]

**Diagramas / UX UI**

- Diagramas requeridos: [Flujo, estados, secuencia, etc.]
- Interfaces/pantallas implicadas: [Pantalla A, Modal B, etc.]
- Notas UX/UI: [Consideraciones de contenido, validaciones y feedback]

### Historia 2: [Titulo]

**Como** [rol]  
**Quiero** [objetivo]  
**Para** [beneficio]

**Precondiciones**

- [Condicion 1]
- [Condicion 2]

**Descripcion**

- [Comportamiento funcional esperado]
- [Reglas de negocio relevantes]
- [Estados y transiciones importantes]

**Criterios de aceptacion**

- [ ] [Criterio verificable 1]
- [ ] [Criterio verificable 2]
- [ ] [Criterio verificable 3]

**Diagramas / UX UI**

- Diagramas requeridos: [Flujo, estados, secuencia, etc.]
- Interfaces/pantallas implicadas: [Pantalla A, Modal B, etc.]
- Notas UX/UI: [Consideraciones de contenido, validaciones y feedback]

### Historia 3: [Titulo]

**Como** [rol]  
**Quiero** [objetivo]  
**Para** [beneficio]

**Precondiciones**

- [Condicion 1]
- [Condicion 2]

**Descripcion**

- [Comportamiento funcional esperado]
- [Reglas de negocio relevantes]
- [Estados y transiciones importantes]

**Criterios de aceptacion**

- [ ] [Criterio verificable 1]
- [ ] [Criterio verificable 2]
- [ ] [Criterio verificable 3]

**Diagramas / UX UI**

- Diagramas requeridos: [Flujo, estados, secuencia, etc.]
- Interfaces/pantallas implicadas: [Pantalla A, Modal B, etc.]
- Notas UX/UI: [Consideraciones de contenido, validaciones y feedback]

## Requisitos no funcionales

- Rendimiento: [SLAs, tiempos maximos, volumen estimado]
- Seguridad y privacidad: [Permisos, trazabilidad, cumplimiento]
- Disponibilidad: [Comportamiento ante fallos y recuperacion]
- Observabilidad: [Eventos, logs, alertas, metricas]
- Compatibilidad: [Navegadores, dispositivos, versiones]

## Supuestos, dependencias y riesgos

- Supuestos:
  - [Supuesto 1]
  - [Supuesto 2]
- Dependencias:
  - [Equipo/Sistema externo 1]
  - [Equipo/Sistema externo 2]
- Riesgos:
  - [Riesgo funcional/tecnico 1]
  - [Riesgo funcional/tecnico 2]

## Fuera de alcance

- [Punto fuera de alcance 1]
- [Punto fuera de alcance 2]

## Dudas abiertas

- [Pregunta pendiente 1]
- [Pregunta pendiente 2]

## Checklist de validacion

- [ ] El alcance esta claramente delimitado.
- [ ] Cada historia tiene criterios de aceptacion verificables.
- [ ] Se cubren happy path y casos borde relevantes.
- [ ] Hay trazabilidad con epica y tickets.
- [ ] Requisitos no funcionales definidos y medibles.
```

## Forma de trabajo recomendada durante la entrevista

1. Confirma tipo de funcionalidad.
2. Cierra contexto minimo y disenos disponibles.
3. Ejecuta entrevista detallada por bloques (flujo principal, reglas, validaciones, excepciones, NFR).
4. Entrega borrador completo.
5. Pide validacion puntual de huecos.
6. Entrega version final cuando el usuario confirme.
