---
name: td-quality-assurance
description: Disena y ejecuta aseguramiento de calidad E2E basado en specs para validar criterios de aceptacion con Playwright. Usa este skill siempre que el usuario pida crear, ampliar o mantener tests end to end a partir de un spec o historias funcionales, especialmente cuando quiera trazabilidad criterio->test, cobertura de happy path/casos borde y un flujo de validacion humana antes de escribir codigo.
---

# TD Quality Assurance

Guia para convertir un spec funcional en una suite de pruebas E2E con Playwright, con control de calidad en dos fases y aprobacion humana obligatoria antes de implementar codigo.

## Objetivo

Garantizar que los criterios de aceptacion de un spec quedan cubiertos por tests E2E ejecutables, legibles y mantenibles, siguiendo un flujo bloqueante:

1. Redactar plan/casos de prueba.
2. Pedir validacion explicita del usuario.
3. Solo despues de aprobar, escribir codigo Playwright.

## Alcance

Este skill cubre:
- Analisis de specs funcionales y criterios de aceptacion.
- Diseno de casos de prueba E2E trazables.
- Implementacion de tests Playwright tras aprobacion.
- Validaciones de robustez basica (selectores, esperas, aserciones claras).

Este skill no cubre automaticamente:
- Cambios de producto fuera del alcance del spec.
- Refactors masivos no necesarios para el objetivo de QA.
- Automatizaciones de frameworks distintos de Playwright.

## Reglas obligatorias

1. **Siempre dos fases bloqueantes.**
   - Fase 1: disenar casos de prueba (sin codigo).
   - Fase 2: escribir tests Playwright (solo con aprobacion explicita).

2. **Nunca generar codigo de tests en la fase 1.**
   - En esta fase solo se entrega documentacion de pruebas.

3. **Pedir confirmacion explicita siempre.**
   - Incluso si el usuario dice "hazlo todo".
   - No avanzar a implementacion sin un "aprobado/confirmado" claro.

4. **Trazabilidad criterio -> caso de prueba.**
   - Cada criterio de aceptacion debe mapearse a uno o mas casos.
   - Si un criterio no es automatizable, justificarlo y proponer alternativa.

5. **No inventar comportamiento no definido.**
   - Si faltan datos del spec, preguntar de forma concreta.
   - Hacer una pregunta por mensaje cuando se este en discovery con stakeholder.

6. **Persistir casos de prueba junto al spec (Fase 1).**
   - Tras redactar el diseno de QA, **guardarlo siempre en un fichero** `{nombre-spec}.qa.md`.
   - El fichero debe vivir **en el mismo directorio** que el spec de origen (misma carpeta, mismo “stem” que el `.spec.md`).
   - Regla de correspondencia: si el spec es `ruta/ejemplo.spec.md`, el documento de casos de prueba es `ruta/ejemplo.qa.md`.
   - Objetivo: que el usuario pueda **abrir y revisar el `.qa.md`** (diff, comentarios, aprobacion) antes de autorizar la Fase 2.
   - Si el spec de entrada no sigue el patron `.spec.md`, igualmente coloca `{mismo-nombre-base}.qa.md` al lado del fichero fuente (ej. `foo.md` -> `foo.qa.md`).

7. **Failure-first en E2E (obligatorio en Fase 2 salvo justificacion explicita en el `.qa.md`).**
   - Los tests deben **fallar en rojo** contra el baseline **sin** la funcionalidad objetivo (o sin el contrato acordado), y pasar a **verde** cuando la implementacion cumpla el spec y el contrato.
   - **Prohibido** como senal principal de exito: aserciones que pueden cumplirse en pantallas ajenas al alcance (p. ej. solo comprobar ausencias triviales en todo el DOM, sin anclar al shell de la feature).
   - **Contrato explicito**: definir en el `.qa.md` invariantes observables que fallen si faltan — idealmente `data-testid` / landmarks minimos acordados con front — y documentar la tabla en la seccion de propuesta tecnica.
   - **Evitar `test.skip` por "no encuentro el campo"** cuando ese campo forma parte del contrato de la epica: en ese caso debe **fallar** hasta que exista el elemento o hasta que se renegocie el contrato en el `.qa.md`.
   - Tras implementar tests nuevos, indicar en entrega que la primera corrida esperada sobre baseline legacy es **fallida**, y que el verde corresponde al branch/entorno con feature + contrato.

## Flujo de trabajo

### Fase 0: Preparacion y entendimiento

1. Leer el spec objetivo y detectar:
   - alcance funcional,
   - criterios de aceptacion,
   - dependencias y precondiciones,
   - huecos o ambiguedades.
2. Si hay ambiguedades criticas, preguntar de una en una antes de disenar pruebas.

### Fase 1: Diseno de estrategia y casos de prueba (sin codigo)

Construir y presentar un paquete de QA con esta estructura minima:

1. **Matriz de cobertura**
   - Criterio de aceptacion.
   - Casos de prueba asociados.
   - Prioridad (P0/P1/P2).
   - Tipo (happy path, borde, regresion, permisos, validaciones).

2. **Casos de prueba detallados**
   - ID unico (`E2E-<area>-<numero>`).
   - Titulo.
   - Objetivo.
   - Precondiciones y datos.
   - Pasos de alto nivel.
   - Resultado esperado verificable.
   - Criterios cubiertos (IDs o citas textuales).

3. **Riesgos y huecos**
   - Cobertura no automatizable (si aplica).
   - Dependencias externas (entorno, datos, auth, fixtures).
   - Supuestos para implementacion.

4. **Propuesta tecnica Playwright**
   - Estructura de archivos a crear/editar.
   - Reutilizacion de helpers/page objects/fixtures existentes.
   - Estrategia de estabilidad (waits semanticas, selectores robustos, retries solo si aplica).
   - **Contrato failure-first**: tabla minima de `data-testid` o invariantes sin ambiguedad; como debe ejecutarse la suite en **rojo** antes del despliegue y **verde** despues.

Al finalizar la fase 1:
1. **Escribir o actualizar** el fichero `{nombre-spec}.qa.md` junto al spec (contenido completo del paquete de QA segun la plantilla).
2. Detenerse y pedir aprobacion explicita (el usuario revisa el `.qa.md` en el repo antes de confirmar).

### Gate obligatorio entre fases

Usar un cierre explicito como:

> "He terminado el diseno de casos de prueba. Confirma con 'aprobado' para que implemente ahora los tests Playwright. Sin esa confirmacion no escribire codigo."

Si no hay aprobacion, no implementar codigo.

### Fase 2: Implementacion de tests Playwright (tras aprobacion)

1. Crear/actualizar tests siguiendo el diseno aprobado y el **contrato failure-first** documentado en el `.qa.md` (smoke global `beforeEach` o equivalente que falle si falta la superficie de la feature).
2. Mantener consistencia con convenciones del repo:
   - naming,
   - organizacion de carpetas,
   - fixtures,
   - helpers.
3. Incluir aserciones orientadas a criterio de aceptacion, no solo checks superficiales.
4. Preferir selectores estables (`data-testid`, `getByRole`, `getByLabel`) frente a selectores fragiles.
5. Preparar o reutilizar datos de prueba de forma deterministicamente repetible.
6. Ejecutar los tests nuevos/modificados y reportar resultado (**se espera rojo en baseline sin feature** hasta que front cumpla el contrato).
7. Si algun test falla por defecto de producto o entorno:
   - documentar causa raiz,
   - evidencias,
   - impacto en cobertura.

## Plantilla de salida recomendada (Fase 1)

Usar este formato:

```markdown
## Cobertura E2E propuesta

### 1) Matriz criterio -> test
| Criterio | Caso(s) | Prioridad | Notas |
|---|---|---|---|
| CA-01 | E2E-AGENDA-001, E2E-AGENDA-002 | P0 | ... |

### 2) Casos de prueba detallados
#### E2E-AGENDA-001 - [Titulo]
- Objetivo:
- Precondiciones:
- Datos:
- Pasos:
- Resultado esperado:
- Criterios cubiertos:

### 3) Riesgos/huecos
- ...

### 4) Propuesta tecnica Playwright
- Archivos a crear/editar:
- Fixtures/helpers:
- Consideraciones de estabilidad:

### 5) Confirmacion requerida
Confirma con "aprobado" para pasar a implementacion de codigo Playwright.
```

## Plantilla de salida recomendada (Fase 2)

Tras implementar:

```markdown
## Implementacion Playwright completada

- Archivos creados/editados:
- Casos implementados:
- Trazabilidad criterio -> test:
- Resultado de ejecucion:
- Incidencias encontradas (si aplica):
- Siguientes pasos recomendados:
```

## Criterios de calidad del codigo de test

- Cada test valida un comportamiento de negocio observable **anclado al alcance** (shell/contrato), no patrones coincidentes en cualquier pagina del producto.
- Tests independientes entre si y repetibles.
- Evitar sleeps fijos salvo justificacion.
- Mantener bajo acoplamiento a detalles visuales no funcionales.
- Mensajes de asercion y nombres de tests claros para diagnostico rapido.

## Manejo de cambios y feedback

- Si el usuario corrige casos en fase 1, actualizar plan y volver a pedir aprobacion.
- Si durante fase 2 surge contradiccion con el spec, pausar implementacion y pedir definicion.
- Si se detectan criterios faltantes en el spec, reportarlos explicitamente como huecos de cobertura.
