# Análisis funcional (borrador)  
## Rediseño de paso de dirección y validación postal en checkout

## 1) Contexto y problema
- En el checkout actual se detecta una tasa de abandono elevada durante el paso de dirección.
- El problema afecta a dos canales: flujo web y flujo app.
- Existe un diseño parcial en Figma para el nuevo paso de dirección.
- Existe un ticket de referencia: `COM-2419` en JIRA.
- La mejora debe concentrarse en dirección y validación postal; los métodos de pago deben mantenerse sin cambios funcionales.

## 2) Objetivo funcional
Reducir el abandono en checkout en el paso de dirección mediante una experiencia más guiada, menor fricción en la captura de datos y validación postal temprana y clara, sin modificar la lógica ni la UX de los métodos de pago.

## 3) Alcance
### En alcance
- Rediseño del paso de dirección en checkout (web y app).
- Definición de campos obligatorios/opcionales de dirección.
- Validaciones de formato y consistencia de datos de dirección.
- Validación postal (código postal y su consistencia con país/provincia/ciudad según reglas disponibles).
- Mensajería de error y ayuda contextual en tiempo real.
- Comportamiento de continuidad del checkout (guardar avance en ese paso y recuperación en caso de salida).
- Instrumentación analítica del paso para medir mejora.

### Fuera de alcance
- Cambios en métodos de pago, reglas de pago o pantallas de pago.
- Rediseño completo del checkout fuera del paso de dirección.
- Reestructuración de catálogo, carrito o promociones.
- Cambios de pricing, impuestos o lógica de envío no relacionada con validación postal.

## 4) Supuestos y restricciones
- Se reutiliza la arquitectura actual de checkout.
- El backend actual permite validar código postal o se podrá extender sin impacto en pago.
- El diseño de Figma parcial cubre estructura base; los estados faltantes (error, loading, vacíos) se completarán en esta especificación.
- Se requiere consistencia funcional entre web y app, adaptando solo patrones UI nativos cuando aplique.

## 5) Usuarios y casos de uso
### Usuario principal
- Cliente final que avanza por checkout para completar una compra/reserva.

### Casos de uso críticos
- Ingresar dirección válida y continuar a pago sin fricción.
- Corregir errores de dirección guiado por mensajes concretos.
- Reanudar checkout con datos previamente ingresados.
- Detectar y bloquear direcciones no válidas para cobertura/postal.

## 6) Propuesta funcional del nuevo paso de dirección
## 6.1 Estructura del paso
- Se mantiene el checkout secuencial actual.
- El paso de dirección se presenta en una sola pantalla con:
  - Campos de dirección.
  - Validación inline.
  - Indicadores de progreso.
  - CTA principal: “Continuar a pago”.
- El CTA permanece deshabilitado hasta cumplir validaciones mínimas obligatorias.

## 6.2 Campos de dirección (propuesta base)
- Nombre y apellidos (si no viene precargado de perfil).
- País.
- Dirección línea 1 (calle y número).
- Dirección línea 2 (opcional: piso, puerta, referencia).
- Código postal.
- Provincia/estado.
- Ciudad/municipio.
- Teléfono de contacto (si requerido por operación logística existente).

Nota: los campos exactos y obligatoriedad final deben alinearse con reglas de negocio actuales y cobertura logística por país.

## 6.3 Reglas de validación (cliente)
- Validación de requerido en campos obligatorios.
- Longitud mínima/máxima por campo.
- Restricción de caracteres inválidos (evitar símbolos no permitidos donde corresponda).
- Trim automático de espacios al inicio/fin.
- Normalización básica (por ejemplo, colapso de espacios múltiples).
- Validación en tiempo real al salir del campo (on blur) y previa al submit.

## 6.4 Validación postal (cliente + servidor)
### Objetivo
Asegurar que el código postal sea válido y consistente antes de pasar a pago.

### Reglas funcionales mínimas
- El código postal se valida por formato según país.
- Si país requiere consistencia territorial, se valida combinación:
  - País + código postal.
  - Código postal + provincia/estado.
  - Código postal + ciudad (si se dispone de catálogo/regla).
- Si la validación requiere backend:
  - Ejecutar al completar campo de código postal o al intentar continuar.
  - Mostrar estado de validación en progreso sin bloquear edición.

### Resultados de validación
- **Válido**: permitir continuar (si el resto está correcto).
- **Inválido por formato**: mensaje específico y sugerencia de formato esperado.
- **Inválido por cobertura/regla territorial**: mensaje claro (“No encontramos cobertura para este código postal” o equivalente de negocio).
- **Error técnico de validación**: mensaje recuperable y opción de reintentar.

## 6.5 Mensajería y UX de errores
- Mensajes cortos, accionables y ubicados junto al campo.
- No mostrar error “agresivo” antes de interacción del usuario con el campo.
- Al submit con errores:
  - Resumen superior opcional (“Revisa los campos marcados”).
  - Foco automático en el primer campo inválido.
- Mantener datos ingresados tras error para evitar reescritura.

## 6.6 Persistencia y recuperación
- Guardado temporal de dirección en progreso (sesión/estado local según canal).
- Si el usuario abandona y regresa:
  - Recuperar datos válidos previamente ingresados.
  - Revalidar postal si cambió contexto relevante (país/provincia/código).

## 6.7 Consistencia web vs app
- Mismas reglas funcionales y validaciones.
- Diferencias permitidas solo de patrón UI:
  - Teclado numérico para código postal/teléfono en app.
  - Selectores nativos donde aplique.
- Misma taxonomía de errores y eventos analíticos entre plataformas.

## 7) Requisitos funcionales (RF)
- **RF-01**: El sistema debe mostrar un paso de dirección unificado antes de pago.
- **RF-02**: El sistema debe validar obligatorios y formato de campos antes de permitir continuar.
- **RF-03**: El sistema debe validar código postal por país y reglas territoriales definidas.
- **RF-04**: El sistema debe impedir el paso a pago si la dirección no es válida.
- **RF-05**: El sistema debe mostrar mensajes de error claros por campo.
- **RF-06**: El sistema debe conservar datos de dirección cuando existan errores de validación.
- **RF-07**: El sistema debe recuperar datos guardados temporalmente al reingresar al checkout.
- **RF-08**: El comportamiento funcional debe ser equivalente en web y app.

## 8) Requisitos no funcionales (RNF)
- **RNF-01 Rendimiento**: Validación postal no debe degradar la experiencia; objetivo de respuesta percibida rápida (con indicador de carga si aplica).
- **RNF-02 Disponibilidad**: Si falla servicio de validación postal, el usuario debe recibir feedback claro y posibilidad de reintento.
- **RNF-03 Usabilidad**: Reducción de errores por campo y menor tiempo de completitud.
- **RNF-04 Observabilidad**: Eventos de tracking para cada punto del embudo del paso de dirección.
- **RNF-05 Accesibilidad**: Etiquetas, foco y mensajes compatibles con lectura asistida en web y patrones equivalentes en app.

## 9) Instrumentación y métricas de éxito
## 9.1 Eventos sugeridos
- `checkout_address_step_viewed`
- `checkout_address_field_completed`
- `checkout_address_field_error`
- `checkout_postal_validation_requested`
- `checkout_postal_validation_failed`
- `checkout_address_step_completed`
- `checkout_address_step_abandoned`

## 9.2 KPIs principales
- Tasa de abandono en paso de dirección (web/app).
- Tasa de error por campo (especialmente código postal).
- Tiempo medio de completitud del paso de dirección.
- Conversión de dirección completada -> inicio de pago.

## 9.3 Criterio de mejora (orientativo)
- Disminución relativa del abandono en dirección respecto a baseline actual.
- Reducción de errores de validación postal y retrabajo del usuario.

## 10) Criterios de aceptación (alto nivel)
- CA-01: Usuario con dirección válida puede continuar a pago sin bloqueos adicionales.
- CA-02: Usuario con código postal inválido recibe error específico y no puede continuar.
- CA-03: Usuario corrige error y el sistema habilita continuación en la misma sesión.
- CA-04: Al volver al checkout, los datos de dirección se recuperan según reglas de persistencia.
- CA-05: No hay cambios funcionales en pantalla ni lógica de métodos de pago.
- CA-06: Web y app pasan escenarios equivalentes de validación y éxito.

## 11) Dependencias
- Definición final de reglas postales por país/mercado activo.
- Confirmación de endpoint/servicio de validación postal (existente o nuevo).
- Completar estados de diseño faltantes en Figma (error/loading/edge cases).
- Alineación con ticket `COM-2419` para trazabilidad y priorización.

## 12) Riesgos y mitigaciones
- **Riesgo**: reglas postales incompletas por país.  
  **Mitigación**: implementar validación por capas (formato mínimo + reglas avanzadas por disponibilidad).
- **Riesgo**: latencia o caída de servicio postal.  
  **Mitigación**: reintento, timeout controlado, mensaje claro y fallback definido.
- **Riesgo**: diferencias funcionales entre web y app.  
  **Mitigación**: contrato de validaciones compartido y suite de casos de prueba comunes.
- **Riesgo**: impacto indirecto en conversión total si la validación es demasiado estricta.  
  **Mitigación**: monitorizar métricas en rollout gradual y ajustar reglas.

## 13) Plan de implementación sugerido (incremental)
1. Alinear alcance detallado con Producto, Diseño (Figma) y ticket `COM-2419`.
2. Definir contrato de validaciones de campos y postal (fuente única).
3. Implementar UI/UX del paso en web y app con paridad funcional.
4. Integrar validación postal y manejo de errores técnicos.
5. Instrumentar eventos analíticos y dashboard de seguimiento.
6. Ejecutar QA funcional, regresión de checkout y pruebas de accesibilidad.
7. Liberar de forma controlada y revisar KPIs vs baseline.

## 14) Preguntas abiertas para cerrar especificación
- ¿Qué países/mercados deben quedar soportados en esta iteración?
- ¿La validación postal requiere cobertura logística estricta o solo formato/consistencia territorial?
- ¿Qué campos son realmente obligatorios por canal y por mercado?
- ¿Cuál es la política exacta de persistencia (duración, sesión vs usuario autenticado)?
- ¿Qué estados del Figma parcial faltan por definir para desarrollo?

---
Documento borrador generado para acelerar definición funcional inicial. Requiere validación con stakeholders de Producto, Diseño, Ingeniería y Operaciones antes de pasar a especificación final.
