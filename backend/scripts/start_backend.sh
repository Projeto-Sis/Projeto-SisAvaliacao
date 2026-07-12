#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
printf '\033]0;SISAVALIA - BACKEND\007'

if [[ ! -x "$BACKEND_DIR/.venv/bin/uvicorn" ]]; then
  echo "Ambiente Python não encontrado em backend/.venv."
  exit 1
fi

printf "Chave da API Google Maps Geocoding (ficará oculta; Enter para usar o fallback): "
read -r -s SISAVALIA_GOOGLE_MAPS_API_KEY
printf "\n"

export SISAVALIA_GOOGLE_MAPS_API_KEY
export SISAVALIA_DATABASE_URL="postgresql://sisavalia:sisavalia_local@127.0.0.1:5432/sisavalia"
export SISAVALIA_ENABLE_FIXTURE_CONNECTOR="true"

if [[ -n "$SISAVALIA_GOOGLE_MAPS_API_KEY" ]]; then
  echo "Google Maps Geocoding configurado para esta sessão."
else
  echo "Google Maps não configurado; usando o fallback de desenvolvimento."
fi
echo "Mercado Livre desativado nesta sessão."
echo "Backend iniciado em http://127.0.0.1:8000"
cd "$BACKEND_DIR"
exec .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
