#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/config.sh"

# gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
#   sqladmin.googleapis.com secretmanager.googleapis.com

# gcloud artifacts repositories create gestao-rh \
#   --repository-format=docker --location="$REGION"

# gcloud auth configure-docker "$REGION-docker.pkg.dev"

# --- Passo 2: Cloud SQL ---
read -rsp "Senha do banco: " DB_PASS; echo

gcloud sql instances create "$SQL_INSTANCE" \
  --database-version=POSTGRES_16 --edition=ENTERPRISE \
  --tier=db-f1-micro --region="$REGION" \
  --root-password="$DB_PASS"

for db in funcionario departamento auth; do
  gcloud sql databases create "gestao_rh_$db" --instance="$SQL_INSTANCE"
done

rintf '%s' "$DB_PASS" | gcloud secrets create db-password --data-file=-

