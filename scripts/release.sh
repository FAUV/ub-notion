#!/usr/bin/env bash
set -euo pipefail
echo "▶ Versions"; node -v && npm -v
echo "▶ Clean install"; rm -rf node_modules package-lock.json; npm i
echo "▶ Lint / Typecheck / Build"; npm run lint; npm run typecheck; npm run build; echo "✅ Web build OK"
echo
echo "ℹ Deploy web (Vercel): set env vars NOTION_TOKEN, NOTION_TIMEZONE, UB_API_KEY, NEXT_PUBLIC_UB_API_KEY, CAP_SERVER_URL, then:"
echo "   vercel deploy --prod"
echo
echo "▶ iOS (optional, Capacitor server.url)"
if [ -n "${CAP_SERVER_URL:-}" ]; then
  chmod +x scripts/ios.sh; ./scripts/ios.sh
else
  echo "⚠ Skipping iOS: CAP_SERVER_URL not set"
fi
