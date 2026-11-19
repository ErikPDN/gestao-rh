# Deploy no Google Cloud

Guia para publicar o backend (gateway + 3 microserviços) no **Google Cloud Run**, com **Cloud SQL (PostgreSQL)** e imagens no **Artifact Registry**. O deploy do front está documentado no repositório `gestao-rh-ui`.

Nenhum serviço de aplicação roda em VM: tudo é gerenciado pelo provedor.

## Arquitetura em produção

```
Navegador
   │ HTTPS
   ▼
frontend (Cloud Run, nginx)
   │  /api/*  →  proxy para o gateway (mesma origem para o navegador)
   ▼
api-gateway (Cloud Run, HTTP)
   │ gRPC sobre TLS (:443, HTTP/2)
   ├──► funcionarios  (Cloud Run --use-http2) ─┐
   ├──► departamentos (Cloud Run --use-http2) ─┼─► Cloud SQL (socket /cloudsql/...)
   └──► auth          (Cloud Run --use-http2) ─┘
        ▲
        └─ senha do banco e chaves JWT vêm do Secret Manager
```

| Recurso | Uso |
|---|---|
| Cloud Run | 5 serviços: `frontend`, `api-gateway`, `auth`, `funcionarios`, `departamentos` |
| Cloud SQL | 1 instância PostgreSQL 16 (`db-f1-micro`) com 3 bancos: `gestao_rh_funcionario`, `gestao_rh_departamento`, `gestao_rh_auth` |
| Artifact Registry | Repositório Docker `gestao-rh` com as imagens |
| Secret Manager | `db-password`, `jwt-private-key`, `jwt-public-key` |

## Pré-requisitos

- Projeto no Google Cloud com faturamento ativo.
- [`gcloud`](https://cloud.google.com/sdk/docs/install) autenticado (`gcloud auth login`) e Docker instalado.
- [`cloud-sql-proxy`](https://cloud.google.com/sql/docs/postgres/sql-proxy) e `psql` (para migrations e conferências a partir da sua máquina).
- Arquivos `apps/auth/.env` e `apps/api-gateway/.env` já com `JWT_PRIVATE_KEY_BASE64` e `JWT_PUBLIC_KEY_BASE64` (veja o [README](README.md), passo 4).

## Configuração

As variáveis do projeto ficam em [infra/config.sh](infra/config.sh):

```bash
PROJECT=sd-ufg-2026          # ID do projeto GCP
REGION=us-central1
REGISTRY=$REGION-docker.pkg.dev/$PROJECT/gestao-rh
SQL_INSTANCE=gestao-rh-db
```

Ajuste `PROJECT` para o seu projeto e rode `gcloud config set project <PROJECT>`.

## Scripts

| Arquivo | Papel | Quando roda |
|---|---|---|
| [infra/config.sh](infra/config.sh) | Variáveis compartilhadas | Importado pelos outros |
| [infra/setup.sh](infra/setup.sh) | Cria a infraestrutura | **Uma vez** por projeto |
| [infra/deploy.sh](infra/deploy.sh) | Build, push e deploy dos serviços | A cada versão |

O `setup.sh` **não é idempotente**: rodar de novo falha com "já existe". Os comandos dele estão listados abaixo, na ordem, para que você possa executá-los (ou conferir o que já foi feito).

## 1. Infraestrutura (uma vez)

```bash
source infra/config.sh

# APIs, registry e autenticação do Docker
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  sqladmin.googleapis.com secretmanager.googleapis.com
gcloud artifacts repositories create gestao-rh \
  --repository-format=docker --location="$REGION"
gcloud auth configure-docker "$REGION-docker.pkg.dev"
```

Se o segundo comando reclamar que a API não está habilitada, aguarde um minuto e repita (a ativação demora a propagar).

**Banco de dados.** Gere uma senha forte, crie a instância e os 3 bancos, e guarde a senha no Secret Manager:

```bash
DB_PASS=$(openssl rand -hex 16)

gcloud sql instances create "$SQL_INSTANCE" \
  --database-version=POSTGRES_16 --edition=ENTERPRISE \
  --tier=db-f1-micro --region="$REGION" --root-password="$DB_PASS"

for db in funcionario departamento auth; do
  gcloud sql databases create "gestao_rh_$db" --instance="$SQL_INSTANCE"
done

printf '%s' "$DB_PASS" | gcloud secrets create db-password --data-file=-
```

A instância leva de 5 a 10 minutos para ficar pronta.

**Chaves JWT e permissões:**

```bash
sed -n 's/^JWT_PRIVATE_KEY_BASE64=//p' apps/auth/.env | tr -d '\n' \
  | gcloud secrets create jwt-private-key --data-file=-
sed -n 's/^JWT_PUBLIC_KEY_BASE64=//p' apps/api-gateway/.env | tr -d '\n' \
  | gcloud secrets create jwt-public-key --data-file=-

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')
SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor
gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:$SA" --role=roles/cloudsql.client
```

> **Confira os secrets.** Se o valor chegar vazio, o `gcloud secrets create` cria o secret **sem versão e sem avisar**. Verifique com `gcloud secrets versions list <nome>`: deve haver uma versão `enabled`. Se não houver, use `gcloud secrets versions add <nome> --data-file=-`.

## 2. Migrations e seeds

O banco só é acessível pelo Cloud Run e pelo proxy. Em um terminal, abra o proxy:

```bash
cloud-sql-proxy $PROJECT:$REGION:$SQL_INSTANCE --port 5433 --gcloud-auth
```

Em outro, na raiz do projeto, rode as migrations apontando para a porta do proxy. As variáveis passadas inline têm prioridade sobre os `.env` locais:

```bash
export DB_PASS=$(gcloud secrets versions access latest --secret=db-password)

DB_HOST_FUNCIONARIO=localhost DB_PORT_FUNCIONARIO=5433 DB_PASSWORD_FUNCIONARIO=$DB_PASS \
  pnpm migration:run:funcionarios
DB_HOST_DEPARTAMENTO=localhost DB_PORT_DEPARTAMENTO=5433 DB_PASSWORD_DEPARTAMENTO=$DB_PASS \
  pnpm migration:run:departamentos
DB_HOST_AUTH=localhost DB_PORT_AUTH=5433 DB_PASSWORD_AUTH=$DB_PASS \
  pnpm migration:run:auth
```

Crie o administrador (use uma senha forte, pois o gateway é público):

```bash
DB_HOST_AUTH=localhost DB_PORT_AUTH=5433 DB_PASSWORD_AUTH=$DB_PASS \
  ADMIN_EMAIL=admin@email.com ADMIN_PASSWORD='<senha-forte>' pnpm seed:auth
```

Opcional, para popular dados de demonstração (departamentos, cargos e funcionários):

```bash
DB_HOST_DEPARTAMENTO=localhost DB_PORT_DEPARTAMENTO=5433 DB_PASSWORD_DEPARTAMENTO=$DB_PASS \
DB_HOST_FUNCIONARIO=localhost DB_PORT_FUNCIONARIO=5433 DB_PASSWORD_FUNCIONARIO=$DB_PASS \
  pnpm seed:demo
```

## 3. Deploy do backend

```bash
git commit ...            # a tag da imagem é o hash do último commit
bash infra/deploy.sh
```

O script:

1. Constrói as 4 imagens (`auth`, `funcionarios`, `departamentos`, `api-gateway`) com o mesmo [Dockerfile](Dockerfile), variando `--build-arg APP=<app>`, e envia ao Artifact Registry com a tag do commit.
2. Faz o deploy dos serviços no Cloud Run, com as variáveis de ambiente e os secrets descritos abaixo.

Rodar o script de novo é seguro: o Docker usa cache e o Cloud Run atualiza os serviços existentes.

**Faça o commit antes do deploy.** Sem ele, a imagem nova sobrescreve a tag do commit anterior e você perde a rastreabilidade.

### O que cada serviço recebe

URLs entre serviços usam o formato determinístico `SERVICO-<NUMERO_DO_PROJETO>.<REGIAO>.run.app`, o que permite deployar em qualquer ordem e resolve a dependência circular entre `funcionarios` e `departamentos`.

| Serviço | Variáveis de ambiente | Secrets |
|---|---|---|
| `departamentos` | `GRPC_CREDENTIALS=true`, `DEPARTAMENTO_GRPC_URL=0.0.0.0:8080`, `FUNCIONARIO_GRPC_URL=<host>:443`, `DB_HOST_DEPARTAMENTO=/cloudsql/<conexão>`, `DB_PORT_DEPARTAMENTO=5432`, `DB_USERNAME_DEPARTAMENTO`, `DB_DEPARTAMENTO` | `DB_PASSWORD_DEPARTAMENTO` ← `db-password` |
| `funcionarios` | `GRPC_CREDENTIALS=true`, `FUNCIONARIO_GRPC_URL=0.0.0.0:8080`, `DEPARTAMENTO_GRPC_URL=<host>:443`, `DB_HOST_FUNCIONARIO`, `DB_PORT_FUNCIONARIO`, `DB_USERNAME_FUNCIONARIO`, `DB_FUNCIONARIO` | `DB_PASSWORD_FUNCIONARIO` ← `db-password` |
| `auth` | `GRPC_CREDENTIALS=true`, `AUTH_GRPC_URL=0.0.0.0:8080`, `FUNCIONARIO_GRPC_URL=<host>:443`, `DB_*_AUTH`, `JWT_ACCESS_TTL`, `REFRESH_TOKEN_TTL`, `REFRESH_TOKEN_ABSOLUTE_TTL` | `DB_PASSWORD_AUTH` ← `db-password`, `JWT_PRIVATE_KEY_BASE64` ← `jwt-private-key` |
| `api-gateway` | `GRPC_CREDENTIALS=true`, `FRONTEND_URL`, `REFRESH_TOKEN_TTL`, `DEPARTAMENTO_GRPC_URL`, `FUNCIONARIO_GRPC_URL`, `AUTH_GRPC_URL` (todas `<host>:443`) | `JWT_PUBLIC_KEY_BASE64` ← `jwt-public-key` |

O gateway recebe `PORT=8080` do próprio Cloud Run. Os 3 microserviços usam `--use-http2` e `--add-cloudsql-instances`.

### Adaptações no código para o Cloud Run

- **Uma imagem, quatro apps.** O [Dockerfile](Dockerfile) é multi-stage e recebe `APP`. A imagem final contém só o bundle, as dependências de produção e a pasta `proto/` (lida em runtime). Nenhum `.env` entra na imagem; o [.dockerignore](.dockerignore) bloqueia `**/.env` e `**/*.pem`.
- **TLS no gRPC.** O Cloud Run só aceita gRPC em `:443` com TLS. Os clients usam `grpcCredentials()` ([libs/common/src/grpc/grpc-credentials.ts](libs/common/src/grpc/grpc-credentials.ts)), que ativa o TLS quando `GRPC_CREDENTIALS=true`. Localmente a variável não existe e a conexão continua insegura, como antes.
- **Listas vazias.** Campos `repeated` vazios não trafegam no protobuf e chegavam como `undefined`, quebrando chamadas como `.map`. `GRPC_LOADER_OPTIONS = { arrays: true }` ([libs/common/src/grpc/grpc-loader.ts](libs/common/src/grpc/grpc-loader.ts)) é aplicado em todos os clients e servidores.
- **Banco por socket.** `DB_HOST_*=/cloudsql/<projeto>:<região>:<instância>` com `DB_PORT_*=5432` (a porta compõe o nome do arquivo de socket).

## 4. Verificação

Gateway no ar (deve responder `401`, não erro de conexão):

```bash
G=https://api-gateway-<NUMERO_DO_PROJETO>.$REGION.run.app
curl -i $G/auth/me
```

Caminho completo (login → gRPC → banco). O `read -s` evita deixar a senha no histórico:

```bash
printf 'Senha do admin: '; read -rs SENHA; echo
TOKEN=$(curl -s -X POST $G/auth/login -H 'Content-Type: application/json' \
  -d "{\"email\":\"admin@email.com\",\"senha\":\"$SENHA\"}" | jq -r .accessToken)
curl -s -H "Authorization: Bearer $TOKEN" $G/departamentos
curl -s -H "Authorization: Bearer $TOKEN" $G/funcionarios
```

Logs de um serviço:

```bash
gcloud run services logs read auth --region $REGION --limit 30
```

## Operação e custos

- **Cloud Run** escala a zero: não cobra quando ocioso. Os serviços têm `--max-instances 2` para limitar custo. Depois de ociosos, a primeira requisição tem *cold start* de alguns segundos.
- **Cloud SQL** é o único recurso que cobra continuamente. Desligue quando não estiver usando e religue antes de testar ou apresentar:

  ```bash
  gcloud sql instances patch gestao-rh-db --activation-policy=NEVER    # desliga (paga só o disco)
  gcloud sql instances patch gestao-rh-db --activation-policy=ALWAYS   # liga (leva alguns minutos)
  ```

  Com o banco desligado o site abre, mas login e telas com dados falham. Isso é esperado. Não use `gcloud sql instances delete`, que apaga os dados.
- **Atualizar um secret:** `printf '%s' "$NOVO" | gcloud secrets versions add <nome> --data-file=-`. Os serviços leem `:latest` ao iniciar, então precisam de um novo deploy.
- **Rollback:** `gcloud run services update-traffic <serviço> --region $REGION --to-revisions=<revisão>=100`. As revisões anteriores ficam disponíveis.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Container não sobe, log com `Configuration key ... does not exist` | Variável de ambiente ou secret não configurado no serviço |
| `UNAVAILABLE`/erro de conexão entre serviços | `GRPC_CREDENTIALS=true` ausente, ou `<host>:443` sem a porta |
| Serviço cai na inicialização com erro de banco | Cloud SQL desligado, ou permissão `cloudsql.client` ausente |
| `401` no refresh ao recarregar a página | O site foi aberto por uma URL diferente de `FRONTEND_URL` (o `OriginGuard` compara a origem) |
| `500` em listagens vazias | Imagem antiga, sem o `GRPC_LOADER_OPTIONS` |
| `secret not found or has no versions` | Secret criado com valor vazio; adicione uma versão |

## Limitações conhecidas

- Os microsserviços usam `--allow-unauthenticated`, ou seja, os endpoints gRPC são públicos e protegidos apenas por não serem divulgados. O correto seria IAM com ID token entre serviços.
- O par de chaves JWT de produção pode ser o mesmo do ambiente local. Em um sistema real, gere um par exclusivo.
