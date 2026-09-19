import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDeletedAtColumnDeFuncionario1789779925941 implements MigrationInterface {
    name = 'RemoveDeletedAtColumnDeFuncionario1789779925941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "funcionario" RENAME COLUMN "deleted_at" TO "data_demissao"`);
        await queryRunner.query(`ALTER TABLE "funcionario" DROP COLUMN "data_demissao"`);
        await queryRunner.query(`ALTER TABLE "funcionario" ADD "data_demissao" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "funcionario" DROP COLUMN "data_demissao"`);
        await queryRunner.query(`ALTER TABLE "funcionario" ADD "data_demissao" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "funcionario" RENAME COLUMN "data_demissao" TO "deleted_at"`);
    }

}
