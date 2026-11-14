#!/usr/bin/env bash
# Shared helpers for Cursor hooks. Compatible with macOS bash 3.2.

# json_field <json> <key>: prints a top-level string/number field ("" if absent).
json_field() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$1" | jq -r --arg k "$2" '.[$k] // empty | tostring' 2>/dev/null
  elif command -v python3 >/dev/null 2>&1; then
    printf '%s' "$1" | python3 -c 'import json,sys
try:
    v = json.load(sys.stdin).get(sys.argv[1], "")
    print("" if v is None else v)
except Exception:
    pass' "$2" 2>/dev/null
  else
    return 1
  fi
}

json_available() {
  command -v jq >/dev/null 2>&1 || command -v python3 >/dev/null 2>&1
}

# emit_json <key> <value> [<key> <value> ...]: prints a flat JSON object of strings.
emit_json() {
  if command -v jq >/dev/null 2>&1; then
    local args=() filter="{}" i=0
    while [ $# -ge 2 ]; do
      args+=(--arg "k$i" "$1" --arg "v$i" "$2")
      filter="$filter + {(\$k$i): \$v$i}"
      i=$((i + 1))
      shift 2
    done
    jq -cn "${args[@]}" "$filter"
  else
    python3 -c 'import json,sys
a = sys.argv[1:]
print(json.dumps(dict(zip(a[::2], a[1::2]))))' "$@"
  fi
}

# is_env_file <path>: true for real dotenv files (.env, .env.local, .env.*),
# false for committed templates (.env.example, .env.sample, .env.template, .env.dist).
is_env_file() {
  local base="${1##*/}"
  case "$base" in
    *.example | *.sample | *.template | *.dist) return 1 ;;
    .env | .env.* | .env\* | .env\?*) return 0 ;;
  esac
  return 1
}
