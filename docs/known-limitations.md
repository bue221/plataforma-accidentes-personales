# Limitaciones conocidas (MVP)

- **Logout sin revocación server-side de JWT:** Al cerrar sesión se limpia la cookie `httpOnly`, pero el token emitido sigue siendo criptográficamente válido hasta su expiración corta. En un entorno productivo se mitigaría con lista de revocación en caché/BD o rotación de refresh tokens.
- **Datos exclusivamente ficticios:** No está diseñado para datos personales reales ni cumple por sí solo con requisitos de producción (observabilidad avanzada, rate limiting distribuido, backups automatizados).
