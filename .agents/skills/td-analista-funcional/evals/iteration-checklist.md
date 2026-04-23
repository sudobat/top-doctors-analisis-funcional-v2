# Checklist de evaluacion iterativa

Usa este checklist en cada ciclo de mejora del skill.

## 1) Preparar la iteracion

- [ ] Confirmar que `evals/evals.json` sigue representando casos reales.
- [ ] Si hay nuevos escenarios frecuentes, anadir al menos 1 eval nuevo.
- [ ] Definir version de skill evaluada (ej: `v0.2`).

## 2) Ejecutar pruebas

- [ ] Ejecutar cada prompt de `evals.json` con el skill.
- [ ] (Opcional recomendado) Ejecutar baseline sin skill para comparar.
- [ ] Guardar salidas por carpeta: `iteration-N/eval-X/with_skill/outputs/`.

## 3) Evaluar calidad con rubrica

- [ ] Aplicar `evals/quality-rubric.md` a cada salida.
- [ ] Registrar evidencia concreta por criterio.
- [ ] Calcular score por evaluacion y promedio global.

## 4) Analizar gaps

- [ ] Detectar criterios con peor puntuacion recurrente.
- [ ] Identificar si el fallo es de:
  - [ ] Triggering (el skill no se activa o no se sigue)
  - [ ] Instrucciones (falta de claridad/orden)
  - [ ] Cobertura de casos (faltan prompts representativos)

## 5) Mejorar skill

- [ ] Ajustar `SKILL.md` explicando el "por que" de cada instruccion clave.
- [ ] Evitar sobreajuste a un caso concreto.
- [ ] Repetir evaluacion completa en nueva iteracion.

## 6) Criterio de salida

- [ ] Promedio >= 22/24 en dos iteraciones consecutivas.
- [ ] Sin fallos criticos en:
  - [ ] estructura exacta de plantilla
  - [ ] detalle de solucion
  - [ ] criterios verificables
  - [ ] dudas abiertas accionables

## Log recomendado (manual o automatico)

Guarda un resumen por iteracion en `evals/history/iteration-N-summary.md` con:

- Cambios realizados en el skill.
- Scores por eval.
- Criterios mas debiles.
- Decisiones para siguiente iteracion.
