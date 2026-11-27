import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarKeyToUsuario1795735234066 implements MigrationInterface {
  name = 'AddAvatarKeyToUsuario1795735234066';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usuario" ADD "avatar_key" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usuario" DROP COLUMN "avatar_key"`);
  }
}
