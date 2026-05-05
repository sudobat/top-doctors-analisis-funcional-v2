# QA E2E — Mejoras configuracion agendas y citas

Documento de **Fase 1**: diseno de casos de prueba end-to-end trazables al spec `mejoras-configuracion-agendas-y-citas.spec.md`. No incluye codigo Playwright.

**Fuente**: `specs/mejoras-configuracion-agendas-y-citas.spec.md`  
**Alcance**: pantalla unificada de configuracion (Backoffice Doctor), guardado atomico final, validacion global, bloqueos de navegacion/consulta, bloques A/B/C.

---

## Contrato E2E obligatorio (failure-first: rojo antes, verde despues)

Los tests **no deben pasar** en pantallas ajenas al alcance (p. ej. office legacy sin vista unificada). El front debe exponer `data-testid` minimos acordados; el page object ejecuta `expectUnifiedUiContract()` en cada caso **antes** de aserciones de negocio.

| testid | Uso |
|---|---|
| `unified-config-page` | Raiz de la vista unificada |
| `unified-config-consultation-select` | Selector de consulta |
| `unified-config-block-consulta` | Bloque A |
| `unified-config-block-servicios` | Bloque B |
| `unified-config-block-resumen` | Bloque C |
| `unified-config-save` | CTA unico **Guardar configuracion** |
| `backoffice-sidebar` | Contenedor menu lateral BO |
| `unified-config-nav-item` | Entrada de menu hacia la vista unificada |
| `unified-config-margen-primera-cita-dias` | Campo para invalidacion/guardado en pruebas |
| `unified-config-service-note-sample` | Nota servicio (persistencia sin guardar) |
| `unified-config-discard` | **Descartar cambios** |

**Reglas de interpretacion**

1. **Sin implementacion / URL equivocada**: la suite debe ir **en rojo** (contrato no visible), no en verde por aserciones solo negativas o por `skip` masivo.
2. **Con implementacion correcta**: la misma suite debe poder ir **en verde**.
3. **E2E-UCFG-003**: cuenta guardados intermedios **solo dentro de** `unified-config-page`.
4. **E2E-UCFG-029**: exige variable `PLAYWRIGHT_SAVE_URL_GLOB`; si falta, **error explicito** (no skip).

---

## Cobertura E2E propuesta

### 1) Matriz criterio -> test

Convencion de criterios: se referencian por historia y orden del spec (texto abreviado entre parentesis).

| Criterio (spec) | Caso(s) | Prioridad | Tipo | Notas |
|---|---|---|---|---|
| H1: formulario unificado al entrar | E2E-UCFG-001 | P0 | Happy path | Requiere URL/menu final de la nueva pantalla |
| H1: todos los datos de Servicios + Consultas/agendas en una consulta | E2E-UCFG-002, E2E-UCFG-014 | P0 | Happy path / smoke | 002 smoke de presencia bloques; 014 muestreo campos representativos por subbloque |
| H1: sin guardados intermedios obligatorios; un solo guardado final | E2E-UCFG-003 | P0 | Regresion | Ausencia de CTAs parciales **dentro de** `unified-config-page`; contrato obligatorio evita verde en legacy |
| H1: orden bloques A -> B -> C | E2E-UCFG-004 | P0 | Regresion | Orden visual DOM o landmarks |
| H1: menu lateral estructura actual | E2E-UCFG-005 | P1 | Regresion | Exige `backoffice-sidebar` + `unified-config-nav-item` visibles; sin enlaces legacy triviales (`/^servicios$/`, texto consultas/agendas) |
| H2: no persistir hasta guardado final | E2E-UCFG-006 | P0 | Borde | Recarga o segunda pestanya tras editar sin guardar (datos no persistidos) |
| H2: errores bloquean guardado + resumen global arriba | E2E-UCFG-007 | P0 | Borde | Forzar invalidacion conocida |
| H2: item error navega scroll + foco | E2E-UCFG-008 | P0 | Borde | enlazar con campo invalido |
| H2: sin errores persiste atomico completo | E2E-UCFG-009 | P0 | Happy path | Verificar persistencia vuelta a cargar / API si disponible en test |
| H2: feedback exito claro | E2E-UCFG-009 | P0 | Happy path | Toast/banner acorde a DS |
| H3: salir con cambios muestra confirmacion | E2E-UCFG-010 | P0 | Borde | `beforeunload` o modal segun implementacion |
| H3: cambio consulta bloqueado con cambios sin guardar | E2E-UCFG-011 | P0 | Borde | Mensaje esperado en matriz header |
| H3: errores validacion impiden cambiar consulta | E2E-UCFG-012 | P0 | Borde | Tras intento guardado con errores |
| H3: tras guardado exitoso puede cambiar consulta | E2E-UCFG-013 | P0 | Happy path | Extension de 009 |
| H3: consistencia por consulta | E2E-UCFG-024 | P1 | Regresion | Datos A/B no se mezclan al cambiar consulta |
| H4: subbloques A1..A6 en orden | E2E-UCFG-014 | P1 | Regresion | Titulos/regiones accesibles |
| H4: A1 solo lectura coherente Admin | E2E-UCFG-015 | P1 | Regresion | Comparar con fixture o valor conocido |
| H4: A2..A6 reglas/rangos existentes | E2E-UCFG-016 | P1 | Borde | Casos minimos: margenes, recurrente, solape, horario fin>inicio |
| H4: dependencias habilitacion visibles | E2E-UCFG-017 | P2 | UI | Hijo deshabilitado u oculto segun padre |
| H4: incompleto + error navegable | E2E-UCFG-007, E2E-UCFG-008 | P0 | Borde | Ya cubierto si error es de bloque A |
| H5: editar servicios sin salir | E2E-UCFG-018 | P0 | Happy path | Abrir Configurar en vista |
| H5: tarjeta estado activacion/visibilidad/completitud | E2E-UCFG-019 | P1 | Regresion | Badge Completo/Incompleto |
| H5: Configurar muestra campos B3 | E2E-UCFG-020 | P1 | Regresion | Muestreo por canal si aplica |
| H5: condicionales precio/canal vigentes | E2E-UCFG-021 | P1 | Borde | Escenario con prepago/mixto segun datos |
| H5: incompleto en tarjeta + global | E2E-UCFG-022 | P0 | Borde | Servicio incompleto lista error global |
| H6: resumen C tiempo real | E2E-UCFG-023 | P1 | Regresion | Al invalidar campo A o B actualiza conteos |
| H6: CTA guardar solo sin errores bloqueantes | E2E-UCFG-007, E2E-UCFG-009 | P0 | Borde / happy | disabled/enabled |
| H6: errores en C con enlaces + CTA bloqueado | E2E-UCFG-007 | P0 | Borde | |
| H6: exito -> Sin cambios + timestamp | E2E-UCFG-025 | P1 | Regresion | Header estado derivado |
| H7: estados visuales coherentes DS | E2E-UCFG-026 | P2 | UI | Muestreo (invalido, disabled, readonly) |
| H7: sin errores huerfanos | E2E-UCFG-027 | P1 | Borde | Tras corregir campo desaparece de lista global |
| H7: navegacion resumen siempre campo correcto | E2E-UCFG-028 | P1 | Borde | Multiples errores en A y B |
| H7: bloqueos salida/consulta consistentes | E2E-UCFG-010, E2E-UCFG-011, E2E-UCFG-012 | P0 | Borde | |

**NFR rendimiento (p95)** | — | P2 | No E2E tipico | Medir en perf/regression dedicada o backend; no automatizar en Playwright salvo umbral laxo opcional |

**Trazabilidad backend atomico / rollback** | E2E-UCFG-029 | P1 | Borde | Simular fallo red/API si hay mock o entorno |

---

### 2) Casos de prueba detallados

#### E2E-UCFG-001 — Entrada directa al formulario unificado

- **Objetivo**: Verificar que al acceder a la nueva funcionalidad el doctor ve el formulario unificado sin pantalla introductoria intermedia.
- **Precondiciones**: Usuario doctor con permisos de configuracion; al menos una consulta activa en Admin.
- **Datos**: Credenciales de entorno de pruebas; URL/ruta final acordada (`[Pendiente en spec: menu]`).
- **Pasos**:
  1. Autenticarse como doctor.
  2. Navegar al item de menu que sustituye `Servicios` y `Consultas y agendas`.
  3. Observar primera vista renderizada.
- **Resultado esperado**: Se muestra selector de consulta y bloques del formulario (al menos region/header unificado visible); no hay paso previo obligatorio de seleccion de modo distinto al selector de consulta.
- **Criterios cubiertos**: Historia 1 — "visualiza directamente el formulario unificado".

#### E2E-UCFG-002 — Cobertura smoke bloques A, B y C

- **Objetivo**: Confirmar que una sola pantalla expone configuracion de consulta/agendas, servicios y resumen final.
- **Precondiciones**: Misma que 001; consulta seleccionada por defecto o seleccionable.
- **Datos**: Consulta con configuracion minima valida existente (fixture).
- **Pasos**:
  1. Entrar en pantalla unificada.
  2. Identificar bloque `Consulta y agendas`, `Servicios de la consulta`, `Resumen y validacion final`.
  3. Verificar presencia de CTA unico `Guardar configuracion` en header o bloque C segun diseno.
- **Resultado esperado**: Los tres bloques son localizables en la misma vista (scroll); existe un unico punto de guardado explícito alineado al spec.
- **Criterios cubiertos**: Historia 1 — datos repartidos hoy en dos secciones disponibles en una pantalla; orden verificado en 004.

#### E2E-UCFG-003 — Ausencia de guardados intermedios obligatorios

- **Objetivo**: Verificar que no se exige persistencia parcial por subpantalla antes del guardado final.
- **Precondiciones**: Pantalla con datos editables en A y B.
- **Datos**: —
- **Pasos**:
  1. Editar campo en bloque A sin guardar.
  2. Ir a bloque B (scroll); editar campo opcional de servicio.
  3. Inspeccionar UI: no debe aparecer CTA de "Guardar" intermedio obligatorio que bloquee continuar (salvo comportamiento legacy documentado como fuera de alcance).
- **Resultado esperado**: El flujo permite trabajar A y B antes de un unico guardado final; solo el CTA principal persiste.
- **Criterios cubiertos**: Historia 1 — "No existen guardados intermedios obligatorios".

#### E2E-UCFG-004 — Orden fijo de bloques A -> B -> C

- **Objetivo**: Validar orden visual de bloques segun spec.
- **Precondiciones**: Pantalla cargada.
- **Pasos**:
  1. Obtener posiciones verticales (orden en DOM o `getBoundingClientRect`) de titulos/regiones de A, B y C.
- **Resultado esperado**: A aparece antes que B; B antes que C.
- **Criterios cubiertos**: Historia 1 — orden de bloques.

#### E2E-UCFG-005 — Menu lateral: acceso unificado sin romper resto

- **Objetivo**: Confirmar que las entradas antiguas se reemplazan por el acceso unificado y el resto del menu permanece usable.
- **Precondiciones**: —
- **Pasos**:
  1. Listar items laterales visibles.
  2. Verificar ausencia de rutas duplicadas conflictivas o enlaces rotos a secciones eliminadas.
  3. Navegar a otra seccion no relacionada y volver.
- **Resultado esperado**: Estructura lateral coherente con spec; nueva entrada lleva a pantalla unificada.
- **Criterios cubiertos**: Historia 1 — menu lateral.

#### E2E-UCFG-006 — Cambios no persisten sin guardado final

- **Objetivo**: Verificar que hasta pulsar guardado final los cambios no quedan en servidor.
- **Precondiciones**: Consulta con estado conocido; posibilidad de recargar sesion.
- **Datos**: Valor editable reversible (ej. nota servicio o campo no critico acordado con datos de prueba).
- **Pasos**:
  1. Anotar estado inicial (GET UI o recarga).
  2. Modificar campo en A o B.
  3. Recargar pagina sin guardar (aceptar aviso si aparece — caso relacionado 010).
  4. Verificar valor en UI respecto servidor/estado inicial.
- **Resultado esperado**: Cambio no persistido tras recarga.
- **Criterios cubiertos**: Historia 2 — no persistir hasta guardado final.

#### E2E-UCFG-007 — Guardado bloqueado con resumen global superior

- **Objetivo**: Con validacion global fallida, el guardado final no ejecuta persistencia y se muestra lista de errores arriba del formulario.
- **Precondiciones**: Escenario que fuerce error conocido (ej. hora fin <= inicio, margen fuera rango, falta canal — segun datos).
- **Pasos**:
  1. Introducir datos invalidos que el sistema ya validaba antes de la unificacion.
  2. Pulsar `Guardar configuracion`.
- **Resultado esperado**: Lista/resumen global visible en zona superior del contenido; persistencia no aplicada (mensaje o estado sin "guardado").
- **Criterios cubiertos**: Historia 2 (bloqueo + resumen); Historia 6 (CTA bloqueado si errores).

#### E2E-UCFG-008 — Enlaces del resumen global: scroll y foco

- **Objetivo**: Cada item del resumen lleva al campo invalido con scroll y foco.
- **Precondiciones**: Escenario con >=2 errores en bloques distintos (A y B si posible).
- **Pasos**:
  1. Provocar errores multiples.
  2. Pulsar primer enlace del resumen global.
  3. Registrar elemento enfocado y visibilidad en viewport.
  4. Repetir con segundo enlace.
- **Resultado esperado**: Cada clic mueve vista al bloque correcto y el foco queda en control invalido asociado.
- **Criterios cubiertos**: Historia 2; Historia 7 (navegacion precisa); Historia 6 (enlaces en resumen C si aplica mismo componente).

#### E2E-UCFG-009 — Happy path: guardado atomico y feedback

- **Objetivo**: Configuracion valida completa persiste de una vez y muestra feedback de exito.
- **Precondiciones**: Fixture de consulta o datos que cumplan todas las reglas obligatorias.
- **Pasos**:
  1. Completar o ajustar bloques A y B para estado valido.
  2. Revisar bloque C (opcional visual).
  3. Pulsar `Guardar configuracion`.
- **Resultado esperado**: Exito no ambiguo (toast/banner); estado del formulario refleja guardado; recarga opcional confirma persistencia de cambios clave acordados.
- **Criterios cubiertos**: Historia 2 (persistencia unica operacion + feedback); Historia 6 parcial.

#### E2E-UCFG-010 — Abandono de pantalla con cambios sin guardar

- **Objetivo**: Intento de salir con cambios pendientes muestra confirmacion.
- **Precondiciones**: Cambio sin guardar en formulario.
- **Pasos**:
  1. Editar campo.
  2. Navegar a otra ruta del BO o cerrar pestanya segun estrategia reproducible en Playwright.
- **Resultado esperado**: Modal nativo o de aplicacion que advierte perdida de datos; cancelar conserva cambios en memoria.
- **Criterios cubiertos**: Historia 3; Historia 7.

#### E2E-UCFG-011 — Selector consulta bloqueado con cambios sin guardar

- **Objetivo**: No permitir cambiar de consulta hasta guardar correctamente.
- **Precondiciones**: >=2 consultas en selector; cambio sin guardar.
- **Pasos**:
  1. Editar campo.
  2. Abrir selector e intentar elegir otra consulta.
- **Resultado esperado**: Accion impedida o muestra mensaje alineado a copy funcional (`Debes guardar...`) del spec matriz header.
- **Criterios cubiertos**: Historia 3.

#### E2E-UCFG-012 — Errores validacion bloquean cambio de consulta

- **Objetivo**: Si guardado falla por validacion, cambiar consulta sigue bloqueado hasta corregir.
- **Precondiciones**: Dos consultas; estado invalido que impide guardar.
- **Pasos**:
  1. Dejar formulario invalido y pulsar guardar (errores visibles).
  2. Intentar cambiar consulta en selector.
- **Resultado esperado**: Bloqueo mantenido hasta corregir errores y guardar con exito.
- **Criterios cubiertos**: Historia 3; Historia 7.

#### E2E-UCFG-013 — Tras guardado exitoso, cambio de consulta libre

- **Objetivo**: Sin cambios pendientes post-guardado, el selector permite otra consulta.
- **Precondiciones**: Dos consultas; estado valido guardable.
- **Pasos**:
  1. Guardar con exito (009).
  2. Cambiar a segunda consulta.
- **Resultado esperado**: Carga datos de segunda consulta sin bloqueos indebidos.
- **Criterios cubiertos**: Historia 3.

#### E2E-UCFG-014 — Estructura bloque A: subbloques A1..A6 y orden

- **Objetivo**: Validar jerarquia y orden de subbloques segun Historia 4.
- **Precondiciones**: Bloque A expandido por defecto primera carga (spec).
- **Pasos**:
  1. Expandir si colapsado y capturar orden de titulos/secciones A1..A6.
  2. Verificar presencia de controles representativos (switch Mostrar online, radios reserva/pago, grid horarios, acceso config avanzada rango).
- **Resultado esperado**: Orden A1..A6; primera carga con A visible expandido.
- **Criterios cubiertos**: Historia 4 (orden + contenido); Historia 1 muestreo datos consulta/agendas.

#### E2E-UCFG-015 — A1 solo lectura

- **Objetivo**: Campos identidad consulta no editables y valores coherentes con fuente Admin (fixture).
- **Precondiciones**: Consulta con datos conocidos en Admin.
- **Pasos**:
  1. Localizar nombre consulta, direccion, tratamientos asociados.
  2. Intentar edicion directa (teclado).
- **Resultado esperado**: Controles readonly/disabled; valores coinciden con expectation del fixture.
- **Criterios cubiertos**: Historia 4.

#### E2E-UCFG-016 — Validaciones rangos A2..A6 (muestra representativa)

- **Objetivo**: Reglas numericas y horarias existentes se aplican en UI.
- **Precondiciones**: —
- **Pasos** (subset acordado con QA negocio):
  1. Margen primera cita fuera de 0..168 -> mensaje esperado.
  2. Margen ultima fuera de 1..52 semanas -> mensaje esperado.
  3. Recurrente ON con numero fuera 2..12 -> error.
  4. Solapamiento ON con numero fuera 2..4 -> error.
  5. Dia activo con hora fin <= inicio -> error.
- **Resultado esperado**: Mensajes alineados a copys de matriz campo a campo del spec (o equivalente vigente).
- **Criterios cubiertos**: Historia 4; parcial Historia 2.

#### E2E-UCFG-017 — Dependencias padre-hijo visibles (A2..A6)

- **Objetivo**: Switch padre controla visibilidad/habilitacion de hijos de forma explicita.
- **Precondiciones**: Feature recurrente/solapamiento disponibles.
- **Pasos**:
  1. Toggle padre OFF -> hijo no aplicable deshabilitado u oculto.
  2. Toggle ON -> hijo editable.
- **Resultado esperado**: Coherencia visual sin contradicciones.
- **Criterios cubiertos**: Historia 4; Historia 7 parcial.

#### E2E-UCFG-018 — Bloque B sin salir de pantalla

- **Objetivo**: Listado y edicion de servicios dentro de la misma vista.
- **Precondiciones**: Servicios asociados a especialidades.
- **Pasos**:
  1. Scroll a bloque B.
  2. Usar buscador/filtro basico.
  3. Toggle activacion servicio de prueba.
- **Resultado esperado**: Sin navegacion a URL legacy `Servicios` separada.
- **Criterios cubiertos**: Historia 5.

#### E2E-UCFG-019 — Tarjeta servicio: activacion, Top Doctors, completitud

- **Objetivo**: Estados visibles en fila/tarjeta.
- **Precondiciones**: Servicio activable.
- **Pasos**:
  1. Observar badge Completo/Incompleto antes y despues de provocar incompletitud.
- **Resultado esperado**: Indicadores visibles y actualizados.
- **Criterios cubiertos**: Historia 5.

#### E2E-UCFG-020 — Detalle Configurar muestra campos B3

- **Objetivo**: Panel/acordeon lateral lista campos operativos por canal.
- **Precondiciones**: Servicio con canales habilitados segun reglas.
- **Pasos**:
  1. Abrir `Configurar` en servicio de prueba.
  2. Verificar presencia multi-select tratamientos, IVA, switches canal, duraciones, precios condicionados, nota.
- **Resultado esperado**: Campos B3 visibles segun habilitacion vigente.
- **Criterios cubiertos**: Historia 5.

#### E2E-UCFG-021 — Condicionales precio/canal

- **Objetivo**: Mostrar precio / campos prepago solo cuando reglas actuales lo permitan.
- **Precondiciones**: Servicios con combinaciones distintas (preparar datos).
- **Pasos**:
  1. Para cada combinacion, abrir detalle y snapshot de campos visibles.
- **Resultado esperado**: Coincide con logica previa (baseline manual o comparacion con build anterior si existe).
- **Criterios cubiertos**: Historia 5.

#### E2E-UCFG-022 — Servicio incompleto en tarjeta y lista global

- **Objetivo**: Error de servicio aparece en tarjeta y en resumen/global superior.
- **Precondiciones**: Servicio activo con campo obligatorio condicional vacio.
- **Pasos**:
  1. Dejar incompleto e intentar guardar.
- **Resultado esperado**: Mini-resumen en tarjeta + entrada en barra/lista global navegable.
- **Criterios cubiertos**: Historia 5; Historia 2.

#### E2E-UCFG-023 — Bloque C tiempo real

- **Objetivo**: Contadores/checklist en C reflejan cambios en A/B sin guardar.
- **Precondiciones**: —
- **Pasos**:
  1. Observar conteo errores/pendientes en C en estado limpio.
  2. Introducir error en A -> verificar incremento/estado en C.
  3. Corregir -> verificar actualizacion.
- **Resultado esperado**: Actualizacion reactiva coherente.
- **Criterios cubiertos**: Historia 6.

#### E2E-UCFG-024 — Aislamiento datos entre consultas

- **Objetivo**: Tras cambiar consulta (tras guardado), no se muestran datos cruzados.
- **Precondiciones**: Dos consultas con configuraciones distinguibles (fixtures).
- **Pasos**:
  1. Guardar en consulta A con marca reconocible.
  2. Cambiar a consulta B.
  3. Verificar ausencia de valores de A en UI.
- **Resultado esperado**: Datos por consulta consistentes.
- **Criterios cubiertos**: Historia 3 (consistencia).

#### E2E-UCFG-025 — Post-guardado: estado Sin cambios y timestamp

- **Objetivo**: Header muestra estado derivado y ultima actualizacion visible si spec UX lo incluye.
- **Precondiciones**: Guardado exitoso.
- **Pasos**:
  1. Tras 009, leer badge estado y campo timestamp si existe.
- **Resultado esperado**: `Sin cambios` (o equivalente); timestamp actualizado reciente.
- **Criterios cubiertos**: Historia 6.

#### E2E-UCFG-026 — Estados visuales componentes (muestreo DS)

- **Objetivo**: Campos muestran invalido/disabled/readonly de forma coherente.
- **Precondiciones**: —
- **Pasos**: Capturar screenshots o assertions de clases ARIA en 2-3 controles por tipo.
- **Resultado esperado**: Sin regresiones obvias vs design system BO.
- **Criterios cubiertos**: Historia 7.

#### E2E-UCFG-027 — Sin mensajes huerfanos ni errores sin mensaje

- **Objetivo**: Toda entrada en lista global tiene campo asociado visible al navegar; al corregir, desaparece de lista.
- **Precondiciones**: Multiples errores.
- **Pasos**:
  1. Corregir un error; verificar lista global actualizada.
- **Resultado esperado**: Lista consistente con validacion.
- **Criterios cubiertos**: Historia 7.

#### E2E-UCFG-028 — Multiples errores: navegacion siempre correcta

- **Objetivo**: Refuerzo de precision de enlaces con N errores (>2) en A y B.
- **Precondiciones**: —
- **Pasos**: Iterar cada link del resumen verificando bloque destino y campo.
- **Resultado esperado**: 100% coincidencias en iteracion.
- **Criterios cubiertos**: Historia 7.

#### E2E-UCFG-029 — Fallo recuperable de guardado (no persistencia parcial)

- **Objetivo**: Si backend/devtools simulan fallo, UI muestra error recuperable y estado previo consistente.
- **Precondiciones**: Capacidad de interceptar request guardado (Playwright `route`) en entorno controlado.
- **Pasos**:
  1. Forzar respuesta 500 o timeout en POST guardado.
  2. Observar mensaje y posibilidad de reintento.
  3. Verificar que datos persistidos no quedan a medias (segun NFR disponibilidad).
- **Resultado esperado**: Sin persistencia parcial; usuario puede reintentar.
- **Criterios cubiertos**: RNF disponibilidad + Historia 2 implicito.

#### E2E-UCFG-030 — Descartar cambios con confirmacion

- **Objetivo**: Accion secundaria Descartar cambios solicita confirmacion y revierte estado dirty.
- **Precondiciones**: Cambios sin guardar.
- **Pasos**:
  1. Pulsa `Descartar cambios` en bloque C (o ubicacion final).
  2. Confirmar/cancelar segun dos subcamino.
- **Resultado esperado**: Confirmacion obligatoria; confirmar restaura valores persistidos previos; cancelar mantiene ediciones.
- **Criterios cubiertos**: Historia 6 (subbloque C3).

---

### 3) Riesgos y huecos

| Riesgo / hueco | Impacto | Mitigacion propuesta |
|---|---|---|
| Este repo no contiene aun proyecto Playwright ni rutas reales de la app | Alto para implementacion | Anclar paths/navigation cuando exista el paquete front; usar fixtures auth del BO |
| URL prototipo y rutas menu pendientes en spec | Medio | Congelar contrato de navegacion en ticket UX antes de codificar tests |
| Copy final errores y textos exactos pendientes | Medio | Aserciones por rol/`data-testid`/ patron estable; evitar texto literal hasta freeze copy |
| Reglas negocio complejas (seguros, precios multi-canal) | Alto | Priorizar fixtures minimales acordados con negocio; baseline contra build actual |
| `beforeunload` vs modal SPA inconsistente entre navegadores | Medio | Parametrizar expectativa por estrategia real de implementacion |
| Guardado atomico solo verificable con API/intercept | Medio | Combinar reload + assertion UI y opcional intercept spy |
| Datos Admin readonly (A1) requieren sincronizacion fixture | Medio | Preparar consulta seed en Admin pipeline o mocks |
| Performance NFR p95 | Bajo E2E | No cubrir en E2E salvo smoke opcional; usar monitorizacion |

**Automatizacion parcial**: Instrumentacion analytics (`unified_config_*`) puede validarse en tests separados de contract/analytics si el equipo lo pide; no sustituye aserciones funcionales UI.

---

### 4) Propuesta tecnica Playwright

- **Archivos a crear/editar** (cuando exista el paquete de aplicacion):
  - `e2e/unified-consultation-config/` o equivalente segun convencion del monorepo.
  - `e2e/fixtures/backoffice-doctor-auth.ts` — sesion doctor reutilizable (storageState).
  - `e2e/pages/unified-config.page.ts` — page object: selector consulta, bloques A/B/C, lista errores global, CTA guardar.
  - `e2e/data/unified-config-seeds.ts` — ids consulta/servicio para entornos staging.

- **Fixtures/helpers**:
  - Login con rol doctor y permisos de configuracion.
  - Helpers `expectProgressHeader()`, `openErrorLink(index)`, `fillMinimalValidConfig()`.

- **Consideraciones de estabilidad**:
  - **Contrato failure-first**: tabla `data-testid` de la seccion "Contrato E2E obligatorio"; smoke por `expectUnifiedUiContract()` en `beforeEach`.
  - Encima del contrato, priorizar `getByRole` / `getByLabel` para detalle (errores globales, microcopy).
  - Esperas en validaciones: `expect.poll` o esperas a red (`waitForResponse`) en guardado en lugar de `sleep`.
  - Tests independientes: cada uno puede hacer login desde storageState y navegar; evitar orden dependiente.
  - Para cambio consulta y unload, usar APIs Playwright (`page.goto` con opciones, `dialog` event para `beforeunload` si aplica).
  - Retry: solo a nivel playwright.config si ya existe politica global del repo.

---

### 5) Estado implementacion Playwright (repo)

Suite inicial en `e2e/unified-consultation-config/mejoras-agendas-citas.spec.ts` alineada al contrato **failure-first** anterior. Antes de desplegar la vista unificada con los `data-testid`, la ejecucion esperable es **rojo**; tras implementacion + testids, **verde**.
