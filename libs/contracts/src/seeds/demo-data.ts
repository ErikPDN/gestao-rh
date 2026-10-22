import { NivelCargo } from '../departamentos/enums/nivel-cargo.enum.js';

interface CargoModelo {
  nome: string;
  salarioBase: number;
  salarioTeto: number;
  nivel?: NivelCargo;
}

interface DepartamentoDemo {
  id: string;
  nome: string;
  descricao: string;
  gestorId: string;
  gestorNome: string;
}

interface CargoDemo extends CargoModelo {
  id: string;
  departamentoId: string;
}

interface FuncionarioDemo {
  id: string;
  cpfCnpj: string;
  nome: string;
  departamentoId: string;
  cargoId: string;
  salario: number;
  dataNascimento: Date;
  dataAdmissao: Date;
  dataDemissao?: Date;
}

// Os dados são gerados de forma determinística: os seeds de departamentos e de
// funcionários rodam em bancos diferentes e precisam concordar nos UUIDs.
const DEPARTAMENTOS: [nome: string, descricao: string][] = [
  ['Tecnologia da Informação', 'Desenvolvimento de sistemas e infraestrutura'],
  ['Recursos Humanos', 'Gestão de pessoas e folha de pagamento'],
  ['Financeiro', 'Contas a pagar, contas a receber e tesouraria'],
  ['Comercial', 'Vendas e relacionamento com clientes'],
  ['Marketing', 'Marca, campanhas e mídias digitais'],
  ['Jurídico', 'Contratos, compliance e contencioso'],
  ['Logística', 'Armazenagem, transporte e distribuição'],
  ['Compras', 'Negociação com fornecedores e suprimentos'],
  ['Operações', 'Processos operacionais e produtividade'],
  ['Atendimento ao Cliente', 'Suporte, SAC e pós-venda'],
  ['Qualidade', 'Controle de qualidade e melhoria contínua'],
  ['Pesquisa e Desenvolvimento', 'Inovação e novos produtos'],
  ['Contabilidade', 'Escrituração, balanços e obrigações fiscais'],
  ['Comunicação Corporativa', 'Comunicação interna e assessoria de imprensa'],
  ['Segurança do Trabalho', 'Saúde ocupacional e prevenção de acidentes'],
  ['Infraestrutura', 'Redes, servidores e nuvem'],
  ['Suporte Técnico', 'Help desk e atendimento a usuários internos'],
  ['Produto', 'Gestão e roadmap de produtos'],
  ['Design', 'Experiência do usuário e identidade visual'],
  ['Dados e Analytics', 'Inteligência de negócio e ciência de dados'],
  ['Manutenção', 'Manutenção preventiva e corretiva'],
  ['Planejamento Estratégico', 'Metas, indicadores e orçamento'],
  ['Auditoria Interna', 'Controles internos e gestão de riscos'],
  ['Sustentabilidade', 'Programas ambientais e responsabilidade social'],
  ['Facilities', 'Gestão predial e serviços gerais'],
];

const CARGOS: CargoModelo[] = [
  { nome: 'Estagiário', salarioBase: 1800, salarioTeto: 2800, nivel: NivelCargo.TRAINEE },
  { nome: 'Analista Júnior', salarioBase: 3500, salarioTeto: 5500, nivel: NivelCargo.JUNIOR },
  { nome: 'Analista Pleno', salarioBase: 5500, salarioTeto: 8500, nivel: NivelCargo.PLENO },
  { nome: 'Analista Sênior', salarioBase: 8500, salarioTeto: 12500, nivel: NivelCargo.SENIOR },
  { nome: 'Gerente', salarioBase: 12500, salarioTeto: 18000, nivel: NivelCargo.ESPECIALISTA },
];
const INDICE_GERENTE = CARGOS.length - 1;

const NOMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Eduarda', 'Fernando', 'Gabriela', 'Henrique',
  'Isabela', 'João', 'Karina', 'Leonardo', 'Mariana', 'Nicolas', 'Olívia', 'Paulo',
  'Rafaela', 'Samuel', 'Tatiana', 'Vinícius', 'Aline', 'Caio', 'Débora', 'Eduardo',
  'Fabiana', 'Gustavo', 'Helena', 'Igor', 'Júlia', 'Lucas', 'Marcela', 'Natália',
  'Otávio', 'Patrícia', 'Renato', 'Sabrina', 'Thiago', 'Valéria', 'Wesley', 'Yasmin',
];

const SOBRENOMES = [
  'Almeida', 'Barbosa', 'Cardoso', 'Dias', 'Esteves', 'Ferreira', 'Gomes', 'Henriques',
  'Lima', 'Machado', 'Nogueira', 'Oliveira', 'Pereira', 'Queiroz', 'Ramos', 'Silva',
  'Teixeira', 'Uchoa', 'Vieira', 'Xavier', 'Alves', 'Borges', 'Costa', 'Duarte',
  'Freitas', 'Guimarães', 'Lopes', 'Martins', 'Nascimento', 'Pinto', 'Rocha', 'Santos',
  'Souza', 'Tavares', 'Moreira', 'Campos', 'Araújo', 'Ribeiro', 'Monteiro', 'Carvalho',
];

const PERCENTUAL_DESLIGADOS = 0.1;
const ADMISSAO_RECENTE_A_CADA = 12;

// Gerador pseudoaleatório com semente fixa (mulberry32), para o resultado ser o mesmo em todas as VMs
function criarGerador(semente: number) {
  let estado = semente;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const uuid = (prefixo: number, n: number) =>
  `00000000-0000-4000-8000-${prefixo}${String(n).padStart(11, '0')}`;

// meio-dia local evita que o TypeORM desloque a data por causa do fuso horário
const diasAtras = (dias: number) => {
  const data = new Date();
  data.setHours(12, 0, 0, 0);
  data.setDate(data.getDate() - Math.round(dias));
  return data;
};

const digitoCpf = (digitos: number[]) => {
  const soma = digitos.reduce(
    (acc, d, i) => acc + d * (digitos.length + 1 - i),
    0,
  );
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
};

const cpf = (n: number) => {
  const digitos = String(123456000 + n)
    .split('')
    .map(Number);
  digitos.push(digitoCpf(digitos));
  digitos.push(digitoCpf(digitos));
  return digitos.join('');
};

export const DEPARTAMENTOS_DEMO: DepartamentoDemo[] = [];
export const CARGOS_DEMO: CargoDemo[] = [];
export const FUNCIONARIOS_DEMO: FuncionarioDemo[] = [];

const aleatorio = criarGerador(20261022);
const entre = (min: number, max: number) => min + aleatorio() * (max - min);

let seqCargo = 0;
let seqFuncionario = 0;

DEPARTAMENTOS.forEach(([nome, descricao], i) => {
  const departamentoId = uuid(1, i + 1);

  const cargoIds = CARGOS.map((cargo) => {
    const id = uuid(2, ++seqCargo);
    CARGOS_DEMO.push({ id, departamentoId, ...cargo });
    return id;
  });

  // 3 a 5 funcionários por departamento, o primeiro é sempre o gerente (gestor)
  const quantidade = 3 + (i % 3);
  let gestor = { id: '', nome: '' };

  for (let j = 0; j < quantidade; j++) {
    const seq = ++seqFuncionario;
    const id = uuid(3, seq);
    const ehGerente = j === 0;
    const indiceCargo = ehGerente
      ? INDICE_GERENTE
      : Math.floor(entre(0, INDICE_GERENTE));
    const cargo = CARGOS[indiceCargo];

    const primeiroSobrenome = Math.floor(entre(0, SOBRENOMES.length));
    // soma um deslocamento não nulo para os dois sobrenomes nunca coincidirem
    const segundoSobrenome =
      (primeiroSobrenome + 1 + Math.floor(entre(0, SOBRENOMES.length - 1))) %
      SOBRENOMES.length;
    const funcionarioNome = `${NOMES[Math.floor(entre(0, NOMES.length))]} ${
      SOBRENOMES[primeiroSobrenome]
    } ${SOBRENOMES[segundoSobrenome]}`;

    const admissaoRecente = !ehGerente && seq % ADMISSAO_RECENTE_A_CADA === 0;
    const diasDesdeAdmissao = admissaoRecente
      ? entre(1, 20)
      : entre(30, 8 * 365);

    const desligado =
      !ehGerente &&
      diasDesdeAdmissao > 120 &&
      aleatorio() < PERCENTUAL_DESLIGADOS;

    FUNCIONARIOS_DEMO.push({
      id,
      cpfCnpj: cpf(seq),
      nome: funcionarioNome,
      departamentoId,
      cargoId: cargoIds[indiceCargo],
      salario:
        Math.round(entre(cargo.salarioBase, cargo.salarioTeto) / 50) * 50,
      dataNascimento: diasAtras(entre(26, 58) * 365.25),
      dataAdmissao: diasAtras(diasDesdeAdmissao),
      dataDemissao: desligado
        ? diasAtras(entre(1, diasDesdeAdmissao - 90))
        : undefined,
    });

    if (ehGerente) gestor = { id, nome: funcionarioNome };
  }

  DEPARTAMENTOS_DEMO.push({
    id: departamentoId,
    nome,
    descricao,
    gestorId: gestor.id,
    gestorNome: gestor.nome,
  });
});
