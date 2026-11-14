#!/usr/bin/env bash
# stop hook: when the agent finishes a turn that changed code, run lint + typecheck + arch:check
# and feed failures back as a follow-up. Skips gracefully when the toolchain is not ready.
# Loop protection: hooks.json sets loop_limit; this script also stops after MAX_LOOPS.

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib.sh
. "$HOOK_DIR/lib.sh"

MAX_LOOPS=3
CHECK_SCRIPTS="lint typecheck arch:check"
ROOT="$(cd "$HOOK_DIR/../.." && pwd)"

skip() {
  [ -n "${HOOK_DEBUG:-}" ] && echo "verify-on-stop: skipped ($1)" >&2
  printf '%s\n' '{}'
  exit 0
}

input="$(cat)"
json_available || skip "jq/python3 not available"

status="$(json_field "$input" status)"
loop_count="$(json_field "$input" loop_count)"
[ "$status" = "completed" ] || skip "status=$status"
[ "${loop_count:-0}" -lt "$MAX_LOOPS" ] 2>/dev/null || skip "loop limit reached"

cd "$ROOT" || skip "cannot cd to project root"
[ -f package.json ] || skip "no package.json yet"
[ -d node_modules ] || skip "dependencies not installed"
command -v npm >/dev/null 2>&1 || skip "npm not on PATH"

has_script() {
  if command -v jq >/dev/null 2>&1; then
    jq -e --arg s "$1" '.scripts[$s] // empty' package.json >/dev/null 2>&1
  else
    python3 -c 'import json,sys; sys.exit(0 if json.load(open("package.json")).get("scripts",{}).get(sys.argv[1]) else 1)' "$1"
  fi
}

for s in $CHECK_SCRIPTS; do
  has_script "$s" || skip "npm script '$s' not defined"
done

# Only verify when there are uncommitted changes in code/config (not docs-only turns).
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  changed="$(git status --porcelain -- apps packages package.json tsconfig*.json .dependency-cruiser* 2>/dev/null)"
  [ -n "$changed" ] || skip "no code changes"
fi

log="$(mktemp -t verify-on-stop.XXXXXX)"
trap 'rm -f "$log"' EXIT

for s in $CHECK_SCRIPTS; do
  npm run --silent "$s" >"$log" 2>&1
  code=$?
  if [ "$code" -ne 0 ]; then
    output="$(tail -n 60 "$log")"
    emit_json followup_message "Los checks automáticos fallaron en \`npm run $s\` (exit $code, intento $((loop_count + 1))/$MAX_LOOPS). Corrige la causa raíz en la capa correcta (no silencies reglas ni relajes la configuración) y vuelve a ejecutar \`npm run lint && npm run typecheck && npm run arch:check\`. Salida (últimas 60 líneas):

$output"
    exit 0
  fi
done

printf '%s\n' '{}'
exit 0
