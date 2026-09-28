import DetalhesCategorias from "@/app/components/categoria/DetalhesCategorias";
import OrcamentoMensalTotal from "@/app/components/categoria/OrcamentoMensalTotal";
import React from "react";

function page() {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-5 sm:p-6 lg:p-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Planejamento
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          Categorias e orçamento
        </h1>
        <p className="mt-2 text-sm text-muted">
          Gerencie seus limites de gastos e acompanhe o uso por categoria
        </p>
      </div>

      <OrcamentoMensalTotal />
      <h1 className="text-2xl font-bold py-5">Detalhamento Por Categoria</h1>

      <DetalhesCategorias />
    </div>
  );
}

export default page;
