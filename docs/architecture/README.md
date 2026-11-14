# Arquitectura

> Visión planificada. Las decisiones puntuales se registran como ADR en [`../adr/`](../adr/) y en el [decision log](../decisions/decision-log.md). El documento de arquitectura de BMAD (`bmad-architecture`) debe ser coherente con este y con los lineamientos de `docs/_private/` (que prevalecen).

## Vista general

```
 Navegador (React SPA, mismo origen)
        │  cookie httpOnly (JWT)
        ▼
 ┌──────────────────────── apps/api (Fastify) ────────────────────────┐
 │ infrastructure/http   → rutas, auth plugin, Zod, mapeo de errores  │
 │        │ llama                                                     │
 │ application/use-cases → orquestan; dependen de ports (interfaces)  │
 │        │ usa                                                       │
 │ domain/               → entidades, value objects, reglas, errores  │
 │                                                                    │
 │ infrastructure/persistence/postgres, security, config → implementan│
 │ los ports; main.ts los cablea (composition root)                   │
 └────────────────────────────────────────────────────────────────────┘
        │ pg (SQL parametrizado)
        ▼
   PostgreSQL 16 (accidentes / accidentes_test)
```

Fastify también sirve el build estático de `apps/web` (mismo origen ⇒ cookie `SameSite=Strict` sin CORS).

## Capas y reglas de dependencia

| Capa              | Responsabilidad                                                                                                                          | Puede depender de                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `domain/`         | `Accident`, `AccidentStatus` (máquina de estados), `User`, `Role`, value objects (email, documento, fecha no futura), errores de dominio | nada externo                         |
| `application/`    | Casos de uso y `ports/`                                                                                                                  | `domain/`                            |
| `infrastructure/` | Adaptadores HTTP, Postgres, seguridad, config, logging                                                                                   | `application/`, `domain/`, librerías |
| `main.ts`         | Composition root                                                                                                                         | todo                                 |

Reglas verificadas por dependency-cruiser (`npm run arch:check`, configuración en `apps/api/.dependency-cruiser.cjs`).

## Casos de uso planificados

| Caso de uso                  | Actor     | Ports                                                          |
| ---------------------------- | --------- | -------------------------------------------------------------- |
| `RegisterUser`               | visitante | `UserRepository`, `PasswordHasher`, `IdGenerator`, `Clock`     |
| `AuthenticateUser`           | visitante | `UserRepository`, `PasswordHasher`, `TokenService`             |
| `GetCurrentUser`             | usuario   | `UserRepository`                                               |
| `RegisterAccident`           | usuario   | `AccidentRepository`, `UserRepository`, `IdGenerator`, `Clock` |
| `ListMyAccidents`            | usuario   | `AccidentRepository`                                           |
| `GetMyAccident`              | usuario   | `AccidentRepository`                                           |
| `ListAccidentsGroupedByUser` | admin     | `AccidentRepository`                                           |
| `ChangeAccidentStatus`       | admin     | `AccidentRepository`, `Clock`                                  |
| `SeedAdmin` (script)         | operador  | `UserRepository`, `PasswordHasher`                             |

## Ports y adaptadores planificados

| Port (`application/ports/`)                                                                                    | Adaptador (`infrastructure/`)                     |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `AccidentRepository` (`findByIdForOwner(id, ownerId)`, `listByOwner(ownerId)`, `save`, `listAllGroupedByUser`) | `persistence/postgres/PostgresAccidentRepository` |
| `UserRepository`                                                                                               | `persistence/postgres/PostgresUserRepository`     |
| `PasswordHasher`                                                                                               | `security/BcryptPasswordHasher` (o Argon2)        |
| `TokenService` (emitir/verificar JWT)                                                                          | `security/JwtTokenService`                        |
| `Clock`, `IdGenerator`                                                                                         | `SystemClock`, `CryptoIdGenerator`                |

`findByIdForOwner` hace explícito en la firma que no existe lectura de accidentes sin dueño para usuarios normales.

## Flujo de autenticación y autorización

1. **Signup:** Zod valida → `RegisterUser` → hash de contraseña → usuario con rol `USER` (el rol del cliente se ignora).
2. **Login:** `AuthenticateUser` verifica el hash → `TokenService` firma JWT `{ sub: userId, role }` con expiración corta → `Set-Cookie: <name>=<jwt>; HttpOnly; SameSite=Strict; Path=/; Secure (prod)`.
3. **Request autenticada:** plugin de auth en `http/` lee la cookie, verifica firma y expiración, y adjunta `request.auth = { userId, role }`. Sin cookie válida ⇒ 401.
4. **Autorización:** el controlador pasa `actorId` (del token) al caso de uso; nunca un id del cliente. Rutas `/api/admin/*` exigen `role === 'ADMIN'` ⇒ si no, 403.
5. **Ownership:** el repositorio consulta `WHERE id = $1 AND user_id = $2`; sin fila ⇒ error de dominio `AccidentNotFound` ⇒ 404.
6. **Logout:** borra la cookie. Limitación: el JWT sigue válido hasta expirar (ver [known-limitations](../known-limitations.md)).

CSRF: mitigado por `SameSite=Strict`, mismo origen y API solo JSON.

## Configuración

Variables validadas con Zod en `infrastructure/config` al arrancar (fallo rápido si faltan). Existentes en `.env.example`: `NODE_ENV`, `HOST`, `PORT`, `LOG_LEVEL`, `DB_*`, `VITE_API_BASE_URL`. Previstas para auth/seed (a añadir por la historia correspondiente): secreto de firma JWT, expiración del JWT, credenciales del admin de seed. Solo `VITE_*` llega al bundle del navegador.

## Manejo de errores

- Dominio: errores tipados (`ValidationError`, `AccidentNotFound`, `InvalidStatusTransition`, `Forbidden`...).
- `http/`: un único error handler los mapea a 400/401/403/404/409 con cuerpo `{ error: { code, message, details? } }`; errores inesperados ⇒ 500 genérico, detalle solo en logs (sin secretos ni datos personales).

## Grafo de dependencias

```bash
npm run arch:check   # falla si se viola una regla de dependencia
npm run arch:graph   # genera docs/architecture/dependency-graph.mmd (Mermaid)
```

Adjunta el grafo actualizado en los PRs que cambien la estructura de `apps/api/src`.

## Fuentes y plantillas

Toda plantilla o componente público usado se identifica aquí (o en un ADR) con: fuente, motivo de elección y adaptaciones realizadas.

| Fuente                                      | Uso | Justificación | Adaptaciones |
| ------------------------------------------- | --- | ------------- | ------------ |
| _pendiente de completar por el scaffolding_ |     |               |              |
