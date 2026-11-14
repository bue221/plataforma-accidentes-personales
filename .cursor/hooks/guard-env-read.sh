#!/usr/bin/env bash
# beforeReadFile guard: keeps real dotenv files (.env, .env.local, .env.*) out of the model context.
# Templates such as .env.example remain readable.

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib.sh
. "$HOOK_DIR/lib.sh"

input="$(cat)"

if ! json_available; then
  # Cannot parse safely: deny only when the raw payload clearly targets a dotenv file.
  if printf '%s' "$input" | grep -Eq '"file_path"[[:space:]]*:[[:space:]]*"[^"]*/\.env(\.[A-Za-z0-9_-]+)?"' &&
    ! printf '%s' "$input" | grep -Eq '"file_path"[[:space:]]*:[[:space:]]*"[^"]*\.(example|sample|template|dist)"'; then
    printf '%s\n' '{"permission":"deny","user_message":"Lectura de .env bloqueada por política del proyecto."}'
  else
    printf '%s\n' '{"permission":"allow"}'
  fi
  exit 0
fi

file_path="$(json_field "$input" file_path)"

if [ -n "$file_path" ] && is_env_file "$file_path"; then
  emit_json permission deny \
    user_message "Lectura de '${file_path##*/}' bloqueada: los .env reales contienen secretos y no deben enviarse al modelo. Usa .env.example."
  exit 0
fi

emit_json permission allow
exit 0
