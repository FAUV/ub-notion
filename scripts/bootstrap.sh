#!/usr/bin/env bash
set -euo pipefail

DIR=\"$(cd \"$(dirname \"$0\")\" && pwd)\"
echo \"▶ Ejecutando bootstrap Next/PWA…\"
\"$DIR\"/bootstrap-next.sh \"$@\"
