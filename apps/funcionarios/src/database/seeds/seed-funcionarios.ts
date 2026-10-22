import dataSource from '../data-source.js';
import { Funcionario } from '../../entities/funcionario.entity.js';
import { FUNCIONARIOS_DEMO } from '../../../../../libs/contracts/src/seeds/demo-data.js';

async function seedFuncionarios() {
  await dataSource.initialize();

  try {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(Funcionario)
      .values(FUNCIONARIOS_DEMO)
      .orIgnore()
      .execute();

    console.log(
      `Funcionários (${FUNCIONARIOS_DEMO.length}) de demonstração processados.`,
    );
  } finally {
    await dataSource.destroy();
  }
}

seedFuncionarios().catch((error) => {
  console.error('Erro ao popular funcionários:', error);
  process.exit(1);
});
