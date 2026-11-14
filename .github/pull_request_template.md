## Resumen

Describe brevemente qué cambia este PR y a qué historia o defecto corresponde (`feature/<id>` / `BUG-NN`).

## Tipo de cambio

- [ ] `feat`: Nueva funcionalidad
- [ ] `fix`: Corrección de defecto
- [ ] `docs`: Documentación
- [ ] `refactor`: Refactorización sin cambio funcional
- [ ] `test`: Pruebas
- [ ] `chore`: Mantenimiento / configuración

## Evidencia de validación

Pega aquí la salida real de los comandos ejecutados después del último cambio:

```bash
npm run lint && npm run typecheck && npm run arch:check && npm test
```

## Checklist (Definition of Done)

- [ ] Criterios de aceptación cumplidos y verificados.
- [ ] `lint`, `typecheck`, `arch:check` y `test` en verde.
- [ ] Pruebas nuevas en la capa correcta (y regresión TDD si es un bug).
- [ ] Sin reglas de negocio en controladores; dominio sin imports externos.
- [ ] Ownership verificado en servidor (404 para recursos ajenos); sin secretos en código, logs ni respuestas.
- [ ] Documentación actualizada (`docs/api`, `docs/data-model`, `docs/testing`, `docs/decisions/`) si aplica.
- [ ] Sesión de IA exportada y saneada en `docs/ai-sessions/` (sin secretos ni datos confidenciales).
