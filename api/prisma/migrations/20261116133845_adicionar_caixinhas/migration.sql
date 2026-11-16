-- CreateEnum
CREATE TYPE "PeriodoTaxa" AS ENUM ('MENSAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "TipoMovimentoCaixinha" AS ENUM ('DEPOSITO', 'RETIRADA', 'AJUSTE');

-- CreateTable
CREATE TABLE "Caixinha" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "instituicao" TEXT,
    "isentaIR" BOOLEAN NOT NULL DEFAULT false,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Caixinha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxaCaixinha" (
    "id" SERIAL NOT NULL,
    "taxa" DECIMAL(65,30) NOT NULL,
    "periodo" "PeriodoTaxa" NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "caixinhaId" INTEGER NOT NULL,

    CONSTRAINT "TaxaCaixinha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentoCaixinha" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoMovimentoCaixinha" NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caixinhaId" INTEGER NOT NULL,
    "contaId" INTEGER,

    CONSTRAINT "MovimentoCaixinha_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Caixinha" ADD CONSTRAINT "Caixinha_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxaCaixinha" ADD CONSTRAINT "TaxaCaixinha_caixinhaId_fkey" FOREIGN KEY ("caixinhaId") REFERENCES "Caixinha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoCaixinha" ADD CONSTRAINT "MovimentoCaixinha_caixinhaId_fkey" FOREIGN KEY ("caixinhaId") REFERENCES "Caixinha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoCaixinha" ADD CONSTRAINT "MovimentoCaixinha_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
