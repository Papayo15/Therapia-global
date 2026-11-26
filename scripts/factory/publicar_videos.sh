#!/bin/bash
# Publica la biblioteca de videos en Netlify (sitio therapiaglobal-videos).
#   scripts/factory/publicar_videos.sh
# Requiere haber iniciado sesión una vez con netlify-cli (la sesión queda en ~/Library/Preferences/netlify).
set -e
cd "$(dirname "$0")/../.."
SITE=2543ba3e-9ae5-421e-816c-4b5348118f5e
D=renders/_deploy_videos
rm -rf "$D" && mkdir -p "$D"
cp -R public/videos/fabrica/. "$D/"            # enlaces duros → copia real del contenido
cat > "$D/_headers" <<'H'
/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
H
echo "/  https://therapiaglobal-app.netlify.app/es  302" > "$D/_redirects"
npx -y netlify-cli@latest deploy --prod --dir "$D" --site "$SITE" --message "biblioteca $(date +%F)"
rm -rf "$D"
