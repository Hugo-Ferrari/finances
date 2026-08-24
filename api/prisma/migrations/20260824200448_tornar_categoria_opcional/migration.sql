-- DropForeignKey
ALTER TABLE "Transacao" DROP CONSTRAINT "Transacao_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "Transacao" DROP CONSTRAINT "Transacao_contaId_fkey";

-- AlterTable
ALTER TABLE "Conta" ADD COLUMN     "ativa" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Transacao" ALTER COLUMN "categoriaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
