import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintEmCargo1789741507043 implements MigrationInterface {
    name = 'AddUniqueConstraintEmCargo1789741507043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_df416c0ac9307452d8d23abdf2" ON "cargo"  ("departamento_id", "nome") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_df416c0ac9307452d8d23abdf2"`);
    }

}
