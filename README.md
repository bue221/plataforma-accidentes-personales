# Plataforma de Accidentes Personales (MVP)

MVP web para el **registro y seguimiento de accidentes personales**. Un usuario puede crear una cuenta, iniciar sesión, registrar sus propios accidentes y consultar únicamente los suyos; un administrador puede gestionar el estado de los casos (`REGISTRADO` → `EN_REVISION` → `CERRADO`).

> **Nota:** Proyecto con fines de demostración técnica y datos exclusivamente ficticios. No es un producto de producción.

## Stack

- **Monorepo:** npm workspaces (`apps/api` y `apps/web`).
- **Backend (`@accidentes/api`):** Node.js >= 22.22, TypeScript, Fastify (arquitectura hexagonal), Zod en los bordes HTTP/config, `pg` + `node-pg-migrate`, Pino, Vitest, `dependency-cruiser`.
- **Frontend (`@accidentes/web`):** Vite, React, TypeScript. En producción/build el backend sirve los estáticos desde el mismo origen.
- **Base de datos:** PostgreSQL 16 (`docker-compose.yml`), con base de desarrollo (`accidentes`) y base de pruebas (`accidentes_test`).
- **Calidad y gobernanza:** ESLint, Prettier, Husky, commitlint (Conventional Commits), CI en GitHub Actions y flujo BMAD Method v6.12.4.

## Requisitos previos

- Node.js `>= 22.22.0` (ver `.nvmrc`) y npm `>= 10`
- Docker y Docker Compose (para PostgreSQL local)

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (valores ficticios para desarrollo local)
cp .env.example .env

# 3. Levantar PostgreSQL y ejecutar migraciones
npm run db:up
npm run db:migrate
npm run db:migrate:test

# 4. Iniciar API + Web en modo desarrollo
npm run dev
```

## Comandos principales

| Comando                    | Descripción                                              |
| -------------------------- | -------------------------------------------------------- |
| `npm run dev`              | Inicia API y Web en paralelo en modo desarrollo          |
| `npm run build`            | Compila `@accidentes/web` y `@accidentes/api`            |
| `npm start`                | Inicia la API compilada (sirve también el build del web) |
| `npm test`                 | Ejecuta pruebas unitarias y de integración               |
| `npm run test:unit`        | Ejecuta pruebas unitarias (`api` y `web`)                |
| `npm run test:integration` | Ejecuta pruebas de integración contra `accidentes_test`  |
| `npm run lint`             | Ejecuta ESLint en todo el monorepo                       |
| `npm run typecheck`        | Ejecuta `tsc` en todos los workspaces                    |
| `npm run arch:check`       | Valida las reglas de dependencias hexagonales            |
| `npm run format:check`     | Verifica formato con Prettier                            |

## Estructura del repositorio

```text
apps/api/
  src/domain/          Entidades, value objects, reglas y errores de dominio (puro)
  src/application/     Casos de uso y ports (interfaces)
  src/infrastructure/  Adaptadores HTTP, PostgreSQL, logging y configuración
  src/main.ts          Composition root
  migrations/          Migraciones SQL (node-pg-migrate)
  test/{unit,integration}/
apps/web/src/          SPA React
docs/                  Documentación técnica, ADRs, decisiones, pruebas y sesiones
```

## Documentación

- Índice general: [`docs/README.md`](./docs/README.md)
- Guía de contribución y GitFlow: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Reglas para agentes de IA: [`AGENTS.md`](./AGENTS.md)
