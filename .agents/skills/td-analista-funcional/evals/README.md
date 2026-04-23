# Kit de evaluacion del skill

Este directorio contiene herramientas para medir la calidad del skill `td-analista-funcional` en cada iteracion.

## Archivos

- `evals.json`: set inicial de casos de prueba realistas.
- `quality-rubric.md`: rubrica con 12 criterios (0-2 cada uno, max 24).
- `iteration-checklist.md`: proceso operativo para ejecutar y mejorar por iteraciones.
- `eval-metadata-template.json`: plantilla para describir una evaluacion y sus assertions.
- `scoring-template.json`: plantilla de scoring con evidencia por criterio.

## Uso recomendado rapido

1. Ejecuta los prompts de `evals.json` con la version actual del skill.
2. Evalua cada salida con `quality-rubric.md`.
3. Registra resultados con `scoring-template.json`.
4. Resume aprendizajes siguiendo `iteration-checklist.md`.
5. Repite tras cada mejora del `SKILL.md`.
