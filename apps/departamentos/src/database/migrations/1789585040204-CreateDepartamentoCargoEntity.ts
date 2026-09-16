import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDepartamentoCargoEntity1789585040204 implements MigrationInterface {
    name = 'CreateDepartamentoCargoEntity1789585040204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."cargo_nivel_enum" AS ENUM('TRAINEE', 'JUNIOR', 'PLENO', 'SENIOR', 'ESPECIALISTA')`);
        await queryRunner.query(`CREATE TABLE "cargo" ("id" uuid NOT NULL, "nome" character varying(255) NOT NULL, "salario_base" numeric(10,2) NOT NULL, "salario_teto" numeric(10,2) NOT NULL, "departamento_id" uuid NOT NULL, "nivel" "public"."cargo_nivel_enum", "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "ativo" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_1af8b2a790f35aedbe7e3da4199" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "departamento" ("id" uuid NOT NULL, "nome" character varying(255) NOT NULL, "descricao" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "ativo" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_7fd6f336280fd0c7a9318464723" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "departamento"`);
        await queryRunner.query(`DROP TABLE "cargo"`);
        await queryRunner.query(`DROP TYPE "public"."cargo_nivel_enum"`);
    }

}
