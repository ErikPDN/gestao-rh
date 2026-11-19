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

# --- deploy ---
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')
SQL_CONN="$PROJECT:$REGION:$SQL_INSTANCE"
host() { echo "$1-$PROJECT_NUMBER.$REGION.run.app"; }   # URL determinística de cada serviço
FRONTEND_URL="https://$(host frontend)"

COMMON=(--region "$REGION" --allow-unauthenticated --max-instances 2 --cpu-boost)
GRPC=(--use-http2 --add-cloudsql-instances "$SQL_CONN")

gcloud run deploy departamentos --image "$REGISTRY/departamentos:$TAG" "${COMMON[@]}" "${GRPC[@]}" \
  --set-env-vars "GRPC_CREDENTIALS=true,DEPARTAMENTO_GRPC_URL=0.0.0.0:8080,FUNCIONARIO_GRPC_URL=$(host funcionarios):443,DB_HOST_DEPARTAMENTO=/cloudsql/$SQL_CONN,DB_PORT_DEPARTAMENTO=5432,DB_USERNAME_DEPARTAMENTO=postgres,DB_DEPARTAMENTO=gestao_rh_departamento" \
  --set-secrets "DB_PASSWORD_DEPARTAMENTO=db-password:latest"

gcloud run deploy funcionarios --image "$REGISTRY/funcionarios:$TAG" "${COMMON[@]}" "${GRPC[@]}" \
  --set-env-vars "GRPC_CREDENTIALS=true,FUNCIONARIO_GRPC_URL=0.0.0.0:8080,DEPARTAMENTO_GRPC_URL=$(host departamentos):443,DB_HOST_FUNCIONARIO=/cloudsql/$SQL_CONN,DB_PORT_FUNCIONARIO=5432,DB_USERNAME_FUNCIONARIO=postgres,DB_FUNCIONARIO=gestao_rh_funcionario" \
  --set-secrets "DB_PASSWORD_FUNCIONARIO=db-password:latest"

gcloud run deploy auth --image "$REGISTRY/auth:$TAG" "${COMMON[@]}" "${GRPC[@]}" \
  --set-env-vars "GRPC_CREDENTIALS=true,AUTH_GRPC_URL=0.0.0.0:8080,FUNCIONARIO_GRPC_URL=$(host funcionarios):443,DB_HOST_AUTH=/cloudsql/$SQL_CONN,DB_PORT_AUTH=5432,DB_USERNAME_AUTH=postgres,DB_AUTH=gestao_rh_auth,JWT_ACCESS_TTL=900,REFRESH_TOKEN_TTL=604800,REFRESH_TOKEN_ABSOLUTE_TTL=2592000" \
  --set-secrets "DB_PASSWORD_AUTH=db-password:latest,JWT_PRIVATE_KEY_BASE64=jwt-private-key:latest"

gcloud run deploy api-gateway --image "$REGISTRY/api-gateway:$TAG" "${COMMON[@]}" \
  --set-env-vars "GRPC_CREDENTIALS=true,FRONTEND_URL=$FRONTEND_URL,REFRESH_TOKEN_TTL=604800,DEPARTAMENTO_GRPC_URL=$(host departamentos):443,FUNCIONARIO_GRPC_URL=$(host funcionarios):443,AUTH_GRPC_URL=$(host auth):443" \
  --set-secrets "JWT_PUBLIC_KEY_BASE64=jwt-public-key:latest"