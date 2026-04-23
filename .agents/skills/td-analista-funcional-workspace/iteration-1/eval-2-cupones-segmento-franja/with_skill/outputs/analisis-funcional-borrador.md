# Mejora del panel de administracion de cupones con segmentacion y franja horaria

## Descripcion funcional

### Metadatos

- Fecha de creacion: 2026-04-23
- Responsable negocio: Por definir (Equipo Comercial / Growth)
- Responsable funcional: Por definir (Producto)
- PO: Por definir
- Responsable UX: Por definir
- Prioridad (Q): Alta
- Tipo: Mejora
- Trimestre objetivo: Q3

### Descripcion general de la funcionalidad

El panel actual de cupones permite configurar reglas base (por ejemplo vigencia general, limites de uso y restricciones heredadas), pero no permite acotar de forma nativa el uso por segmento de usuario ni por franja horaria. Esto genera descuentos no controlados, alta carga operativa para soporte/comercial y dificultad para ejecutar campanas dirigidas con precision.

El objetivo de negocio es habilitar una configuracion robusta de reglas de elegibilidad que permita:
- limitar un cupon a uno o varios segmentos de clientes;
- limitar un cupon a ventanas horarias especificas por dia;
- definir como conviven estas reglas con las restricciones heredadas;
- disponer de mensajes claros de rechazo y trazabilidad para operacion y auditoria.

El valor esperado es aumentar control de margenes, reducir incidencias por aplicacion incorrecta de cupones y mejorar la capacidad de experimentar promociones dirigidas sin intervencion manual en cada campana.

Alcance principal de este borrador:
- extension del backoffice de cupones para configurar segmentacion y franjas horarias;
- evaluacion de elegibilidad en el momento de aplicar cupon;
- resolucion de conflictos con reglas heredadas;
- auditoria minima de decisiones de aplicacion/rechazo;
- propuesta de migracion controlada para cupones existentes.

### Prototipo funcional

- URL prototipo/diseno: No disponible (solo capturas de pantallas actuales; diseno final pendiente)
- Referencias adicionales:
  - Capturas del panel actual de cupones (pendiente de adjuntar en repositorio documental)
  - Reglas heredadas vigentes en produccion (pendiente de inventario detallado por negocio y tecnologia)

### Relacion con epica/iniciativa

- Epica: Pendiente de alta (propuesta: EPICA-COMM-COUPON-RULES)
- Tickets relacionados: Pendiente (propuestos: COUPON-201, COUPON-202, COUPON-203)

## Historias funcionales

### Historia 1: Configuracion de segmentacion y franjas horarias en backoffice

**Como** administrador comercial  
**Quiero** configurar para cada cupon los segmentos habilitados y las ventanas horarias permitidas  
**Para** controlar con precision quienes pueden usar el descuento y en que momento

**Precondiciones**

- El usuario tiene permiso de edicion de cupones en backoffice.
- Existe catalogo de segmentos disponible para consulta desde el panel.
- El cupon esta en estado editable (borrador o activo editable segun politica interna).

**Descripcion**

- En la ficha de cupon se agrega un bloque "Elegibilidad avanzada" con dos subbloques: "Segmentacion" y "Franja horaria".
- Segmentacion:
  - Selector multivalor de segmentos activos.
  - Opcion explicita "Sin restriccion por segmento" (valor por defecto para cupones existentes).
  - Validacion: no se permite guardar estado "restriccion por segmento activa" con lista vacia.
- Franja horaria:
  - Configuracion por dia de semana (L-D) con una o varias ventanas por dia.
  - Cada ventana define hora inicio y hora fin en zona horaria de negocio.
  - Validacion: no se permiten solapes en ventanas del mismo dia para un mismo cupon.
  - Validacion: no se permite hora inicio igual o posterior a hora fin.
  - Opcion "Sin restriccion horaria" (valor por defecto para cupones existentes).
- Reglas heredadas:
  - Se muestra un resumen solo lectura de restricciones heredadas aplicables al cupon.
  - Se agrega nota de prioridad de evaluacion: "Las reglas heredadas bloqueantes siempre prevalecen".
- Guardado y versionado:
  - Cada cambio en elegibilidad avanzada incrementa version de regla del cupon.
  - Se registra actor, timestamp, diff de campos y motivo de cambio (campo de texto opcional recomendado).
- Publicacion:
  - Si el cupon esta activo, un cambio en reglas entra en vigor inmediatamente tras guardar.
  - Se recomienda advertencia de impacto antes de confirmar cambios en cupon activo.

**Criterios de aceptacion**

- [ ] Dado un administrador con permisos, cuando habilita restriccion por segmento y selecciona segmentos validos, entonces el sistema guarda la configuracion y la refleja en la vista resumen del cupon.
- [ ] Dado un administrador, cuando carga dos franjas solapadas en un mismo dia, entonces el sistema bloquea el guardado y muestra mensaje de validacion indicando el conflicto exacto.
- [ ] Dado un cupon activo, cuando se modifica la elegibilidad avanzada, entonces se registra nueva version de regla con actor, fecha/hora y campos modificados.
- [ ] Dado un cupon sin restricciones previas, cuando no se activa segmentacion ni franja horaria, entonces el comportamiento permanece equivalente al estado actual (compatibilidad hacia atras).
- [ ] Dado un administrador sin permiso de edicion, cuando intenta modificar elegibilidad avanzada, entonces solo puede visualizar y no guardar cambios.

**Diagramas / UX UI**

- Diagramas requeridos: Flujo de edicion de cupon; diagrama de estados de version de regla; matriz de validaciones de formulario.
- Interfaces/pantallas implicadas: Pantalla de detalle de cupon, modal de confirmacion de cambios en cupon activo, tabla historial de cambios.
- Notas UX/UI: Mostrar ayudas contextuales sobre prioridad de reglas; validar en linea campos de hora; incluir mensajes de error accionables y consistentes.

### Historia 2: Evaluacion de elegibilidad al aplicar cupon en canal de compra

**Como** sistema de checkout/promociones  
**Quiero** evaluar en tiempo real si un cupon cumple segmento, franja horaria y reglas heredadas  
**Para** aceptar o rechazar el descuento de forma determinista y trazable

**Precondiciones**

- El cupon existe y esta activo en el entorno correspondiente.
- El usuario de compra tiene contexto de segmento resoluble (directo o derivado).
- El servicio de promociones recibe timestamp de solicitud y zona horaria de referencia definida.

**Descripcion**

- Orden de evaluacion propuesto:
  - Validaciones heredadas bloqueantes (vigencia, estado, limites globales, etc.).
  - Validacion de segmento.
  - Validacion de franja horaria.
  - Validaciones heredadas no bloqueantes o complementarias (si aplica).
- Regla de segmento:
  - Si el cupon no tiene restriccion por segmento, pasa automaticamente.
  - Si tiene restriccion, el segmento efectivo del usuario debe pertenecer al set habilitado.
  - Si no se puede resolver segmento por error tecnico, resultado configurable: "rechazo seguro" (default) o "fallback controlado" (pendiente definicion).
- Regla de franja horaria:
  - Se evalua contra dia/hora efectiva segun zona horaria configurada para la operacion.
  - Si no hay restriccion horaria, pasa automaticamente.
  - Si hay restriccion, al menos una ventana del dia debe contener el timestamp (inclusive inicio, exclusivo fin; pendiente confirmacion).
- Resultado:
  - Si alguna validacion falla, se devuelve estado `REJECTED` con codigo de motivo canónico.
  - Si todas pasan, se devuelve estado `ACCEPTED` con referencia de version de regla evaluada.
- Codigos de rechazo minimos:
  - `COUPON_SEGMENT_NOT_ALLOWED`
  - `COUPON_OUTSIDE_ALLOWED_TIME_WINDOW`
  - `COUPON_LEGACY_RULE_BLOCKED`
  - `COUPON_SEGMENT_UNRESOLVED`
- Mensajeria:
  - Mensaje para usuario final (amigable) desacoplado del codigo tecnico.
  - Mensaje para soporte/backoffice con detalle de validacion fallida y datos de contexto.

**Criterios de aceptacion**

- [ ] Dado un usuario cuyo segmento no esta permitido, cuando intenta aplicar el cupon, entonces la respuesta es `REJECTED` con codigo `COUPON_SEGMENT_NOT_ALLOWED` y sin aplicar descuento.
- [ ] Dado un usuario permitido fuera de franja, cuando intenta aplicar el cupon, entonces la respuesta es `REJECTED` con codigo `COUPON_OUTSIDE_ALLOWED_TIME_WINDOW`.
- [ ] Dado un usuario permitido dentro de franja y sin bloqueos heredados, cuando aplica el cupon, entonces la respuesta es `ACCEPTED` y registra la version de regla evaluada.
- [ ] Dado un error de resolucion de segmento, cuando se evalua el cupon, entonces el sistema aplica la politica definida (rechazo seguro por defecto) y genera evento de observabilidad.
- [ ] Dado un cupon sin segmentacion ni franja configuradas, cuando se aplica en condiciones validas actuales, entonces el resultado coincide con el motor existente.

**Diagramas / UX UI**

- Diagramas requeridos: Secuencia de evaluacion de reglas; tabla de decision (decision table) con combinaciones de resultado; mapa de codigos de rechazo.
- Interfaces/pantallas implicadas: Checkout/campo cupon, mensajes de error frontend, endpoint de validacion de promociones.
- Notas UX/UI: Mensajes de rechazo no deben exponer logica sensible; usar textos consistentes por canal web/app y conservar accesibilidad.

### Historia 3: Operacion, auditoria y gestion de casuistica heredada

**Como** equipo de operaciones/comercial/soporte  
**Quiero** visibilidad del motivo de aceptacion o rechazo y herramientas para gestionar reglas heredadas  
**Para** reducir tiempos de diagnostico y evitar conflictos entre reglas nuevas y antiguas

**Precondiciones**

- Existe almacenamiento de trazas de evaluacion por intento de uso de cupon.
- El panel de backoffice tiene seccion de historial o auditoria disponible (nueva o reutilizada).
- Se dispone de inventario inicial de reglas heredadas por tipo de cupon (aunque sea parcial).

**Descripcion**

- Auditoria de evaluacion:
  - Registrar por intento: `coupon_id`, `rule_version`, `timestamp`, `timezone`, `segmento_resuelto`, resultado, codigo motivo y canal.
  - Retencion minima propuesta para soporte operativo (pendiente politica final).
- Vista de diagnostico:
  - En detalle de cupon, agregar pestaña "Diagnostico" con ultimos rechazos agregados por codigo.
  - Filtro por rango temporal y canal para identificar patrones.
- Gestion de reglas heredadas:
  - Crear matriz de precedencia documentada (nueva regla vs regla heredada).
  - Marcar reglas heredadas deprecadas con fecha objetivo de retiro.
  - Alertar en UI cuando una configuracion nueva quede potencialmente anulada por regla heredada.
- Modo simulacion (recomendado en fase 1.5 o 2):
  - Permitir test interno con usuario/segmento/hora simulados sin impacto real de descuento.
  - Mostrar resultado paso a paso de evaluacion para validacion funcional y QA.
- Operacion segura:
  - Rollout progresivo por bandera para motor de elegibilidad avanzada.
  - Plan de rollback: desactivar segmentacion/franja y volver a evaluacion previa sin perder datos historicos.

**Criterios de aceptacion**

- [ ] Dado un rechazo de cupon, cuando soporte consulta el detalle, entonces puede ver codigo de motivo, version de regla y contexto minimo para diagnostico.
- [ ] Dado un cupon con regla heredada bloqueante, cuando comercial configura segmentacion/franja compatible, entonces el panel muestra advertencia de precedencia antes de guardar.
- [ ] Dado un despliegue con bandera activa para subset de trafico, cuando se detecta incremento anomalo de rechazos tecnicos, entonces existe procedimiento de rollback operativo definido y ejecutable.
- [ ] Dado un intento de prueba interna en modo simulacion (si se implementa), cuando se ingresan segmento y hora, entonces el sistema devuelve trazabilidad de cada paso de evaluacion.
- [ ] Dado un cambio de regla en cupon activo, cuando auditoria revisa historial, entonces encuentra registro completo de quien cambio, que cambio y cuando.

**Diagramas / UX UI**

- Diagramas requeridos: Matriz de precedencia de reglas; flujo de diagnostico para soporte; flujo de rollback operativo.
- Interfaces/pantallas implicadas: Backoffice detalle de cupon (historial/diagnostico), consola de monitoreo/alertas, utilitario de simulacion (si aplica).
- Notas UX/UI: Priorizar legibilidad de codigos de rechazo con traduccion a lenguaje de negocio; incluir tooltips de precedencia y estados de deprecacion.

## Requisitos no funcionales

- Rendimiento: Validacion de cupon en checkout con p95 <= 200 ms en condiciones nominales; p99 <= 400 ms; soportar picos de 10x del trafico medio de cupones sin degradacion critica.
- Seguridad y privacidad: Control de acceso por rol para editar reglas; trazabilidad inmutable de cambios; evitar exponer datos sensibles de segmentacion en mensajes al cliente final.
- Disponibilidad: Si falla el modulo nuevo de segmentacion/franja, aplicar politica fail-safe definida (rechazo seguro por defecto, pendiente confirmacion) y registrar incidente; contemplar circuito de degradacion controlada.
- Observabilidad: Emitir eventos de evaluacion (`coupon_rule_evaluated`, `coupon_rule_rejected`, `coupon_rule_accepted`), metricas por codigo de rechazo, alertas por tasa anomala de `COUPON_SEGMENT_UNRESOLVED`.
- Compatibilidad: Consistencia funcional entre web y app; compatibilidad de panel en navegadores corporativos soportados (Chrome y Edge versiones vigentes); mantener comportamiento legacy para cupones no migrados.

## Supuestos, dependencias y riesgos

- Supuestos:
  - Existe o puede crearse una fuente confiable para resolver segmento de usuario en tiempo de validacion.
  - Las capturas actuales representan de forma suficiente el flujo AS-IS para iniciar borrador aunque no exista Figma final.
  - El negocio acepta un modelo de prioridad de reglas explicitamente documentado.
- Dependencias:
  - Equipo de Datos/CRM para definicion y disponibilidad del catalogo de segmentos.
  - Equipo de Backend Promociones para motor de evaluacion y versionado de reglas.
  - Equipo de Frontend Backoffice para UI de configuracion/diagnostico.
  - Equipo de Soporte/Operaciones para validar mensajes y flujo de troubleshooting.
- Riesgos:
  - Ambiguedad en reglas heredadas puede producir regresiones si no se inventarian antes del despliegue.
  - Diferencias de zona horaria entre sistemas pueden generar rechazos incorrectos en bordes de ventana.
  - Mala calidad de dato de segmento puede elevar falsos rechazos y afectar conversion.
  - Ausencia de diseno final puede introducir retrabajo en UX y validaciones de formulario.

## Fuera de alcance

- Redefinir toda la estrategia comercial de cupones o el modelo de descuentos de la compania.
- Construir un motor de segmentacion nuevo desde cero (se asume fuente externa o existente).
- Cambiar el proceso de liquidacion/contabilidad post-venta asociado a descuentos.
- Implementar personalizacion de mensajes por pais/idioma mas alla del set minimo inicial.

## Dudas abiertas

- Cual es la definicion oficial de "segmento efectivo" cuando un usuario pertenece a multiples segmentos simultaneos?
- Cual es la zona horaria canonica para evaluar franjas: pais del negocio, pais del usuario o zona por cupon?
- Los limites de franja aplican solo por dia de semana o tambien por fechas especiales/feriados?
- La evaluacion de borde en hora fin debe ser exclusiva o inclusiva?
- Cual es la politica final ante fallo en resolucion de segmento: rechazo seguro obligatorio o fallback configurable?
- Que reglas heredadas son bloqueantes y cuales informativas? Existe inventario validado?
- Se requiere aprobacion adicional (4 ojos) para cambios en cupones activos de alta sensibilidad?
- Cual es el volumen esperado de cupones y validaciones para dimensionar SLAs reales?
- Habra entorno de simulacion para negocio/soporte previo a salida productiva?
- Que taxonomia final de codigos de rechazo y mensajes de negocio aprueba CX/Soporte?

## Checklist de validacion

- [x] El alcance esta claramente delimitado.
- [x] Cada historia tiene criterios de aceptacion verificables.
- [x] Se cubren happy path y casos borde relevantes.
- [ ] Hay trazabilidad con epica y tickets.
- [x] Requisitos no funcionales definidos y medibles.
