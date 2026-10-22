import dataSource from '../data-source.js';
import { Departamento } from '../../entities/departamento.entity.js';
import { Cargo } from '../../entities/cargo.entity.js';
import {
  CARGOS_DEMO,
  DEPARTAMENTOS_DEMO,
} from '../../../../../libs/contracts/src/seeds/demo-data.js';

async function seedDepartamentos() {
  await dataSource.initialize();

  try {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(Departamento)
      .values(DEPARTAMENTOS_DEMO)
      .orIgnore()
      .execute();

    await dataSource
      .createQueryBuilder()
      .insert()
      .into(Cargo)
      .values(CARGOS_DEMO)
      .orIgnore()
      .execute();

    console.log(
      `Departamentos (${DEPARTAMENTOS_DEMO.length}) e cargos (${CARGOS_DEMO.length}) de demonstração processados.`,
    );
  } finally {
    await dataSource.destroy();
  }
}

seedDepartamentos().catch((error) => {
  console.error('Erro ao popular departamentos:', error);
  process.exit(1);
});
