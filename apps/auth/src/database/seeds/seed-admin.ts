import { Usuario } from '../../entities/usuario.entity.js';
import dataSource from '../data-source.js';
import * as argon2 from 'argon2';
import { Role } from '../../../../../libs/contracts/src/auth/enums/role.enum.js';

const MIN_PASSWORD_LENGTH = 8;

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_PASSWORD;

  if (!email || !senha) {
    throw new Error(
      'ADMIN_EMAIL e ADMIN_PASSWORD devem ser definidos no arquivo .env para criar o usuário administrador.',
    );
  }

  if (senha.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `A senha do administrador deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
  }

  await dataSource.initialize();

  try {
    const usuarioRepository = dataSource.getRepository(Usuario);

    if (await usuarioRepository.findOne({ where: { email } })) {
      console.log(`Usuário administrador com email ${email} já existe.`);
      return;
    }

    await usuarioRepository.save(
      usuarioRepository.create({
        id: crypto.randomUUID(),
        email,
        senhaHash: await argon2.hash(senha),
        roles: [Role.ADMIN],
        funcionarioId: null,
      }),
    );

    console.log(`Usuário administrador com email ${email} criado com sucesso.`);
  } finally {
    await dataSource.destroy();
  }
}

seedAdmin().catch((error) => {
  console.error('Erro ao criar o usuário administrador:', error);
  process.exit(1);
});
