# Criterios de aceptación — BORRADOR

> **Estado: borrador.** Semilla para refinar con el PM de BMAD (`bmad-prd`). Los criterios definitivos viven en el PRD y en las historias de `_bmad-output/`. Formato Dado / Cuando / Entonces; cada criterio debe ser verificable por una prueba.

## F1 — Landing (RF-01)

- **AC-F1-01** Dado un visitante sin sesión, cuando abre `/`, entonces ve el propósito de la plataforma y los accesos "Registrar un accidente" e "Ingresar para consultar mis accidentes".
- **AC-F1-02** Dado un visitante sin sesión, cuando elige "Registrar un accidente", entonces se le dirige a ingresar o crear cuenta antes de ver el formulario.

## F2 — Registro de cuenta (RF-02)

- **AC-F2-01** Dado un email no registrado y datos válidos, cuando envía el signup, entonces se crea la cuenta con rol `USER` y la contraseña se guarda con hash (nunca en texto plano).
- **AC-F2-02** Dado un email ya registrado, cuando envía el signup, entonces recibe un error comprensible y no se crea un duplicado.
- **AC-F2-03** Dado un payload con `role: "ADMIN"`, cuando envía el signup, entonces el rol se ignora o rechaza y la cuenta queda como `USER`.

## F3 — Inicio y cierre de sesión (RF-03)

- **AC-F3-01** Dadas credenciales válidas, cuando inicia sesión, entonces recibe una cookie `httpOnly`, `SameSite=Strict` (y `Secure` en producción) con un JWT de expiración corta, y el token no aparece en el cuerpo de la respuesta.
- **AC-F3-02** Dadas credenciales inválidas, cuando inicia sesión, entonces recibe 401 con un mensaje genérico que no revela si el email existe.
- **AC-F3-03** Dada una sesión activa, cuando cierra sesión, entonces la cookie se elimina y las rutas privadas vuelven a responder 401.

## F4 — Registrar accidente (RF-04, RF-05, RNF-03)

- **AC-F4-01** Dado un usuario autenticado, cuando abre el formulario, entonces los datos del afectado vienen precargados desde su perfil.
- **AC-F4-02** Dado un usuario autenticado con datos válidos, cuando registra el accidente, entonces se guarda con estado `REGISTRADO`, asociado a su identidad del token, y ve una confirmación.
- **AC-F4-03** Dado un formulario sin campos obligatorios, cuando intenta enviarlo, entonces el frontend muestra errores por campo y no envía la petición.
- **AC-F4-04** Dada una petición directa al backend sin campos obligatorios o con datos inválidos (fecha futura, tipo inexistente, textos vacíos), cuando llega a `POST /api/accidents`, entonces responde 400 con detalle por campo y no persiste nada.
- **AC-F4-05** Dada una petición con `userId` o `email` de otro usuario en el cuerpo, cuando registra el accidente, entonces el dueño sigue siendo el usuario del token.
- **AC-F4-06** Dada una petición sin sesión, cuando llama a `POST /api/accidents`, entonces responde 401.

## F5 — Mis accidentes (RF-06, RNF-02)

- **AC-F5-01** Dado un usuario con accidentes, cuando abre su área privada, entonces ve solo sus accidentes con fecha y estado.
- **AC-F5-02** Dado un usuario sin accidentes, cuando abre su área privada, entonces ve un mensaje que lo invita a registrar el primero.
- **AC-F5-03** Dada una petición sin sesión, cuando llama a `GET /api/me/accidents`, entonces responde 401.

## F6 — Detalle (RF-07, RNF-02)

- **AC-F6-01** Dado un accidente propio, cuando abre su detalle, entonces ve todos sus datos y su estado actual.
- **AC-F6-02** Dado el id de un accidente de otro usuario, cuando llama a `GET /api/accidents/:id`, entonces responde 404, igual que para un id inexistente.
- **AC-F6-03** Dado un id con formato inválido, cuando llama al detalle, entonces responde 400 o 404 sin exponer errores internos.

## F7 — Estados y tablero admin (RF-08, RF-09)

- **AC-F7-01** Dado un accidente `REGISTRADO`, cuando un `ADMIN` lo pasa a `EN_REVISION`, entonces el cambio se persiste.
- **AC-F7-02** Dado un accidente `EN_REVISION`, cuando un `ADMIN` lo pasa a `CERRADO`, entonces el cambio se persiste.
- **AC-F7-03** Dado un accidente `CERRADO` o una transición que salta estados (`REGISTRADO → CERRADO`), cuando se intenta, entonces el dominio la rechaza (409 propuesto) y el estado no cambia.
- **AC-F7-04** Dado un usuario con rol `USER`, cuando llama a cualquier `/api/admin/*`, entonces responde 403; sin sesión, 401.
- **AC-F7-05** Dado un `ADMIN`, cuando abre el tablero, entonces ve los accidentes agrupados por usuario en acordeones, con solo los botones de transición válidos.
- **AC-F7-06** Dado un entorno nuevo, cuando se ejecuta el seed con `ADMIN_EMAIL`/`ADMIN_PASSWORD` del entorno, entonces existe un único admin y no hay credenciales en el código.

## F8 — Persistencia (RF-10)

- **AC-F8-01** Dado un accidente registrado, cuando se reinicia la aplicación (y el contenedor de BD), entonces el accidente sigue disponible.
- **AC-F8-02** Dada una base vacía, cuando se ejecuta `npm run db:migrate`, entonces se crean tablas, claves foráneas y restricciones `CHECK` de estados y campos obligatorios.

## F9 — Seguridad y configuración (RNF-04, RNF-05)

- **AC-F9-01** Dado el repositorio y su historial, cuando se buscan secretos, entonces no hay `.env` reales ni credenciales; solo `.env.example` ficticio.
- **AC-F9-02** Dado el build del frontend, cuando se inspecciona el bundle, entonces solo contiene variables `VITE_*` públicas.
- **AC-F9-03** Dada cualquier respuesta de la API o log, cuando se inspecciona, entonces no contiene `password_hash`, secretos ni stack traces.

## F10 — Arranque limpio (RNF-06)

- **AC-F10-01** Dado un clon nuevo, cuando se siguen solo los pasos del README (instalar, levantar BD, migrar, compilar, `npm start`), entonces se completa el flujo crear cuenta → registrar accidente → consultarlo, sin credenciales reales.
