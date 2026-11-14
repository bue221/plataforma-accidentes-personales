# Migraciones SQL (node-pg-migrate)

Cada migración es un archivo `.sql` versionado con prefijo de timestamp, por ejemplo
`1763030000000_create-users-table.sql`, con dos secciones:

```sql
-- Up Migration
CREATE TABLE ...;

-- Down Migration
DROP TABLE ...;
```

- Aplicar sobre la base principal: `npm run db:migrate`
- Aplicar sobre la base de pruebas (`DB_NAME_TEST`): `npm run db:migrate:test`

Las tablas de negocio (usuarios, accidentes) se crean en las historias correspondientes; este
directorio arranca sin migraciones a propósito.
