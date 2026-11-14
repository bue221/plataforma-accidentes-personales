# Decision Log

Registro de decisiones técnicas, supuestos de negocio y resolución de posibles contradicciones con insumos confidenciales en `docs/_private/`.

| Fecha      | Decisión / Supuesto                                                                | Contexto                                                       | Referencia     |
| ---------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------- |
| 2026-11-13 | El afectado es el titular de la cuenta y el formulario se precarga desde el perfil | Supuesto inicial del MVP hasta definir si se soportan terceros | `AGENTS.md` §6 |
| 2026-11-13 | Acceso a accidente ajeno o inexistente responde `404` (no `403`)                   | Evita enumeración de identificadores por usuarios autenticados | `AGENTS.md` §6 |
| 2026-11-13 | JWT en cookie `httpOnly` + `SameSite=Strict`, sin blacklist en logout              | Alcance MVP; limitación documentada en `known-limitations.md`  | `AGENTS.md` §6 |
