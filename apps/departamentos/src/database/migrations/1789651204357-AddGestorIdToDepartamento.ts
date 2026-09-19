import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGestorIdToDepartamento1789651204357 implements MigrationInterface {
    name = 'AddGestorIdToDepartamento1789651204357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departamento" ADD "gestor_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departamento" DROP COLUMN "gestor_id"`);
    }

}
