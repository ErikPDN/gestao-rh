#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/config.sh"
cd "$(dirname "$0")/.."

TAG=$(git rev-parse --short HEAD)

# --- build e push das imagens ---
for app in auth funcionarios departamentos api-gateway; do
  docker build --build-arg APP="$app" -t "$REGISTRY/$app:$TAG" .
  docker push "$REGISTRY/$app:$TAG"
done
