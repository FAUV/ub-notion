#!/usr/bin/env bash
set -euo pipefail
if [ -z "${CAP_SERVER_URL:-}" ]; then
  echo "❌ Set CAP_SERVER_URL, e.g.: export CAP_SERVER_URL='https://your-prod-domain'"
  exit 1
fi
echo "▶ iOS init/sync (Capacitor, server.url=${CAP_SERVER_URL})"
npm run cap:init
npm run ios:add
npm run cap:sync
npm run ios:open
