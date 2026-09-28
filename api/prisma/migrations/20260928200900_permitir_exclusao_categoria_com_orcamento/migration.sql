-- DropForeignKey
ALTER TABLE "Orcamento" DROP CONSTRAINT "Orcamento_categoriaId_fkey";

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
