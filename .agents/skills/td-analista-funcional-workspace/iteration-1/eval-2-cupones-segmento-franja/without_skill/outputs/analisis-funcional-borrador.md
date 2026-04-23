# Analisis funcional (borrador) - Mejora de panel de administracion de cupones

## 1. Contexto y problema

El panel de administracion de cupones permite crear y gestionar descuentos, pero actualmente no soporta dos necesidades criticas del negocio:

1. Limitar cupones por segmento de usuarios.
2. Limitar cupones por franja horaria.

Ademas, existen reglas heredadas y casuistica acumulada que hoy se resuelven de forma manual o con validaciones parciales, lo que aumenta el riesgo de errores de configuracion y de aplicacion indebida de descuentos.

No se dispone de diseno final de UI. Solo existen capturas del estado actual del panel.

## 2. Objetivo funcional

Incorporar capacidades de segmentacion y ventanas horarias en la configuracion de cupones, manteniendo compatibilidad con reglas heredadas y minimizando impactos operativos.

Objetivos concretos:

- Permitir definir a que segmentos aplica/no aplica un cupon.
- Permitir definir en que franja horaria aplica un cupon.
- Hacer explicita la precedencia entre reglas nuevas y heredadas.
- Mejorar trazabilidad para soporte y auditoria (motivo de aplicacion o rechazo de un cupon).

## 3. Alcance

### Incluido en este borrador

- Definicion funcional de nuevas condiciones de elegibilidad:
  - Segmentos.
  - Franjas horarias.
- Reglas de combinacion con condiciones existentes del cupon (vigencia, usos, etc.).
- Criterios de validacion en administracion y en checkout/aplicacion.
- Requerimientos de auditoria y observabilidad funcional.

### Fuera de alcance (por ahora)

- Diseno visual definitivo (se definira en iteracion UX/UI).
- Cambios de pricing complejos (apilamiento avanzado entre multiples cupones).
- Motor de reglas generico para todo el ecommerce (se limita a cupones).
- Migracion masiva automatica de toda casuistica historica (se define estrategia incremental).

## 4. Actores

- Administrador de marketing/comercial: crea y edita cupones.
- Operaciones/soporte: diagnostica rechazos o aplicaciones inesperadas.
- Usuario final (cliente): intenta aplicar cupon en compra.
- Sistema de checkout/backoffice: evalua reglas y decide aplicabilidad.

## 5. Supuestos de negocio

- Un usuario puede pertenecer a uno o varios segmentos.
- Segmentos disponibles provienen de una fuente ya existente (CRM/CDP o definicion interna).
- El sistema ya tiene zona horaria de referencia para transacciones (si no, se debera definir por pais/canal).
- Existen reglas heredadas con comportamiento no siempre documentado; durante implementacion se requerira inventario.

## 6. Requisitos funcionales

## RF-01 - Condicion por segmento

El administrador puede configurar restricciones por segmento en cada cupon:

- Modo inclusivo: "Aplica solo a segmentos seleccionados".
- Modo exclusivo: "No aplica a segmentos seleccionados".
- Soporte para seleccion multiple de segmentos.

Comportamiento esperado:

- Si un cupon no tiene reglas de segmento, se considera sin restriccion por segmento.
- Si tiene reglas, el sistema evalua pertenencia del usuario antes de aceptar el cupon.

## RF-02 - Condicion por franja horaria

El administrador puede definir una o varias franjas horarias de aplicacion:

- Dias de la semana (opcional).
- Hora inicio y hora fin.
- Zona horaria de evaluacion.

Comportamiento esperado:

- Si no hay franjas definidas, no hay restriccion horaria.
- Si hay franjas, al menos una debe cumplirse para aceptar el cupon.
- Debe contemplarse cruce de medianoche (ej. 22:00-02:00).

## RF-03 - Combinacion de condiciones

Para que un cupon sea aplicable, deben cumplirse todas las condiciones activas:

- Vigencia por fecha (existente).
- Limites de uso (existente).
- Restriccion por segmento (nueva).
- Restriccion por franja horaria (nueva).
- Otras reglas heredadas vigentes.

Principio base: combinacion por AND entre bloques de condicion, salvo excepciones heredadas explicitadas.

## RF-04 - Precedencia y compatibilidad con reglas heredadas

Se define precedencia funcional inicial:

1. Validaciones tecnicas basicas (cupon existe, activo, no expirado).
2. Reglas de bloqueo fuerte heredadas (si aplican).
3. Reglas nuevas de segmento y horario.
4. Reglas comerciales restantes (usos, canal, etc.).

Cuando exista conflicto entre una regla heredada y una nueva:

- Prioriza regla de bloqueo (deny) sobre regla permisiva (allow).
- El motivo del rechazo debe quedar trazado con codigo legible.

## RF-05 - Mensajeria funcional y trazabilidad

El sistema debe registrar y exponer motivo de rechazo/aplicacion:

- Motivos minimos:
  - No pertenece a segmento permitido.
  - Pertenece a segmento excluido.
  - Fuera de franja horaria.
  - Bloqueado por regla heredada.
- En panel interno debe verse historial de evaluacion por intento (al menos en logs funcionales).

## RF-06 - Edicion y seguridad de cambios

Al guardar cambios en reglas de segmento/horario:

- Validar consistencia (ej. hora inicio/hora fin, segmentos existentes).
- Registrar usuario administrador, fecha/hora y diff funcional del cambio.
- Permitir desactivar temporalmente reglas nuevas sin borrar configuracion (toggle de habilitacion).

## 7. Reglas de negocio (propuestas)

- RB-01: Un cupon sin condiciones nuevas mantiene comportamiento actual (backward compatible).
- RB-02: Si se configuran segmentos inclusivos y exclusivos simultaneamente, primero se evalua exclusion y luego inclusion.
- RB-03: Si hay multiples franjas, se aplica logica OR entre franjas (cualquier franja valida habilita).
- RB-04: Si un usuario no tiene informacion de segmento, por defecto se trata como "sin segmento" y:
  - en modo inclusivo -> rechaza;
  - en modo exclusivo -> permite (salvo otras reglas).
- RB-05: Evaluacion horaria usa zona definida en cupon; si no esta definida, usa zona por defecto del negocio.
- RB-06: Ante ambiguedad de reglas heredadas, prevalece la decision mas restrictiva hasta aclaracion.

## 8. Casuistica relevante (ejemplos)

1. Cupon "NOCHEVIP": solo segmento VIP, franja 20:00-23:59.
   - VIP a las 21:00 -> aplica.
   - No VIP a las 21:00 -> rechaza por segmento.
   - VIP a las 10:00 -> rechaza por horario.

2. Cupon "WELCOME": excluye segmento "clientes con mora", sin franja.
   - Usuario en mora -> rechaza.
   - Usuario sin mora -> aplica si cumple resto.

3. Franja cruzando medianoche (22:00-02:00):
   - 23:30 -> aplica.
   - 01:30 -> aplica.
   - 03:00 -> rechaza.

4. Usuario en multiples segmentos:
   - Si aparece en un excluido, rechaza aunque tambien este en uno permitido.

## 9. Historias de usuario (borrador)

### HU-01
Como administrador de marketing, quiero seleccionar segmentos permitidos/excluidos al crear un cupon para controlar a que audiencia aplica.

Criterios de aceptacion:

- Puedo buscar y seleccionar multiples segmentos.
- Puedo elegir modo inclusivo o exclusivo.
- El sistema evita guardar segmentos inexistentes.
- El resumen del cupon muestra claramente la regla configurada.

### HU-02
Como administrador, quiero definir franjas horarias de aplicacion para alinear promociones con ventanas comerciales.

Criterios de aceptacion:

- Puedo agregar una o varias franjas.
- El sistema valida formatos y solapamientos invalidos segun reglas definidas.
- Puedo configurar zona horaria.
- El preview funcional indica si una fecha/hora de prueba aplicaria.

### HU-03
Como agente de soporte, quiero ver por que un cupon fue rechazado para responder reclamos con evidencia.

Criterios de aceptacion:

- Cada intento registra resultado y motivo principal.
- Los motivos usan codigos estables y descripcion legible.
- Puedo filtrar por cupon, usuario y rango de fechas.

## 10. Requisitos no funcionales (minimos)

- RNF-01 (Rendimiento): evaluacion de reglas de cupon no debe degradar perceptiblemente el checkout.
- RNF-02 (Auditabilidad): todo cambio de reglas queda trazado.
- RNF-03 (Confiabilidad): fallback seguro ante falla de resolucion de segmento (politica conservadora configurable).
- RNF-04 (Mantenibilidad): reglas nuevas deben ser configurables sin deploy.
- RNF-05 (Observabilidad): metricas de rechazo por motivo para detectar configuraciones problematicas.

## 11. Riesgos y mitigaciones

- Riesgo: reglas heredadas no documentadas generan regresiones.
  - Mitigacion: inventario previo de reglas, pruebas de regresion y feature flag.

- Riesgo: conflictos entre segmentos inclusivos/exclusivos confunden a negocio.
  - Mitigacion: UI con precedencia explicita y ejemplos de resultado.

- Riesgo: errores por zona horaria.
  - Mitigacion: estandarizar timezone, mostrar conversiones y agregar tests de bordes (DST/medianoche).

- Riesgo: aumento de rechazos no esperados al activar reglas nuevas.
  - Mitigacion: activacion gradual, monitoreo diario y rollback rapido.

## 12. Dependencias

- Fuente de datos de segmentos y su latencia de actualizacion.
- Servicio de cupones/checkout que ejecuta validaciones.
- Sistema de logs/auditoria para exponer motivos.
- Definicion de politica de fallback cuando falta dato de segmento.

## 13. Preguntas abiertas

1. Cual es la lista oficial de reglas heredadas vigentes y su prioridad real?
2. La franja horaria se evalua por pais, por canal o por timezone de cuenta?
3. Se permitira exclusion e inclusion simultanea en todos los casos o se restringira?
4. Que mensaje exacto vera el usuario final al rechazo (generico vs especifico)?
5. Se requiere simulador de reglas en el panel antes de publicar?
6. Habra versionado de configuracion de cupon para auditoria legal/comercial?

## 14. Propuesta de implementacion incremental (funcional)

Fase 1 (MVP controlado):

- Alta/edicion de reglas por segmento (inclusivo/exclusivo).
- Alta/edicion de una franja horaria simple por cupon.
- Trazabilidad minima de motivo de rechazo.

Fase 2:

- Multiples franjas y dias de semana.
- Mejoras de UX en resumen y simulacion.
- Reportes de efectividad y rechazos por motivo.

Fase 3:

- Ordenamiento avanzado de reglas heredadas.
- Herramientas de depuracion operativa para soporte.

## 15. Criterios de exito

- Disminucion de incidencias por aplicacion incorrecta de cupones.
- Menor tiempo medio de soporte para explicar rechazos.
- Reduccion de configuraciones manuales fuera del panel.
- Capacidad de lanzar campañas segmentadas por horario sin cambios tecnicos ad hoc.

---

Documento borrador para refinamiento con negocio, producto, UX y equipo tecnico antes de pasar a especificacion final y estimacion.
