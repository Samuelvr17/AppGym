# Pasos de QA manual

## 1. Repetir una rutina no avanza la semana
1. Crea un mesociclo con dos rutinas (por ejemplo `Upper` y `Lower`) y fija la duración en 4 semanas al guardarlas.
2. Inicia un entrenamiento de `Upper` y guárdalo.
3. Repite un segundo entrenamiento de `Upper` antes de completar `Lower`.
4. Vuelve a la lista de rutinas y verifica el badge "Semana" del mesociclo: debe seguir mostrando la misma semana en curso (no aumenta el contador de semanas completadas) y la rutina marcada como "Próxima en la secuencia" continúa siendo `Lower`.

## 2. Saltar una rutina reinicia la secuencia en el punto correcto
1. Con el mismo mesociclo, registra un entrenamiento de `Lower` inmediatamente después de `Upper`, sin haber hecho `Lower` en la semana previa.
2. Comprueba en la vista de la rutina o en la sesión de entrenamiento que la rutina esperada según la secuencia vuelve a ser `Upper` (se reinicia el orden desde el principio) y que el progreso semanal no se da por completado hasta cerrar toda la secuencia.

## 3. "Iniciar siguiente mesociclo" reinicia el cómputo
1. Una vez completadas las semanas planificadas, utiliza el botón **Iniciar siguiente mesociclo** en el detalle de la rutina y establece una nueva duración.
2. Observa que los badges de semana se reinician a "Semana 1" y que los entrenamientos anteriores dejan de contarse para el nuevo ciclo (no contribuyen a las semanas completadas ni disparan notificaciones hasta registrar un nuevo entrenamiento tras el reinicio).
