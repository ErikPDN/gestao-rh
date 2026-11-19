#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/config.sh"

# gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
#   sqladmin.googleapis.com secretmanager.googleapis.com

# gcloud artifacts repositories create gestao-rh \
#   --repository-format=docker --location="$REGION"

# gcloud auth configure-docker "$REGION-docker.pkg.dev"

# # --- Passo 2: Cloud SQL ---
# read -rsp "Senha do banco: " DB_PASS; echo

# gcloud sql instances create "$SQL_INSTANCE" \
#   --database-version=POSTGRES_16 --edition=ENTERPRISE \
#   --tier=db-f1-micro --region="$REGION" \
#   --root-password="$DB_PASS"

# for db in funcionario departamento auth; do
#   gcloud sql databases create "gestao_rh_$db" --instance="$SQL_INSTANCE"
# done

# rintf '%s' "$DB_PASS" | gcloud secrets create db-password --data-file=-

# ---- Passo 3: secrets JWT e permissões ----
ROOT="$(dirname "$0")/.."

sed -n 's/^JWT_PRIVATE_KEY_BASE64=//p' "$ROOT/apps/auth/.env" | tr -d '\n' \
  | gcloud secrets create jwt-private-key --data-file=-

sed -n 's/^JWT_PUBLIC_KEY_BASE64=//p' "$ROOT/apps/api-gateway/.env" | tr -d '\n' \
  | gcloud secrets create jwt-public-key --data-file=-

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')
SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor
gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:$SA" --role=roles/cloudsql.client