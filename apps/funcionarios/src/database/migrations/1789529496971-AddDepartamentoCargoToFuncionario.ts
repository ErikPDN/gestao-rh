import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepartamentoCargoToFuncionario1789529496971 implements MigrationInterface {
    name = 'AddDepartamentoCargoToFuncionario1789529496971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "funcionario" ADD "departamento_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "funcionario" ADD "cargo_id" uuid NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "funcionario" DROP COLUMN "cargo_id"`);
        await queryRunner.query(`ALTER TABLE "funcionario" DROP COLUMN "departamento_id"`);
    }

}
