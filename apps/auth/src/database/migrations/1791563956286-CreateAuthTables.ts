import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTables1791563956286 implements MigrationInterface {
    name = 'CreateAuthTables1791563956286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."usuario_roles_enum" AS ENUM('ADMIN', 'RH', 'GESTOR', 'COLABORADOR')`);
        await queryRunner.query(`CREATE TABLE "usuario" ("id" uuid NOT NULL, "email" character varying(255) NOT NULL, "senha_hash" character varying(255) NOT NULL, "roles" "public"."usuario_roles_enum" array NOT NULL, "funcionario_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "ativo" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email"), CONSTRAINT "UQ_1c3666748085fe9193995cea3d7" UNIQUE ("funcionario_id"), CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" uuid NOT NULL, "usuario_id" uuid NOT NULL, "token_hash" character varying(255) NOT NULL, "family_id" uuid NOT NULL, "session_created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f0812282fad2e352cdaf83ef0a9" UNIQUE ("token_hash"), CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_43414ed51c593a004dce41487f" ON "refresh_token"  ("usuario_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_eb31f2a7917404a46e17f539f1" ON "refresh_token"  ("family_id") `);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_43414ed51c593a004dce41487f0" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_43414ed51c593a004dce41487f0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eb31f2a7917404a46e17f539f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_43414ed51c593a004dce41487f"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP TYPE "public"."usuario_roles_enum"`);
    }

}
