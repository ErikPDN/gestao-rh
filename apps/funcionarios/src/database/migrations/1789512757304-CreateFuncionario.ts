import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFuncionario1789512757304 implements MigrationInterface {
    name = 'CreateFuncionario1789512757304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "funcionario" ("id" uuid NOT NULL, "cpf_cnpj" character varying(14) NOT NULL, "nome" character varying(255) NOT NULL, "salario" numeric(10,2) NOT NULL, "data_nascimento" date NOT NULL, "data_admissao" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_e9d149b53fe11c13c84aa9abeac" UNIQUE ("cpf_cnpj"), CONSTRAINT "PK_2c5d0c275b4f652fd5cb381655f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "funcionario"`);
    }

}
