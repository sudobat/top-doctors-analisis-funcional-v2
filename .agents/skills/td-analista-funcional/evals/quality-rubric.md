# Rubrica de calidad - td-analista-funcional

Usa esta rubrica para evaluar cada salida del skill en cada iteracion.

## Escala de puntuacion (por criterio)

- `0` = No cumple.
- `1` = Cumple parcialmente o de forma vaga.
- `2` = Cumple de forma correcta y verificable.

Puntuacion maxima total: `24` puntos.

## Criterios

1. **Estructura exacta de plantilla (0-2)**
   - 2: Respeta todos los bloques y orden de la plantilla.
   - 1: Faltan bloques menores o hay cambios de orden.
   - 0: No sigue la plantilla.

2. **Idioma y claridad (0-2)**
   - 2: Espanol claro, preciso, sin ambiguedades.
   - 1: Comprensible pero con vaguedades.
   - 0: Confuso o en idioma incorrecto.

3. **Clasificacion correcta nueva vs mejora (0-2)**
   - 2: Clasifica correctamente y adapta el enfoque.
   - 1: Clasifica pero no adapta suficiente.
   - 0: Omite o confunde el tipo.

4. **Uso de contexto previo (0-2)**
   - 2: Integra enlaces/pantallas/docs/restricciones en el analisis.
   - 1: Menciona contexto sin usarlo realmente.
   - 0: Ignora el contexto previo.

5. **Tratamiento de disenos/prototipos (0-2)**
   - 2: Usa disenos como input funcional clave o explicita su ausencia.
   - 1: Los menciona de forma superficial.
   - 0: No los contempla.

6. **Detalle de solucion (0-2)**
   - 2: Bajo nivel real: reglas, validaciones, estados, transiciones y comportamiento por caso.
   - 1: Mezcla detalle con descripcion alta.
   - 0: Mayoritariamente alto nivel.

7. **Calidad de historias funcionales (0-2)**
   - 2: Historias completas con precondiciones, descripcion funcional y casuistica.
   - 1: Historias incompletas o poco concretas.
   - 0: Historias ausentes o deficientes.

8. **Criterios de aceptacion verificables (0-2)**
   - 2: Criterios testeables, concretos y sin ambiguedad.
   - 1: Algunos criterios vagos/no medibles.
   - 0: Criterios no verificables.

9. **Cobertura de casos borde y errores (0-2)**
   - 2: Incluye excepciones, fallos y recuperacion con comportamientos esperados.
   - 1: Cobertura parcial.
   - 0: Sin cobertura de borde/error.

10. **Requisitos no funcionales medibles (0-2)**
    - 2: NFR concretos (SLA, seguridad, observabilidad, compatibilidad) con datos o umbrales.
    - 1: NFR presentes pero genericos.
    - 0: NFR ausentes.

11. **Supuestos/dependencias/riesgos utiles (0-2)**
    - 2: Elementos accionables, concretos y relevantes.
    - 1: Lista superficial.
    - 0: Ausente o irrelevante.

12. **Calidad del borrador para validacion (0-2)**
    - 2: Incluye dudas abiertas reales y proximos pasos claros.
    - 1: Dudas abiertas poco accionables.
    - 0: Presenta salida cerrada sin huecos explicitados.

## Umbrales de decision por iteracion

- `22-24`: Excelente, lista para pasar a version final tras ajustes menores.
- `18-21`: Buena, requiere mejoras puntuales.
- `14-17`: Insuficiente para uso operativo; iterar.
- `<14`: Replantear instrucciones del skill y test cases.

## Formato sugerido de registro por evaluacion

```json
{
  "run_id": "eval-1-with_skill",
  "score_total": 20,
  "max_score": 24,
  "criteria": [
    {
      "name": "Estructura exacta de plantilla",
      "score": 2,
      "evidence": "Secciones y orden respetados."
    }
  ],
  "summary": "Buena calidad general, faltan mas casos borde en historia 2."
}
```
