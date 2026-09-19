import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintEmDepartamento1789688570175 implements MigrationInterface {
    name = 'AddUniqueConstraintEmDepartamento1789688570175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departamento" ADD CONSTRAINT "UQ_24bc16b448afbe8c58fbcf55603" UNIQUE ("nome")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departamento" DROP CONSTRAINT "UQ_24bc16b448afbe8c58fbcf55603"`);
    }

}
