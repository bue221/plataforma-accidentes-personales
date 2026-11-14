# ADR-0001: Stack tecnológico y arquitectura hexagonal

- **Estado:** Aceptado
- **Fecha:** 2026-11-13

## Contexto

Se requiere construir un MVP web para registro y consulta de accidentes personales con separación clara de responsabilidades, validación estricta en servidor, pruebas unitarias sin infraestructura y pruebas de integración contra PostgreSQL real.

## Decisión

1. **Monorepo con npm workspaces** (`apps/api` y `apps/web`) para compartir tooling (ESLint, Prettier, TypeScript, Husky, commitlint) y facilitar el despliegue unificado.
2. **Backend en Node.js + TypeScript + Fastify** estructurado bajo **arquitectura hexagonal** (`domain/`, `application/`, `infrastructure/`, `main.ts`), validada automáticamente con `dependency-cruiser` (`npm run arch:check`).
3. **Validación con Zod únicamente en los bordes** (`infrastructure/http` e `infrastructure/config`); el dominio permanece libre de librerías externas.
4. **PostgreSQL 16** vía `pg` y migraciones SQL explícitas con `node-pg-migrate` (sin ORM pesado para mantener consultas SQL auditables, especialmente filtros de ownership `WHERE id = $1 AND user_id = $2`).
5. **Frontend en Vite + React + TypeScript**, servido en producción/build desde el mismo origen por Fastify para simplificar cookies `httpOnly` (`SameSite=Strict`) sin CORS complejo.

## Consecuencias

- Las reglas de negocio y transiciones de estado se prueban en milisegundos sin BD ni HTTP.
- Cualquier acoplamiento indebido hacia `infrastructure/` o librerías externas desde `domain/` o `application/` rompe `npm run arch:check` en local y en CI.
