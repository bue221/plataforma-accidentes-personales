# AGENTS.md — Fuente de verdad para agentes de IA

Aplica a todo agente (Cursor, Claude Code, Codex, Copilot, BMAD). Si algo aquí contradice a otra guía del repo, este archivo gana; si contradice los insumos confidenciales de la organización en `docs/_private/`, ganan esos insumos y la contradicción se registra en `docs/decisions/decision-log.md`.

## 1. Propósito

MVP web para **registro y consulta de accidentes personales**. Un usuario crea cuenta, inicia sesión, registra accidentes y consulta **solo los suyos**. Un administrador cambia el estado de los accidentes. Datos exclusivamente ficticios. Alcance: MVP funcional, no producto de producción.

## 2. Stack

- Monorepo npm workspaces: `apps/api` (`@accidentes/api`) y `apps/web` (`@accidentes/web`).
- Backend: Node.js + TypeScript + Fastify, Zod (solo en bordes), `pg` + `node-pg-migrate`, Vitest, dependency-cruiser.
- Frontend: Vite + React + TypeScript. Fastify sirve el build del web (mismo origen).
- PostgreSQL 16 vía `docker-compose.yml`; base `accidentes` y base de pruebas `accidentes_test`.
- Husky + commitlint (Conventional Commits). BMAD Method v6.12.4 (`_bmad/`, skills en `.agents/skills/`).

## 3. Mapa del repo

```
apps/api/src/domain/          Entidades, value objects, reglas y errores de dominio (puro)
apps/api/src/application/     Casos de uso + ports/ (interfaces de dependencias externas)
apps/api/src/infrastructure/  Adaptadores: http/, persistence/postgres/, security/, config/
apps/api/src/main.ts          Composition root (único lugar que cablea adaptadores)
apps/api/migrations/          Migraciones SQL (node-pg-migrate)
apps/api/test/{unit,integration}/
apps/web/src/                 SPA React
docs/                         Documentación (índice en docs/README.md); docs/adr/ = ADRs
docs/_private/                Insumos confidenciales (NO versionado)
_bmad/  _bmad-output/         Instalación BMAD y artefactos reales generados por BMAD
.cursor/                      Reglas, subagentes revisores y hooks
```

## 4. Comandos (contrato; úsalos tal cual)

`npm run dev` · `build` · `start` · `test` · `test:unit` · `test:integration` · `lint` · `typecheck` · `format` · `arch:check` · `arch:graph` · `db:up` · `db:migrate` · `db:migrate:test`

Antes de declarar cualquier tarea terminada: `npm run lint && npm run typecheck && npm run arch:check && npm test`.

## 5. Arquitectura hexagonal (reglas de dependencia)

Las dependencias apuntan **hacia el núcleo**. Lo verifica `npm run arch:check`; no se relajan sus reglas para "hacer pasar" código.

| Capa              | Puede importar                               | Prohibido                                                                  |
| ----------------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| `domain/`         | solo `domain/`                               | `node_modules` (incl. Zod, Fastify, pg), `application/`, `infrastructure/` |
| `application/`    | `domain/`, `application/`                    | `infrastructure/`, Fastify, pg, Zod, bcrypt/argon2, `process.env`          |
| `infrastructure/` | `application/` (ports), `domain/`, librerías | otros adaptadores sin pasar por ports cuando haya lógica compartida        |
| `main.ts`         | todo                                         | lógica de negocio                                                          |

```ts
// ✅ application/use-cases/register-accident.ts
import { Accident } from '../../domain/accident/accident';
import type { AccidentRepository } from '../ports/accident-repository';
// ❌ application → infraestructura o librería
import { Pool } from 'pg';
import { PostgresAccidentRepository } from '../../infrastructure/persistence/postgres/...';
// ❌ domain → librería
import { z } from 'zod';
```

- Controladores HTTP: parsean (Zod), obtienen la identidad verificada, llaman al caso de uso y mapean errores a HTTP. **Sin reglas de negocio.**
- Toda dependencia externa (BD, hash, tokens, reloj, ids) entra por un port en `application/ports/`.
- Las reglas de dominio se prueban sin BD ni HTTP.

## 6. Reglas de negocio e invariantes de seguridad (no negociables)

1. Registrar un accidente exige sesión. El dueño es **siempre** la identidad verificada en el servidor desde el token; nunca un `userId`/email del cliente (ignóralos/recházalos).
2. Supuesto vigente: el afectado es el titular de la cuenta; el formulario se precarga desde el perfil.
3. Toda lectura de accidentes filtra por dueño en la consulta: `WHERE id = $1 AND user_id = $2`. Accidente ajeno o inexistente ⇒ **404** (no 403).
4. Estados: `REGISTRADO` → `EN_REVISION` → `CERRADO`; `CERRADO` es terminal. Transiciones validadas en el **dominio**; solo rol `ADMIN` las ejecuta.
5. El rol nunca lo envía ni lo modifica el cliente. El admin se crea con un script de seed desde variables de entorno.
6. Ocultar pantallas en React **no** es autorización; el backend valida autenticación y autorización en cada endpoint.
7. Contraseñas con hash (bcrypt/argon2); nunca en texto plano, ni en logs ni respuestas.
8. Auth: JWT en cookie `httpOnly` + `SameSite=Strict` (+ `Secure` en producción), expiración corta. Logout limpia la cookie (el JWT sigue válido hasta expirar: limitación documentada).
9. Validación en frontend **y** backend; el backend es la autoridad.
10. Secretos solo por variables de entorno. `.env.example` con valores ficticios. `.env` real nunca se versiona ni se lee/imprime por agentes. Nada secreto en bundle, respuestas, errores, logs ni docs. Solo `VITE_*` (configuración pública) llega al frontend.

**Fallos eliminatorios:** secretos en el repo, acceso a accidentes ajenos, contraseñas en texto plano. Ante la duda, detente y pregunta.

## 7. Política de pruebas

| Capa               | Tipo                                                  | Dónde                            | Infra      |
| ------------------ | ----------------------------------------------------- | -------------------------------- | ---------- |
| domain             | unit                                                  | `apps/api/test/unit/domain`      | ninguna    |
| application        | unit con fakes en memoria de los ports                | `apps/api/test/unit/application` | ninguna    |
| persistence / http | integración (`fastify.inject` + BD `accidentes_test`) | `apps/api/test/integration`      | PostgreSQL |
| web                | componentes / validación de formularios               | `apps/web/src/**/*.test.tsx`     | ninguna    |

- **Bugs = TDD:** primero la prueba de regresión que falla (evidencia), luego el fix en la capa de la causa raíz, luego la prueba pasa. Prohibido el parche que oculta el síntoma.
- Nunca afirmes que una prueba pasó sin ejecutarla; pega la salida real en el PR.
- Matriz obligatoria y estado: `docs/testing/README.md`.

## 8. GitFlow y commits

- `main`: solo releases; se modifica únicamente por PR desde `release/*` o `hotfix/*`. `develop`: integración.
- Ramas: `feature/<story-id>-<slug>`, `bugfix/<slug>`, `release/x.y.z`, `hotfix/<slug>`; fase 2: `bugfix/BUG-NN-<slug>`.
- Nunca commit directo ni push a `main`/`develop`; nunca `--force`. Todo entra por PR con descripción y evidencia de validación.
- Commits en inglés, Conventional Commits: `type(scope): Subject` — tipos `feat|fix|docs|style|refactor|test|chore`; subject en presente, con mayúscula inicial, sin punto final. Ej.: `feat(accidents): Add accident registration use case`.
- Detalle paso a paso: `CONTRIBUTING.md`.

## 9. Flujo BMAD (v6.12.4)

Planificación (artefactos en `_bmad-output/planning-artifacts/`):

1. `bmad-product-brief` (analista) → brief.
2. `bmad-prd` (PM) → PRD con criterios de aceptación verificables (Dado/Cuando/Entonces), partiendo de `docs/requirements/`.
3. `bmad-ux` (ligero) → estados de carga, error, vacío y confirmación.
4. `bmad-architecture` → coherente con esta guía, `docs/architecture/` y `docs/_private/`.
5. `bmad-create-epics-and-stories`.
6. `bmad-sprint-planning` → **gate de readiness**: si falla, no se implementa.

Implementación (artefactos en `_bmad-output/implementation-artifacts/`): 7. **Un chat nuevo por historia** con `bmad-build`, en su rama `feature/<story-id>-<slug>`. 8. Revisión: `bmad-code-review` + subagentes `hexagonal-reviewer`, `security-reviewer`, `test-reviewer` → PR → aprobación humana.

Cambios de alcance: `bmad-correct-course`. Dudas sobre el siguiente paso: `bmad-help`. No escribas a mano artefactos "como si" los hubiera generado BMAD.

## 10. Supervisión

- Los agentes **proponen**, los checks automáticos (lint, typecheck, arch:check, tests, hooks) **verifican**, el humano **aprueba**.
- Toda corrección hecha a la salida de un agente se registra en `docs/decisions/agent-corrections.md`; toda decisión o supuesto, en `docs/decisions/decision-log.md`.
- Hooks activos en `.cursor/hooks.json`: bloquean push/commit en `main`/`develop`, `--force`, lectura/impresión de `.env` real y `git add` forzado; al terminar un turno con cambios de código ejecutan lint + typecheck + arch:check.

## 11. Confidencialidad

- El enunciado del caso es confidencial y el repo será público: no copies su texto, no lo cites literalmente, no nombres a la firma reclutadora ni a la organización contratante. Parafrasea.
- Insumos de la organización (MDD de agentes, contratos/contextos, lineamientos de arquitectura) viven en `docs/_private/` (gitignored). Prevalecen sobre este repo; registra cualquier contradicción.

## 12. Historial de prompts/sesiones

- Exporta la sesión de cada historia/bug a `docs/ai-sessions/` (convención en `docs/ai-sessions/README.md`) y enlázala en el PR.
- **Antes de versionar, elimina secretos**, tokens, cookies, credenciales y nombres confidenciales.

## 13. Definition of Done

- [ ] Criterios de aceptación de la historia cumplidos y verificados.
- [ ] `npm run lint && npm run typecheck && npm run arch:check && npm test` en verde (salida real en el PR).
- [ ] Pruebas nuevas en la capa correcta; en bugs, prueba de regresión que falló antes del fix.
- [ ] Sin reglas de negocio en controladores; dominio sin imports externos.
- [ ] Ownership verificado en servidor; 404 para recursos ajenos; sin secretos en código, logs ni respuestas.
- [ ] Migraciones y restricciones de BD actualizadas si cambió el modelo.
- [ ] Docs actualizadas (`docs/api`, `docs/data-model`, `docs/testing`, decision log, correcciones de agentes).
- [ ] Sesión de IA exportada y saneada; PR con plantilla completa, desde la rama correcta hacia `develop`.
