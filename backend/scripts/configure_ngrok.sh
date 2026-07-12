#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
NGROK="$BACKEND_DIR/.local/bin/ngrok"

if [[ ! -x "$NGROK" ]]; then
  echo "ngrok não encontrado em backend/.local/bin/ngrok."
  exit 1
fi

echo "No painel do ngrok, copie o comando de instalação do Authtoken."
printf "Cole aqui o token ou o comando completo (ficará oculto): "
read -r -s NGROK_INPUT
printf "\n"

NGROK_TOKEN="${NGROK_INPUT##* }"
NGROK_TOKEN="${NGROK_TOKEN%\"}"
NGROK_TOKEN="${NGROK_TOKEN#\"}"
NGROK_TOKEN="${NGROK_TOKEN%\'}"
NGROK_TOKEN="${NGROK_TOKEN#\'}"

if [[ -z "$NGROK_TOKEN" ]]; then
  echo "Nenhum Authtoken foi informado."
  exit 1
fi

"$NGROK" config add-authtoken "$NGROK_TOKEN"
unset NGROK_INPUT NGROK_TOKEN
echo "Configuração concluída. Execute ./backend/scripts/start_ngrok.sh"
