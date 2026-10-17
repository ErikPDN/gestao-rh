# Gestão de RH

Sistema de gestão de recursos humanos construído como **microserviços** com NestJS (projeto da disciplina de Sistemas Distribuídos 2 – UFG). Cobre cadastro de funcionários, departamentos e cargos, além de autenticação e autorização por perfil.

## Arquitetura

```
Cliente (frontend :3000)
        │ HTTP + cookies
        ▼
  api-gateway :3001 ── valida JWT (chave pública) e roles
        │ gRPC
        ├──────────► funcionarios  :50052  ─► gestao_rh_funcionario
        ├──────────► departamentos :50051  ─► gestao_rh_departamento
        └──────────► auth          :50053  ─► gestao_rh_auth

  Entre os serviços: gRPC (funcionarios ⇄ departamentos, auth → funcionarios)
```

Toda a comunicação interna usa **gRPC**: o gateway é o único ponto com rotas REST e traduz as chamadas HTTP para RPCs dos microserviços (e os erros gRPC de volta para status HTTP). Os microserviços não expõem rotas HTTP.

| Serviço | Responsabilidade |
|---|---|
| `api-gateway` | Ponto de entrada. Rotas REST, cookies de sessão, guards de JWT/roles, dashboard agregado |
| `auth` | Usuários, login, refresh token, emissão de JWT (RS256), seed do admin |
| `funcionarios` | CRUD de funcionários, demissão, dashboard |
| `departamentos` | CRUD de departamentos e cargos, desativação, dashboard |

Cada serviço tem seu **próprio banco** (sem FK entre eles; a consistência é validada via gRPC). Libs compartilhadas: `libs/contracts` (DTOs, enums e código gerado dos `.proto`) e `libs/common` (filtros, pipes e guards). Os contratos gRPC ficam em `proto/`.

**Perfis:** `ADMIN`, `RH`, `GESTOR`, `COLABORADOR`.

## Stack

NestJS 12 · TypeScript · gRPC · PostgreSQL 16 · TypeORM · JWT (RS256) + Argon2 · pnpm · Vitest · rspack

## Pré-requisitos

- Node.js (desenvolvido com a v24) e pnpm
- Docker e Docker Compose
- OpenSSL (para gerar as chaves JWT)
- `protoc` (somente para regenerar os contratos gRPC)

## Como subir o projeto

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Subir o PostgreSQL

```bash
docker compose -f docker/docker-compose.yml up -d
```

Cria os bancos `gestao_rh_funcionario`, `gestao_rh_departamento` e `gestao_rh_auth` (usuário e senha `postgres`).

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
for app in api-gateway auth departamentos funcionarios; do
  cp apps/$app/.env.example apps/$app/.env
done
```

Cada serviço carrega `apps/<servico>/.env` e, em seguida, o `.env` da raiz (que define apenas `FRONTEND_URL`, usado pelo CORS e pela validação de origin no gateway).

### 4. Gerar o par de chaves JWT

O `auth` assina os tokens com a chave privada e o `api-gateway` valida com a pública:

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

base64 -w0 private.pem   # → apps/auth/.env         JWT_PRIVATE_KEY_BASE64
base64 -w0 public.pem    # → apps/api-gateway/.env  JWT_PUBLIC_KEY_BASE64
```

> Não versione os arquivos `.pem`.

### 5. Rodar as migrations

```bash
pnpm migration:run:funcionarios
pnpm migration:run:departamentos
pnpm migration:run:auth
```

### 6. Criar o usuário administrador

Usa `ADMIN_EMAIL` e `ADMIN_PASSWORD` de `apps/auth/.env`:

```bash
pnpm seed:auth
```

### 7. Iniciar os serviços

Em um terminal para cada serviço:

```bash
pnpm nest start funcionarios --watch
pnpm nest start departamentos --watch
pnpm nest start auth --watch
pnpm start:dev                       # api-gateway (projeto padrão do monorepo)
```

O gateway fica disponível em `http://localhost:3001`.

## Variáveis de ambiente

| Arquivo | Variáveis |
|---|---|
| `.env` (raiz) | `FRONTEND_URL` |
| `apps/api-gateway/.env` | `PORT`, `FUNCIONARIO_GRPC_URL`, `DEPARTAMENTO_GRPC_URL`, `AUTH_GRPC_URL`, `REFRESH_TOKEN_TTL`, `JWT_PUBLIC_KEY_BASE64` |
| `apps/auth/.env` | `DB_*_AUTH`, `FUNCIONARIO_GRPC_URL`, `AUTH_GRPC_URL`, `JWT_PRIVATE_KEY_BASE64`, `JWT_ACCESS_TTL`, `REFRESH_TOKEN_TTL`, `REFRESH_TOKEN_ABSOLUTE_TTL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| `apps/funcionarios/.env` | `DB_*_FUNCIONARIO`, `FUNCIONARIO_GRPC_URL`, `DEPARTAMENTO_GRPC_URL` |
| `apps/departamentos/.env` | `DB_*_DEPARTAMENTO`, `DEPARTAMENTO_GRPC_URL`, `FUNCIONARIO_GRPC_URL` |

`REFRESH_TOKEN_TTL` precisa ter o mesmo valor no gateway (duração do cookie) e no auth (validade do token).

## Principais rotas (via gateway)

| Prefixo | Descrição |
|---|---|
| `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me` | Sessão (refresh token em cookie httpOnly) |
| `POST /auth/criar-usuario` | Cria usuário (somente `ADMIN`) |
| `/funcionarios` | CRUD, `GET /dashboard`, `POST /:id/demitir` |
| `/departamentos` | CRUD, `GET /dashboard`, `POST /:id/desativar` |
| `/departamentos/:id/cargos` | CRUD de cargos, `POST /:cargoId/desativar` |
| `GET /dashboard` | Visão geral agregada |

## Portas

| Serviço | Porta | Protocolo |
|---|---|---|
| api-gateway | 3001 | HTTP |
| funcionarios | 50052 | gRPC |
| departamentos | 50051 | gRPC |
| auth | 50053 | gRPC |
| PostgreSQL | 5432 | – |


## Comandos úteis

```bash
pnpm test                                    # testes unitários
pnpm test:cov                                # cobertura
pnpm build                                   # build do gateway
pnpm migration:generate:<servico> <caminho>  # gerar migration (funcionarios | departamentos | auth)
pnpm proto:gen:funcionario                   # regenerar contratos gRPC (idem :departamento e :auth); rode após editar os .proto
```

## Documentação

Requisitos e decisões de domínio: [docs/rh-requisitos.md](docs/rh-requisitos.md).
