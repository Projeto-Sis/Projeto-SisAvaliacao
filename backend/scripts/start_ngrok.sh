#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
printf '\033]0;SISAVALIA - NGROK\007'
NGROK="$BACKEND_DIR/.local/bin/ngrok"

if [[ ! -x "$NGROK" ]]; then
  echo "ngrok não encontrado em backend/.local/bin/ngrok."
  exit 1
fi

echo "Túnel OAuth: https://caddie-hamster-raffle.ngrok-free.dev"
exec "$NGROK" http 8000 --url "https://caddie-hamster-raffle.ngrok-free.dev"
