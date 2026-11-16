-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "metaEconomia" DECIMAL(65,30) NOT NULL DEFAULT 20;

-- CreateTable
CREATE TABLE "Recorrente" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "tipoTransacao" "TipoTransacao" NOT NULL DEFAULT 'SAIDA',
    "inicio" TIMESTAMP(3) NOT NULL,
    "parcelasTotal" INTEGER,
    "parcelaInicial" INTEGER NOT NULL DEFAULT 1,
    "valorAVista" DECIMAL(65,30),
    "ehSalario" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "contaId" INTEGER,
    "categoriaId" INTEGER,

    CONSTRAINT "Recorrente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OcorrenciaRecorrente" (
    "id" SERIAL NOT NULL,
    "competencia" TEXT NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorrenteId" INTEGER NOT NULL,
    "transacaoId" INTEGER,

    CONSTRAINT "OcorrenciaRecorrente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recorrente_usuarioId_idx" ON "Recorrente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "OcorrenciaRecorrente_transacaoId_key" ON "OcorrenciaRecorrente"("transacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "OcorrenciaRecorrente_recorrenteId_competencia_key" ON "OcorrenciaRecorrente"("recorrenteId", "competencia");

-- AddForeignKey
ALTER TABLE "Recorrente" ADD CONSTRAINT "Recorrente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recorrente" ADD CONSTRAINT "Recorrente_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recorrente" ADD CONSTRAINT "Recorrente_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaRecorrente" ADD CONSTRAINT "OcorrenciaRecorrente_recorrenteId_fkey" FOREIGN KEY ("recorrenteId") REFERENCES "Recorrente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaRecorrente" ADD CONSTRAINT "OcorrenciaRecorrente_transacaoId_fkey" FOREIGN KEY ("transacaoId") REFERENCES "Transacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
