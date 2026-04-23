# Rediseno del paso de direccion y validacion postal en checkout (Web y App)

## Descripcion funcional

### Metadatos

- Fecha de creacion: 2026-04-23
- Responsable negocio: Pendiente de confirmacion (Equipo eCommerce)
- Responsable funcional: Adria Batlle + Analisis Funcional (Equipo Producto Digital)
- PO: Pendiente de confirmacion
- Responsable UX: Pendiente de confirmacion (Equipo UX)
- Prioridad (Q): Alta
- Tipo: Mejora
- Trimestre objetivo: Q2

### Descripcion general de la funcionalidad

Actualmente existe una fuga relevante en checkout al introducir la direccion de envio, especialmente en la etapa de validacion postal. La mejora propuesta redisena exclusivamente el paso de direccion y su validacion postal para web y app, manteniendo intactos los metodos de pago, el orden del resto de pasos y la logica de cobro. El objetivo de negocio es reducir abandono en checkout, mejorar tasa de direccion valida al primer intento y disminuir errores de entrega por codigos postales inconsistentes. El alcance principal incluye: nueva experiencia de captura de direccion, validaciones sincrona/asincrona de campos, mensajes de error accionables, reglas de bloqueo/desbloqueo del CTA de avance y trazabilidad de eventos para analitica.

AS-IS (actual):
- El formulario de direccion presenta validaciones tardias y mensajes poco accionables, concentrados en el intento de continuar.
- La coherencia entre codigo postal y ciudad/provincia no siempre se valida en el momento correcto, generando rechazos tardios.
- Existen diferencias de comportamiento entre web y app en guardado de datos parciales y recuperacion tras salida del flujo.
- El usuario puede no entender por que el CTA queda bloqueado, elevando abandono en este paso.

TO-BE (objetivo funcional):
- El paso de direccion aplica validacion progresiva (campo a campo + validacion de negocio) con estados visibles y consistentes entre canales.
- Se unifica la logica de bloqueo del CTA: solo habilitado con campos obligatorios completos, formato valido y validacion postal `VALIDA`.
- Se incorpora persistencia incremental del borrador para prevenir perdida de datos y reducir friccion en web/app.
- Se estandariza la mensajeria de error para formato, coherencia geografica, zona no servida y error tecnico, con acciones de recuperacion.
- Se instrumenta el embudo del paso direccion para medir impacto real de la mejora sobre abandono y calidad de direccion.

### Prototipo funcional

- URL prototipo/diseno: Pendiente de compartir enlace Figma (se reporta diseno parcial del nuevo paso)
- Referencias adicionales:
  - Ticket JIRA: COM-2419
  - Checkout actual (AS-IS): Pendiente de URL de entorno web y build app de referencia

### Relacion con epica/iniciativa

- Epica: Pendiente de confirmacion (iniciativa de reduccion de abandono en checkout)
- Tickets relacionados: COM-2419

## Historias funcionales

### Historia 1: Captura guiada de direccion con persistencia por canal

**Como** usuario comprador en checkout (web o app)  
**Quiero** completar mi direccion en un formulario guiado y claro  
**Para** avanzar sin friccion al siguiente paso y evitar abandono

**Precondiciones**

- El usuario ya tiene carrito valido y se encuentra en checkout en el paso de direccion.
- Existe sesion de checkout activa con `checkout_id` y pais de envio seleccionado.
- El backend de checkout expone endpoint de guardar borrador de direccion.

**Descripcion**

- El paso de direccion se renderiza como pantalla unica con secciones: datos de via, numero, piso/puerta (opcional), ciudad, provincia/estado, codigo postal, telefono de contacto.
- AS-IS detallado de interaccion:
  - El usuario suele completar todo el formulario y recibe errores al final, lo que incrementa retrabajo.
  - En app puede perder datos al cambiar de contexto o ante cierres inesperados si no hubo guardado completo.
  - En web pueden coexistir valores autocompletados no normalizados con reglas internas.
- TO-BE detallado de interaccion:
  - El usuario recibe feedback temprano por campo (sintaxis/formato) y feedback de negocio antes de salir del paso.
  - El sistema conserva borrador consistente entre sesiones de checkout activas y retorno desde pasos posteriores.
  - La interfaz muestra siempre estado de validacion postal y causa de bloqueo del avance.
- El formulario opera en modo "guardado incremental": cada campo confirmado (`onBlur` en web, `onFieldSubmit` o perdida de foco en app) persiste en borrador para evitar perdida de datos ante cierre o navegacion atras.
- Se define orden de foco y avance:
  - Web: tabulacion de izquierda a derecha y de arriba abajo.
  - App: boton "Siguiente" del teclado virtual avanza al siguiente campo editable.
- Campos obligatorios minimos para habilitar validacion postal final: `direccion_linea1`, `ciudad`, `provincia_estado`, `codigo_postal`, `pais`, `telefono`.
- El CTA primario ("Continuar a pago" o etiqueta equivalente) permanece deshabilitado hasta cumplir simultaneamente:
  - Todos los campos obligatorios completos.
  - Validaciones de formato local correctas.
  - Validacion postal de negocio en estado `VALIDA`.
- Si el usuario vuelve atras desde pago y retorna a direccion, se precargan datos guardados y se conserva el ultimo estado de validacion postal mientras no cambien campos clave (`codigo_postal`, `ciudad`, `provincia_estado`, `pais`, `direccion_linea1`).
- Diferencias de canal permitidas:
  - Web: posibilidad de autocompletar por navegador si no contradice reglas de formato.
  - App: soporte de autofill del SO (iOS/Android) con normalizacion posterior.
- Estados de interfaz definidos para la pantalla:
  - `IDLE_SIN_DATOS`
  - `EDITANDO`
  - `PENDIENTE_VALIDACION_POSTAL`
  - `VALIDADA`
  - `INVALIDA_BLOQUEANTE`
  - `ERROR_TECNICO_VALIDACION`

**Criterios de aceptacion**

- [ ] Dado un checkout iniciado, cuando el usuario completa campos obligatorios validos, entonces el sistema persiste automaticamente el borrador sin perder datos al recargar (web) o reabrir app.
- [ ] Dado que falta al menos un campo obligatorio o hay formato invalido, cuando el usuario intenta continuar, entonces el CTA permanece deshabilitado y se muestra feedback por campo.
- [ ] Dado que la direccion ya fue validada y el usuario modifica `codigo_postal`, entonces el estado vuelve a `PENDIENTE_VALIDACION_POSTAL` y se requiere nueva validacion antes de continuar.
- [ ] Dado retorno desde el paso de pago, cuando el usuario vuelve al paso direccion sin cambios, entonces visualiza los datos previos y conserva estado `VALIDADA`.

**Diagramas / UX UI**

- Diagramas requeridos: Flujo de estados de pantalla, diagrama de secuencia guardar borrador, mapa de foco/navegacion por campos.
- Interfaces/pantallas implicadas: Paso Direccion checkout web, Paso Direccion checkout app iOS, Paso Direccion checkout app Android.
- Notas UX/UI: Mostrar campos obligatorios con indicador explicito, copy orientado a accion, helper text preventivo en codigo postal, feedback de guardado discreto (no intrusivo).

### Historia 2: Validacion postal de negocio y normalizacion de direccion

**Como** usuario comprador  
**Quiero** que el sistema valide mi codigo postal y coherencia geografica en tiempo real  
**Para** asegurar que mi direccion es entregable y evitar rechazos posteriores

**Precondiciones**

- El usuario tiene completo al menos `codigo_postal`, `ciudad`, `provincia_estado` y `pais`.
- Existe servicio de validacion postal interno o tercero con contrato disponible.
- Se dispone de catalogo vigente de reglas postales por pais objetivo.

**Descripcion**

- La validacion postal se dispara en dos momentos:
  - Validacion preventiva al salir del campo `codigo_postal` (sintaxis/longitud/patron por pais).
  - Validacion de negocio al intentar continuar o al completar campos geograficos requeridos.
- Tipos de validacion:
  - **Formato local**: regex por pais, longitud minima/maxima, caracteres permitidos.
  - **Coherencia geografica**: correspondencia codigo postal <-> ciudad/provincia.
  - **Entregabilidad**: codigo y zona habilitados para envio segun reglas logisticas vigentes.
- Reglas de prioridad de errores:
  1. Error de formato local (bloqueante inmediato).
  2. Error de coherencia geografica (bloqueante).
  3. Zona no servida (bloqueante con mensaje de negocio).
  4. Error tecnico de servicio (no confirma validez; bloquea continuidad salvo politica de fallback aprobada).
- Normalizacion de datos antes de enviar al backend:
  - Trim de espacios extremos.
  - Colapsar espacios multiples internos.
  - Estandarizar mayusculas/minusculas segun regla de pais (ej. postal en mayuscula cuando aplique).
  - Remocion de caracteres no permitidos en codigo postal.
- Mensajeria funcional requerida:
  - Error formato: "Revisa el codigo postal. Formato esperado: XXXXX" (dinamico por pais).
  - Error coherencia: "El codigo postal no coincide con la ciudad/provincia indicada."
  - Zona no servida: "De momento no realizamos envios en esta zona postal."
  - Error tecnico: "No pudimos validar tu direccion ahora. Intentalo de nuevo en unos segundos."
- Si hay sugerencias de correccion del validador (ej. ciudad canonica), se muestran como recomendacion seleccionable sin autoseleccionar para evitar cambios inesperados.
- Se registra resultado de validacion con `validation_source`, `timestamp`, `rule_version` y `decision` para auditoria.
- Estados de validacion postal:
  - `NO_EJECUTADA`
  - `EN_PROCESO`
  - `VALIDA`
  - `INVALIDA_FORMATO`
  - `INVALIDA_COHERENCIA`
  - `INVALIDA_ZONA`
  - `ERROR_TECNICO`

**Criterios de aceptacion**

- [ ] Dado pais ES y codigo postal con patron invalido, cuando el usuario sale del campo, entonces se muestra error de formato y no se ejecuta validacion de coherencia hasta corregir.
- [ ] Dado codigo postal con formato valido pero ciudad incompatible, cuando se dispara validacion de negocio, entonces el sistema marca `INVALIDA_COHERENCIA`, bloquea CTA y muestra mensaje especifico.
- [ ] Dado direccion valida y zona servida, cuando la validacion responde OK, entonces el estado pasa a `VALIDA`, se habilita CTA y se persiste huella de validacion con version de regla.
- [ ] Dado fallo tecnico del servicio de validacion, cuando el usuario intenta continuar, entonces se informa error tecnico y no se permite avanzar hasta reintento exitoso (salvo decision de fallback explicitamente aprobada).

**Diagramas / UX UI**

- Diagramas requeridos: Diagrama de decision de validaciones, secuencia frontend-backend-servicio postal, matriz de mensajes por error.
- Interfaces/pantallas implicadas: Campo codigo postal, resumen de errores del paso, toast/banner de fallo tecnico.
- Notas UX/UI: Feedback de validacion en menos de 300 ms para formato local; para validacion remota mostrar estado de carga no bloqueante con indicador claro.

### Historia 3: Recuperacion ante errores, analitica del embudo y control de regresion

**Como** equipo de producto/operaciones  
**Quiero** trazabilidad completa del paso direccion y estrategias de recuperacion  
**Para** medir reduccion de abandono y detectar rapidamente incidencias funcionales

**Precondiciones**

- Existe capa de eventos de analitica en web y app con esquema versionado.
- Se define baseline AS-IS del embudo actual para comparar impacto.
- QA dispone de ambientes con mocks de validacion postal (OK, error formato, zona no servida, timeout).

**Descripcion**

- Instrumentacion minima de eventos:
  - `checkout_address_step_viewed`
  - `checkout_address_field_blur`
  - `checkout_address_validation_requested`
  - `checkout_address_validation_result`
  - `checkout_address_continue_clicked`
  - `checkout_address_continue_blocked`
  - `checkout_address_step_completed`
- Propiedades obligatorias de evento:
  - `checkout_id`, `canal` (web/app), `plataforma` (ios/android/web), `pais`, `postal_code_prefix_masked`, `validation_state`, `error_type`, `latency_ms`.
- Politica de privacidad:
  - No enviar direccion completa ni telefono en claro en eventos.
  - Enmascarar codigo postal segun normativa local (ej. prefijo + mascara).
- Estrategia de recuperacion UX ante error tecnico:
  - Boton `Reintentar validacion`.
  - Mantener datos ingresados sin limpiar formulario.
  - Si hay 3 fallos consecutivos, escalar mensaje: "Estamos teniendo problemas para validar. Puedes intentar en unos minutos."
- Control de regresion:
  - No modificar endpoints, UI ni reglas de metodos de pago.
  - Contrato de salida del paso direccion hacia pago debe mantenerse compatible (`shipping_address_validated=true` como condicion de avance).
- Casos borde obligatorios:
  - Usuario pega direccion con caracteres especiales.
  - Usuario cambia pais despues de haber validado codigo postal.
  - Timeout de red en app con reconexion y reintento.
  - Navegacion atras/adelante del navegador en web durante `EN_PROCESO`.
- Definicion de exito (borrador, sujeto a confirmacion):
  - Reducir abandono en paso direccion >= 15% vs baseline de 4 semanas.
  - Aumentar tasa de validacion exitosa al primer intento >= 10%.
  - Reducir tickets de soporte por direccion/codigo postal >= 20%.

**Criterios de aceptacion**

- [ ] Dado cualquier intento de validacion, cuando finaliza, entonces se emite `checkout_address_validation_result` con propiedades minimas y sin exponer PII sensible.
- [ ] Dado error tecnico de validacion, cuando el usuario pulsa `Reintentar`, entonces se ejecuta nuevo intento sin borrar datos y con trazabilidad del intento incremental.
- [ ] Dado despliegue de la mejora, cuando se ejecutan pruebas de regresion de checkout, entonces el flujo y reglas del paso de pago se mantienen sin cambios funcionales.
- [ ] Dado usuario en web/app con cambio de pais tras validacion previa, cuando se detecta el cambio, entonces se invalida estado postal y se obliga nueva validacion consistente.

**Diagramas / UX UI**

- Diagramas requeridos: Embudo de eventos, secuencia de reintentos, mapa de casos borde por canal.
- Interfaces/pantallas implicadas: Banner de error tecnico, boton reintentar, estado del CTA continuar.
- Notas UX/UI: Priorizar mensajes accionables y breves; evitar bloqueos silenciosos del CTA; mostrar razon de bloqueo siempre visible.

## Requisitos no funcionales

- Rendimiento: Validacion de formato local <= 300 ms p95; validacion remota <= 1500 ms p95; tiempo de render del paso <= 2 s p95 en 4G; soporte de 50 rps sostenidas en validacion postal en picos.
- Seguridad y privacidad: Cifrado en transito (TLS 1.2+), sin persistencia de PII en logs de cliente, trazabilidad de cambios de direccion con `user_id/checkout_id`, cumplimiento de politica de minimizacion de datos.
- Disponibilidad: Si el validador externo cae, el sistema debe degradar con mensaje explicito y opcion de reintento; objetivo disponibilidad paso direccion 99.9% mensual.
- Observabilidad: Dashboard con tasa de error por tipo (`formato`, `coherencia`, `zona`, `tecnico`), alertas cuando `ERROR_TECNICO` > 5% en 15 minutos, logs correlacionados por `checkout_id`.
- Compatibilidad: Web en ultimas 2 versiones de Chrome, Safari, Firefox, Edge; app iOS version activa -1 y Android version activa -2; soporte responsive desde 320 px.

## Supuestos, dependencias y riesgos

- Supuestos:
  - Existe servicio de validacion postal disponible para los paises actualmente comercializados.
  - El diseno Figma parcial cubre componentes clave de formularios y estados de error.
  - El equipo de datos puede instrumentar eventos sin bloquear release.
- Dependencias:
  - Equipo UX para cerrar diseno final de estados, mensajes y accesibilidad.
  - Equipo Backend Checkout para contrato de validacion y persistencia de borrador.
  - Equipo Logistica/Operaciones para definir zonas no servidas vigentes.
  - Equipo Data para definicion de baseline y tablero comparativo AS-IS vs TO-BE.
- Riesgos:
  - Inconsistencia de reglas postales por pais puede generar falsos negativos y friccion.
  - Latencia del servicio de validacion puede aumentar abandono en conexiones moviles.
  - Divergencia de implementacion entre web y app puede romper paridad funcional.
  - Figma parcial puede dejar decisiones de UX sin cerrar al inicio del desarrollo.

## Fuera de alcance

- Cambios en metodos de pago, antifraude, tokenizacion o experiencia del paso de pago.
- Rediseno completo de checkout fuera del paso de direccion.
- Cambios en precios, promociones, cupones o calculo de costos de envio no ligados a validez postal.
- Cambios de arquitectura mayor en identidad/autenticacion del usuario.

## Dudas abiertas

- Cual es la URL final del Figma y que estados exactos del paso direccion estan ya aprobados vs pendientes?
- Que paises y formatos postales deben estar soportados en la primera entrega?
- La validacion de entregabilidad (zona servida/no servida) sera en tiempo real o por tabla cacheada diaria?
- Existe politica aprobada de fallback para permitir continuar a pago ante `ERROR_TECNICO`, o debe ser siempre bloqueante?
- Que metrica exacta de abandono actual en direccion se toma como baseline (fuente, periodo, segmentos)?
- Se requiere autocompletado por proveedor externo (ej. direcciones sugeridas) en esta fase o queda fuera?
- Cual es el propietario de negocio para aprobacion final de mensajes de error y reglas de bloqueo?
- Se debe permitir direccion manual excepcional para ciertos tipos de envio/logistica?
- COM-2419 depende de otros tickets tecnicos (API, analitica, QA automation) aun no referenciados?

## Checklist de validacion

- [x] El alcance esta claramente delimitado.
- [x] Cada historia tiene criterios de aceptacion verificables.
- [x] Se cubren happy path y casos borde relevantes.
- [x] Hay trazabilidad con epica y tickets.
- [x] Requisitos no funcionales definidos y medibles.
