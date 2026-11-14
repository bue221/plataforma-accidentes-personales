# Guía de contribución

Este repositorio sigue **GitFlow** y **Conventional Commits**. Ningún cambio entra directamente en `main` ni en `develop`: todo se integra mediante Pull Request.

## Ramas (GitFlow)

| Rama                                     | Propósito                         | Origen    | Destino del PR       |
| ---------------------------------------- | --------------------------------- | --------- | -------------------- |
| `main`                                   | Releases estables                 | —         | —                    |
| `develop`                                | Integración continua de historias | `main`    | `release/*` → `main` |
| `feature/<story-id>-<slug>`              | Nueva funcionalidad / historia    | `develop` | `develop`            |
| `bugfix/<slug>` o `bugfix/BUG-NN-<slug>` | Corrección de defecto             | `develop` | `develop`            |
| `release/x.y.z`                          | Preparación de versión            | `develop` | `main` y `develop`   |
| `hotfix/<slug>`                          | Corrección urgente en producción  | `main`    | `main` y `develop`   |

Los hooks de Husky bloquean commits directos en `main` y `develop` (salvo el commit inicial de `main`). Nunca uses `--force` ni `git push` directo a esas ramas.

## Convención de commits

Validada automáticamente por `commitlint` (`commitlint.config.js`):

```text
type(scope): Subject
```

- **Tipos permitidos:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`, `revert`.
- **Subject:** en inglés, tiempo presente, primera letra en mayúscula y sin punto final.
- **Ejemplo:** `feat(accidents): Add accident registration use case`

## Flujo de trabajo para una historia o bug

1. Crea una rama desde `develop`:
   ```bash
   git switch develop
   git pull origin develop
   git switch -c feature/<story-id>-<slug>
   ```
2. Implementa siguiendo las reglas de arquitectura hexagonal y seguridad definidas en [`AGENTS.md`](./AGENTS.md).
3. En bugs, aplica **TDD**: primero la prueba de regresión que reproduce el fallo, luego la corrección de causa raíz y finalmente la evidencia en verde.
4. Ejecuta todas las verificaciones locales antes de abrir el PR:
   ```bash
   npm run lint && npm run typecheck && npm run arch:check && npm test
   ```
5. Actualiza la documentación pertinente (`docs/api`, `docs/data-model`, `docs/testing`, `docs/decisions/`) y exporta/sanea la sesión de IA en `docs/ai-sessions/` sin secretos.
6. Abre un Pull Request hacia `develop` completando la plantilla en `.github/pull_request_template.md` y adjuntando la salida real de las pruebas.
