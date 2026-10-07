import { MigrationInterface, QueryRunner } from "typeorm";

export class CriaCampoGestorNome1791297417486 implements MigrationInterface {
    name = 'CriaCampoGestorNome1791297417486'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departamento" ADD "gestor_nome" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departamento" DROP COLUMN "gestor_nome"`);
    }

}
