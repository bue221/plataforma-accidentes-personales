#!/usr/bin/env bash
# beforeShellExecution guard (project policy, see AGENTS.md > GitFlow y secretos).
# Denies: push to main/develop, force pushes, commits on main/develop,
# `git add` of dotenv files or forced adds, and commands that print .env contents.
# Best-effort, regex/token based: Husky, branch protection and CI remain the real enforcement.

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib.sh
. "$HOOK_DIR/lib.sh"

input="$(cat)"

if ! json_available; then
  emit_json permission ask \
    user_message "guard-shell: jq/python3 no disponibles; revisa el comando manualmente." \
    agent_message "Shell guard could not parse input (missing jq/python3). Ask the human." 2>/dev/null ||
    printf '%s\n' '{"permission":"ask"}'
  exit 0
fi

command_str="$(json_field "$input" command)"
cwd="$(json_field "$input" cwd)"
[ -n "$cwd" ] && [ -d "$cwd" ] || cwd="$PWD"

PROTECTED_BRANCHES="main develop"
READERS=" cat tac less more head tail bat batcat nl grep egrep fgrep rg ag awk gawk sed strings xxd od hexdump base64 sort uniq cut tr diff cmp vi vim nvim nano pbcopy "

deny() {
  emit_json permission deny \
    user_message "Bloqueado por política del proyecto: $1" \
    agent_message "Blocked by project hook (.cursor/hooks/guard-shell.sh): $1. Follow AGENTS.md (GitFlow: feature/bugfix branch + PR; never read or print real .env files)."
  exit 0
}

is_protected() {
  local b="${1#refs/heads/}" p
  for p in $PROTECTED_BRANCHES; do
    [ "$b" = "$p" ] && return 0
  done
  return 1
}

current_branch() { git -C "$1" symbolic-ref --quiet --short HEAD 2>/dev/null; }
has_commits() { git -C "$1" rev-parse --verify --quiet HEAD >/dev/null 2>&1; }

strip_token() {
  local t="$1"
  t="${t//\"/}"
  t="${t//\'/}"
  t="${t#\$(}"
  t="${t#\`}"
  t="${t#(}"
  t="${t#<}"
  t="${t%)}"
  t="${t%\`}"
  printf '%s' "$t"
}

check_git() {
  # $@ = tokens starting after "git"
  local dir="$cwd" sub=""
  while [ $# -gt 0 ]; do
    case "$1" in
      -C) dir="$2"; shift 2 ;;
      -c) shift 2 ;;
      -*) shift ;;
      *) sub="$1"; shift; break ;;
    esac
  done
  case "$dir" in /*) ;; *) dir="$cwd/$dir" ;; esac

  case "$sub" in
    push)
      local positional=() all=0 t dest
      while [ $# -gt 0 ]; do
        t="$1"; shift
        case "$t" in
          --force | --force-with-lease* | --force-if-includes) deny "git push --force no está permitido" ;;
          --all | --mirror) all=1 ;;
          --repo | --receive-pack | --exec | -o | --push-option) shift ;;
          --*) ;;
          -*f*) deny "git push -f (force) no está permitido" ;;
          -*) ;;
          *) positional+=("$t") ;;
        esac
      done
      [ "$all" -eq 1 ] && deny "git push --all/--mirror incluye ramas protegidas (main/develop)"
      if [ "${#positional[@]}" -le 1 ]; then
        local cb
        cb="$(current_branch "$dir")"
        [ -n "$cb" ] && is_protected "$cb" && deny "git push desde '$cb' (rama protegida); usa una rama feature/bugfix y abre un PR"
      else
        local i=1
        while [ $i -lt "${#positional[@]}" ]; do
          t="${positional[$i]}"
          case "$t" in +*) deny "refspec forzado '$t' no está permitido" ;; esac
          dest="${t##*:}"
          if [ "$dest" = "HEAD" ] || [ -z "$dest" ]; then
            dest="$(current_branch "$dir")"
          fi
          is_protected "$dest" && deny "git push hacia '$dest' (rama protegida); integra mediante PR"
          i=$((i + 1))
        done
      fi
      ;;
    commit)
      local cb
      cb="$(current_branch "$dir")"
      # Bootstrap exception: the very first commit of a new repository is allowed.
      if [ -n "$cb" ] && is_protected "$cb" && has_commits "$dir"; then
        deny "git commit en '$cb' (rama protegida); crea feature/<story-id>-<slug> o bugfix/<slug>"
      fi
      ;;
    add)
      local t
      for t in "$@"; do
        case "$t" in
          -f | --force) deny "git add --force (forzar archivos ignorados) no está permitido" ;;
        esac
        is_env_file "$(strip_token "$t")" && deny "git add de un archivo .env real"
      done
      ;;
  esac
}

check_segment() {
  local seg="$1" tokens=() t i reader_seen=0
  set -f
  read -r -a tokens <<<"$seg"
  set +f
  [ "${#tokens[@]}" -eq 0 ] && return 0

  i=0
  while [ $i -lt "${#tokens[@]}" ]; do
    t="$(strip_token "${tokens[$i]}")"
    case "$t" in
      *=* | sudo | command | exec | time | env | nohup) i=$((i + 1)); continue ;;
    esac
    break
  done
  if [ $i -lt "${#tokens[@]}" ] && [ "$(strip_token "${tokens[$i]##*/}")" = "git" ]; then
    check_git "${tokens[@]:$((i + 1))}"
  fi

  for t in "${tokens[@]}"; do
    t="$(strip_token "$t")"
    case "$READERS" in *" ${t##*/} "*) reader_seen=1; continue ;; esac
    if [ "$reader_seen" -eq 1 ] && is_env_file "$t"; then
      deny "leer/imprimir un archivo .env real ('$t'); usa .env.example"
    fi
  done
}

segments="$(printf '%s\n' "$command_str" | awk '{ gsub(/&&|\|\||;|\|/, "\n"); print }')"
while IFS= read -r segment; do
  check_segment "$segment"
done <<<"$segments"

emit_json permission allow
exit 0
