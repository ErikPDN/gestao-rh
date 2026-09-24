# TODO

Pendências técnicas identificadas durante o desenvolvimento. Requisitos funcionais (RF) e escopo de
domínio ficam em [docs/rh-requisitos.md](docs/rh-requisitos.md) — este arquivo é só débito técnico/bugs.

- [ ] **`gestorId` sem validação cross-service.** `PATCH /departamentos/:id` aceita qualquer UUID em
      `gestorId` sem checar se ele existe de fato em `funcionarios` (diferente de `cargoId`/`departamentoId`
      no cadastro de funcionário, que passam por `getCargo`/`getDepartamento` via gRPC). Também não valida
      se o funcionário indicado como gestor pertence ao departamento que ele vai gerenciar.

- [ ] **`.env` da raiz com URLs trocadas.** `FUNCIONARIO_SERVICE_API_URL=http://localhost:3001` e
      `DEPARTAMENTO_SERVICE_API_URL=http://localhost:3002` — essas portas são do `api-gateway` (3001) e do
      `funcionarios` (3002), não batem com os nomes das variáveis. Conferir se algo depende desse arquivo
      antes de corrigir.
