# Gestão de RH — Requisitos e Domínio

Documento vivo: marque os `[ ]` como `[x]` conforme for implementando.

## 1. Cargo: `funcionarios` ou `departamentos`?

Recomendação: **`Cargo` pertence ao domínio de `departamentos`**, não de `funcionarios`.

Motivo: `Cargo` (nome, nível — júnior/pleno/sênior, faixa salarial, CBO) descreve **estrutura organizacional**
— quais posições existem, em qual departamento, com qual faixa salarial. Isso é decisão de quem organiza a
empresa (departamentos), não de quem registra o funcionário. `Funcionario` só guarda a referência:

```ts
@Column({ name: 'departamento_id', type: 'uuid' })
departamentoId!: string;

@Column({ name: 'cargo_id', type: 'uuid' })
cargoId!: string;
```

Sem FK de banco (bancos separados — ver conversa anterior sobre isso). A validação de que o `cargoId`/
`departamentoId` existem é feita via chamada gRPC ao serviço de `departamentos` (`libs/proto` + `libs/contracts`),
não via constraint de banco.

## 2. Requisitos Funcionais (RF)

Organizados por módulo, do que é essencial pro MVP até extensões que dão mais "corpo" ao projeto sem virar
um sistema de folha de pagamento completo.

### Módulo: Funcionário (core — serviço `funcionarios`)

- [ ] RF01 — Cadastrar funcionário (nome, CPF, e-mail, data de nascimento, data de admissão, cargo, departamento)
- [ ] RF02 — Editar dados cadastrais do funcionário
- [ ] RF03 — Consultar funcionário por ID / listar com filtros (nome, departamento, status)
- [ ] RF04 — Desligar funcionário (soft delete + `dataDemissao`, não apagar o registro — histórico importa em RH)
- [ ] RF05 — Impedir CPF/e-mail duplicado (unique constraint + validação)
- [ ] RF06 — Consultar dados do departamento/cargo do funcionário via chamada ao serviço `departamentos`
      (é o RF que efetivamente exercita a comunicação entre microserviços)

### Módulo: Departamento e Cargo (serviço `departamentos`, futuro)

- [ ] RF07 — Cadastrar/editar/listar departamentos (nome, gestor responsável)
- [ ] RF08 — Cadastrar/editar/listar cargos (nome, nível, faixa salarial, departamento ao qual pertence)
- [ ] RF09 — Consultar organograma (departamentos e seus cargos)
- [ ] RF10 — Expor endpoint gRPC pra `funcionarios` validar `departamentoId`/`cargoId` na hora do cadastro

### Módulo: Vínculo Empregatício e Histórico

- [ ] RF11 — Registrar histórico de mudança de cargo/salário do funcionário (promoções, não sobrescrever)
- [ ] RF12 — Registrar histórico de transferência entre departamentos

### Módulo: Férias

- [ ] RF13 — Calcular período de férias disponível (com base na data de admissão)
- [ ] RF14 — Agendar/registrar férias tiradas (data início/fim)
- [ ] RF15 — Impedir agendamento de férias que ultrapasse o saldo disponível

### Módulo: Ocorrências/Advertências

- [ ] RF16 — Registrar ocorrência disciplinar (advertência, elogio, atestado) vinculada ao funcionário
- [ ] RF17 — Listar histórico de ocorrências por funcionário

### Extensões possíveis (avaliar se cabe no escopo da disciplina)

- [ ] RF18 — Folha de pagamento simplificada (cálculo de salário líquido: INSS/IRRF simplificado)
- [ ] RF19 — Benefícios (vale-transporte, vale-refeição) associados ao funcionário
- [ ] RF20 — Avaliação de desempenho (ciclo, nota, feedback)

## 3. Entidades sugeridas

**Serviço `funcionarios`:**
- `Funcionario` (já existe)
- `HistoricoCargoSalario` (RF11) — `funcionarioId`, `cargoIdAnterior`, `cargoIdNovo`, `salario`, `dataMudanca`
- `Ferias` (RF13-15) — `funcionarioId`, `dataInicio`, `dataFim`, `diasUtilizados`
- `Ocorrencia` (RF16-17) — `funcionarioId`, `tipo` (enum), `descricao`, `data`

**Serviço `departamentos` (futuro):**
- `Departamento` — `nome`, `gestorFuncionarioId` (referência simples, sem FK)
- `Cargo` — `nome`, `nivel` (enum), `salarioMin`, `salarioMax`, `departamentoId`

## 4. Quando criar o serviço `departamentos`?

Recomendação: **depois que `funcionarios` estiver fechado de ponta a ponta** — entity final, migration
gerada e aplicada, CRUD funcionando via HTTP (RF01-05 testados manualmente). Motivos:

1. Valida o padrão (entity → migration → repository → service → controller) uma vez, num serviço só,
   antes de replicar pra um segundo.
2. Só faz sentido implementar RF06 (chamada gRPC pra validar `departamentoId`/`cargoId`) quando já existir
   alguém do outro lado pra responder — criar `departamentos` cedo demais significa manter dois serviços
   incompletos em paralelo.
3. É o ponto natural pra finalmente usar o `libs/proto`/`libs/contracts` que já foram criados lá no início,
   mas continuam sem uso real até hoje.
