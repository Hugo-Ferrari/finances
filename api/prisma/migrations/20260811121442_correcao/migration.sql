/*
  Warnings:

  - You are about to drop the column `cpf` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuarioId,nome]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Transacao" DROP CONSTRAINT "Transacao_contaId_fkey";

-- DropIndex
DROP INDEX "Usuario_cpf_key";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "cpf";

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_usuarioId_nome_key" ON "Categoria"("usuarioId", "nome");

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
